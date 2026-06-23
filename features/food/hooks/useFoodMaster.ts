'use client';

import { useEffect, useState } from 'react';
import { indexedDbFoodRepository } from '../../../infrastructure/indexeddb/food-repository';
import { createDefaultFoodFormValues, type FoodFormValues } from '../schema';
import type { FoodMaster } from '../types';
import { deleteFood, saveFood, searchFoods } from '../usecases';

type FoodMasterState = {
  foods: FoodMaster[];
  values: FoodFormValues;
  editingId?: string;
  keyword: string;
  isLoading: boolean;
  isSaving: boolean;
  message?: string;
  error?: string;
};

function toFormValues(food: FoodMaster): FoodFormValues {
  return {
    name: food.name,
    baseAmount: food.baseAmount,
    unit: food.unit,
    calories: food.calories,
    proteinGrams: food.proteinGrams,
    memo: food.memo,
    isFavorite: food.isFavorite,
  };
}

export function useFoodMaster() {
  const [state, setState] = useState<FoodMasterState>({
    foods: [],
    values: createDefaultFoodFormValues(),
    keyword: '',
    isLoading: true,
    isSaving: false,
  });

  async function load(keyword = state.keyword) {
    setState((current) => ({ ...current, isLoading: true, error: undefined }));
    try {
      const foods = await searchFoods(indexedDbFoodRepository, keyword);
      setState((current) => ({ ...current, foods, keyword, isLoading: false }));
    } catch {
      setState((current) => ({ ...current, isLoading: false, error: '食材を読み込めませんでした。少し時間をおいてもう一度お試しください。' }));
    }
  }

  useEffect(() => {
    void load('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateValues(updater: (values: FoodFormValues) => FoodFormValues) {
    setState((current) => ({ ...current, values: updater(current.values), message: undefined, error: undefined }));
  }

  function startEdit(food: FoodMaster) {
    setState((current) => ({ ...current, values: toFormValues(food), editingId: food.id, message: undefined, error: undefined }));
  }

  function resetForm() {
    setState((current) => ({ ...current, values: createDefaultFoodFormValues(), editingId: undefined, message: undefined, error: undefined }));
  }

  async function submit() {
    setState((current) => ({ ...current, isSaving: true, message: undefined, error: undefined }));
    try {
      const editing = state.editingId !== undefined;
      await saveFood(indexedDbFoodRepository, state.values, new Date().toISOString(), state.editingId);
      const foods = await searchFoods(indexedDbFoodRepository, state.keyword);
      setState((current) => ({
        ...current,
        foods,
        values: createDefaultFoodFormValues(),
        editingId: undefined,
        isSaving: false,
        message: editing ? '食材を更新しました。' : '食材を追加しました。',
      }));
    } catch (error) {
      setState((current) => ({ ...current, isSaving: false, error: error instanceof Error ? error.message : '食材を保存できませんでした。' }));
    }
  }

  async function remove(id: string) {
    setState((current) => ({ ...current, isSaving: true, message: undefined, error: undefined }));
    try {
      await deleteFood(indexedDbFoodRepository, id);
      const foods = await searchFoods(indexedDbFoodRepository, state.keyword);
      setState((current) => ({
        ...current,
        foods,
        values: current.editingId === id ? createDefaultFoodFormValues() : current.values,
        editingId: current.editingId === id ? undefined : current.editingId,
        isSaving: false,
        message: '食材を削除しました。',
      }));
    } catch {
      setState((current) => ({ ...current, isSaving: false, error: '食材を削除できませんでした。' }));
    }
  }

  return { ...state, load, updateValues, startEdit, resetForm, submit, remove };
}
