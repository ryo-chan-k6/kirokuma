import type { WorkoutRepository } from '../../features/workout/repository';
import type { PlanDay, WorkoutExerciseLog, WorkoutSession } from '../../features/workout/types';
import { db } from './db';

export const indexedDbWorkoutRepository: WorkoutRepository = {
  async listActivePlans() { return db.workoutPlans.where('isActive').equals(true).toArray(); },
  async findPlanByDay(dayCode: PlanDay) { return db.workoutPlans.where('dayCode').equals(dayCode).first(); },
  async listPlanExercises(workoutPlanId: string) { return db.workoutPlanExercises.where('workoutPlanId').equals(workoutPlanId).toArray(); },
  async createSession(input: WorkoutSession, logs: WorkoutExerciseLog[]) {
    await db.transaction('rw', db.workoutSessions, db.workoutExerciseLogs, async () => {
      await db.workoutSessions.add(input);
      await Promise.all(logs.map((log) => db.workoutExerciseLogs.add(log)));
    });
  },
  async findLatestCompletedSession() { return db.workoutSessions.where('completed').equals(true).first(); },
};
