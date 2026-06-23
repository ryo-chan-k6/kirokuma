import type { BodyRecord } from '../body-record/types';
import type { FoodMaster } from '../food/types';
import type { MealLog } from '../meal/types';
import type { Recipe, RecipeIngredient } from '../recipe/types';
import type { AppSettings } from '../settings/types';
import type { WorkoutExerciseLog, WorkoutPlan, WorkoutPlanExercise, WorkoutSession } from '../workout/types';
import type { CardioLog } from '../../infrastructure/indexeddb/db';

export const EXPORT_FORMAT = 'kirokuma.backup.v1' as const;

export type ExportedMealPhoto = {
  id: string;
  mealLogId: string;
  dataUrl: string;
  createdAt: string;
};

export type KirokumaBackupData = {
  format: typeof EXPORT_FORMAT;
  exportedAt: string;
  data: {
    settings: AppSettings[];
    bodyRecords: BodyRecord[];
    workoutPlans: WorkoutPlan[];
    workoutPlanExercises: WorkoutPlanExercise[];
    workoutSessions: WorkoutSession[];
    workoutExerciseLogs: WorkoutExerciseLog[];
    cardioLogs: CardioLog[];
    mealLogs: MealLog[];
    mealPhotos: ExportedMealPhoto[];
    foodMaster: FoodMaster[];
    recipes: Recipe[];
    recipeIngredients: RecipeIngredient[];
  };
};

export type KirokumaBackupRepository = {
  exportAll(exportedAt: string): Promise<KirokumaBackupData>;
  replaceAll(backup: KirokumaBackupData): Promise<void>;
};

const requiredCollections = [
  'settings',
  'bodyRecords',
  'workoutPlans',
  'workoutPlanExercises',
  'workoutSessions',
  'workoutExerciseLogs',
  'cardioLogs',
  'mealLogs',
  'mealPhotos',
  'foodMaster',
  'recipes',
  'recipeIngredients',
] as const;

export function parseBackupJson(json: string): KirokumaBackupData {
  let value: unknown;
  try {
    value = JSON.parse(json);
  } catch {
    throw new Error('JSONの形式が正しくありません。ファイルの内容を確認してください。');
  }

  if (!isBackupData(value)) {
    throw new Error('きろくまのバックアップJSONとして読み込めません。');
  }

  return value;
}

export function serializeBackup(backup: KirokumaBackupData): string {
  return `${JSON.stringify(backup, null, 2)}\n`;
}

export async function createBackupJson(repository: KirokumaBackupRepository, now: string): Promise<string> {
  return serializeBackup(await repository.exportAll(now));
}

export async function importBackupJson(repository: KirokumaBackupRepository, json: string): Promise<KirokumaBackupData> {
  const backup = parseBackupJson(json);
  await repository.replaceAll(backup);
  return backup;
}

function isBackupData(value: unknown): value is KirokumaBackupData {
  if (!isRecord(value) || value.format !== EXPORT_FORMAT || typeof value.exportedAt !== 'string' || !isRecord(value.data)) {
    return false;
  }

  return requiredCollections.every((key) => Array.isArray(value.data[key]));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
