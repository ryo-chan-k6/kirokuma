import type { FoodMaster } from '../food/types';
import type { Recipe, RecipeIngredient } from './types';

export type RecipeIngredientFormValues = {
  foodId: string;
  amount: number;
};

export type RecipeFormValues = {
  name: string;
  servingCount: number;
  memo?: string;
  ingredients: RecipeIngredientFormValues[];
};

export type RecipeNutritionTotals = {
  totalCalories: number;
  totalProteinGrams: number;
  caloriesPerServing: number;
  proteinGramsPerServing: number;
};

export type RecipeValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: Partial<Record<keyof RecipeFormValues | `ingredient-${number}`, string>> };

export function createDefaultRecipeFormValues(): RecipeFormValues {
  return { name: '', servingCount: 1, ingredients: [] };
}

export function validateRecipeForm(input: RecipeFormValues): RecipeValidationResult<RecipeFormValues> {
  const errors: Partial<Record<keyof RecipeFormValues | `ingredient-${number}`, string>> = {};
  const name = input.name.trim();

  if (name.length === 0) {
    errors.name = 'レシピ名を入力してください。';
  } else if (name.length > 80) {
    errors.name = 'レシピ名は80文字以内で入力してください。';
  }

  if (!isInRange(input.servingCount, 1, 100)) {
    errors.servingCount = '何食分かは1〜100で入力してください。';
  }

  if (input.memo !== undefined && input.memo.length > 300) {
    errors.memo = 'メモは300文字以内で入力してください。';
  }

  if (input.ingredients.length === 0) {
    errors.ingredients = '材料を1つ以上追加してください。';
  }

  input.ingredients.forEach((ingredient, index) => {
    if (ingredient.foodId.trim().length === 0 || !isInRange(ingredient.amount, 0.1, 100000)) {
      errors[`ingredient-${index}`] = '材料と使用量を確認してください。';
    }
  });

  return Object.keys(errors).length === 0
    ? { success: true, data: { ...input, name, memo: input.memo?.trim() || undefined } }
    : { success: false, errors };
}

export function calculateIngredientNutrition(food: FoodMaster, amount: number): Pick<RecipeIngredient, 'calories' | 'proteinGrams' | 'unit'> {
  const ratio = amount / food.baseAmount;
  return {
    unit: food.unit,
    calories: roundNutrition(food.calories * ratio),
    proteinGrams: roundNutrition(food.proteinGrams * ratio),
  };
}

export function calculateRecipeTotals(ingredients: Array<Pick<RecipeIngredient, 'calories' | 'proteinGrams'>>, servingCount: number): RecipeNutritionTotals {
  const totalCalories = roundNutrition(ingredients.reduce((sum, ingredient) => sum + ingredient.calories, 0));
  const totalProteinGrams = roundNutrition(ingredients.reduce((sum, ingredient) => sum + ingredient.proteinGrams, 0));
  return {
    totalCalories,
    totalProteinGrams,
    caloriesPerServing: roundNutrition(totalCalories / servingCount),
    proteinGramsPerServing: roundNutrition(totalProteinGrams / servingCount),
  };
}

export function toRecipe(values: RecipeFormValues, totals: RecipeNutritionTotals, id: string, now: string, existing?: Recipe): Recipe {
  return {
    id,
    name: values.name.trim(),
    servingCount: values.servingCount,
    totalCalories: totals.totalCalories,
    totalProteinGrams: totals.totalProteinGrams,
    memo: values.memo?.trim() || undefined,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}

function isInRange(value: number, min: number, max: number): boolean {
  return Number.isFinite(value) && value >= min && value <= max;
}

function roundNutrition(value: number): number {
  return Math.round(value * 10) / 10;
}
