import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const dbSource = readFileSync(new URL('../infrastructure/indexeddb/db.ts', import.meta.url), 'utf8');
const repositoryFiles = [
  'settings-repository.ts',
  'body-record-repository.ts',
  'workout-repository.ts',
  'meal-repository.ts',
  'food-repository.ts',
  'recipe-repository.ts',
];
const tables = [
  'settings',
  'bodyRecords',
  'workoutPlans',
  'workoutPlanExercises',
  'workoutSessions',
  'workoutExerciseLogs',
  'cardioLogs',
  'mealLogs',
  'mealPhotos',
  'foodMaster',
  'recipes',
  'recipeIngredients',
];

for (const table of tables) {
  assert.match(dbSource, new RegExp(`${table}: '`), `${table} should be defined in kirokumaSchema`);
  assert.match(dbSource, new RegExp(`${table}!: Table<`), `${table} should be exposed as a typed Dexie table`);
}

for (const file of repositoryFiles) {
  const source = readFileSync(new URL(`../infrastructure/indexeddb/${file}`, import.meta.url), 'utf8');
  assert.match(source, /from '\.\/db'/, `${file} should use the shared IndexedDB database module`);
}

console.log('IndexedDB schema and repository skeleton checks passed.');
