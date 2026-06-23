import type { FoodMaster } from './types';

export type FoodUnit = FoodMaster['unit'];

export type FoodFormValues = {
  name: string;
  baseAmount: number;
  unit: FoodUnit;
  calories: number;
  proteinGrams: number;
  memo?: string;
  isFavorite: boolean;
};

export type FoodValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: Partial<Record<keyof T, string>> };

const FOOD_UNITS: FoodUnit[] = ['g', 'ml', 'piece', 'serving'];

export function createDefaultFoodFormValues(): FoodFormValues {
  return {
    name: '',
    baseAmount: 100,
    unit: 'g',
    calories: 0,
    proteinGrams: 0,
    isFavorite: false,
  };
}

export function validateFoodForm(input: FoodFormValues): FoodValidationResult<FoodFormValues> {
  const errors: Partial<Record<keyof FoodFormValues, string>> = {};
  const name = input.name.trim();

  if (name.length === 0) {
    errors.name = '食材名を入力してください。';
  } else if (name.length > 80) {
    errors.name = '食材名は80文字以内で入力してください。';
  }

  if (!isInRange(input.baseAmount, 0.1, 10000)) {
    errors.baseAmount = '基準量は0.1〜10000で入力してください。';
  }

  if (!FOOD_UNITS.includes(input.unit)) {
    errors.unit = '単位を選択してください。';
  }

  if (!isInRange(input.calories, 0, 100000)) {
    errors.calories = 'カロリーは0〜100000kcalで入力してください。';
  }

  if (!isInRange(input.proteinGrams, 0, 10000)) {
    errors.proteinGrams = 'たんぱく質は0〜10000gで入力してください。';
  }

  if (input.memo !== undefined && input.memo.length > 300) {
    errors.memo = 'メモは300文字以内で入力してください。';
  }

  return Object.keys(errors).length === 0
    ? { success: true, data: { ...input, name, memo: input.memo?.trim() || undefined } }
    : { success: false, errors };
}

export function toFoodMaster(values: FoodFormValues, id: string, now: string, existing?: FoodMaster): FoodMaster {
  return {
    id,
    name: values.name.trim(),
    baseAmount: values.baseAmount,
    unit: values.unit,
    calories: values.calories,
    proteinGrams: values.proteinGrams,
    memo: values.memo?.trim() || undefined,
    isFavorite: values.isFavorite,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}

function isInRange(value: number, min: number, max: number): boolean {
  return Number.isFinite(value) && value >= min && value <= max;
}
