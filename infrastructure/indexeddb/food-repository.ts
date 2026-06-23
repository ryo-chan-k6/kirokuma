import type { FoodRepository } from '../../features/food/repository';
import type { FoodMaster } from '../../features/food/types';
import { db } from './db';

export const indexedDbFoodRepository: FoodRepository = {
  async create(input: FoodMaster) { await db.foodMaster.add(input); },
  async update(id: string, input: Partial<FoodMaster>) { await db.foodMaster.update(id, input); },
  async delete(id: string) { await db.foodMaster.delete(id); },
  async findById(id: string) { return db.foodMaster.get(id); },
  async listAll() {
    const foods = await db.foodMaster.toArray();
    return foods.sort(compareFoodsForDisplay);
  },
  async searchByName(keyword: string) {
    const normalizedKeyword = keyword.trim().toLocaleLowerCase();
    const foods = await db.foodMaster.toArray();
    const matchedFoods = normalizedKeyword.length === 0
      ? foods
      : foods.filter((food) => food.name.toLocaleLowerCase().includes(normalizedKeyword));
    return matchedFoods.sort(compareFoodsForDisplay);
  },
  async listFavorites() {
    const foods = await db.foodMaster.where('isFavorite').equals(true).toArray();
    return foods.sort(compareFoodsForDisplay);
  },
};

function compareFoodsForDisplay(a: FoodMaster, b: FoodMaster): number {
  if (a.isFavorite !== b.isFavorite) {
    return a.isFavorite ? -1 : 1;
  }
  return a.name.localeCompare(b.name, 'ja');
}
