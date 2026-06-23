import type { BodyRecordRepository } from '../body-record/repository';
import type { MealRepository } from '../meal/repository';
import type { SettingsRepository } from '../settings/repository';
import { getSettingsTargets } from '../settings/usecases';
import type { WorkoutRepository } from '../workout/repository';

export type AnalyticsRepositories = {
  bodyRecordRepository: BodyRecordRepository;
  mealRepository: MealRepository;
  settingsRepository: SettingsRepository;
  workoutRepository: WorkoutRepository;
};

export type DailyAnalytics = {
  date: string;
  label: string;
  weightKg?: number;
  calories: number;
  proteinGrams: number;
  workoutCount: number;
  mealLogCount: number;
  calorieDiff?: number;
  proteinDiff?: number;
  weightDiff?: number;
};

export type AnalyticsSummary = {
  today: string;
  targetWeightKg?: number;
  targetCalories?: number;
  targetProteinGrams?: number;
  totalWorkoutCount: number;
  totalMealLogCount: number;
  averageCalories: number;
  averageProteinGrams: number;
  latestWeightKg?: number;
  daily: DailyAnalytics[];
};

export async function getRecentAnalytics(repositories: AnalyticsRepositories, today: string, days = 7): Promise<AnalyticsSummary> {
  const dates = listRecentDatesAscending(today, days);
  const [settings, completedSessions, bodyRecordsByDate, mealLogsByDate] = await Promise.all([
    repositories.settingsRepository.findCurrent(),
    repositories.workoutRepository.listCompletedSessionsSince(dates[0] ?? today),
    Promise.all(dates.map((date) => repositories.bodyRecordRepository.findByDate(date))),
    Promise.all(dates.map((date) => repositories.mealRepository.listLogsByDate(date))),
  ]);

  const targets = settings ? getSettingsTargets(settings) : undefined;
  const workoutCounts = new Map<string, number>();
  for (const session of completedSessions) {
    if (!session.completed || !dates.includes(session.date)) continue;
    workoutCounts.set(session.date, (workoutCounts.get(session.date) ?? 0) + 1);
  }

  const daily = dates.map((date, index) => {
    const meals = mealLogsByDate[index] ?? [];
    const calories = round1(sumBy(meals, (meal) => meal.calories));
    const proteinGrams = round1(sumBy(meals, (meal) => meal.proteinGrams));
    const weightKg = bodyRecordsByDate[index]?.weightKg;

    return {
      date,
      label: formatShortDate(date),
      weightKg,
      calories,
      proteinGrams,
      workoutCount: workoutCounts.get(date) ?? 0,
      mealLogCount: meals.length,
      calorieDiff: targets?.targetCaloriesKcal !== undefined ? round1(calories - targets.targetCaloriesKcal) : undefined,
      proteinDiff: targets?.targetProteinG !== undefined ? round1(proteinGrams - targets.targetProteinG) : undefined,
      weightDiff: settings?.targetWeightKg !== undefined && weightKg !== undefined ? round1(weightKg - settings.targetWeightKg) : undefined,
    };
  });

  return {
    today,
    targetWeightKg: settings?.targetWeightKg,
    targetCalories: targets?.targetCaloriesKcal,
    targetProteinGrams: targets?.targetProteinG,
    totalWorkoutCount: sumBy(daily, (day) => day.workoutCount),
    totalMealLogCount: sumBy(daily, (day) => day.mealLogCount),
    averageCalories: round1(sumBy(daily, (day) => day.calories) / daily.length),
    averageProteinGrams: round1(sumBy(daily, (day) => day.proteinGrams) / daily.length),
    latestWeightKg: [...daily].reverse().find((day) => day.weightKg !== undefined)?.weightKg,
    daily,
  };
}

export function listRecentDatesAscending(today: string, days: number): string[] {
  return Array.from({ length: days }, (_, index) => addDays(today, index - days + 1));
}

function sumBy<T>(items: T[], pick: (item: T) => number): number {
  return items.reduce((total, item) => total + pick(item), 0);
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function addDays(date: string, days: number): string {
  const value = new Date(`${date}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function formatShortDate(date: string): string {
  const [, month, day] = date.split('-');
  return `${Number(month)}/${Number(day)}`;
}
