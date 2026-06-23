'use client';

import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { createLocalStoragePasscodeRepository } from '../local-storage-repository';
import type { PasscodeSettings } from '../repository';
import { isPasscodeEnabled, verifyPasscode } from '../usecases';

export function PasscodeGate({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<PasscodeSettings>({ enabled: false });
  const [isLoading, setIsLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const repository = useMemo(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }
    return createLocalStoragePasscodeRepository(window.localStorage);
  }, []);

  useEffect(() => {
    if (!repository) {
      return;
    }

    void repository.load().then((loaded) => {
      setSettings(loaded);
      setIsUnlocked(!isPasscodeEnabled(loaded));
      setIsLoading(false);
    });
  }, [repository]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (verifyPasscode(settings, input)) {
      setError('');
      setInput('');
      setIsUnlocked(true);
      return;
    }

    setError('パスコードが違います。もう一度入力してください。');
  }

  if (isLoading) {
    return <div className="mx-auto min-h-screen max-w-sm bg-orange-50 px-4 py-6 text-slate-900" />;
  }

  if (isUnlocked) {
    return children;
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center bg-orange-50 px-4 py-6 text-slate-900">
      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-orange-600">きろくま</p>
        <h1 className="mt-2 text-2xl font-bold">パスコードを入力</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">記録を見るために、設定したパスコードを入力してください。</p>

        <form className="mt-5 grid gap-3" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            パスコード
            <input
              className="rounded-2xl border border-orange-200 px-4 py-4 text-center text-2xl tracking-[0.5em] outline-none focus:border-orange-500"
              type="password"
              inputMode="numeric"
              autoComplete="current-password"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              aria-label="パスコード"
            />
          </label>
          <button className="rounded-2xl bg-orange-500 px-4 py-4 font-bold text-white shadow-sm" type="submit">
            開く
          </button>
        </form>

        {error && <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
      </section>
    </main>
  );
}
