import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const outDir = mkdtempSync(join(tmpdir(), 'kirokuma-workout-session-'));
const tsconfigPath = join(outDir, 'tsconfig.json');
writeFileSync(tsconfigPath, JSON.stringify({
  compilerOptions: { module: 'NodeNext', moduleResolution: 'NodeNext', target: 'ES2022', outDir, rootDir: process.cwd(), strict: true, skipLibCheck: true },
  files: [
    join(process.cwd(), 'features/workout/types.ts'),
    join(process.cwd(), 'features/workout/repository.ts'),
    join(process.cwd(), 'features/workout/initial-data.ts'),
    join(process.cwd(), 'features/workout/schema.ts'),
    join(process.cwd(), 'features/workout/usecases.ts'),
  ],
}));
execFileSync('npx', ['tsc', '--project', tsconfigPath], { stdio: 'inherit' });

const initialData = await import(join(outDir, 'features/workout/initial-data.js'));
const schema = await import(join(outDir, 'features/workout/schema.js'));
const usecases = await import(join(outDir, 'features/workout/usecases.js'));

const day1Exercises = initialData.listInitialWorkoutExercisesByPlan(initialData.WORKOUT_PLAN_IDS.DAY_1);
const defaults = schema.createWorkoutSessionFormDefaults(day1Exercises, '2026-06-23');
assert.equal(defaults.date, '2026-06-23');
assert.equal(defaults.completed, true);
assert.equal(defaults.sets.length, 15);
assert.deepEqual(defaults.sets.slice(0, 3).map((set) => set.setNumber), [1, 2, 3]);

assert.equal(schema.validateWorkoutSessionForm(defaults, '2026-06-23').success, true);
assert.equal(schema.validateWorkoutSessionForm({ ...defaults, date: '2026-06-24' }, '2026-06-23').success, false);
assert.equal(schema.validateWorkoutSessionForm({ ...defaults, sets: [{ ...defaults.sets[0], reps: undefined, seconds: undefined }] }, '2026-06-23').success, false);

const saved = [];
const repository = {
  async listActivePlans() { return initialData.INITIAL_WORKOUT_PLANS; },
  async findPlanByDay(dayCode) { return initialData.INITIAL_WORKOUT_PLANS.find((plan) => plan.dayCode === dayCode); },
  async listPlanExercises(workoutPlanId) { return initialData.listInitialWorkoutExercisesByPlan(workoutPlanId); },
  async saveInitialPlans() {},
  async createSession(session, logs) { saved.push({ session, logs }); },
  async listCompletedSessionsSince() { return []; },
    async findLatestCompletedSession() { return saved.at(-1)?.session; },
};

let id = 0;
const session = await usecases.saveWorkoutSession(repository, defaults, '2026-06-23', '2026-06-23T09:00:00.000Z', () => `id-${++id}`);
assert.equal(session.id, 'id-1');
assert.equal(session.dayCode, 'DAY_1');
assert.equal(saved[0].logs.length, 15);
assert.equal(saved[0].logs[0].workoutSessionId, 'id-1');

const nextWorkout = await usecases.getTodayWorkout(repository);
assert.equal(nextWorkout.plan.dayCode, 'DAY_2');

console.log('workout session tests passed');
