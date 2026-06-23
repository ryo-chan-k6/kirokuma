import type { FoodRepository } from '../../features/food/repository';
import type { FoodMaster } from '../../features/food/types';
import { db } from './db';

export const indexedDbFoodRepository: FoodRepository = {
  async create(input: FoodMaster) { await db.foodMaster.add(input); },
  async update(id: string, input: Partial<FoodMaster>) { await db.foodMaster.update(id, input); },
  async delete(id: string) { await db.foodMaster.delete(id); },
  async findById(id: string) { return db.foodMaster.get(id); },
  async searchByName(keyword: string) {
    const foods = await db.foodMaster.toArray();
    return foods.filter((food) => food.name.includes(keyword));
  },
  async listFavorites() { return db.foodMaster.where('isFavorite').equals(true).toArray(); },
};
