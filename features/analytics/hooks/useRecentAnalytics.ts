'use client';

import { useEffect, useState } from 'react';
import { indexedDbBodyRecordRepository } from '../../../infrastructure/indexeddb/body-record-repository';
import { indexedDbMealRepository } from '../../../infrastructure/indexeddb/meal-repository';
import { indexedDbSettingsRepository } from '../../../infrastructure/indexeddb/settings-repository';
import { indexedDbWorkoutRepository } from '../../../infrastructure/indexeddb/workout-repository';
import { getRecentAnalytics, type AnalyticsSummary } from '../usecases';

export function useRecentAnalytics(today: string) {
  const [summary, setSummary] = useState<AnalyticsSummary>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setIsLoading(true);
    });
    getRecentAnalytics({
      bodyRecordRepository: indexedDbBodyRecordRepository,
      mealRepository: indexedDbMealRepository,
      settingsRepository: indexedDbSettingsRepository,
      workoutRepository: indexedDbWorkoutRepository,
    }, today)
      .then((result) => { if (!cancelled) { setSummary(result); setError(undefined); } })
      .catch(() => { if (!cancelled) setError('分析データを読み込めませんでした。'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [today]);

  return { summary, isLoading, error };
}
