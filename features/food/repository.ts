import type { FoodMaster } from './types';

export type FoodRepository = {
  create(input: FoodMaster): Promise<void>;
  update(id: string, input: Partial<FoodMaster>): Promise<void>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<FoodMaster | undefined>;
  listAll(): Promise<FoodMaster[]>;
  searchByName(keyword: string): Promise<FoodMaster[]>;
  listFavorites(): Promise<FoodMaster[]>;
};
