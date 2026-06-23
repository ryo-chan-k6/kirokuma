import type { PlanDay, WorkoutPlan, WorkoutPlanExercise } from './types';

export const WORKOUT_PLAN_IDS: Record<PlanDay, string> = {
  DAY_1: 'workout-plan-day-1',
  DAY_2: 'workout-plan-day-2',
  DAY_3: 'workout-plan-day-3',
  DAY_4: 'workout-plan-day-4',
  DAY_5: 'workout-plan-day-5',
} as const;

export const INITIAL_WORKOUT_PLANS: WorkoutPlan[] = [
  { id: WORKOUT_PLAN_IDS.DAY_1, dayCode: 'DAY_1', name: 'Day1：胸・腕', targetArea: '胸・腕', displayOrder: 1, isActive: true },
  { id: WORKOUT_PLAN_IDS.DAY_2, dayCode: 'DAY_2', name: 'Day2：下半身・体幹', targetArea: '下半身・体幹', displayOrder: 2, isActive: true },
  { id: WORKOUT_PLAN_IDS.DAY_3, dayCode: 'DAY_3', name: 'Day3：背中・肩', targetArea: '背中・肩', displayOrder: 3, isActive: true },
  { id: WORKOUT_PLAN_IDS.DAY_4, dayCode: 'DAY_4', name: 'Day4：有酸素・腹', targetArea: '有酸素・腹', displayOrder: 4, isActive: true },
  { id: WORKOUT_PLAN_IDS.DAY_5, dayCode: 'DAY_5', name: 'Day5：全身', targetArea: '全身', displayOrder: 5, isActive: true },
];

