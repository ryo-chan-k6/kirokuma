export type FoodMaster = {
  id: string;
  name: string;
  baseAmount: number;
  unit: 'g' | 'ml' | 'piece' | 'serving';
  calories: number;
  proteinGrams: number;
  memo?: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
};
