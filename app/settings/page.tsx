export default function SettingsPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col gap-5 bg-orange-50 px-4 py-6 text-slate-900">
      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-orange-600">きろくま設定</p>
        <h1 className="mt-2 text-2xl font-bold">目標を設定しよう</h1>
        <p className="mt-2 text-sm text-slate-600">身長・体重・目標体重などから、毎日の目安を自動で表示します。</p>
      </section>

      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold">入力する項目</h2>
        <ul className="mt-3 grid gap-2 text-sm text-slate-700">
          <li>身長、現在体重、目標体重</li>
          <li>年齢、性別、活動レベル</li>
          <li>週の筋トレ目標</li>
        </ul>
      </section>

      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold">自動表示される目安</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl bg-orange-100 p-3">現在BMI</div>
          <div className="rounded-2xl bg-orange-100 p-3">目標BMI</div>
          <div className="rounded-2xl bg-orange-100 p-3">目標カロリー</div>
          <div className="rounded-2xl bg-orange-100 p-3">目標たんぱく質</div>
        </div>
      </section>

      <p className="rounded-2xl bg-amber-100 p-4 text-xs leading-6 text-amber-900">
        表示されるカロリー・たんぱく質目標は目安です。体調不良、既往歴、極端な食事制限がある場合は専門家に相談してください。
      </p>
    </main>
  );
}
