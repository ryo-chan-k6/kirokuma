'use client';

import type { FoodFormValues, FoodUnit } from '../schema';
import type { FoodMaster } from '../types';
import { useFoodMaster } from '../hooks/useFoodMaster';

const unitLabels: Record<FoodUnit, string> = {
  g: 'g',
  ml: 'ml',
  piece: '個',
  serving: '食分',
};

function toNumber(value: string): number {
  return value.trim() === '' ? Number.NaN : Number(value);
}

function formatFoodNutrition(food: FoodMaster): string {
  return `${food.baseAmount}${unitLabels[food.unit]}あたり ${food.calories}kcal / P${food.proteinGrams}g`;
}

export function FoodMasterManager() {
  const { foods, values, editingId, keyword, isLoading, isSaving, message, error, load, updateValues, startEdit, resetForm, submit, remove } = useFoodMaster();

  return (
    <>
      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-orange-600">食材マスタ</p>
        <h2 className="mt-2 text-xl font-bold">{editingId ? '食材を編集' : '食材を追加'}</h2>
        <p className="mt-2 text-sm text-slate-600">自炊レシピで使うカロリー・たんぱく質を登録しておきましょう。</p>

        <form className="mt-5 grid gap-4" onSubmit={(event) => { event.preventDefault(); void submit(); }}>
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            食材名
            <input className="rounded-2xl border border-orange-200 px-4 py-3" maxLength={80} value={values.name} onChange={(event) => updateValues((current) => ({ ...current, name: event.target.value }))} placeholder="例：鶏むね肉" />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1 text-sm font-semibold text-slate-700">
              基準量
              <input className="rounded-2xl border border-orange-200 px-4 py-3" inputMode="decimal" type="number" min="0.1" step="0.1" value={Number.isNaN(values.baseAmount) ? '' : values.baseAmount} onChange={(event) => updateValues((current) => ({ ...current, baseAmount: toNumber(event.target.value) }))} />
            </label>
            <label className="grid gap-1 text-sm font-semibold text-slate-700">
              単位
              <select className="rounded-2xl border border-orange-200 px-4 py-3" value={values.unit} onChange={(event) => updateValues((current) => ({ ...current, unit: event.target.value as FoodFormValues['unit'] }))}>
                {Object.entries(unitLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1 text-sm font-semibold text-slate-700">
              カロリー（kcal）
              <input className="rounded-2xl border border-orange-200 px-4 py-3" inputMode="decimal" type="number" min="0" step="0.1" value={Number.isNaN(values.calories) ? '' : values.calories} onChange={(event) => updateValues((current) => ({ ...current, calories: toNumber(event.target.value) }))} />
            </label>
            <label className="grid gap-1 text-sm font-semibold text-slate-700">
              たんぱく質（g）
              <input className="rounded-2xl border border-orange-200 px-4 py-3" inputMode="decimal" type="number" min="0" step="0.1" value={Number.isNaN(values.proteinGrams) ? '' : values.proteinGrams} onChange={(event) => updateValues((current) => ({ ...current, proteinGrams: toNumber(event.target.value) }))} />
            </label>
          </div>

          <label className="flex items-center gap-3 rounded-2xl bg-orange-50 p-4 text-sm font-semibold text-slate-700">
            <input type="checkbox" className="h-5 w-5" checked={values.isFavorite} onChange={(event) => updateValues((current) => ({ ...current, isFavorite: event.target.checked }))} />
            よく使う食材にする
          </label>

          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            メモ
            <textarea className="min-h-20 rounded-2xl border border-orange-200 px-4 py-3" maxLength={300} value={values.memo ?? ''} onChange={(event) => updateValues((current) => ({ ...current, memo: event.target.value }))} placeholder="皮なし、ゆで後などのメモ" />
          </label>

          {message && <p className="rounded-2xl bg-green-50 p-3 text-sm font-semibold text-green-700">{message}</p>}
          {error && <p className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}

          <div className="grid grid-cols-2 gap-3">
            <button className="rounded-2xl bg-orange-500 px-4 py-4 font-bold text-white shadow-sm disabled:bg-orange-200" type="submit" disabled={isSaving}>{isSaving ? '保存中…' : editingId ? '更新する' : '追加する'}</button>
            <button className="rounded-2xl bg-slate-100 px-4 py-4 font-bold text-slate-700" type="button" onClick={resetForm}>クリア</button>
          </div>
        </form>
      </section>

      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-orange-600">食材一覧</p>
        <h2 className="mt-2 text-xl font-bold">登録した食材</h2>
        <form className="mt-4 flex gap-2" onSubmit={(event) => { event.preventDefault(); void load(keyword); }}>
          <input className="min-w-0 flex-1 rounded-2xl border border-orange-200 px-4 py-3" value={keyword} onChange={(event) => void load(event.target.value)} placeholder="食材名で検索" />
          <button className="rounded-2xl bg-orange-100 px-4 py-3 text-sm font-bold text-orange-700" type="submit">検索</button>
        </form>

        {isLoading ? <p className="mt-4 text-sm text-slate-600">食材を読み込んでいます…</p> : null}
        {!isLoading && foods.length === 0 ? <p className="mt-4 rounded-2xl bg-orange-50 p-4 text-sm text-slate-600">まだ食材がありません。よく使う食材から追加しましょう。</p> : null}
        <ul className="mt-4 grid gap-3">
          {foods.map((food) => (
            <li key={food.id} className="rounded-3xl border border-orange-100 bg-orange-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-900">{food.isFavorite ? '★ ' : ''}{food.name}</p>
                  <p className="mt-1 text-sm text-slate-700">{formatFoodNutrition(food)}</p>
                  {food.memo ? <p className="mt-2 text-xs text-slate-600">{food.memo}</p> : null}
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button className="rounded-2xl bg-white px-3 py-3 text-sm font-bold text-orange-700" type="button" onClick={() => startEdit(food)}>編集</button>
                <button className="rounded-2xl bg-white px-3 py-3 text-sm font-bold text-red-600" type="button" onClick={() => void remove(food.id)}>削除</button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
