'use client';

import { useEffect, useMemo, useState } from 'react';
import { indexedDbFoodRepository } from '../../../infrastructure/indexeddb/food-repository';
import { indexedDbRecipeRepository } from '../../../infrastructure/indexeddb/recipe-repository';
import type { FoodMaster } from '../../food/types';
import { calculateIngredientNutrition, calculateRecipeTotals, createDefaultRecipeFormValues, type RecipeFormValues } from '../schema';
import type { Recipe, RecipeIngredient } from '../types';
import { deleteRecipe, listRecipes, loadRecipe, saveRecipe } from '../usecases';

type RecipeManagerState = {
  foods: FoodMaster[];
  recipes: Recipe[];
  values: RecipeFormValues;
  editingId?: string;
  isLoading: boolean;
  isSaving: boolean;
  message?: string;
  error?: string;
};

export function useRecipeManager() {
  const [state, setState] = useState<RecipeManagerState>({ foods: [], recipes: [], values: createDefaultRecipeFormValues(), isLoading: true, isSaving: false });

  async function load() {
    setState((current) => ({ ...current, isLoading: true, error: undefined }));
    try {
      const [foods, recipes] = await Promise.all([indexedDbFoodRepository.listAll(), listRecipes(indexedDbRecipeRepository)]);
      setState((current) => ({ ...current, foods, recipes, isLoading: false }));
    } catch {
      setState((current) => ({ ...current, isLoading: false, error: 'レシピを読み込めませんでした。' }));
    }
  }

  useEffect(() => { void load(); }, []);

  const previewIngredients = useMemo(() => state.values.ingredients.map((ingredient) => {
    const food = state.foods.find((item) => item.id === ingredient.foodId);
    return food ? { ...ingredient, food, nutrition: calculateIngredientNutrition(food, ingredient.amount) } : undefined;
  }).filter((item): item is NonNullable<typeof item> => item !== undefined), [state.foods, state.values.ingredients]);

  const previewTotals = useMemo(() => calculateRecipeTotals(previewIngredients.map((item) => item.nutrition), state.values.servingCount || 1), [previewIngredients, state.values.servingCount]);

  function updateValues(updater: (values: RecipeFormValues) => RecipeFormValues) {
    setState((current) => ({ ...current, values: updater(current.values), message: undefined, error: undefined }));
  }

  function addIngredient(foodId: string) {
    const food = state.foods.find((item) => item.id === foodId);
    if (!food) return;
    updateValues((current) => ({ ...current, ingredients: [...current.ingredients, { foodId, amount: food.baseAmount }] }));
  }

  function updateIngredient(index: number, changes: Partial<RecipeFormValues['ingredients'][number]>) {
    updateValues((current) => ({ ...current, ingredients: current.ingredients.map((ingredient, currentIndex) => currentIndex === index ? { ...ingredient, ...changes } : ingredient) }));
  }

  function removeIngredient(index: number) {
    updateValues((current) => ({ ...current, ingredients: current.ingredients.filter((_, currentIndex) => currentIndex !== index) }));
  }

  async function startEdit(recipe: Recipe) {
    setState((current) => ({ ...current, isLoading: true, message: undefined, error: undefined }));
    try {
      const loaded = await loadRecipe(indexedDbRecipeRepository, recipe.id);
      if (!loaded) throw new Error('missing');
      setState((current) => ({ ...current, isLoading: false, editingId: recipe.id, values: toFormValues(loaded) }));
    } catch {
      setState((current) => ({ ...current, isLoading: false, error: 'レシピを編集用に読み込めませんでした。' }));
    }
  }

  function resetForm() {
    setState((current) => ({ ...current, values: createDefaultRecipeFormValues(), editingId: undefined, message: undefined, error: undefined }));
  }

  async function submit() {
    setState((current) => ({ ...current, isSaving: true, message: undefined, error: undefined }));
    try {
      const editing = state.editingId !== undefined;
      await saveRecipe(indexedDbRecipeRepository, indexedDbFoodRepository, state.values, new Date().toISOString(), state.editingId);
      const recipes = await listRecipes(indexedDbRecipeRepository);
      setState((current) => ({ ...current, recipes, values: createDefaultRecipeFormValues(), editingId: undefined, isSaving: false, message: editing ? 'レシピを更新しました。' : 'レシピを追加しました。' }));
    } catch (error) {
      setState((current) => ({ ...current, isSaving: false, error: error instanceof Error ? error.message : 'レシピを保存できませんでした。' }));
    }
  }

  async function remove(id: string) {
    setState((current) => ({ ...current, isSaving: true, message: undefined, error: undefined }));
    try {
      await deleteRecipe(indexedDbRecipeRepository, id);
      const recipes = await listRecipes(indexedDbRecipeRepository);
      setState((current) => ({ ...current, recipes, isSaving: false, values: current.editingId === id ? createDefaultRecipeFormValues() : current.values, editingId: current.editingId === id ? undefined : current.editingId, message: 'レシピを削除しました。' }));
    } catch {
      setState((current) => ({ ...current, isSaving: false, error: 'レシピを削除できませんでした。' }));
    }
  }

  return { ...state, previewIngredients, previewTotals, load, updateValues, addIngredient, updateIngredient, removeIngredient, startEdit, resetForm, submit, remove };
}

function toFormValues(recipe: Recipe & { ingredients: RecipeIngredient[] }): RecipeFormValues {
  return { name: recipe.name, servingCount: recipe.servingCount, memo: recipe.memo, ingredients: recipe.ingredients.map((ingredient) => ({ foodId: ingredient.foodId, amount: ingredient.amount })) };
}
