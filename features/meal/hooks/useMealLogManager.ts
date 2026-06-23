'use client';

import { useEffect, useState } from 'react';
import { indexedDbMealRepository } from '../../../infrastructure/indexeddb/meal-repository';
import { indexedDbRecipeRepository } from '../../../infrastructure/indexeddb/recipe-repository';
import type { Recipe } from '../../recipe/types';
import { createDefaultMealLogFormValues, type MealLogFormValues } from '../schema';
import type { MealLog } from '../types';
import { applyRecipeToMealForm, listRecentMealLogs, saveMealLog } from '../usecases';

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

type State = { values: MealLogFormValues; recipes: Recipe[]; logs: MealLog[]; isLoading: boolean; isSaving: boolean; message?: string; error?: string };

export function useMealLogManager() {
  const today = todayString();
  const [state, setState] = useState<State>({ values: createDefaultMealLogFormValues(today), recipes: [], logs: [], isLoading: true, isSaving: false });

  async function load() {
    setState((current) => ({ ...current, isLoading: true, error: undefined }));
    try {
      const [recipes, logs] = await Promise.all([indexedDbRecipeRepository.listAll(), listRecentMealLogs(indexedDbMealRepository, 7, todayString())]);
      setState((current) => ({ ...current, recipes, logs, isLoading: false }));
    } catch {
      setState((current) => ({ ...current, isLoading: false, error: '食事記録を読み込めませんでした。' }));
    }
  }

  useEffect(() => { void load(); }, []);

  function updateValues(updater: (values: MealLogFormValues) => MealLogFormValues) {
    setState((current) => ({ ...current, values: updater(current.values), message: undefined, error: undefined }));
  }

  async function applyRecipe(recipeId: string) {
    if (!recipeId) return;
    try {
      const values = await applyRecipeToMealForm(indexedDbRecipeRepository, state.values, recipeId);
      setState((current) => ({ ...current, values, message: 'レシピの値を反映しました。', error: undefined }));
    } catch (error) {
      setState((current) => ({ ...current, error: error instanceof Error ? error.message : 'レシピを反映できませんでした。' }));
    }
  }

  async function submit() {
    setState((current) => ({ ...current, isSaving: true, message: undefined, error: undefined }));
    try {
      await saveMealLog(indexedDbMealRepository, state.values, todayString(), new Date().toISOString());
      const logs = await listRecentMealLogs(indexedDbMealRepository, 7, todayString());
      setState((current) => ({ ...current, logs, values: createDefaultMealLogFormValues(todayString()), isSaving: false, message: '食事を記録しました。' }));
    } catch (error) {
      setState((current) => ({ ...current, isSaving: false, error: error instanceof Error ? error.message : '食事を保存できませんでした。' }));
    }
  }

  return { ...state, updateValues, applyRecipe, submit };
}
