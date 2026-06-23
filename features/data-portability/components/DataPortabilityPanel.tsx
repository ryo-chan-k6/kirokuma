'use client';

import { useDataPortability } from '../hooks/useDataPortability';

export function DataPortabilityPanel() {
  const { isProcessing, message, error, exportJson, importJson } = useDataPortability();

  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-orange-600">バックアップ</p>
      <h2 className="mt-2 text-xl font-bold">データを保存・復元</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        端末やブラウザに保存された記録を、きろくま専用のJSONファイルとしてバックアップできます。
      </p>

      <div className="mt-5 grid gap-3">
        <button className="rounded-2xl bg-orange-500 px-4 py-4 font-bold text-white shadow-sm disabled:bg-orange-200" type="button" disabled={isProcessing} onClick={() => void exportJson()}>
          JSONをエクスポート
        </button>

        <label className="grid gap-2 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm font-semibold text-slate-700">
          JSONからインポート
          <input className="text-sm" type="file" accept="application/json,.json" disabled={isProcessing} onChange={(event) => void importJson(event.target.files?.[0])} />
        </label>
      </div>

      <div className="mt-4 rounded-2xl bg-amber-100 p-4 text-xs leading-6 text-amber-900">
        <p className="font-bold">注意</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>インポートは追加ではなく、現在のローカルデータをバックアップ内容で上書きします。</li>
          <li>JSONには食事写真データも含まれるため、ファイルサイズが大きくなることがあります。</li>
          <li>クラウド同期や自動バックアップではありません。ファイルは安全な場所に保管してください。</li>
        </ul>
      </div>

      {message && <p className="mt-4 rounded-2xl bg-green-50 p-3 text-sm font-semibold text-green-700">{message}</p>}
      {error && <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
    </section>
  );
}
