import type { WorkoutRepository } from '../../features/workout/repository';
import type { PlanDay, WorkoutExerciseLog, WorkoutPlan, WorkoutPlanExercise, WorkoutSession } from '../../features/workout/types';
import { db } from './db';

export const indexedDbWorkoutRepository: WorkoutRepository = {
  async listActivePlans() {
    const plans = await db.workoutPlans.where('isActive').equals(true).toArray();
    return plans.sort((a, b) => a.displayOrder - b.displayOrder);
  },
  async findPlanByDay(dayCode: PlanDay) { return db.workoutPlans.where('dayCode').equals(dayCode).first(); },
  async listPlanExercises(workoutPlanId: string) {
    const exercises = await db.workoutPlanExercises.where('workoutPlanId').equals(workoutPlanId).toArray();
    return exercises.sort((a, b) => a.displayOrder - b.displayOrder);
  },
  async saveInitialPlans(plans: WorkoutPlan[], exercises: WorkoutPlanExercise[]) {
    await db.transaction('rw', db.workoutPlans, db.workoutPlanExercises, async () => {
      await Promise.all(plans.map((plan) => db.workoutPlans.put(plan)));
      await Promise.all(exercises.map((exercise) => db.workoutPlanExercises.put(exercise)));
    });
  },
  async createSession(input: WorkoutSession, logs: WorkoutExerciseLog[]) {
    await db.transaction('rw', db.workoutSessions, db.workoutExerciseLogs, async () => {
      await db.workoutSessions.add(input);
      await Promise.all(logs.map((log) => db.workoutExerciseLogs.add(log)));
    });
  },
  async findLatestCompletedSession() { return db.workoutSessions.where('completed').equals(true).first(); },
};
