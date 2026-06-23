import type { WorkoutPlan, WorkoutPlanExercise } from '../types';

export function formatWorkoutPlanTitle(plan: WorkoutPlan): string {
  return `${plan.name}（${plan.targetArea}）`;
}

export function formatWorkoutExerciseSummary(exercise: WorkoutPlanExercise): string {
  const weight = exercise.defaultWeightKg === undefined ? '自重' : `${exercise.defaultWeightKg}kg`;
  const amount = exercise.defaultSeconds === undefined ? `${exercise.defaultReps ?? 0}回` : `${exercise.defaultSeconds}秒`;
  return `${exercise.exerciseName} / ${weight} / ${amount} / ${exercise.defaultSets}セット`;
}
