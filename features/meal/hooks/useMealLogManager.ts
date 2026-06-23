'use client';

import { useEffect, useRef, useState } from 'react';
import { indexedDbMealRepository } from '../../../infrastructure/indexeddb/meal-repository';
import { indexedDbRecipeRepository } from '../../../infrastructure/indexeddb/recipe-repository';
import type { Recipe } from '../../recipe/types';
import { createDefaultMealLogFormValues, type MealLogFormValues } from '../schema';
import type { MealLog, MealPhoto } from '../types';
import { addMealPhotos, applyRecipeToMealForm, listRecentMealLogs, removeMealPhoto, saveMealLog, validateMealPhoto } from '../usecases';

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

type SelectedMealPhoto = { id: string; file: File; previewUrl: string };
type MealPhotoPreview = MealPhoto & { previewUrl: string };
type State = { values: MealLogFormValues; recipes: Recipe[]; logs: MealLog[]; photosByMealLogId: Record<string, MealPhotoPreview[]>; selectedPhotos: SelectedMealPhoto[]; isLoading: boolean; isSaving: boolean; message?: string; error?: string };

export function useMealLogManager() {
  const today = todayString();
  const [state, setState] = useState<State>({ values: createDefaultMealLogFormValues(today), recipes: [], logs: [], photosByMealLogId: {}, selectedPhotos: [], isLoading: true, isSaving: false });
  const stateRef = useRef(state);
  stateRef.current = state;

  async function load() {
    setState((current) => ({ ...current, isLoading: true, error: undefined }));
    try {
      const [recipes, logs] = await Promise.all([indexedDbRecipeRepository.listAll(), listRecentMealLogs(indexedDbMealRepository, 7, todayString())]);
      const photosByMealLogId = await loadPhotoPreviews(logs);
      setState((current) => {
        revokePhotoPreviews(current.photosByMealLogId);
        return { ...current, recipes, logs, photosByMealLogId, isLoading: false };
      });
    } catch {
      setState((current) => ({ ...current, isLoading: false, error: '食事記録を読み込めませんでした。' }));
    }
  }

  useEffect(() => {
    void load();
    return () => {
      stateRef.current.selectedPhotos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
      revokePhotoPreviews(stateRef.current.photosByMealLogId);
    };
  }, []);

  function updateValues(updater: (values: MealLogFormValues) => MealLogFormValues) {
    setState((current) => ({ ...current, values: updater(current.values), message: undefined, error: undefined }));
  }

  function selectPhotos(files: FileList | null) {
    if (!files) return;
    try {
      const selectedPhotos = Array.from(files).map((file) => {
        validateMealPhoto(file);
        return { id: crypto.randomUUID(), file, previewUrl: URL.createObjectURL(file) };
      });
      setState((current) => ({ ...current, selectedPhotos: [...current.selectedPhotos, ...selectedPhotos], message: undefined, error: undefined }));
    } catch (error) {
      setState((current) => ({ ...current, error: error instanceof Error ? error.message : '写真を選択できませんでした。' }));
    }
  }

  function unselectPhoto(id: string) {
    setState((current) => {
      const photo = current.selectedPhotos.find((item) => item.id === id);
      if (photo) URL.revokeObjectURL(photo.previewUrl);
      return { ...current, selectedPhotos: current.selectedPhotos.filter((item) => item.id !== id), message: undefined, error: undefined };
    });
  }

  async function deletePhoto(photoId: string) {
    try {
      await removeMealPhoto(indexedDbMealRepository, photoId);
      await load();
      setState((current) => ({ ...current, message: '写真を削除しました。', error: undefined }));
    } catch {
      setState((current) => ({ ...current, error: '写真を削除できませんでした。' }));
    }
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
      const now = new Date().toISOString();
      const mealLog = await saveAndAttachPhotos(state.values, state.selectedPhotos, now);
      const logs = await listRecentMealLogs(indexedDbMealRepository, 7, todayString());
      const photosByMealLogId = await loadPhotoPreviews(logs);
      setState((current) => {
        current.selectedPhotos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
        revokePhotoPreviews(current.photosByMealLogId);
        return { ...current, logs, photosByMealLogId, selectedPhotos: [], values: createDefaultMealLogFormValues(todayString()), isSaving: false, message: mealLog.photoIds.length > 0 ? '食事と写真を記録しました。' : '食事を記録しました。' };
      });
    } catch (error) {
      setState((current) => ({ ...current, isSaving: false, error: error instanceof Error ? error.message : '食事を保存できませんでした。' }));
    }
  }

  async function saveAndAttachPhotos(values: MealLogFormValues, selectedPhotos: SelectedMealPhoto[], now: string): Promise<MealLog> {
    const mealLog = await saveMealLog(indexedDbMealRepository, values, todayString(), now);
    if (selectedPhotos.length > 0) {
      const photos = await addMealPhotos(indexedDbMealRepository, mealLog.id, selectedPhotos.map((photo) => ({ blob: photo.file, name: photo.file.name })), now);
      mealLog.photoIds = photos.map((photo) => photo.id);
    }
    return mealLog;
  }

  return { ...state, updateValues, selectPhotos, unselectPhoto, deletePhoto, applyRecipe, submit };
}

async function loadPhotoPreviews(logs: MealLog[]): Promise<Record<string, MealPhotoPreview[]>> {
  const entries = await Promise.all(logs.map(async (log) => {
    const photos = await indexedDbMealRepository.listPhotos(log.id);
    return [log.id, photos.map((photo) => ({ ...photo, previewUrl: URL.createObjectURL(photo.blob) }))] as const;
  }));
  return Object.fromEntries(entries);
}

function revokePhotoPreviews(photosByMealLogId: Record<string, MealPhotoPreview[]>): void {
  Object.values(photosByMealLogId).flat().forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
}
