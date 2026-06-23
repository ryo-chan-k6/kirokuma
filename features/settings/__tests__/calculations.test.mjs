import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const outDir = mkdtempSync(join(tmpdir(), 'kirokuma-settings-'));
const tsconfigPath = join(outDir, 'tsconfig.json');
writeFileSync(tsconfigPath, JSON.stringify({ compilerOptions: { module: 'NodeNext', moduleResolution: 'NodeNext', target: 'ES2022', outDir, rootDir: process.cwd(), strict: true, skipLibCheck: true }, files: [join(process.cwd(), 'features/settings/calculations.ts'), join(process.cwd(), 'features/settings/types.ts')] }));
execFileSync('npx', ['tsc', '--project', tsconfigPath], { stdio: 'inherit' });

const calculations = await import(join(outDir, 'features/settings/calculations.js'));

assert.equal(calculations.calculateBmi(62, 163), 23.3);
assert.equal(calculations.calculateBmi(56, 163), 21.1);
assert.equal(calculations.calculateRemainingWeight(62, 56), 6);
assert.equal(calculations.calculateTargetProtein(62, 56), 90);
assert.equal(calculations.calculateTargetCalories({ heightCm: 163, currentWeightKg: 62, targetWeightKg: 56, age: 35, sex: 'other', activityLevel: 'medium' }), 1610);

const targets = calculations.calculateSettingsTargets({ heightCm: 163, currentWeightKg: 62, targetWeightKg: 56, age: 35, sex: 'other', activityLevel: 'medium' });
assert.deepEqual(targets, {
  currentBmi: 23.3,
  targetBmi: 21.1,
  remainingWeightKg: 6,
  targetCaloriesKcal: 1610,
  targetProteinG: 90,
});

writeFileSync(join(outDir, 'ok'), 'ok');
console.log('settings calculation tests passed');
