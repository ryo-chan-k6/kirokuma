import type { BodyRecordRepository } from '../body-record/repository';
import type { BodyRecord } from '../body-record/types';
import type { MealRepository } from '../meal/repository';
import type { MealLog } from '../meal/types';
import type { SettingsRepository } from '../settings/repository';
import { getSettingsTargets } from '../settings/usecases';
import type { AppSettings } from '../settings/types';
import type { WorkoutRepository } from '../workout/repository';
import { getTodayWorkout, type TodayWorkout } from '../workout/usecases';

export type HomeRepositories = {
  bodyRecordRepository: BodyRecordRepository;
  mealRepository: MealRepository;
  settingsRepository: SettingsRepository;
  workoutRepository: WorkoutRepository;
};

export type HomeRecordStatus = {
  date: string;
  hasBodyRecord: boolean;
  mealLogCount: number;
  hasWorkout: boolean;
};

export type HomeReminderKind = 'body' | 'breakfast' | 'lunch' | 'dinner' | 'workout';

export type HomeReminder = {
  kind: HomeReminderKind;
  label: string;
  detail: string;
  href: string;
  done: boolean;
};

export type HomeSummary = {
  today: string;
  settings?: AppSettings;
  currentBodyRecord?: BodyRecord;
  targetWeightKg?: number;
  targetCalories?: number;
  targetProteinGrams?: number;
  todayMeals: MealLog[];
  todayCalories: number;
  todayProteinGrams: number;
  todayWorkout: TodayWorkout;
  weeklyWorkoutCount: number;
  recentStatuses: HomeRecordStatus[];
  reminders: HomeReminder[];
};

export async function getHomeSummary(repositories: HomeRepositories, today: string): Promise<HomeSummary> {
  const recentDates = listRecentDates(today, 7);
  const weekStart = recentDates[recentDates.length - 1];

  const [settings, recentBodyRecords, todayMeals, todayWorkout, weeklyWorkoutSessions, mealLogsByDate] = await Promise.all([
    repositories.settingsRepository.findCurrent(),
    repositories.bodyRecordRepository.findRecent(7),
    repositories.mealRepository.listLogsByDate(today),
    getTodayWorkout(repositories.workoutRepository),
    repositories.workoutRepository.listCompletedSessionsSince(weekStart),
    Promise.all(recentDates.map((date) => repositories.mealRepository.listLogsByDate(date))),
  ]);

  const sortedBodyRecords = [...recentBodyRecords].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  const bodyRecordByDate = new Map(sortedBodyRecords.map((record) => [record.date, record]));
  const workoutDates = new Set(weeklyWorkoutSessions.map((session) => session.date));
  const targets = settings ? getSettingsTargets(settings) : undefined;

  const todayStatus: HomeRecordStatus = {
    date: today,
    hasBodyRecord: bodyRecordByDate.has(today),
    mealLogCount: todayMeals.length,
    hasWorkout: workoutDates.has(today),
  };

  return {
    today,
    settings,
    currentBodyRecord: sortedBodyRecords[0],
    targetWeightKg: settings?.targetWeightKg,
    targetCalories: targets?.targetCaloriesKcal,
    targetProteinGrams: targets?.targetProteinG,
    todayMeals,
    todayCalories: sumBy(todayMeals, (meal) => meal.calories),
    todayProteinGrams: sumBy(todayMeals, (meal) => meal.proteinGrams),
    todayWorkout,
    weeklyWorkoutCount: weeklyWorkoutSessions.length,
    reminders: buildHomeReminders(todayMeals, todayStatus, todayWorkout),
    recentStatuses: recentDates.map((date, index) => ({
      date,
      hasBodyRecord: bodyRecordByDate.has(date),
      mealLogCount: mealLogsByDate[index]?.length ?? 0,
      hasWorkout: workoutDates.has(date),
    })),
  };
}

export function buildHomeReminders(todayMeals: MealLog[], todayStatus: HomeRecordStatus, todayWorkout: TodayWorkout): HomeReminder[] {
  const mealTypes = new Set(todayMeals.map((meal) => meal.mealType));

  return [
    {
      kind: 'body',
      label: '朝の体重を記録',
      detail: todayStatus.hasBodyRecord ? '今日の体重は記録済みです。' : '朝のうちに体重と体脂肪率をさっと残しましょう。',
      href: '/body-records',
      done: todayStatus.hasBodyRecord,
    },
    {
      kind: 'breakfast',
      label: '朝食を記録',
      detail: mealTypes.has('breakfast') ? '朝食は記録済みです。' : '写真だけでもOK。朝食を忘れないうちに記録しましょう。',
      href: '/meals',
      done: mealTypes.has('breakfast'),
    },
    {
      kind: 'lunch',
      label: '昼食を記録',
      detail: mealTypes.has('lunch') ? '昼食は記録済みです。' : '昼食のカロリーとたんぱく質をメモしましょう。',
      href: '/meals',
      done: mealTypes.has('lunch'),
    },
    {
      kind: 'dinner',
      label: '夕食を記録',
      detail: mealTypes.has('dinner') ? '夕食は記録済みです。' : '一日の締めに夕食を記録しましょう。',
      href: '/meals',
      done: mealTypes.has('dinner'),
    },
    {
      kind: 'workout',
      label: `${formatDay(todayWorkout.plan.dayCode)}：${todayWorkout.plan.name}`,
      detail: todayStatus.hasWorkout ? '今日の筋トレは完了です。おつかれさまでした！' : `${todayWorkout.plan.targetArea}の日です。できる範囲で進めましょう。`,
      href: '/workouts',
      done: todayStatus.hasWorkout,
    },
  ];
}

export function listRecentDates(today: string, days: number): string[] {
  return Array.from({ length: days }, (_, index) => addDays(today, -index));
}

function sumBy<T>(items: T[], pick: (item: T) => number): number {
  return Math.round(items.reduce((total, item) => total + pick(item), 0) * 10) / 10;
}

function addDays(date: string, days: number): string {
  const value = new Date(`${date}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function formatDay(dayCode: string): string {
  return dayCode.replace('DAY_', 'Day');
}
