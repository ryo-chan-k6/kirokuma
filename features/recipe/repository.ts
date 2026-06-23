import type { Recipe, RecipeIngredient } from './types';

export type RecipeRepository = {
  create(input: Recipe, ingredients: RecipeIngredient[]): Promise<void>;
  update(id: string, input: Partial<Recipe>): Promise<void>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Recipe | undefined>;
  listIngredients(recipeId: string): Promise<RecipeIngredient[]>;
};
