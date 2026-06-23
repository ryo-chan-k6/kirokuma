'use client';

import { useMemo } from 'react';
import { useRecentAnalytics } from '../hooks/useRecentAnalytics';
import type { DailyAnalytics } from '../usecases';

export function AnalyticsDashboard() {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const { summary, isLoading, error } = useRecentAnalytics(today);

  if (isLoading) return <section className="rounded-3xl bg-white p-5 text-sm text-slate-600 shadow-sm">直近7日の分析を読み込んでいます…</section>;
  if (error || !summary) return <section className="rounded-3xl bg-white p-5 text-sm text-red-600 shadow-sm">{error ?? '分析を表示できませんでした。'}</section>;

  return (
    <>
      <section className="grid grid-cols-2 gap-3">
        <MetricCard label="最新体重" value={summary.latestWeightKg ? `${summary.latestWeightKg}kg` : '未記録'} note={summary.targetWeightKg ? `目標 ${summary.targetWeightKg}kg` : '目標体重は未設定'} />
        <MetricCard label="平均カロリー" value={`${summary.averageCalories}kcal`} note={summary.targetCalories ? `目安 ${summary.targetCalories}kcal/日` : '目標は未設定'} />
        <MetricCard label="平均たんぱく質" value={`${summary.averageProteinGrams}g`} note={summary.targetProteinGrams ? `目安 ${summary.targetProteinGrams}g/日` : '目標は未設定'} />
        <MetricCard label="筋トレ回数" value={`${summary.totalWorkoutCount}回`} note={`食事記録 ${summary.totalMealLogCount}件`} />
      </section>

      <ChartSection title="体重推移" unit="kg" values={summary.daily} pick={(day) => day.weightKg} target={summary.targetWeightKg} emptyText="体重記録がない日は点線で表示します。" />
      <ChartSection title="摂取カロリー" unit="kcal" values={summary.daily} pick={(day) => day.calories} target={summary.targetCalories} />
      <ChartSection title="たんぱく質" unit="g" values={summary.daily} pick={(day) => day.proteinGrams} target={summary.targetProteinGrams} />

      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-orange-600">記録件数</p>
        <h2 className="mt-2 text-xl font-bold">食事と筋トレのペース</h2>
        <div className="mt-4 grid gap-2">
          {summary.daily.map((day) => (
            <div key={day.date} className="grid grid-cols-[3.5rem_1fr] items-center gap-3 text-sm">
              <span className="font-semibold text-slate-700">{day.label}</span>
              <div className="rounded-2xl bg-slate-50 px-3 py-2 text-slate-600">食事 {day.mealLogCount}件 ・ 筋トレ {day.workoutCount}回</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function MetricCard({ label, value, note }: { label: string; value: string; note: string }) {
  return <div className="rounded-3xl bg-white p-4 shadow-sm"><p className="text-xs font-semibold text-orange-600">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p><p className="mt-1 text-xs text-slate-500">{note}</p></div>;
}

function ChartSection({ title, unit, values, pick, target, emptyText }: { title: string; unit: string; values: DailyAnalytics[]; pick: (day: DailyAnalytics) => number | undefined; target?: number; emptyText?: string }) {
  const chartValues = values.map((day) => pick(day));
  const numericValues = chartValues.filter((value): value is number => value !== undefined);
  const max = Math.max(...numericValues, target ?? 0, 1);

  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div><p className="text-sm font-semibold text-orange-600">直近7日</p><h2 className="mt-1 text-xl font-bold">{title}</h2></div>
        {target ? <p className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-800">目標 {target}{unit}</p> : null}
      </div>
      <div className="mt-5 flex h-40 items-end gap-2 rounded-2xl bg-slate-50 px-3 py-4">
        {values.map((day, index) => {
          const value = chartValues[index];
          const height = value === undefined ? 8 : Math.max((value / max) * 100, 4);
          return (
            <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
              <div className={`w-full rounded-t-xl ${value === undefined ? 'border border-dashed border-slate-300 bg-transparent' : 'bg-orange-400'}`} style={{ height: `${height}%` }} title={value === undefined ? '未記録' : `${value}${unit}`} />
              <span className="text-[0.65rem] font-semibold text-slate-500">{day.label}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 grid gap-1 text-xs text-slate-600">
        {values.map((day, index) => <p key={day.date}>{day.label}：{chartValues[index] === undefined ? '未記録' : `${chartValues[index]}${unit}`}{formatDiff(title, day)}</p>)}
      </div>
      {emptyText ? <p className="mt-3 text-xs text-slate-500">{emptyText}</p> : null}
    </section>
  );
}

function formatDiff(title: string, day: DailyAnalytics): string {
  if (title === '体重推移' && day.weightDiff !== undefined) return `（目標まで ${formatSigned(day.weightDiff)}kg）`;
  if (title === '摂取カロリー' && day.calorieDiff !== undefined) return `（目標比 ${formatSigned(day.calorieDiff)}kcal）`;
  if (title === 'たんぱく質' && day.proteinDiff !== undefined) return `（目標比 ${formatSigned(day.proteinDiff)}g）`;
  return '';
}

function formatSigned(value: number): string { return value > 0 ? `+${value}` : `${value}`; }
