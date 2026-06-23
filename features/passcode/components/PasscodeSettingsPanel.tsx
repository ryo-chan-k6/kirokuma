'use client';

import { usePasscodeSettings } from '../hooks/usePasscodeSettings';

export function PasscodeSettingsPanel() {
  const { enabled, passcode, setPasscodeInput, message, error, isLoading, enable, disable } = usePasscodeSettings();

  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-orange-600">プライバシー</p>
      <h2 className="mt-2 text-xl font-bold">簡易パスコード</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        自分専用の簡易ロックです。端末内だけに保存され、本格的な認証や暗号化ではありません。
      </p>

      <div className="mt-4 rounded-2xl bg-orange-50 p-3 text-sm font-semibold text-slate-700">
        現在: {enabled ? '有効' : '無効'}
      </div>

      <div className="mt-4 grid gap-3">
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          新しいパスコード（4〜8桁）
          <input
            className="rounded-2xl border border-orange-200 px-4 py-4 text-lg outline-none focus:border-orange-500 disabled:bg-slate-100"
            type="password"
            inputMode="numeric"
            autoComplete="new-password"
            placeholder="例: 1234"
            value={passcode}
            disabled={isLoading}
            onChange={(event) => setPasscodeInput(event.target.value)}
          />
        </label>
        <button className="rounded-2xl bg-orange-500 px-4 py-4 font-bold text-white shadow-sm disabled:bg-orange-200" type="button" disabled={isLoading} onClick={() => void enable()}>
          パスコードを設定する
        </button>
        <button className="rounded-2xl border border-orange-200 bg-white px-4 py-4 font-bold text-orange-700 disabled:text-orange-200" type="button" disabled={isLoading || !enabled} onClick={() => void disable()}>
          パスコードを無効にする
        </button>
      </div>

      {message && <p className="mt-4 rounded-2xl bg-green-50 p-3 text-sm font-semibold text-green-700">{message}</p>}
      {error && <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
    </section>
  );
}
