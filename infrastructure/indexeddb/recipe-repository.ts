import type { RecipeRepository } from '../../features/recipe/repository';
import type { Recipe, RecipeIngredient } from '../../features/recipe/types';
import { db } from './db';

export const indexedDbRecipeRepository: RecipeRepository = {
  async create(input: Recipe, ingredients: RecipeIngredient[]) {
    await db.transaction('rw', db.recipes, db.recipeIngredients, async () => {
      await db.recipes.add(input);
      await Promise.all(ingredients.map((ingredient) => db.recipeIngredients.add(ingredient)));
    });
  },
  async update(id: string, input: Partial<Recipe>) { await db.recipes.update(id, input); },
  async delete(id: string) { await db.recipes.delete(id); },
  async findById(id: string) { return db.recipes.get(id); },
  async listIngredients(recipeId: string) { return db.recipeIngredients.where('recipeId').equals(recipeId).toArray(); },
};
