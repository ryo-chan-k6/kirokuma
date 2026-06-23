import type { FoodRepository } from '../food/repository';
import type { RecipeRepository } from './repository';
import { calculateIngredientNutrition, calculateRecipeTotals, toRecipe, validateRecipeForm, type RecipeFormValues } from './schema';
import type { Recipe, RecipeIngredient } from './types';

export type RecipeWithIngredients = Recipe & { ingredients: RecipeIngredient[] };

export async function saveRecipe(
  recipeRepository: RecipeRepository,
  foodRepository: FoodRepository,
  values: RecipeFormValues,
  now: string,
  id?: string,
  createId: () => string = () => crypto.randomUUID(),
): Promise<RecipeWithIngredients> {
  const validation = validateRecipeForm(values);
  if (!validation.success) {
    throw new Error(Object.values(validation.errors)[0] ?? 'レシピの入力内容を確認してください。');
  }

  const recipeId = id ?? createId();
  const existing = id === undefined ? undefined : await recipeRepository.findById(id);
  const ingredients = await Promise.all(validation.data.ingredients.map(async (ingredient, index) => {
    const food = await foodRepository.findById(ingredient.foodId);
    if (!food) {
      throw new Error('選択した食材が見つかりませんでした。');
    }
    const nutrition = calculateIngredientNutrition(food, ingredient.amount);
    return {
      id: `${recipeId}-ingredient-${index + 1}-${ingredient.foodId}`,
      recipeId,
      foodId: ingredient.foodId,
      amount: ingredient.amount,
      ...nutrition,
    } satisfies RecipeIngredient;
  }));
  const totals = calculateRecipeTotals(ingredients, validation.data.servingCount);
  const recipe = toRecipe(validation.data, totals, recipeId, now, existing);

  if (existing) {
    await recipeRepository.updateWithIngredients(existing.id, recipe, ingredients);
  } else {
    await recipeRepository.create(recipe, ingredients);
  }

  return { ...recipe, ingredients };
}

export async function listRecipes(repository: RecipeRepository): Promise<Recipe[]> {
  return repository.listAll();
}

export async function loadRecipe(repository: RecipeRepository, id: string): Promise<RecipeWithIngredients | undefined> {
  const recipe = await repository.findById(id);
  if (!recipe) return undefined;
  const ingredients = await repository.listIngredients(id);
  return { ...recipe, ingredients };
}

export async function deleteRecipe(repository: RecipeRepository, id: string): Promise<void> {
  await repository.delete(id);
}
