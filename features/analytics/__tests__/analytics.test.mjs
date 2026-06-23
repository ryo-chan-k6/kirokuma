import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const outDir = mkdtempSync(join(tmpdir(), 'kirokuma-analytics-'));
const tsconfigPath = join(outDir, 'tsconfig.json');
writeFileSync(tsconfigPath, JSON.stringify({
  compilerOptions: { module: 'NodeNext', moduleResolution: 'NodeNext', target: 'ES2022', outDir, rootDir: process.cwd(), strict: true, skipLibCheck: true },
  files: [
    join(process.cwd(), 'features/body-record/types.ts'),
    join(process.cwd(), 'features/body-record/repository.ts'),
    join(process.cwd(), 'features/meal/types.ts'),
    join(process.cwd(), 'features/meal/repository.ts'),
    join(process.cwd(), 'features/settings/types.ts'),
    join(process.cwd(), 'features/settings/repository.ts'),
    join(process.cwd(), 'features/settings/calculations.ts'),
    join(process.cwd(), 'features/settings/usecases.ts'),
    join(process.cwd(), 'features/workout/types.ts'),
    join(process.cwd(), 'features/workout/repository.ts'),
    join(process.cwd(), 'features/analytics/usecases.ts'),
  ],
}));
execFileSync('npx', ['tsc', '--project', tsconfigPath], { stdio: 'inherit' });

const { getRecentAnalytics, listRecentDatesAscending } = await import(join(outDir, 'features/analytics/usecases.js'));

assert.deepEqual(listRecentDatesAscending('2026-06-23', 3), ['2026-06-21', '2026-06-22', '2026-06-23']);

const settings = {
  id: 'current-settings', heightCm: 163, startWeightKg: 62, targetWeightKg: 56, startDate: '2026-06-01', targetDate: '2026-12-01', age: 35, sex: 'other', activityLevel: 'medium', weeklyWorkoutTarget: 5, workoutRotationMode: 'rotation', notificationEnabled: false, createdAt: '', updatedAt: '',
};
const bodyRecords = [
  { id: 'body-1', date: '2026-06-22', weightKg: 61.5, createdAt: '', updatedAt: '' },
  { id: 'body-2', date: '2026-06-23', weightKg: 61.1, createdAt: '', updatedAt: '' },
];
const meals = [
  { id: 'meal-1', date: '2026-06-21', mealType: 'breakfast', mealSource: 'home_cooking', title: '朝', calories: 300, proteinGrams: 20, photoIds: [], createdAt: '', updatedAt: '' },
  { id: 'meal-2', date: '2026-06-23', mealType: 'dinner', mealSource: 'other', title: '夜', calories: 700, proteinGrams: 35, photoIds: [], createdAt: '', updatedAt: '' },
];
const sessions = [
  { id: 'session-1', date: '2026-06-21', workoutPlanId: 'plan-1', dayCode: 'DAY_1', completed: true, createdAt: '' },
  { id: 'session-2', date: '2026-06-23', workoutPlanId: 'plan-2', dayCode: 'DAY_2', completed: true, createdAt: '' },
  { id: 'session-3', date: '2026-06-23', workoutPlanId: 'plan-3', dayCode: 'DAY_3', completed: false, createdAt: '' },
];

const summary = await getRecentAnalytics({
  settingsRepository: { async save() {}, async findCurrent() { return settings; } },
  bodyRecordRepository: { async create() {}, async update() {}, async delete() {}, async findById() {}, async findRecent() { return bodyRecords; }, async findByDate(date) { return bodyRecords.find((record) => record.date === date); } },
  mealRepository: { async createLog() {}, async updateLog() {}, async deleteLog() {}, async findLogById() {}, async listLogsByDate(date) { return meals.filter((meal) => meal.date === date); }, async addPhoto() {}, async deletePhoto() {}, async listPhotos() { return []; } },
  workoutRepository: { async listActivePlans() { return []; }, async findPlanByDay() {}, async listPlanExercises() { return []; }, async saveInitialPlans() {}, async createSession() {}, async findLatestCompletedSession() {}, async listCompletedSessionsSince() { return sessions; } },
}, '2026-06-23', 3);

assert.equal(summary.daily.length, 3);
assert.equal(summary.daily[0].weightKg, undefined);
assert.equal(summary.daily[0].calories, 300);
assert.equal(summary.daily[1].weightKg, 61.5);
assert.equal(summary.daily[2].proteinGrams, 35);
assert.equal(summary.totalWorkoutCount, 2);
assert.equal(summary.totalMealLogCount, 2);
assert.equal(summary.averageCalories, 333.3);
assert.equal(summary.latestWeightKg, 61.1);
assert.equal(summary.daily[2].weightDiff, 5.1);
assert.equal(typeof summary.daily[2].calorieDiff, 'number');

console.log('analytics tests passed');
