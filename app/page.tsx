export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col gap-5 bg-orange-50 px-4 py-6 text-slate-900">
      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-orange-600">きろくま</p>
        <h1 className="mt-2 text-2xl font-bold">毎日のからだを記録しよう</h1>
        <p className="mt-2 text-sm text-slate-600">
          体重・食事・筋トレを、やさしく続けられる記録アプリです。
        </p>
      </section>
    </main>
  );
}
