import type { SettingsRepository } from './repository';
import type { AppSettings } from './types';
import type { AppSettingsFormValues } from './schema';
import { validateAppSettingsForm } from './schema';
import { calculateSettingsTargets } from './calculations';

export const CURRENT_SETTINGS_ID = 'current-settings';

export function createDefaultSettingsForm(today: string): AppSettingsFormValues {
  return {
    heightCm: 163,
    startWeightKg: 62,
    targetWeightKg: 56,
    startDate: today,
    targetDate: today,
    age: 35,
    sex: 'other',
    activityLevel: 'medium',
    weeklyWorkoutTarget: 5,
    notificationEnabled: false,
  };
}

export async function saveAppSettings(
  repository: SettingsRepository,
  values: AppSettingsFormValues,
  now: string,
): Promise<AppSettings> {
  const validation = validateAppSettingsForm(values);
  if (!validation.success) {
    throw new Error('設定の入力内容を確認してください。');
  }

  const existing = await repository.findCurrent();
  const settings: AppSettings = {
    id: existing?.id ?? CURRENT_SETTINGS_ID,
    ...validation.data,
    workoutRotationMode: 'rotation',
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  await repository.save(settings);
  return settings;
}

export async function loadAppSettings(repository: SettingsRepository): Promise<AppSettings | undefined> {
  return repository.findCurrent();
}

export function getSettingsTargets(settings: AppSettings) {
  return calculateSettingsTargets({
    heightCm: settings.heightCm,
    currentWeightKg: settings.startWeightKg,
    targetWeightKg: settings.targetWeightKg,
    age: settings.age,
    sex: settings.sex,
    activityLevel: settings.activityLevel,
  });
}
