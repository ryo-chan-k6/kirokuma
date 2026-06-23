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
  async updateWithIngredients(id: string, input: Recipe, ingredients: RecipeIngredient[]) {
    await db.transaction('rw', db.recipes, db.recipeIngredients, async () => {
      await db.recipes.update(id, input);
      const currentIngredients = await db.recipeIngredients.where('recipeId').equals(id).toArray();
      await Promise.all(currentIngredients.map((ingredient) => db.recipeIngredients.delete(ingredient.id)));
      await Promise.all(ingredients.map((ingredient) => db.recipeIngredients.add(ingredient)));
    });
  },
  async delete(id: string) {
    await db.transaction('rw', db.recipes, db.recipeIngredients, async () => {
      await db.recipes.delete(id);
      const currentIngredients = await db.recipeIngredients.where('recipeId').equals(id).toArray();
      await Promise.all(currentIngredients.map((ingredient) => db.recipeIngredients.delete(ingredient.id)));
    });
  },
  async findById(id: string) { return db.recipes.get(id); },
  async listAll() {
    const recipes = await db.recipes.toArray();
    return recipes.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
  },
  async listIngredients(recipeId: string) { return db.recipeIngredients.where('recipeId').equals(recipeId).toArray(); },
};
