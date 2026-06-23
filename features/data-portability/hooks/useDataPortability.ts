'use client';

import { useState } from 'react';
import { indexedDbBackupRepository } from '../../../infrastructure/indexeddb/backup-repository';
import { createBackupJson, importBackupJson } from '../usecases';

type DataPortabilityState = {
  isProcessing: boolean;
  message?: string;
  error?: string;
};

export function useDataPortability() {
  const [state, setState] = useState<DataPortabilityState>({ isProcessing: false });

  async function exportJson() {
    setState({ isProcessing: true });
    try {
      const now = new Date().toISOString();
      const json = await createBackupJson(indexedDbBackupRepository, now);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `kirokuma-backup-${now.slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setState({ isProcessing: false, message: 'バックアップJSONを作成しました。' });
    } catch {
      setState({ isProcessing: false, error: 'エクスポートできませんでした。少し時間をおいてもう一度お試しください。' });
    }
  }

  async function importJson(file: File | undefined) {
    if (!file) return;
    const confirmed = window.confirm('インポートすると現在のローカルデータはバックアップ内容で上書きされます。続けますか？');
    if (!confirmed) return;

    setState({ isProcessing: true });
    try {
      const json = await file.text();
      await importBackupJson(indexedDbBackupRepository, json);
      setState({ isProcessing: false, message: 'バックアップJSONから復元しました。画面を再読み込みすると最新データが表示されます。' });
    } catch (error) {
      setState({ isProcessing: false, error: error instanceof Error ? error.message : 'インポートできませんでした。' });
    }
  }

  return { ...state, exportJson, importJson };
}
