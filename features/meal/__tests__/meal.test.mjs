import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const outDir = mkdtempSync(join(tmpdir(), 'kirokuma-meal-'));
const tsconfigPath = join(outDir, 'tsconfig.json');
writeFileSync(tsconfigPath, JSON.stringify({
  compilerOptions: { module: 'NodeNext', moduleResolution: 'NodeNext', target: 'ES2022', outDir, rootDir: process.cwd(), strict: true, skipLibCheck: true },
  files: [
    join(process.cwd(), 'features/meal/types.ts'),
    join(process.cwd(), 'features/meal/schema.ts'),
    join(process.cwd(), 'features/meal/repository.ts'),
    join(process.cwd(), 'features/recipe/types.ts'),
    join(process.cwd(), 'features/recipe/repository.ts'),
    join(process.cwd(), 'features/meal/usecases.ts'),
  ],
}));
execFileSync('npx', ['tsc', '--project', tsconfigPath], { stdio: 'inherit' });

const schema = await import(join(outDir, 'features/meal/schema.js'));
const usecases = await import(join(outDir, 'features/meal/usecases.js'));

const valid = schema.validateMealLogForm({ date: '2026-06-23', mealType: 'lunch', mealSource: 'restaurant', title: '定食', calories: 650, proteinGrams: 28 }, '2026-06-23');
assert.equal(valid.success, true);

const future = schema.validateMealLogForm({ date: '2026-06-24', mealType: 'lunch', mealSource: 'restaurant', title: '定食', calories: 650, proteinGrams: 28 }, '2026-06-23');
assert.equal(future.success, false);
assert.equal(future.errors.date, '未来日は記録できません。');

const logs = [];
const repository = {
  async createLog(input) { logs.push(input); },
  async updateLog(id, input) { const index = logs.findIndex((log) => log.id === id); logs[index] = { ...logs[index], ...input }; },
  async deleteLog() {},
  async findLogById(id) { return logs.find((log) => log.id === id); },
  async listLogsByDate(date) { return logs.filter((log) => log.date === date); },
  async addPhoto() {},
  async listPhotos() { return []; },
};

const saved = await usecases.saveMealLog(repository, { date: '2026-06-23', mealType: 'breakfast', mealSource: 'home_cooking', title: ' 卵かけごはん ', calories: 420, proteinGrams: 18, memo: ' 朝 ' }, '2026-06-23', '2026-06-23T07:00:00.000Z', undefined, () => 'meal-1');
assert.equal(saved.id, 'meal-1');
assert.equal(saved.title, '卵かけごはん');
assert.equal(saved.memo, '朝');
assert.equal(logs.length, 1);

const recipeRepository = { async create() {}, async updateWithIngredients() {}, async delete() {}, async findById() { return { id: 'recipe-1', name: '鶏むね丼', servingCount: 2, totalCalories: 900, totalProteinGrams: 70, createdAt: '', updatedAt: '' }; }, async listAll() { return []; }, async listIngredients() { return []; } };
const applied = await usecases.applyRecipeToMealForm(recipeRepository, schema.createDefaultMealLogFormValues('2026-06-23'), 'recipe-1');
assert.equal(applied.title, '鶏むね丼');
assert.equal(applied.calories, 450);
assert.equal(applied.proteinGrams, 35);
assert.equal(applied.mealSource, 'home_cooking');

console.log('meal tests passed');
