import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const serviceWorker = await readFile(new URL('../../public/sw.js', import.meta.url), 'utf8');
const offlinePage = await readFile(new URL('../../public/offline.html', import.meta.url), 'utf8');

assert.match(serviceWorker, /const OFFLINE_URL = '\/offline\.html';/);
assert.match(serviceWorker, /APP_SHELL_URLS = \['\/', OFFLINE_URL,/);
assert.match(serviceWorker, /event\.request\.mode === 'navigate'/);
assert.match(serviceWorker, /caches\.match\(OFFLINE_URL\)/);
assert.match(offlinePage, /いまはオフラインです/);
assert.match(offlinePage, /ホームを開きなおす/);
