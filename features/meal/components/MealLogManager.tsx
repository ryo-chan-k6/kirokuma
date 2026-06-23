'use client';

import { useMealLogManager } from '../hooks/useMealLogManager';

const mealTypeLabels = { breakfast: '朝食', lunch: '昼食', dinner: '夕食', snack: '間食' } as const;
const mealSourceLabels = { home_cooking: '自炊', restaurant: '外食', convenience_store: 'コンビニ', other: 'その他' } as const;

function toNumber(value: string): number { return value.trim() === '' ? Number.NaN : Number(value); }

export function MealLogManager() {
  const { values, recipes, logs, isLoading, isSaving, message, error, updateValues, applyRecipe, submit } = useMealLogManager();

  return (
    <>
      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-orange-600">食事記録</p>
        <h2 className="mt-2 text-xl font-bold">今日の食事を追加</h2>
        <form className="mt-5 grid gap-4" onSubmit={(event) => { event.preventDefault(); void submit(); }}>
          <label className="grid gap-1 text-sm font-semibold text-slate-700">日付<input className="rounded-2xl border border-orange-200 px-4 py-3" type="date" value={values.date} onChange={(event) => updateValues((current) => ({ ...current, date: event.target.value }))} /></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1 text-sm font-semibold text-slate-700">食事区分<select className="rounded-2xl border border-orange-200 bg-white px-4 py-3" value={values.mealType} onChange={(event) => updateValues((current) => ({ ...current, mealType: event.target.value as typeof values.mealType }))}>{Object.entries(mealTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label className="grid gap-1 text-sm font-semibold text-slate-700">食事分類<select className="rounded-2xl border border-orange-200 bg-white px-4 py-3" value={values.mealSource} onChange={(event) => updateValues((current) => ({ ...current, mealSource: event.target.value as typeof values.mealSource }))}>{Object.entries(mealSourceLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          </div>
          <label className="grid gap-1 text-sm font-semibold text-slate-700">レシピから反映<select className="rounded-2xl border border-orange-200 bg-white px-4 py-3" value={values.recipeId ?? ''} disabled={recipes.length === 0} onChange={(event) => void applyRecipe(event.target.value)}><option value="">直接入力する</option>{recipes.map((recipe) => <option key={recipe.id} value={recipe.id}>{recipe.name}</option>)}</select>{recipes.length === 0 ? <span className="text-xs font-normal text-slate-500">レシピを登録すると、1食あたりの値を反映できます。</span> : null}</label>
          <label className="grid gap-1 text-sm font-semibold text-slate-700">メニュー名<input className="rounded-2xl border border-orange-200 px-4 py-3" maxLength={80} value={values.title} onChange={(event) => updateValues((current) => ({ ...current, title: event.target.value, recipeId: undefined }))} placeholder="例：鶏むね丼" /></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1 text-sm font-semibold text-slate-700">カロリー<input className="rounded-2xl border border-orange-200 px-4 py-3" inputMode="decimal" type="number" min="0" step="0.1" value={Number.isNaN(values.calories) ? '' : values.calories} onChange={(event) => updateValues((current) => ({ ...current, calories: toNumber(event.target.value), recipeId: undefined }))} /></label>
            <label className="grid gap-1 text-sm font-semibold text-slate-700">たんぱく質<input className="rounded-2xl border border-orange-200 px-4 py-3" inputMode="decimal" type="number" min="0" step="0.1" value={Number.isNaN(values.proteinGrams) ? '' : values.proteinGrams} onChange={(event) => updateValues((current) => ({ ...current, proteinGrams: toNumber(event.target.value), recipeId: undefined }))} /></label>
          </div>
          <label className="grid gap-1 text-sm font-semibold text-slate-700">メモ<textarea className="min-h-20 rounded-2xl border border-orange-200 px-4 py-3" maxLength={300} value={values.memo ?? ''} onChange={(event) => updateValues((current) => ({ ...current, memo: event.target.value }))} placeholder="お腹の具合、満足度など" /></label>
          {message && <p className="rounded-2xl bg-green-50 p-3 text-sm font-semibold text-green-700">{message}</p>}
          {error && <p className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
          <button className="rounded-2xl bg-orange-500 px-4 py-4 font-bold text-white shadow-sm disabled:bg-orange-200" type="submit" disabled={isSaving}>{isSaving ? '保存中…' : '保存する'}</button>
        </form>
      </section>
      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-orange-600">直近7日間</p><h2 className="mt-2 text-xl font-bold">食事一覧</h2>
        {isLoading ? <p className="mt-4 text-sm text-slate-600">読み込んでいます…</p> : null}
        {!isLoading && logs.length === 0 ? <p className="mt-4 rounded-2xl bg-orange-50 p-4 text-sm text-slate-600">まだ食事記録がありません。まずは1食だけ記録してみましょう。</p> : null}
        <ul className="mt-4 grid gap-3">{logs.map((log) => <li key={log.id} className="rounded-3xl border border-orange-100 bg-orange-50 p-4"><div className="flex items-center justify-between gap-2"><p className="font-bold text-slate-900">{log.title}</p><span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-orange-700">{mealTypeLabels[log.mealType]}</span></div><p className="mt-1 text-sm text-slate-700">{log.date}・{mealSourceLabels[log.mealSource]}</p><p className="mt-1 text-sm font-semibold text-slate-800">{log.calories}kcal / P{log.proteinGrams}g</p>{log.memo ? <p className="mt-2 text-xs text-slate-600">{log.memo}</p> : null}</li>)}</ul>
      </section>
    </>
  );
}
