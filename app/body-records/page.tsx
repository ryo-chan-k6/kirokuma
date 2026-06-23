export default function BodyRecordsPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col gap-5 bg-orange-50 px-4 py-6 text-slate-900">
      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-orange-600">きろくま記録</p>
        <h1 className="mt-2 text-2xl font-bold">今朝のからだを記録しよう</h1>
        <p className="mt-2 text-sm text-slate-600">体重、体脂肪率、フェイスライン、お腹まわりをさっと残せます。</p>
      </section>

      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold">入力項目</h2>
        <div className="mt-3 grid gap-3 text-sm text-slate-700">
          <div className="rounded-2xl bg-orange-100 p-3">体重（必須）</div>
          <div className="rounded-2xl bg-orange-100 p-3">体脂肪率（任意）</div>
          <div className="rounded-2xl bg-orange-100 p-3">フェイスライン・お腹まわり</div>
          <div className="rounded-2xl bg-orange-100 p-3">メモ</div>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold">直近7日間</h2>
        <p className="mt-2 text-sm text-slate-600">保存した記録を新しい順に表示します。</p>
      </section>
    </main>
  );
}
