import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const outDir = mkdtempSync(join(tmpdir(), 'kirokuma-workout-'));
const tsconfigPath = join(outDir, 'tsconfig.json');
writeFileSync(tsconfigPath, JSON.stringify({
  compilerOptions: { module: 'NodeNext', moduleResolution: 'NodeNext', target: 'ES2022', outDir, rootDir: process.cwd(), strict: true, skipLibCheck: true },
  files: [
    join(process.cwd(), 'features/workout/types.ts'),
    join(process.cwd(), 'features/workout/repository.ts'),
    join(process.cwd(), 'features/workout/initial-data.ts'),
    join(process.cwd(), 'features/workout/usecases.ts'),
    join(process.cwd(), 'features/workout/components/WorkoutPlanList.ts'),
  ],
}));
execFileSync('npx', ['tsc', '--project', tsconfigPath], { stdio: 'inherit' });

const initialData = await import(join(outDir, 'features/workout/initial-data.js'));
const components = await import(join(outDir, 'features/workout/components/WorkoutPlanList.js'));
const usecases = await import(join(outDir, 'features/workout/usecases.js'));

assert.equal(initialData.INITIAL_WORKOUT_PLANS.length, 5);
assert.deepEqual(initialData.INITIAL_WORKOUT_PLANS.map((plan) => plan.dayCode), ['DAY_1', 'DAY_2', 'DAY_3', 'DAY_4', 'DAY_5']);

for (const plan of initialData.INITIAL_WORKOUT_PLANS) {
  const exercises = initialData.listInitialWorkoutExercisesByPlan(plan.id);
  assert.equal(exercises.length, 5, `${plan.dayCode} should have 5 exercises`);
  assert.deepEqual(exercises.map((exercise) => exercise.displayOrder), [1, 2, 3, 4, 5]);
}

assert.equal(initialData.INITIAL_WORKOUT_PLAN_EXERCISES.length, 25);
assert.equal(components.formatWorkoutPlanTitle(initialData.INITIAL_WORKOUT_PLANS[0]), 'Day1：胸・腕（胸・腕）');
assert.equal(components.formatWorkoutExerciseSummary(initialData.INITIAL_WORKOUT_PLAN_EXERCISES[0]), 'ダンベルプレス / 10kg / 10回 / 3セット');

const calls = [];
await usecases.ensureInitialWorkoutPlans({
  async listActivePlans() { return []; },
  async findPlanByDay() { return undefined; },
  async listPlanExercises() { return []; },
  async saveInitialPlans(plans, exercises) { calls.push({ plans, exercises }); },
  async createSession() {},
  async findLatestCompletedSession() { return undefined; },
});
assert.equal(calls.length, 1);
assert.equal(calls[0].plans.length, 5);
assert.equal(calls[0].exercises.length, 25);

console.log('workout initial data tests passed');
