'use client';

import { useMemo } from 'react';
import { useHomeSummary } from '../hooks/useHomeSummary';

export function HomeDashboard() {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const { summary, isLoading, error } = useHomeSummary(today);

  if (isLoading) {
    return <section className="rounded-3xl bg-white p-5 text-sm text-slate-600 shadow-sm">今日の記録を読み込んでいます…</section>;
  }

  if (error || !summary) {
    return <section className="rounded-3xl bg-white p-5 text-sm text-red-600 shadow-sm">{error ?? 'ホームのデータを表示できませんでした。'}</section>;
  }

  const todayBodyRecorded = summary.recentStatuses[0]?.hasBodyRecord ?? false;
  const todayWorkoutDone = summary.recentStatuses[0]?.hasWorkout ?? false;

  return (
    <>
      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-orange-600">{formatJapaneseDate(summary.today)}</p>
        <h2 className="mt-2 text-xl font-bold">今日のやること</h2>
        <div className="mt-4 grid gap-3">
          <TaskItem done={todayBodyRecorded} label="体重を記録" />
          <TaskItem done={summary.todayMeals.length > 0} label="食事を記録" />
          <TaskItem done={todayWorkoutDone} label={`${formatDay(summary.todayWorkout.plan.dayCode)}：${summary.todayWorkout.plan.name}`} />
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <MetricCard label="現在体重" value={summary.currentBodyRecord ? `${summary.currentBodyRecord.weightKg}kg` : '未記録'} note={summary.currentBodyRecord?.date ?? '体重記録から表示'} />
        <MetricCard label="目標体重" value={summary.targetWeightKg ? `${summary.targetWeightKg}kg` : '未設定'} note="設定画面から変更できます" />
        <MetricCard label="今日のカロリー" value={`${summary.todayCalories}kcal`} note={summary.targetCalories ? `目安 ${summary.targetCalories}kcal` : '目標は未設定'} />
        <MetricCard label="今日のたんぱく質" value={`${summary.todayProteinGrams}g`} note={summary.targetProteinGrams ? `目安 ${summary.targetProteinGrams}g` : '目標は未設定'} />
      </section>

      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-orange-600">筋トレ</p>
        <h2 className="mt-2 text-xl font-bold">今日の筋トレは{formatDay(summary.todayWorkout.plan.dayCode)}</h2>
        <p className="mt-2 text-sm text-slate-600">{summary.todayWorkout.plan.name}（{summary.todayWorkout.plan.targetArea}）</p>
        <p className="mt-3 rounded-2xl bg-orange-100 px-4 py-3 text-sm font-semibold text-orange-800">今週の完了：{summary.weeklyWorkoutCount}回</p>
      </section>

      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-orange-600">直近7日</p>
        <h2 className="mt-2 text-xl font-bold">記録状況</h2>
        <div className="mt-4 grid gap-2">
          {summary.recentStatuses.map((status) => (
            <div key={status.date} className="rounded-2xl bg-slate-50 p-3 text-sm">
              <p className="font-semibold text-slate-800">{formatJapaneseDate(status.date)}</p>
              <p className="mt-1 text-slate-600">体重 {status.hasBodyRecord ? '記録済み' : '未記録'} ・ 食事 {status.mealLogCount}件 ・ 筋トレ {status.hasWorkout ? '完了' : '未完了'}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function TaskItem({ done, label }: { done: boolean; label: string }) {
  return <div className={`rounded-2xl px-4 py-3 text-sm font-semibold ${done ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-100 text-orange-800'}`}>{done ? 'できた！' : 'これから'}：{label}</div>;
}

function MetricCard({ label, value, note }: { label: string; value: string; note: string }) {
  return <div className="rounded-3xl bg-white p-4 shadow-sm"><p className="text-xs font-semibold text-orange-600">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p><p className="mt-1 text-xs text-slate-500">{note}</p></div>;
}

function formatDay(dayCode: string): string { return dayCode.replace('DAY_', 'Day'); }
function formatJapaneseDate(date: string): string { return new Intl.DateTimeFormat('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' }).format(new Date(`${date}T00:00:00+09:00`)); }
