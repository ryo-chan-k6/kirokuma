'use client';

import { formatWorkoutExerciseSummary, formatWorkoutPlanTitle } from './WorkoutPlanList';
import { useTodayWorkout } from '../hooks/useTodayWorkout';

function formatDayLabel(dayCode: string): string {
  return dayCode.replace('DAY_', 'Day');
}

export function TodayWorkoutCard() {
  const { data, error, isLoading } = useTodayWorkout();

  if (isLoading) {
    return (
      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-orange-600">今日の筋トレ</p>
        <p className="mt-3 text-sm text-slate-600">メニューを確認しています…</p>
      </section>
    );
  }

  if (error !== undefined || data === undefined) {
    return (
      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-orange-600">今日の筋トレ</p>
        <p className="mt-3 text-sm text-red-600">{error ?? '今日の筋トレを表示できませんでした。'}</p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-orange-600">今日の筋トレ</p>
      <div className="mt-3 rounded-3xl bg-orange-100 p-4">
        <p className="text-xs font-bold text-orange-700">{formatDayLabel(data.plan.dayCode)}</p>
        <h2 className="mt-1 text-2xl font-bold">{formatWorkoutPlanTitle(data.plan)}</h2>
        <p className="mt-2 text-sm text-slate-700">
          {data.latestCompletedSession === undefined
            ? '初回なのでDay1から始めましょう。'
            : `前回の${formatDayLabel(data.latestCompletedSession.dayCode)}の次のメニューです。`}
        </p>
      </div>
      <ul className="mt-4 grid gap-2 text-sm text-slate-700">
        {data.exercises.map((exercise) => (
          <li key={exercise.id} className="rounded-2xl bg-orange-50 p-3">
            {formatWorkoutExerciseSummary(exercise)}
          </li>
        ))}
      </ul>
    </section>
  );
}
