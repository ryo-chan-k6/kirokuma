import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const outDir = mkdtempSync(join(tmpdir(), 'kirokuma-passcode-'));
const tsconfigPath = join(outDir, 'tsconfig.json');
writeFileSync(tsconfigPath, JSON.stringify({
  compilerOptions: { module: 'NodeNext', moduleResolution: 'NodeNext', target: 'ES2022', outDir, rootDir: process.cwd(), strict: true, skipLibCheck: true },
  files: [
    join(process.cwd(), 'features/passcode/repository.ts'),
    join(process.cwd(), 'features/passcode/usecases.ts'),
  ],
}));
execFileSync('npx', ['tsc', '--project', tsconfigPath], { stdio: 'inherit' });

const { disablePasscode, setPasscode, validatePasscode, verifyPasscode } = await import(join(outDir, 'features/passcode/usecases.js'));

function createMemoryRepository() {
  let settings = { enabled: false };
  return {
    async load() {
      return settings;
    },
    async save(next) {
      settings = next;
    },
    async clear() {
      settings = { enabled: false };
    },
  };
}

assert.deepEqual(validatePasscode('1234'), { success: true, passcode: '1234' });
assert.equal(validatePasscode('12').success, false);
assert.equal(validatePasscode('abcd').success, false);
assert.equal(validatePasscode('123456789').success, false);

const repository = createMemoryRepository();
const enabled = await setPasscode(repository, ' 5678 ');
assert.deepEqual(enabled, { enabled: true, passcode: '5678' });
assert.equal(verifyPasscode(await repository.load(), '5678'), true);
assert.equal(verifyPasscode(await repository.load(), '0000'), false);

const disabled = await disablePasscode(repository);
assert.deepEqual(disabled, { enabled: false });
assert.equal(verifyPasscode(await repository.load(), '5678'), false);

console.log('passcode tests passed');
