export type MealLog = {
  id: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  mealSource: 'home_cooking' | 'restaurant' | 'convenience_store' | 'other';
  title: string;
  calories: number;
  proteinGrams: number;
  memo?: string;
  photoIds: string[];
  recipeId?: string;
  createdAt: string;
  updatedAt: string;
};

export type MealPhoto = {
  id: string;
  mealLogId: string;
  blob: Blob;
  createdAt: string;
};
