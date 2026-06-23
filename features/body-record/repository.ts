import type { BodyRecord } from './types';

export type BodyRecordRepository = {
  create(input: BodyRecord): Promise<void>;
  update(id: string, input: Partial<BodyRecord>): Promise<void>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<BodyRecord | undefined>;
  findRecent(days: number): Promise<BodyRecord[]>;
  findByDate(date: string): Promise<BodyRecord | undefined>;
};