export const INITIAL_WORKOUT_PLAN_EXERCISES: WorkoutPlanExercise[] = [
  { id: 'workout-exercise-day-1-1', workoutPlanId: WORKOUT_PLAN_IDS.DAY_1, exerciseName: 'ダンベルプレス', defaultWeightKg: 10, defaultReps: 10, defaultSets: 3, displayOrder: 1 },
  { id: 'workout-exercise-day-1-2', workoutPlanId: WORKOUT_PLAN_IDS.DAY_1, exerciseName: 'ダンベルフライ', defaultWeightKg: 5, defaultReps: 12, defaultSets: 3, displayOrder: 2 },
  { id: 'workout-exercise-day-1-3', workoutPlanId: WORKOUT_PLAN_IDS.DAY_1, exerciseName: 'プッシュアップ', defaultReps: 10, defaultSets: 3, displayOrder: 3 },
  { id: 'workout-exercise-day-1-4', workoutPlanId: WORKOUT_PLAN_IDS.DAY_1, exerciseName: 'ダンベルカール', defaultWeightKg: 5, defaultReps: 12, defaultSets: 3, displayOrder: 4 },
  { id: 'workout-exercise-day-1-5', workoutPlanId: WORKOUT_PLAN_IDS.DAY_1, exerciseName: 'プランク', defaultSeconds: 30, defaultSets: 3, displayOrder: 5 },

  { id: 'workout-exercise-day-2-1', workoutPlanId: WORKOUT_PLAN_IDS.DAY_2, exerciseName: 'ゴブレットスクワット', defaultWeightKg: 10, defaultReps: 12, defaultSets: 3, displayOrder: 1 },
  { id: 'workout-exercise-day-2-2', workoutPlanId: WORKOUT_PLAN_IDS.DAY_2, exerciseName: 'ダンベルルーマニアンデッドリフト', defaultWeightKg: 10, defaultReps: 10, defaultSets: 3, displayOrder: 2 },
  { id: 'workout-exercise-day-2-3', workoutPlanId: WORKOUT_PLAN_IDS.DAY_2, exerciseName: 'ブルガリアンスクワット', defaultWeightKg: 5, defaultReps: 10, defaultSets: 2, displayOrder: 3 },
  { id: 'workout-exercise-day-2-4', workoutPlanId: WORKOUT_PLAN_IDS.DAY_2, exerciseName: 'レッグレイズ', defaultReps: 12, defaultSets: 3, displayOrder: 4 },
  { id: 'workout-exercise-day-2-5', workoutPlanId: WORKOUT_PLAN_IDS.DAY_2, exerciseName: 'サイドプランク', defaultSeconds: 20, defaultSets: 2, displayOrder: 5 },

  { id: 'workout-exercise-day-3-1', workoutPlanId: WORKOUT_PLAN_IDS.DAY_3, exerciseName: 'ワンハンドダンベルロー', defaultWeightKg: 10, defaultReps: 12, defaultSets: 3, displayOrder: 1 },
  { id: 'workout-exercise-day-3-2', workoutPlanId: WORKOUT_PLAN_IDS.DAY_3, exerciseName: 'ダンベルショルダープレス', defaultWeightKg: 5, defaultReps: 10, defaultSets: 3, displayOrder: 2 },
  { id: 'workout-exercise-day-3-3', workoutPlanId: WORKOUT_PLAN_IDS.DAY_3, exerciseName: 'サイドレイズ', defaultWeightKg: 2, defaultReps: 15, defaultSets: 3, displayOrder: 3 },
  { id: 'workout-exercise-day-3-4', workoutPlanId: WORKOUT_PLAN_IDS.DAY_3, exerciseName: 'リアレイズ', defaultWeightKg: 2, defaultReps: 15, defaultSets: 3, displayOrder: 4 },
  { id: 'workout-exercise-day-3-5', workoutPlanId: WORKOUT_PLAN_IDS.DAY_3, exerciseName: 'プランク', defaultSeconds: 30, defaultSets: 3, displayOrder: 5 },

  { id: 'workout-exercise-day-4-1', workoutPlanId: WORKOUT_PLAN_IDS.DAY_4, exerciseName: 'ウォーキング or 軽いランニング', defaultSeconds: 1200, defaultSets: 1, displayOrder: 1 },
  { id: 'workout-exercise-day-4-2', workoutPlanId: WORKOUT_PLAN_IDS.DAY_4, exerciseName: 'クランチ', defaultReps: 15, defaultSets: 3, displayOrder: 2 },
  { id: 'workout-exercise-day-4-3', workoutPlanId: WORKOUT_PLAN_IDS.DAY_4, exerciseName: 'レッグレイズ', defaultReps: 12, defaultSets: 3, displayOrder: 3 },
  { id: 'workout-exercise-day-4-4', workoutPlanId: WORKOUT_PLAN_IDS.DAY_4, exerciseName: 'マウンテンクライマー', defaultSeconds: 30, defaultSets: 3, displayOrder: 4 },
  { id: 'workout-exercise-day-4-5', workoutPlanId: WORKOUT_PLAN_IDS.DAY_4, exerciseName: 'ストレッチ', defaultSeconds: 300, defaultSets: 1, displayOrder: 5 },

  { id: 'workout-exercise-day-5-1', workoutPlanId: WORKOUT_PLAN_IDS.DAY_5, exerciseName: 'ダンベルスクワット', defaultWeightKg: 10, defaultReps: 10, defaultSets: 3, displayOrder: 1 },
  { id: 'workout-exercise-day-5-2', workoutPlanId: WORKOUT_PLAN_IDS.DAY_5, exerciseName: 'ダンベルプレス', defaultWeightKg: 10, defaultReps: 10, defaultSets: 3, displayOrder: 2 },
  { id: 'workout-exercise-day-5-3', workoutPlanId: WORKOUT_PLAN_IDS.DAY_5, exerciseName: 'ダンベルロー', defaultWeightKg: 10, defaultReps: 10, defaultSets: 3, displayOrder: 3 },
  { id: 'workout-exercise-day-5-4', workoutPlanId: WORKOUT_PLAN_IDS.DAY_5, exerciseName: 'ショルダープレス', defaultWeightKg: 5, defaultReps: 10, defaultSets: 3, displayOrder: 4 },
  { id: 'workout-exercise-day-5-5', workoutPlanId: WORKOUT_PLAN_IDS.DAY_5, exerciseName: 'プランク', defaultSeconds: 30, defaultSets: 3, displayOrder: 5 },
];

export function listInitialWorkoutExercisesByPlan(workoutPlanId: string): WorkoutPlanExercise[] {
  return INITIAL_WORKOUT_PLAN_EXERCISES
    .filter((exercise) => exercise.workoutPlanId === workoutPlanId)
    .sort((a, b) => a.displayOrder - b.displayOrder);
}
