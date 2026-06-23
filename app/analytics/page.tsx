import { AnalyticsDashboard } from '../../features/analytics/components/AnalyticsDashboard';

export default function AnalyticsPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col gap-5 bg-orange-50 px-4 py-6 text-slate-900">
      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-orange-600">きろくま分析</p>
        <h1 className="mt-2 text-2xl font-bold">直近7日の流れを見よう</h1>
        <p className="mt-2 text-sm text-slate-600">体重・食事・筋トレの記録を、スマホで見やすいグラフにまとめます。</p>
      </section>
      <AnalyticsDashboard />
    </main>
  );
}
