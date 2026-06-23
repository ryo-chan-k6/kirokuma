import type { RecipeRepository } from '../recipe/repository';
import type { MealRepository } from './repository';
import { toMealLog, validateMealLogForm, type MealLogFormValues } from './schema';
import type { MealLog } from './types';

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

function addDays(date: string, days: number): string {
  const value = new Date(`${date}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}
