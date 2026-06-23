import type { RecipeRepository } from '../recipe/repository';
import type { MealRepository } from './repository';
import { toMealLog, validateMealLogForm, type MealLogFormValues } from './schema';
import type { MealLog, MealPhoto } from './types';

export const MAX_MEAL_PHOTO_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_MEAL_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;

export type MealPhotoInput = {
  blob: Blob;
  name?: string;
};

export async function saveMealLog(
  mealRepository: MealRepository,
  values: MealLogFormValues,
  today: string,
  now: string,
  id?: string,
  createId: () => string = () => crypto.randomUUID(),
): Promise<MealLog> {
  const validation = validateMealLogForm(values, today);
  if (!validation.success) {
    throw new Error(Object.values(validation.errors)[0] ?? '食事記録の入力内容を確認してください。');
  }

  const existing = id === undefined ? undefined : await mealRepository.findLogById(id);
  const mealLog = toMealLog(validation.data, existing?.id ?? id ?? createId(), now, existing);

  if (existing) {
    await mealRepository.updateLog(existing.id, mealLog);
  } else {
    await mealRepository.createLog(mealLog);
  }

  return mealLog;
}

export async function listRecentMealLogs(repository: MealRepository, days: number, today: string): Promise<MealLog[]> {
  const dates = Array.from({ length: days }, (_, index) => addDays(today, -index));
  const logs = (await Promise.all(dates.map((date) => repository.listLogsByDate(date)))).flat();
  return logs.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
}

export async function applyRecipeToMealForm(recipeRepository: RecipeRepository, values: MealLogFormValues, recipeId: string): Promise<MealLogFormValues> {
  const recipe = await recipeRepository.findById(recipeId);
  if (!recipe) {
    throw new Error('選択したレシピが見つかりませんでした。');
  }

  return {
    ...values,
    mealSource: 'home_cooking',
    title: recipe.name,
    calories: Math.round((recipe.totalCalories / recipe.servingCount) * 10) / 10,
    proteinGrams: Math.round((recipe.totalProteinGrams / recipe.servingCount) * 10) / 10,
    recipeId: recipe.id,
  };
}

export async function addMealPhotos(
  mealRepository: MealRepository,
  mealLogId: string,
  photos: MealPhotoInput[],
  now: string,
  createId: () => string = () => crypto.randomUUID(),
): Promise<MealPhoto[]> {
  const mealLog = await mealRepository.findLogById(mealLogId);
  if (!mealLog) {
    throw new Error('写真を追加する食事記録が見つかりませんでした。');
  }

  const savedPhotos: MealPhoto[] = [];
  for (const photo of photos) {
    validateMealPhoto(photo.blob);
    const savedPhoto: MealPhoto = { id: createId(), mealLogId, blob: photo.blob, createdAt: now };
    await mealRepository.addPhoto(savedPhoto);
    savedPhotos.push(savedPhoto);
  }

  if (savedPhotos.length > 0) {
    await mealRepository.updateLog(mealLogId, {
      photoIds: [...mealLog.photoIds, ...savedPhotos.map((photo) => photo.id)],
      updatedAt: now,
    });
  }

  return savedPhotos;
}

export async function removeMealPhoto(mealRepository: MealRepository, photoId: string): Promise<void> {
  await mealRepository.deletePhoto(photoId);
}

export function validateMealPhoto(blob: Blob): void {
  if (!ACCEPTED_MEAL_PHOTO_TYPES.includes(blob.type as (typeof ACCEPTED_MEAL_PHOTO_TYPES)[number])) {
    throw new Error('写真はJPEG、PNG、WebP、GIFから選んでください。');
  }

  if (blob.size > MAX_MEAL_PHOTO_BYTES) {
    throw new Error('写真は5MB以下の画像を選んでください。');
  }
}

function addDays(date: string, days: number): string {
  const value = new Date(`${date}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}
