import { EXPORT_FORMAT, type ExportedMealPhoto, type KirokumaBackupData, type KirokumaBackupRepository } from '../../features/data-portability/usecases';
import type { MealPhoto } from '../../features/meal/types';
import { db } from './db';

export const indexedDbBackupRepository: KirokumaBackupRepository = {
  async exportAll(exportedAt: string) {
    const mealPhotos = await Promise.all((await db.mealPhotos.toArray()).map(toExportedMealPhoto));

    return {
      format: EXPORT_FORMAT,
      exportedAt,
      data: {
        settings: await db.settings.toArray(),
        bodyRecords: await db.bodyRecords.toArray(),
        workoutPlans: await db.workoutPlans.toArray(),
        workoutPlanExercises: await db.workoutPlanExercises.toArray(),
        workoutSessions: await db.workoutSessions.toArray(),
        workoutExerciseLogs: await db.workoutExerciseLogs.toArray(),
        cardioLogs: await db.cardioLogs.toArray(),
        mealLogs: await db.mealLogs.toArray(),
        mealPhotos,
        foodMaster: await db.foodMaster.toArray(),
        recipes: await db.recipes.toArray(),
        recipeIngredients: await db.recipeIngredients.toArray(),
      },
    };
  },

  async replaceAll(backup: KirokumaBackupData) {
    const mealPhotos = await Promise.all(backup.data.mealPhotos.map(fromExportedMealPhoto));

    await db.transaction('rw', db.tables, async () => {
      await Promise.all(db.tables.map((table) => table.clear()));
      await db.settings.bulkPut(backup.data.settings);
      await db.bodyRecords.bulkPut(backup.data.bodyRecords);
      await db.workoutPlans.bulkPut(backup.data.workoutPlans);
      await db.workoutPlanExercises.bulkPut(backup.data.workoutPlanExercises);
      await db.workoutSessions.bulkPut(backup.data.workoutSessions);
      await db.workoutExerciseLogs.bulkPut(backup.data.workoutExerciseLogs);
      await db.cardioLogs.bulkPut(backup.data.cardioLogs);
      await db.mealLogs.bulkPut(backup.data.mealLogs);
      await db.mealPhotos.bulkPut(mealPhotos);
      await db.foodMaster.bulkPut(backup.data.foodMaster);
      await db.recipes.bulkPut(backup.data.recipes);
      await db.recipeIngredients.bulkPut(backup.data.recipeIngredients);
    });
  },
};

async function toExportedMealPhoto(photo: MealPhoto): Promise<ExportedMealPhoto> {
  return {
    id: photo.id,
    mealLogId: photo.mealLogId,
    dataUrl: await blobToDataUrl(photo.blob),
    createdAt: photo.createdAt,
  };
}

async function fromExportedMealPhoto(photo: ExportedMealPhoto): Promise<MealPhoto> {
  return {
    id: photo.id,
    mealLogId: photo.mealLogId,
    blob: await dataUrlToBlob(photo.dataUrl),
    createdAt: photo.createdAt,
  };
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('写真データをバックアップ用に変換できませんでした。'));
    reader.readAsDataURL(blob);
  });
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl);
  return response.blob();
}
