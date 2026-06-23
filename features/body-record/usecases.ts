import type { BodyRecordRepository } from './repository';
import type { BodyRecord } from './types';
import type { BodyRecordFormValues } from './schema';
import { toBodyRecord, validateBodyRecordForm } from './schema';

export function createDefaultBodyRecordForm(today: string): BodyRecordFormValues {
  return {
    date: today,
    weightKg: 62,
    faceLineStatus: 'normal',
    bellyStatus: 'normal',
  };
}

export async function saveBodyRecord(
  repository: BodyRecordRepository,
  values: BodyRecordFormValues,
  today: string,
  now: string,
  createId: () => string = () => crypto.randomUUID(),
): Promise<BodyRecord> {
  const validation = validateBodyRecordForm(values, today);
  if (!validation.success) {
    throw new Error('体重記録の入力内容を確認してください。');
  }

  const existing = await repository.findByDate(validation.data.date);
  const record = toBodyRecord(validation.data, existing?.id ?? createId(), now, existing);

  if (existing) {
    await repository.update(existing.id, record);
  } else {
    await repository.create(record);
  }

  return record;
}

export async function listRecentBodyRecords(repository: BodyRecordRepository, days = 7): Promise<BodyRecord[]> {
  return repository.findRecent(days);
}
