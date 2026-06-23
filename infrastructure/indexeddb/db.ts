import Dexie, { type Table } from 'dexie';
import type { BodyRecord } from '../../features/body-record/types';
import type { FoodMaster } from '../../features/food/types';
import type { MealLog, MealPhoto } from '../../features/meal/types';
import type { Recipe, RecipeIngredient } from '../../features/recipe/types';
import type { AppSettings } from '../../features/settings/types';
import type { WorkoutExerciseLog, WorkoutPlan, WorkoutPlanExercise, WorkoutSession } from '../../features/workout/types';

export const DATABASE_NAME = 'kirokuma';

export const kirokumaSchema = {
  settings: 'id, updatedAt',
  bodyRecords: 'id, &date, createdAt, updatedAt',
  workoutPlans: 'id, &dayCode, displayOrder, isActive',
  workoutPlanExercises: 'id, workoutPlanId, displayOrder',
  workoutSessions: 'id, date, workoutPlanId, dayCode, completed, createdAt',
  workoutExerciseLogs: 'id, workoutSessionId, setNumber',
  cardioLogs: 'id, date, cardioType, createdAt',
  mealLogs: 'id, date, mealType, recipeId, createdAt, updatedAt',
  mealPhotos: 'id, mealLogId, createdAt',
  foodMaster: 'id, name, isFavorite, createdAt, updatedAt',
  recipes: 'id, name, createdAt, updatedAt',
  recipeIngredients: 'id, recipeId, foodId',
} as const;

export type CardioLog = {
  id: string;
  date: string;
  cardioType: 'walking' | 'running' | 'cycling' | 'other';
  durationMinutes: number;
  distanceKm?: number;
  caloriesBurned?: number;
  memo?: string;
  createdAt: string;
};

export class KirokumaDatabase extends Dexie {
  settings!: Table<AppSettings, string>;
  bodyRecords!: Table<BodyRecord, string>;
  workoutPlans!: Table<WorkoutPlan, string>;
  workoutPlanExercises!: Table<WorkoutPlanExercise, string>;
  workoutSessions!: Table<WorkoutSession, string>;
  workoutExerciseLogs!: Table<WorkoutExerciseLog, string>;
  cardioLogs!: Table<CardioLog, string>;
  mealLogs!: Table<MealLog, string>;
  mealPhotos!: Table<MealPhoto, string>;
  foodMaster!: Table<FoodMaster, string>;
  recipes!: Table<Recipe, string>;
  recipeIngredients!: Table<RecipeIngredient, string>;

  constructor() {
    super(DATABASE_NAME);
    this.version(1).stores(kirokumaSchema);
  }
}

export const db = new KirokumaDatabase();
