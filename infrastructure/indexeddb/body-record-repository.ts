import type { BodyRecordRepository } from '../../features/body-record/repository';
import type { BodyRecord } from '../../features/body-record/types';
import { db } from './db';

export const indexedDbBodyRecordRepository: BodyRecordRepository = {
  async create(input: BodyRecord) { await db.bodyRecords.add(input); },
  async update(id: string, input: Partial<BodyRecord>) { await db.bodyRecords.update(id, input); },
  async delete(id: string) { await db.bodyRecords.delete(id); },
  async findById(id: string) { return db.bodyRecords.get(id); },
  async findRecent(days: number) {
    const from = new Date();
    from.setDate(from.getDate() - Math.max(days - 1, 0));
    const date = from.toISOString().slice(0, 10);
    return db.bodyRecords.where('date').aboveOrEqual(date).reverse().sortBy('date');
  },
  async findByDate(date: string) { return db.bodyRecords.where('date').equals(date).first(); },
};
