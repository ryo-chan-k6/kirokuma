import { INITIAL_WORKOUT_PLAN_EXERCISES, INITIAL_WORKOUT_PLANS } from './initial-data';
import type { WorkoutRepository } from './repository';
import type { PlanDay, WorkoutPlan, WorkoutPlanExercise, WorkoutSession } from './types';

const ROTATION_DAYS: PlanDay[] = ['DAY_1', 'DAY_2', 'DAY_3', 'DAY_4', 'DAY_5'];

export type TodayWorkout = {
  plan: WorkoutPlan;
  exercises: WorkoutPlanExercise[];
  latestCompletedSession?: WorkoutSession;
};

export function getNextWorkoutDay(latestCompletedDay?: PlanDay): PlanDay {
  if (latestCompletedDay === undefined) {
    return 'DAY_1';
  }

  const currentIndex = ROTATION_DAYS.indexOf(latestCompletedDay);
  if (currentIndex === -1) {
    return 'DAY_1';
  }

  return ROTATION_DAYS[(currentIndex + 1) % ROTATION_DAYS.length];
}

export async function ensureInitialWorkoutPlans(repository: WorkoutRepository): Promise<void> {
  await repository.saveInitialPlans(INITIAL_WORKOUT_PLANS, INITIAL_WORKOUT_PLAN_EXERCISES);
}

export async function listWorkoutPlansForDisplay(repository: WorkoutRepository): Promise<WorkoutPlan[]> {
  const plans = await repository.listActivePlans();
  return plans.sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function getTodayWorkout(repository: WorkoutRepository): Promise<TodayWorkout> {
  await ensureInitialWorkoutPlans(repository);

  const latestCompletedSession = await repository.findLatestCompletedSession();
  const nextDay = getNextWorkoutDay(latestCompletedSession?.dayCode);
  const plan = await repository.findPlanByDay(nextDay);

  if (plan === undefined) {
    throw new Error(`Workout plan not found for ${nextDay}`);
  }

  const exercises = await repository.listPlanExercises(plan.id);
  return { plan, exercises, latestCompletedSession };
}
