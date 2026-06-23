import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const outDir = mkdtempSync(join(tmpdir(), 'kirokuma-body-record-'));
const tsconfigPath = join(outDir, 'tsconfig.json');
writeFileSync(tsconfigPath, JSON.stringify({
  compilerOptions: { module: 'NodeNext', moduleResolution: 'NodeNext', target: 'ES2022', outDir, rootDir: process.cwd(), strict: true, skipLibCheck: true },
  files: [
    join(process.cwd(), 'features/body-record/types.ts'),
    join(process.cwd(), 'features/body-record/schema.ts'),
    join(process.cwd(), 'features/body-record/repository.ts'),
    join(process.cwd(), 'features/body-record/usecases.ts'),
  ],
}));
execFileSync('npx', ['tsc', '--project', tsconfigPath], { stdio: 'inherit' });

const schema = await import(join(outDir, 'features/body-record/schema.js'));
const usecases = await import(join(outDir, 'features/body-record/usecases.js'));

const valid = schema.validateBodyRecordForm({ date: '2026-06-23', weightKg: 61.2, bodyFatPercentage: 24.5, memo: ' 朝の記録 ' }, '2026-06-23');
assert.equal(valid.success, true);

const future = schema.validateBodyRecordForm({ date: '2026-06-24', weightKg: 61.2 }, '2026-06-23');
assert.equal(future.success, false);
assert.equal(future.errors.date, '未来日は記録できません。');

const optionalBodyFat = schema.validateBodyRecordForm({ date: '2026-06-23', weightKg: 61.2 }, '2026-06-23');
assert.equal(optionalBodyFat.success, true);

const records = [];
const repository = {
  async create(input) { records.push(input); },
  async update(id, input) {
    const index = records.findIndex((record) => record.id === id);
    records[index] = { ...records[index], ...input };
  },
  async delete() {},
  async findById(id) { return records.find((record) => record.id === id); },
  async findRecent(days) { return records.slice(-days).reverse(); },
  async findByDate(date) { return records.find((record) => record.date === date); },
};

const saved = await usecases.saveBodyRecord(repository, { date: '2026-06-23', weightKg: 61.2, memo: ' 朝の記録 ' }, '2026-06-23', '2026-06-23T06:00:00.000Z', () => 'body-1');
assert.equal(saved.id, 'body-1');
assert.equal(saved.memo, '朝の記録');
assert.equal(records.length, 1);

const updated = await usecases.saveBodyRecord(repository, { date: '2026-06-23', weightKg: 61.0, bodyFatPercentage: 24 }, '2026-06-23', '2026-06-23T07:00:00.000Z', () => 'body-2');
assert.equal(updated.id, 'body-1');
assert.equal(records.length, 1);
assert.equal(records[0].weightKg, 61.0);
assert.equal(records[0].bodyFatPercentage, 24);

console.log('body-record tests passed');
