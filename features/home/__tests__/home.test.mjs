import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const outDir = mkdtempSync(join(tmpdir(), 'kirokuma-home-'));
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
    join(process.cwd(), 'features/workout/initial-data.ts'),
    join(process.cwd(), 'features/workout/usecases.ts'),
    join(process.cwd(), 'features/home/usecases.ts'),
  ],
}));
execFileSync('npx', ['tsc', '--project', tsconfigPath], { stdio: 'inherit' });

const { buildHomeReminders, getHomeSummary, listRecentDates } = await import(join(outDir, 'features/home/usecases.js'));
const initialData = await import(join(outDir, 'features/workout/initial-data.js'));

assert.deepEqual(listRecentDates('2026-06-23', 3), ['2026-06-23', '2026-06-22', '2026-06-21']);

const settings = {
  id: 'current-settings', heightCm: 163, startWeightKg: 62, targetWeightKg: 56, startDate: '2026-06-01', targetDate: '2026-12-01', age: 35, sex: 'other', activityLevel: 'medium', weeklyWorkoutTarget: 5, workoutRotationMode: 'rotation', notificationEnabled: false, createdAt: '2026-06-01T00:00:00.000Z', updatedAt: '2026-06-01T00:00:00.000Z',
};
const bodyRecords = [
  { id: 'body-1', date: '2026-06-23', weightKg: 61.2, createdAt: '2026-06-23T00:00:00.000Z', updatedAt: '2026-06-23T00:00:00.000Z' },
  { id: 'body-2', date: '2026-06-22', weightKg: 61.5, createdAt: '2026-06-22T00:00:00.000Z', updatedAt: '2026-06-22T00:00:00.000Z' },
];
const meals = [
  { id: 'meal-1', date: '2026-06-23', mealType: 'breakfast', mealSource: 'home_cooking', title: '朝ごはん', calories: 350, proteinGrams: 20, photoIds: [], createdAt: '', updatedAt: '' },
  { id: 'meal-2', date: '2026-06-23', mealType: 'lunch', mealSource: 'home_cooking', title: '昼ごはん', calories: 550, proteinGrams: 30.5, photoIds: [], createdAt: '', updatedAt: '' },
  { id: 'meal-3', date: '2026-06-22', mealType: 'dinner', mealSource: 'other', title: '夜ごはん', calories: 500, proteinGrams: 25, photoIds: [], createdAt: '', updatedAt: '' },
];
const completedSessions = [
  { id: 'workout-1', date: '2026-06-23', workoutPlanId: 'workout-plan-day-1', dayCode: 'DAY_1', completed: true, createdAt: '' },
  { id: 'workout-2', date: '2026-06-21', workoutPlanId: 'workout-plan-day-5', dayCode: 'DAY_5', completed: true, createdAt: '' },
];

const summary = await getHomeSummary({
  settingsRepository: { async save() {}, async findCurrent() { return settings; } },
  bodyRecordRepository: { async create() {}, async update() {}, async delete() {}, async findById() {}, async findByDate() {}, async findRecent() { return bodyRecords; } },
  mealRepository: { async createLog() {}, async updateLog() {}, async deleteLog() {}, async findLogById() {}, async listLogsByDate(date) { return meals.filter((meal) => meal.date === date); }, async addPhoto() {}, async deletePhoto() {}, async listPhotos() { return []; } },
  workoutRepository: { async listActivePlans() { return initialData.INITIAL_WORKOUT_PLANS; }, async findPlanByDay(dayCode) { return initialData.INITIAL_WORKOUT_PLANS.find((plan) => plan.dayCode === dayCode); }, async listPlanExercises(workoutPlanId) { return initialData.listInitialWorkoutExercisesByPlan(workoutPlanId); }, async saveInitialPlans() {}, async createSession() {}, async findLatestCompletedSession() { return completedSessions[0]; }, async listCompletedSessionsSince() { return completedSessions; } },
}, '2026-06-23');

assert.equal(summary.currentBodyRecord.weightKg, 61.2);
assert.equal(summary.targetWeightKg, 56);
assert.equal(summary.todayCalories, 900);
assert.equal(summary.todayProteinGrams, 50.5);
assert.equal(summary.todayWorkout.plan.dayCode, 'DAY_2');
assert.equal(summary.weeklyWorkoutCount, 2);
assert.equal(summary.recentStatuses[0].hasBodyRecord, true);
assert.equal(summary.recentStatuses[0].mealLogCount, 2);
assert.equal(summary.recentStatuses[0].hasWorkout, true);
assert.equal(summary.reminders.length, 5);
assert.equal(summary.reminders.find((reminder) => reminder.kind === 'body').done, true);
assert.equal(summary.reminders.find((reminder) => reminder.kind === 'breakfast').done, true);
assert.equal(summary.reminders.find((reminder) => reminder.kind === 'lunch').done, true);
assert.equal(summary.reminders.find((reminder) => reminder.kind === 'dinner').done, false);
assert.equal(summary.reminders.find((reminder) => reminder.kind === 'workout').done, true);

const reminders = buildHomeReminders([], { date: '2026-06-23', hasBodyRecord: false, mealLogCount: 0, hasWorkout: false }, summary.todayWorkout);
assert.deepEqual(reminders.map((reminder) => reminder.done), [false, false, false, false, false]);
assert.equal(reminders.find((reminder) => reminder.kind === 'workout').href, '/workouts');

console.log('home summary tests passed');
