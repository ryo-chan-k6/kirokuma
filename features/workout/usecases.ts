import { INITIAL_WORKOUT_PLAN_EXERCISES, INITIAL_WORKOUT_PLANS } from './initial-data';
import type { WorkoutRepository } from './repository';
import type { WorkoutPlan } from './types';

export async function ensureInitialWorkoutPlans(repository: WorkoutRepository): Promise<void> {
  await repository.saveInitialPlans(INITIAL_WORKOUT_PLANS, INITIAL_WORKOUT_PLAN_EXERCISES);
}

export async function listWorkoutPlansForDisplay(repository: WorkoutRepository): Promise<WorkoutPlan[]> {
  const plans = await repository.listActivePlans();
  return plans.sort((a, b) => a.displayOrder - b.displayOrder);
}
