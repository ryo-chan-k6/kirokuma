import type { PasscodeRepository, PasscodeSettings } from './repository';

const PASSCODE_STORAGE_KEY = 'kirokuma.passcode';

export function createLocalStoragePasscodeRepository(storage: Storage): PasscodeRepository {
  return {
    async load() {
      const raw = storage.getItem(PASSCODE_STORAGE_KEY);
      if (!raw) {
        return { enabled: false };
      }

      try {
        const parsed = JSON.parse(raw) as Partial<PasscodeSettings>;
        if (parsed.enabled && typeof parsed.passcode === 'string') {
          return { enabled: true, passcode: parsed.passcode };
        }
      } catch {
        storage.removeItem(PASSCODE_STORAGE_KEY);
      }

      return { enabled: false };
    },
    async save(settings) {
      storage.setItem(PASSCODE_STORAGE_KEY, JSON.stringify(settings));
    },
    async clear() {
      storage.removeItem(PASSCODE_STORAGE_KEY);
    },
  };
}
