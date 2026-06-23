import { FoodMasterManager } from '../../features/food/components/FoodMasterManager';

export default function FoodsPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col gap-5 bg-orange-50 px-4 py-6 text-slate-900">
      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-orange-600">きろくま食事</p>
        <h1 className="mt-2 text-2xl font-bold">食材を登録しよう</h1>
        <p className="mt-2 text-sm text-slate-600">レシピ計算に使う食材のカロリーとたんぱく質を、ローカルに保存します。</p>
      </section>

      <FoodMasterManager />
    </main>
  );
}
