'use client';

import type { WorkoutSessionFormValues } from '../schema';
import { useWorkoutSessionForm } from '../hooks/useWorkoutSessionForm';
import { formatWorkoutPlanTitle } from './WorkoutPlanList';

const effortLabels = {
  easy: '軽め',
  normal: 'ふつう',
  hard: 'きつい',
} as const;

function toOptionalNumber(value: string): number | undefined {
  return value.trim() === '' ? undefined : Number(value);
}

function updateSet(values: WorkoutSessionFormValues, index: number, changes: Partial<WorkoutSessionFormValues['sets'][number]>): WorkoutSessionFormValues {
  return {
    ...values,
    sets: values.sets.map((set, setIndex) => (setIndex === index ? { ...set, ...changes } : set)),
  };
}

export function WorkoutSessionForm() {
  const { todayWorkout, values, isLoading, isSaving, message, error, updateValues, submit } = useWorkoutSessionForm();

  if (isLoading) {
    return <section className="rounded-3xl bg-white p-5 shadow-sm"><p className="text-sm text-slate-600">記録フォームを準備しています…</p></section>;
  }

  if (todayWorkout === undefined || values === undefined) {
    return <section className="rounded-3xl bg-white p-5 shadow-sm"><p className="text-sm text-red-600">{error ?? '筋トレ記録を開始できませんでした。'}</p></section>;
  }

  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-orange-600">筋トレ記録</p>
      <h2 className="mt-2 text-xl font-bold">{formatWorkoutPlanTitle(todayWorkout.plan)}</h2>
      <p className="mt-2 text-sm text-slate-600">各セットの重量・回数・秒数を確認して、終わったセットにチェックを入れてください。</p>

      <form
        className="mt-5 grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          日付
          <input className="rounded-2xl border border-orange-200 px-4 py-3" type="date" value={values.date} onChange={(event) => updateValues((current) => ({ ...current, date: event.target.value }))} />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            時間（分）
            <input className="rounded-2xl border border-orange-200 px-4 py-3" inputMode="numeric" type="number" min="1" max="600" value={values.durationMinutes ?? ''} onChange={(event) => updateValues((current) => ({ ...current, durationMinutes: toOptionalNumber(event.target.value) }))} />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            きつさ
            <select className="rounded-2xl border border-orange-200 px-4 py-3" value={values.effortLevel ?? 'normal'} onChange={(event) => updateValues((current) => ({ ...current, effortLevel: event.target.value as WorkoutSessionFormValues['effortLevel'] }))}>
              {Object.entries(effortLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
        </div>

        <label className="flex items-center gap-3 rounded-2xl bg-orange-50 p-4 text-sm font-semibold text-slate-700">
          <input type="checkbox" className="h-5 w-5" checked={values.completed} onChange={(event) => updateValues((current) => ({ ...current, completed: event.target.checked }))} />
          このDayを完了にする
        </label>

        <div className="grid gap-4">
          {values.sets.map((set, index) => (
            <div key={`${set.exerciseName}-${set.setNumber}`} className="rounded-3xl border border-orange-100 bg-orange-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-900">{set.exerciseName}</p>
                  <p className="text-xs text-slate-600">{set.setNumber}セット目</p>
                </div>
                <label className="flex items-center gap-2 text-sm font-semibold text-orange-700">
                  <input type="checkbox" className="h-5 w-5" checked={set.completed} onChange={(event) => updateValues((current) => updateSet(current, index, { completed: event.target.checked }))} />
                  完了
                </label>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <input aria-label={`${set.exerciseName} ${set.setNumber}セット目 重量`} className="min-w-0 rounded-2xl border border-orange-200 px-3 py-3" inputMode="decimal" type="number" min="0" step="0.5" placeholder="kg" value={set.weightKg ?? ''} onChange={(event) => updateValues((current) => updateSet(current, index, { weightKg: toOptionalNumber(event.target.value) }))} />
                <input aria-label={`${set.exerciseName} ${set.setNumber}セット目 回数`} className="min-w-0 rounded-2xl border border-orange-200 px-3 py-3" inputMode="numeric" type="number" min="1" placeholder="回" value={set.reps ?? ''} onChange={(event) => updateValues((current) => updateSet(current, index, { reps: toOptionalNumber(event.target.value) }))} />
                <input aria-label={`${set.exerciseName} ${set.setNumber}セット目 秒数`} className="min-w-0 rounded-2xl border border-orange-200 px-3 py-3" inputMode="numeric" type="number" min="1" placeholder="秒" value={set.seconds ?? ''} onChange={(event) => updateValues((current) => updateSet(current, index, { seconds: toOptionalNumber(event.target.value) }))} />
              </div>
            </div>
          ))}
        </div>

        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          メモ
          <textarea className="min-h-24 rounded-2xl border border-orange-200 px-4 py-3" maxLength={300} value={values.memo ?? ''} onChange={(event) => updateValues((current) => ({ ...current, memo: event.target.value }))} placeholder="調子や気づきをメモできます" />
        </label>

        {message && <p className="rounded-2xl bg-green-50 p-3 text-sm font-semibold text-green-700">{message}</p>}
        {error && <p className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}

        <button className="rounded-2xl bg-orange-500 px-4 py-4 font-bold text-white shadow-sm disabled:bg-orange-200" type="submit" disabled={isSaving}>
          {isSaving ? '保存しています…' : '筋トレを記録する'}
        </button>
      </form>
    </section>
  );
}
