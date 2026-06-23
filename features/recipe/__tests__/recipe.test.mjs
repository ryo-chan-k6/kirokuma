import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const outDir = mkdtempSync(join(tmpdir(), 'kirokuma-recipe-'));
const tsconfigPath = join(outDir, 'tsconfig.json');
writeFileSync(tsconfigPath, JSON.stringify({
  compilerOptions: { module: 'NodeNext', moduleResolution: 'NodeNext', target: 'ES2022', outDir, rootDir: process.cwd(), strict: true, skipLibCheck: true },
  files: [
    join(process.cwd(), 'features/food/types.ts'),
    join(process.cwd(), 'features/food/repository.ts'),
    join(process.cwd(), 'features/recipe/types.ts'),
    join(process.cwd(), 'features/recipe/schema.ts'),
    join(process.cwd(), 'features/recipe/repository.ts'),
    join(process.cwd(), 'features/recipe/usecases.ts'),
  ],
}));
execFileSync('npx', ['tsc', '--project', tsconfigPath], { stdio: 'inherit' });

const schema = await import(join(outDir, 'features/recipe/schema.js'));
const usecases = await import(join(outDir, 'features/recipe/usecases.js'));

const chicken = { id: 'food-1', name: '鶏むね肉', baseAmount: 100, unit: 'g', calories: 108, proteinGrams: 22, isFavorite: true, createdAt: 'now', updatedAt: 'now' };
const rice = { id: 'food-2', name: 'ごはん', baseAmount: 150, unit: 'g', calories: 234, proteinGrams: 3.8, isFavorite: false, createdAt: 'now', updatedAt: 'now' };

const chickenNutrition = schema.calculateIngredientNutrition(chicken, 250);
assert.deepEqual(chickenNutrition, { unit: 'g', calories: 270, proteinGrams: 55 });

const riceNutrition = schema.calculateIngredientNutrition(rice, 75);
assert.deepEqual(riceNutrition, { unit: 'g', calories: 117, proteinGrams: 1.9 });

const totals = schema.calculateRecipeTotals([chickenNutrition, riceNutrition], 2);
assert.deepEqual(totals, { totalCalories: 387, totalProteinGrams: 56.9, caloriesPerServing: 193.5, proteinGramsPerServing: 28.5 });

const invalid = schema.validateRecipeForm({ name: '', servingCount: 0, ingredients: [] });
assert.equal(invalid.success, false);
assert.equal(invalid.errors.name, 'レシピ名を入力してください。');
assert.equal(invalid.errors.servingCount, '何食分かは1〜100で入力してください。');
assert.equal(invalid.errors.ingredients, '材料を1つ以上追加してください。');

const foods = [chicken, rice];
const recipes = [];
let recipeIngredients = [];
const foodRepository = {
  async create() {}, async update() {}, async delete() {},
  async findById(id) { return foods.find((food) => food.id === id); },
  async listAll() { return foods; }, async searchByName() { return foods; }, async listFavorites() { return foods.filter((food) => food.isFavorite); },
};
const recipeRepository = {
  async create(input, ingredients) { recipes.push(input); recipeIngredients.push(...ingredients); },
  async update(id, input) { Object.assign(recipes.find((recipe) => recipe.id === id), input); },
  async updateWithIngredients(id, input, ingredients) {
    const index = recipes.findIndex((recipe) => recipe.id === id);
    recipes[index] = input;
    recipeIngredients = recipeIngredients.filter((ingredient) => ingredient.recipeId !== id).concat(ingredients);
  },
  async delete(id) {
    recipes.splice(recipes.findIndex((recipe) => recipe.id === id), 1);
    recipeIngredients = recipeIngredients.filter((ingredient) => ingredient.recipeId !== id);
  },
  async findById(id) { return recipes.find((recipe) => recipe.id === id); },
  async listAll() { return recipes; },
  async listIngredients(recipeId) { return recipeIngredients.filter((ingredient) => ingredient.recipeId === recipeId); },
};

const saved = await usecases.saveRecipe(recipeRepository, foodRepository, { name: ' 親子丼 ', servingCount: 2, memo: ' 作り置き ', ingredients: [{ foodId: 'food-1', amount: 250 }, { foodId: 'food-2', amount: 75 }] }, '2026-06-23T00:00:00.000Z', undefined, () => 'recipe-1');
assert.equal(saved.id, 'recipe-1');
assert.equal(saved.name, '親子丼');
assert.equal(saved.totalCalories, 387);
assert.equal(saved.totalProteinGrams, 56.9);
assert.equal(saved.memo, '作り置き');
assert.equal(saved.ingredients.length, 2);

const updated = await usecases.saveRecipe(recipeRepository, foodRepository, { name: '親子丼 大盛り', servingCount: 1, ingredients: [{ foodId: 'food-2', amount: 300 }] }, '2026-06-24T00:00:00.000Z', 'recipe-1', () => 'recipe-2');
assert.equal(updated.id, 'recipe-1');
assert.equal(updated.createdAt, '2026-06-23T00:00:00.000Z');
assert.equal(updated.totalCalories, 468);
assert.equal(recipeIngredients.length, 1);

const loaded = await usecases.loadRecipe(recipeRepository, 'recipe-1');
assert.equal(loaded.ingredients[0].amount, 300);

await usecases.deleteRecipe(recipeRepository, 'recipe-1');
assert.equal(recipes.length, 0);
assert.equal(recipeIngredients.length, 0);

console.log('recipe tests passed');
