'use client';

import { useRecipeManager } from '../hooks/useRecipeManager';

const unitLabels = { g: 'g', ml: 'ml', piece: '個', serving: '食分' } as const;

function toNumber(value: string): number {
  return value.trim() === '' ? Number.NaN : Number(value);
}

export function RecipeManager() {
  const { foods, recipes, values, editingId, isLoading, isSaving, message, error, previewIngredients, previewTotals, updateValues, addIngredient, updateIngredient, removeIngredient, startEdit, resetForm, submit, remove } = useRecipeManager();
  const selectedFoodId = foods[0]?.id ?? '';

  return (
    <>
      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-orange-600">レシピ</p>
        <h2 className="mt-2 text-xl font-bold">{editingId ? 'レシピを編集' : 'レシピを追加'}</h2>
        <p className="mt-2 text-sm text-slate-600">登録済みの食材を組み合わせて、1回分の目安を確認できます。</p>

        <form className="mt-5 grid gap-4" onSubmit={(event) => { event.preventDefault(); void submit(); }}>
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            レシピ名
            <input className="rounded-2xl border border-orange-200 px-4 py-3" maxLength={80} value={values.name} onChange={(event) => updateValues((current) => ({ ...current, name: event.target.value }))} placeholder="例：鶏むね親子丼" />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            何食分
            <input className="rounded-2xl border border-orange-200 px-4 py-3" inputMode="decimal" type="number" min="1" step="1" value={Number.isNaN(values.servingCount) ? '' : values.servingCount} onChange={(event) => updateValues((current) => ({ ...current, servingCount: toNumber(event.target.value) }))} />
          </label>

          <div className="rounded-3xl bg-orange-50 p-4">
            <div className="flex items-end gap-2">
              <label className="grid min-w-0 flex-1 gap-1 text-sm font-semibold text-slate-700">
                材料を選ぶ
                <select className="rounded-2xl border border-orange-200 bg-white px-4 py-3" defaultValue={selectedFoodId} disabled={foods.length === 0} onChange={(event) => { event.currentTarget.dataset.selected = event.target.value; }}>
                  {foods.map((food) => <option key={food.id} value={food.id}>{food.name}</option>)}
                </select>
              </label>
              <button className="rounded-2xl bg-orange-500 px-4 py-3 text-sm font-bold text-white disabled:bg-orange-200" type="button" disabled={foods.length === 0} onClick={(event) => {
                const select = event.currentTarget.parentElement?.querySelector('select');
                addIngredient(select?.value ?? selectedFoodId);
              }}>追加</button>
            </div>
            {foods.length === 0 ? <p className="mt-3 text-sm text-slate-600">先に食材マスタで食材を追加してください。</p> : null}

            <ul className="mt-4 grid gap-3">
              {previewIngredients.map((item, index) => (
                <li key={`${item.foodId}-${index}`} className="rounded-2xl bg-white p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold">{item.food.name}</p>
                    <button className="text-sm font-bold text-red-600" type="button" onClick={() => removeIngredient(index)}>削除</button>
                  </div>
                  <label className="mt-3 grid gap-1 text-sm font-semibold text-slate-700">
                    使用量（{unitLabels[item.food.unit]}）
                    <input className="rounded-2xl border border-orange-200 px-4 py-3" inputMode="decimal" type="number" min="0.1" step="0.1" value={Number.isNaN(values.ingredients[index]?.amount) ? '' : values.ingredients[index]?.amount} onChange={(event) => updateIngredient(index, { amount: toNumber(event.target.value) })} />
                  </label>
                  <p className="mt-2 text-sm text-slate-600">{item.nutrition.calories}kcal / P{item.nutrition.proteinGrams}g</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl bg-orange-100 p-4 text-sm font-semibold text-orange-900">
            <p>合計：{previewTotals.totalCalories}kcal / P{previewTotals.totalProteinGrams}g</p>
            <p className="mt-1">1食あたり：{previewTotals.caloriesPerServing}kcal / P{previewTotals.proteinGramsPerServing}g</p>
          </div>

          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            メモ
            <textarea className="min-h-20 rounded-2xl border border-orange-200 px-4 py-3" maxLength={300} value={values.memo ?? ''} onChange={(event) => updateValues((current) => ({ ...current, memo: event.target.value }))} placeholder="作り置き、味付けなど" />
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
        <p className="text-sm font-semibold text-orange-600">レシピ一覧</p>
        <h2 className="mt-2 text-xl font-bold">登録したレシピ</h2>
        {isLoading ? <p className="mt-4 text-sm text-slate-600">読み込んでいます…</p> : null}
        {!isLoading && recipes.length === 0 ? <p className="mt-4 rounded-2xl bg-orange-50 p-4 text-sm text-slate-600">まだレシピがありません。よく食べる自炊メニューから追加しましょう。</p> : null}
        <ul className="mt-4 grid gap-3">
          {recipes.map((recipe) => (
            <li key={recipe.id} className="rounded-3xl border border-orange-100 bg-orange-50 p-4">
              <p className="font-bold text-slate-900">{recipe.name}</p>
              <p className="mt-1 text-sm text-slate-700">合計 {recipe.totalCalories}kcal / P{recipe.totalProteinGrams}g（{recipe.servingCount}食分）</p>
              <p className="mt-1 text-sm text-slate-700">1食あたり {Math.round((recipe.totalCalories / recipe.servingCount) * 10) / 10}kcal / P{Math.round((recipe.totalProteinGrams / recipe.servingCount) * 10) / 10}g</p>
              {recipe.memo ? <p className="mt-2 text-xs text-slate-600">{recipe.memo}</p> : null}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button className="rounded-2xl bg-white px-3 py-3 text-sm font-bold text-orange-700" type="button" onClick={() => void startEdit(recipe)}>編集</button>
                <button className="rounded-2xl bg-white px-3 py-3 text-sm font-bold text-red-600" type="button" onClick={() => void remove(recipe.id)}>削除</button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
