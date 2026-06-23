import type { MealRepository } from '../../features/meal/repository';
import type { MealLog, MealPhoto } from '../../features/meal/types';
import { db } from './db';

export const indexedDbMealRepository: MealRepository = {
  async createLog(input: MealLog) { await db.mealLogs.add(input); },
  async updateLog(id: string, input: Partial<MealLog>) { await db.mealLogs.update(id, input); },
  async deleteLog(id: string) { await db.mealLogs.delete(id); },
  async findLogById(id: string) { return db.mealLogs.get(id); },
  async listLogsByDate(date: string) { return db.mealLogs.where('date').equals(date).toArray(); },
  async addPhoto(input: MealPhoto) { await db.mealPhotos.add(input); },
  async deletePhoto(id: string) {
    await db.transaction('rw', db.mealLogs, db.mealPhotos, async () => {
      const photo = await db.mealPhotos.get(id);
      await db.mealPhotos.delete(id);
      if (!photo) return;

      const log = await db.mealLogs.get(photo.mealLogId);
      if (!log) return;

      await db.mealLogs.update(log.id, {
        photoIds: log.photoIds.filter((photoId) => photoId !== id),
        updatedAt: new Date().toISOString(),
      });
    });
  },
  async listPhotos(mealLogId: string) { return db.mealPhotos.where('mealLogId').equals(mealLogId).toArray(); },
};
