import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const outDir = mkdtempSync(join(tmpdir(), 'kirokuma-food-'));
const tsconfigPath = join(outDir, 'tsconfig.json');
writeFileSync(tsconfigPath, JSON.stringify({
  compilerOptions: { module: 'NodeNext', moduleResolution: 'NodeNext', target: 'ES2022', outDir, rootDir: process.cwd(), strict: true, skipLibCheck: true },
  files: [
    join(process.cwd(), 'features/food/types.ts'),
    join(process.cwd(), 'features/food/schema.ts'),
    join(process.cwd(), 'features/food/repository.ts'),
    join(process.cwd(), 'features/food/usecases.ts'),
  ],
}));
execFileSync('npx', ['tsc', '--project', tsconfigPath], { stdio: 'inherit' });

const schema = await import(join(outDir, 'features/food/schema.js'));
const usecases = await import(join(outDir, 'features/food/usecases.js'));

const valid = schema.validateFoodForm({ name: ' 鶏むね肉 ', baseAmount: 100, unit: 'g', calories: 108, proteinGrams: 22, memo: ' 皮なし ', isFavorite: true });
assert.equal(valid.success, true);
assert.equal(valid.data.name, '鶏むね肉');
assert.equal(valid.data.memo, '皮なし');

const invalid = schema.validateFoodForm({ name: '', baseAmount: 0, unit: 'g', calories: -1, proteinGrams: -1, isFavorite: false });
assert.equal(invalid.success, false);
assert.equal(invalid.errors.name, '食材名を入力してください。');
assert.equal(invalid.errors.baseAmount, '基準量は0.1〜10000で入力してください。');

const foods = [];
const repository = {
  async create(input) { foods.push(input); },
  async update(id, input) {
    const index = foods.findIndex((food) => food.id === id);
    foods[index] = { ...foods[index], ...input };
  },
  async delete(id) {
    const index = foods.findIndex((food) => food.id === id);
    foods.splice(index, 1);
  },
  async findById(id) { return foods.find((food) => food.id === id); },
  async listAll() { return foods; },
  async searchByName(keyword) { return foods.filter((food) => food.name.includes(keyword)); },
  async listFavorites() { return foods.filter((food) => food.isFavorite); },
};

const saved = await usecases.saveFood(repository, { name: '鶏むね肉', baseAmount: 100, unit: 'g', calories: 108, proteinGrams: 22, isFavorite: true }, '2026-06-23T00:00:00.000Z', undefined, () => 'food-1');
assert.equal(saved.id, 'food-1');
assert.equal(foods.length, 1);

const updated = await usecases.saveFood(repository, { name: '鶏むね肉', baseAmount: 100, unit: 'g', calories: 110, proteinGrams: 23, isFavorite: false }, '2026-06-24T00:00:00.000Z', 'food-1', () => 'food-2');
assert.equal(updated.id, 'food-1');
assert.equal(updated.createdAt, '2026-06-23T00:00:00.000Z');
assert.equal(foods[0].calories, 110);
assert.equal(foods[0].isFavorite, false);

const searched = await usecases.searchFoods(repository, '鶏');
assert.equal(searched.length, 1);

await usecases.deleteFood(repository, 'food-1');
assert.equal(foods.length, 0);

console.log('food tests passed');
