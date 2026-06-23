import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const outDir = mkdtempSync(join(tmpdir(), 'kirokuma-workout-rotation-'));
const tsconfigPath = join(outDir, 'tsconfig.json');
writeFileSync(tsconfigPath, JSON.stringify({
  compilerOptions: { module: 'NodeNext', moduleResolution: 'NodeNext', target: 'ES2022', outDir, rootDir: process.cwd(), strict: true, skipLibCheck: true },
  files: [
    join(process.cwd(), 'features/workout/types.ts'),
    join(process.cwd(), 'features/workout/repository.ts'),
    join(process.cwd(), 'features/workout/initial-data.ts'),
    join(process.cwd(), 'features/workout/usecases.ts'),
  ],
}));
execFileSync('npx', ['tsc', '--project', tsconfigPath], { stdio: 'inherit' });

const initialData = await import(join(outDir, 'features/workout/initial-data.js'));
const usecases = await import(join(outDir, 'features/workout/usecases.js'));

assert.equal(usecases.getNextWorkoutDay(), 'DAY_1');
assert.equal(usecases.getNextWorkoutDay('DAY_1'), 'DAY_2');
assert.equal(usecases.getNextWorkoutDay('DAY_5'), 'DAY_1');

function createRepository(latestCompletedSession) {
  const calls = [];
  return {
    calls,
    async listActivePlans() { return initialData.INITIAL_WORKOUT_PLANS; },
    async findPlanByDay(dayCode) { return initialData.INITIAL_WORKOUT_PLANS.find((plan) => plan.dayCode === dayCode); },
    async listPlanExercises(workoutPlanId) { return initialData.listInitialWorkoutExercisesByPlan(workoutPlanId); },
    async saveInitialPlans(plans, exercises) { calls.push({ plans, exercises }); },
    async createSession() {},
    async listCompletedSessionsSince() { return []; },
    async findLatestCompletedSession() { return latestCompletedSession; },
  };
}

const firstRepository = createRepository(undefined);
const firstWorkout = await usecases.getTodayWorkout(firstRepository);
assert.equal(firstWorkout.plan.dayCode, 'DAY_1');
assert.equal(firstWorkout.exercises.length, 5);
assert.equal(firstRepository.calls.length, 1);

const afterDay1 = await usecases.getTodayWorkout(createRepository({ dayCode: 'DAY_1', date: '2026-06-20', createdAt: '2026-06-20T10:00:00.000Z', completed: true }));
assert.equal(afterDay1.plan.dayCode, 'DAY_2');

const afterDay5 = await usecases.getTodayWorkout(createRepository({ dayCode: 'DAY_5', date: '2026-06-22', createdAt: '2026-06-22T10:00:00.000Z', completed: true }));
assert.equal(afterDay5.plan.dayCode, 'DAY_1');

console.log('workout rotation tests passed');
