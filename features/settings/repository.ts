import type { AppSettings } from './types';

export type SettingsRepository = {
  save(input: AppSettings): Promise<void>;
  findCurrent(): Promise<AppSettings | undefined>;
};
