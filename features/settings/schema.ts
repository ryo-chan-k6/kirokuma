import type { ActivityLevel, Sex } from './types';

export type AppSettingsFormValues = {
  heightCm: number;
  startWeightKg: number;
  targetWeightKg: number;
  startDate: string;
  targetDate: string;
  age?: number;
  sex?: Sex;
  activityLevel?: ActivityLevel;
  weeklyWorkoutTarget: number;
  notificationEnabled: boolean;
};

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: Partial<Record<keyof T, string>> };

const SEX_VALUES = ['male', 'female', 'other'];
const ACTIVITY_LEVEL_VALUES = ['low', 'medium', 'high'];

export function validateAppSettingsForm(input: AppSettingsFormValues): ValidationResult<AppSettingsFormValues> {
  const errors: Partial<Record<keyof AppSettingsFormValues, string>> = {};

  if (!isInRange(input.heightCm, 100, 230)) errors.heightCm = '身長は100〜230cmで入力してください。';
  if (!isInRange(input.startWeightKg, 20, 250)) errors.startWeightKg = '現在体重は20〜250kgで入力してください。';
  if (!isInRange(input.targetWeightKg, 20, 250)) errors.targetWeightKg = '目標体重は20〜250kgで入力してください。';
  if (!input.startDate) errors.startDate = '開始日を入力してください。';
  if (!input.targetDate) errors.targetDate = '目標日を入力してください。';
  if (input.age !== undefined && !isInRange(input.age, 10, 100)) errors.age = '年齢は10〜100歳で入力してください。';
  if (input.sex !== undefined && !SEX_VALUES.includes(input.sex)) errors.sex = '性別を選択してください。';
  if (input.activityLevel !== undefined && !ACTIVITY_LEVEL_VALUES.includes(input.activityLevel)) errors.activityLevel = '活動レベルを選択してください。';
  if (!Number.isInteger(input.weeklyWorkoutTarget) || !isInRange(input.weeklyWorkoutTarget, 0, 7)) {
    errors.weeklyWorkoutTarget = '筋トレ目標は週0〜7回で入力してください。';
  }

  return Object.keys(errors).length === 0 ? { success: true, data: input } : { success: false, errors };
}

function isInRange(value: number, min: number, max: number): boolean {
  return Number.isFinite(value) && value >= min && value <= max;
}
