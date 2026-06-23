import type { FoodRepository } from './repository';
import { toFoodMaster, validateFoodForm, type FoodFormValues } from './schema';
import type { FoodMaster } from './types';

export async function saveFood(
  repository: FoodRepository,
  values: FoodFormValues,
  now: string,
  id?: string,
  createId: () => string = () => crypto.randomUUID(),
): Promise<FoodMaster> {
  const validation = validateFoodForm(values);
  if (!validation.success) {
    throw new Error(Object.values(validation.errors)[0] ?? '食材の入力内容を確認してください。');
  }

  const existing = id === undefined ? undefined : await repository.findById(id);
  const food = toFoodMaster(validation.data, existing?.id ?? id ?? createId(), now, existing);

  if (existing) {
    await repository.update(existing.id, food);
  } else {
    await repository.create(food);
  }

  return food;
}

export async function deleteFood(repository: FoodRepository, id: string): Promise<void> {
  await repository.delete(id);
}

export async function searchFoods(repository: FoodRepository, keyword: string): Promise<FoodMaster[]> {
  return repository.searchByName(keyword.trim());
}
