import type { BellyStatus, BodyRecord, FaceLineStatus } from './types';

export type BodyRecordFormValues = {
  date: string;
  weightKg: number;
  bodyFatPercentage?: number;
  faceLineStatus?: FaceLineStatus;
  bellyStatus?: BellyStatus;
  memo?: string;
};

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: Partial<Record<keyof T, string>> };

const FACE_LINE_VALUES: FaceLineStatus[] = ['good', 'normal', 'puffy'];
const BELLY_VALUES: BellyStatus[] = ['good', 'normal', 'bloated'];

export function validateBodyRecordForm(
  input: BodyRecordFormValues,
  today: string,
): ValidationResult<BodyRecordFormValues> {
  const errors: Partial<Record<keyof BodyRecordFormValues, string>> = {};

  if (!isDateString(input.date)) {
    errors.date = '日付を入力してください。';
  } else if (input.date > today) {
    errors.date = '未来日は記録できません。';
  }

  if (!isInRange(input.weightKg, 20, 250)) {
    errors.weightKg = '体重は20〜250kgで入力してください。';
  }

  if (input.bodyFatPercentage !== undefined && !isInRange(input.bodyFatPercentage, 1, 80)) {
    errors.bodyFatPercentage = '体脂肪率は1〜80%で入力してください。';
  }

  if (input.faceLineStatus !== undefined && !FACE_LINE_VALUES.includes(input.faceLineStatus)) {
    errors.faceLineStatus = 'フェイスラインの状態を選択してください。';
  }

  if (input.bellyStatus !== undefined && !BELLY_VALUES.includes(input.bellyStatus)) {
    errors.bellyStatus = 'お腹まわりの状態を選択してください。';
  }

  if (input.memo !== undefined && input.memo.length > 300) {
    errors.memo = 'メモは300文字以内で入力してください。';
  }

  return Object.keys(errors).length === 0 ? { success: true, data: input } : { success: false, errors };
}

export function toBodyRecord(values: BodyRecordFormValues, id: string, now: string, existing?: BodyRecord): BodyRecord {
  return {
    id,
    date: values.date,
    weightKg: values.weightKg,
    bodyFatPercentage: values.bodyFatPercentage,
    faceLineStatus: values.faceLineStatus,
    bellyStatus: values.bellyStatus,
    memo: values.memo?.trim() || undefined,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}

function isDateString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00.000Z`).getTime());
}

function isInRange(value: number, min: number, max: number): boolean {
  return Number.isFinite(value) && value >= min && value <= max;
}
