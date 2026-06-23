import type { MealLog, MealPhoto } from './types';

export type MealRepository = {
  createLog(input: MealLog): Promise<void>;
  updateLog(id: string, input: Partial<MealLog>): Promise<void>;
  deleteLog(id: string): Promise<void>;
  findLogById(id: string): Promise<MealLog | undefined>;
  listLogsByDate(date: string): Promise<MealLog[]>;
  addPhoto(input: MealPhoto): Promise<void>;
  deletePhoto(id: string): Promise<void>;
  listPhotos(mealLogId: string): Promise<MealPhoto[]>;
};
