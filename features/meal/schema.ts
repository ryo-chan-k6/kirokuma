import type { MealLog } from './types';

export type MealLogFormValues = {
  date: string;
  mealType: MealLog['mealType'];
  mealSource: MealLog['mealSource'];
  title: string;
  calories: number;
  proteinGrams: number;
  memo?: string;
  recipeId?: string;
};

export type MealValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: Partial<Record<keyof MealLogFormValues, string>> };

const MEAL_TYPES: MealLog['mealType'][] = ['breakfast', 'lunch', 'dinner', 'snack'];
const MEAL_SOURCES: MealLog['mealSource'][] = ['home_cooking', 'restaurant', 'convenience_store', 'other'];

export function createDefaultMealLogFormValues(today: string): MealLogFormValues {
  return { date: today, mealType: 'breakfast', mealSource: 'home_cooking', title: '', calories: 0, proteinGrams: 0 };
}

export function validateMealLogForm(input: MealLogFormValues, today: string): MealValidationResult<MealLogFormValues> {
  const errors: Partial<Record<keyof MealLogFormValues, string>> = {};
  const title = input.title.trim();

  if (!isDateString(input.date)) {
    errors.date = '日付を入力してください。';
  } else if (input.date > today) {
    errors.date = '未来日は記録できません。';
  }

  if (!MEAL_TYPES.includes(input.mealType)) {
    errors.mealType = '食事区分を選択してください。';
  }

  if (!MEAL_SOURCES.includes(input.mealSource)) {
    errors.mealSource = '食事分類を選択してください。';
  }

  if (title.length === 0) {
    errors.title = 'メニュー名を入力してください。';
  } else if (title.length > 80) {
    errors.title = 'メニュー名は80文字以内で入力してください。';
  }

  if (!isInRange(input.calories, 0, 5000)) {
    errors.calories = 'カロリーは0〜5000kcalで入力してください。';
  }

  if (!isInRange(input.proteinGrams, 0, 300)) {
    errors.proteinGrams = 'たんぱく質は0〜300gで入力してください。';
  }

  if (input.memo !== undefined && input.memo.length > 300) {
    errors.memo = 'メモは300文字以内で入力してください。';
  }

  return Object.keys(errors).length === 0
    ? { success: true, data: { ...input, title, memo: input.memo?.trim() || undefined, recipeId: input.recipeId || undefined } }
    : { success: false, errors };
}

export function toMealLog(values: MealLogFormValues, id: string, now: string, existing?: MealLog): MealLog {
  return {
    id,
    date: values.date,
    mealType: values.mealType,
    mealSource: values.mealSource,
    title: values.title.trim(),
    calories: values.calories,
    proteinGrams: values.proteinGrams,
    memo: values.memo?.trim() || undefined,
    photoIds: existing?.photoIds ?? [],
    recipeId: values.recipeId || undefined,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}

function isDateString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00.000Z`).getTime());
}

function isInRange(value: number, min: number, max: number): boolean {
  return Number.isFinite(value) && value >= min && value <= max;
}
