'use client';

import { useEffect, useState } from 'react';
import { indexedDbWorkoutRepository } from '../../../infrastructure/indexeddb/workout-repository';
import { getTodayWorkout, type TodayWorkout } from '../usecases';

type TodayWorkoutState = {
  data?: TodayWorkout;
  isLoading: boolean;
  error?: string;
};

export function useTodayWorkout(): TodayWorkoutState {
  const [state, setState] = useState<TodayWorkoutState>({ isLoading: true });

  useEffect(() => {
    let active = true;

    getTodayWorkout(indexedDbWorkoutRepository)
      .then((data) => {
        if (active) {
          setState({ data, isLoading: false });
        }
      })
      .catch(() => {
        if (active) {
          setState({ error: '今日の筋トレを読み込めませんでした。少し時間をおいてもう一度お試しください。', isLoading: false });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return state;
}
