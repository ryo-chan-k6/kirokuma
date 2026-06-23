export type Recipe = {
  id: string;
  name: string;
  servingCount: number;
  totalCalories: number;
  totalProteinGrams: number;
  memo?: string;
  createdAt: string;
  updatedAt: string;
};

export type RecipeIngredient = {
  id: string;
  recipeId: string;
  foodId: string;
  amount: number;
  unit: string;
  calories: number;
  proteinGrams: number;
};
