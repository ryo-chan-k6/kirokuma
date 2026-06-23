'use client';

import { useEffect, useMemo, useState } from 'react';
import { createLocalStoragePasscodeRepository } from '../local-storage-repository';
import type { PasscodeSettings } from '../repository';
import { disablePasscode, isPasscodeEnabled, setPasscode } from '../usecases';

export function usePasscodeSettings() {
  const [settings, setSettings] = useState<PasscodeSettings>({ enabled: false });
  const [passcode, setPasscodeInput] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

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
      setIsLoading(false);
    });
  }, [repository]);

  async function enable() {
    if (!repository) {
      return;
    }

    setError('');
    setMessage('');
    try {
      const saved = await setPasscode(repository, passcode);
      setSettings(saved);
      setPasscodeInput('');
      setMessage('パスコードを設定しました。次回起動時から入力が必要です。');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'パスコードを設定できませんでした。');
    }
  }

  async function disable() {
    if (!repository) {
      return;
    }

    setError('');
    setMessage('');
    const saved = await disablePasscode(repository);
    setSettings(saved);
    setPasscodeInput('');
    setMessage('パスコードを無効にしました。');
  }

  return {
    enabled: isPasscodeEnabled(settings),
    passcode,
    setPasscodeInput,
    message,
    error,
    isLoading,
    enable,
    disable,
  };
}
