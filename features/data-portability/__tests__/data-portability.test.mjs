import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('../usecases.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

const compiledModule = { exports: {} };
new Function('exports', 'module', compiled)(compiledModule.exports, compiledModule);

const { EXPORT_FORMAT, parseBackupJson, serializeBackup } = compiledModule.exports;

const emptyBackup = {
  format: EXPORT_FORMAT,
  exportedAt: '2026-06-23T00:00:00.000Z',
  data: {
    settings: [],
    bodyRecords: [],
    workoutPlans: [],
    workoutPlanExercises: [],
    workoutSessions: [],
    workoutExerciseLogs: [],
    cardioLogs: [],
    mealLogs: [],
    mealPhotos: [],
    foodMaster: [],
    recipes: [],
    recipeIngredients: [],
  },
};

assert.deepEqual(parseBackupJson(JSON.stringify(emptyBackup)), emptyBackup);
assert.match(serializeBackup(emptyBackup), /kirokuma\.backup\.v1/);
assert.throws(() => parseBackupJson('{not-json'), /JSONの形式が正しくありません/);
assert.throws(() => parseBackupJson(JSON.stringify({ format: 'other' })), /きろくまのバックアップJSONとして読み込めません/);

console.log('data portability usecases ok');
