'use client';

import { useEffect, useState } from 'react';
import { indexedDbWorkoutRepository } from '../../../infrastructure/indexeddb/workout-repository';
import { createWorkoutSessionFormDefaults, type WorkoutSessionFormValues } from '../schema';
import { getTodayWorkout, saveWorkoutSession, type TodayWorkout } from '../usecases';

type WorkoutSessionFormState = {
  todayWorkout?: TodayWorkout;
  values?: WorkoutSessionFormValues;
  isLoading: boolean;
  isSaving: boolean;
  message?: string;
  error?: string;
};

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function useWorkoutSessionForm() {
  const [state, setState] = useState<WorkoutSessionFormState>({ isLoading: true, isSaving: false });

  async function load() {
    setState((current) => ({ ...current, isLoading: true, error: undefined }));
    try {
      const todayWorkout = await getTodayWorkout(indexedDbWorkoutRepository);
      setState({
        todayWorkout,
        values: createWorkoutSessionFormDefaults(todayWorkout.exercises, todayString()),
        isLoading: false,
        isSaving: false,
      });
    } catch {
      setState({ isLoading: false, isSaving: false, error: '筋トレメニューを読み込めませんでした。少し時間をおいてもう一度お試しください。' });
    }
  }

  useEffect(() => {
    let active = true;
    getTodayWorkout(indexedDbWorkoutRepository)
      .then((todayWorkout) => {
        if (active) {
          setState({ todayWorkout, values: createWorkoutSessionFormDefaults(todayWorkout.exercises, todayString()), isLoading: false, isSaving: false });
        }
      })
      .catch(() => {
        if (active) {
          setState({ isLoading: false, isSaving: false, error: '筋トレメニューを読み込めませんでした。少し時間をおいてもう一度お試しください。' });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  function updateValues(updater: (values: WorkoutSessionFormValues) => WorkoutSessionFormValues) {
    setState((current) => (current.values === undefined ? current : { ...current, values: updater(current.values), message: undefined, error: undefined }));
  }

  async function submit() {
    if (state.values === undefined) {
      return;
    }

    setState((current) => ({ ...current, isSaving: true, message: undefined, error: undefined }));
    try {
      await saveWorkoutSession(indexedDbWorkoutRepository, state.values, todayString(), new Date().toISOString());
      const nextWorkout = await getTodayWorkout(indexedDbWorkoutRepository);
      setState({
        todayWorkout: nextWorkout,
        values: createWorkoutSessionFormDefaults(nextWorkout.exercises, todayString()),
        isLoading: false,
        isSaving: false,
        message: '筋トレを記録しました。次回のDayに進みました！',
      });
    } catch (error) {
      setState((current) => ({ ...current, isSaving: false, error: error instanceof Error ? error.message : '筋トレ記録を保存できませんでした。' }));
    }
  }

  return { ...state, reload: load, updateValues, submit };
}
