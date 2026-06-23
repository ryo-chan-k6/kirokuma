import type { Recipe, RecipeIngredient } from './types';

export type RecipeRepository = {
  create(input: Recipe, ingredients: RecipeIngredient[]): Promise<void>;
  update(id: string, input: Partial<Recipe>): Promise<void>;
  updateWithIngredients(id: string, input: Recipe, ingredients: RecipeIngredient[]): Promise<void>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Recipe | undefined>;
  listAll(): Promise<Recipe[]>;
  listIngredients(recipeId: string): Promise<RecipeIngredient[]>;
};
