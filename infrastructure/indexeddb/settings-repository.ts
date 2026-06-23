import type { SettingsRepository } from '../../features/settings/repository';
import type { AppSettings } from '../../features/settings/types';
import { db } from './db';

export const indexedDbSettingsRepository: SettingsRepository = {
  async save(input: AppSettings) {
    await db.settings.put(input);
  },
  async findCurrent() {
    return db.settings.orderBy('updatedAt').reverse().first();
  },
};
