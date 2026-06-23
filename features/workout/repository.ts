import type { PlanDay, WorkoutExerciseLog, WorkoutPlan, WorkoutPlanExercise, WorkoutSession } from './types';

export type WorkoutRepository = {
  listActivePlans(): Promise<WorkoutPlan[]>;
  findPlanByDay(dayCode: PlanDay): Promise<WorkoutPlan | undefined>;
  listPlanExercises(workoutPlanId: string): Promise<WorkoutPlanExercise[]>;
  createSession(input: WorkoutSession, logs: WorkoutExerciseLog[]): Promise<void>;
  findLatestCompletedSession(): Promise<WorkoutSession | undefined>;
};
