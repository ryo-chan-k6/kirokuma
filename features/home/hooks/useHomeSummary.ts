'use client';

import { useEffect, useState } from 'react';
import { indexedDbBodyRecordRepository } from '../../../infrastructure/indexeddb/body-record-repository';
import { indexedDbMealRepository } from '../../../infrastructure/indexeddb/meal-repository';
import { indexedDbSettingsRepository } from '../../../infrastructure/indexeddb/settings-repository';
import { indexedDbWorkoutRepository } from '../../../infrastructure/indexeddb/workout-repository';
import { getHomeSummary, type HomeSummary } from '../usecases';

export function useHomeSummary(today: string) {
  const [summary, setSummary] = useState<HomeSummary>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let ignore = false;
    setIsLoading(true);
    setError(undefined);

    getHomeSummary({
      bodyRecordRepository: indexedDbBodyRecordRepository,
      mealRepository: indexedDbMealRepository,
      settingsRepository: indexedDbSettingsRepository,
      workoutRepository: indexedDbWorkoutRepository,
    }, today)
      .then((nextSummary) => {
        if (!ignore) setSummary(nextSummary);
      })
      .catch(() => {
        if (!ignore) setError('ホームのデータを読み込めませんでした。少し時間をおいてもう一度お試しください。');
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => { ignore = true; };
  }, [today]);

  return { summary, isLoading, error };
}
