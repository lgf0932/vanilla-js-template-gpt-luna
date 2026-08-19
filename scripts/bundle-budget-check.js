import { gzipSync } from 'node:zlib';
import { access, readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from './build.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = join(root, 'dist');

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const filename = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await filesIn(filename));
    } else if (entry.name.endsWith('.js') || entry.name.endsWith('.css')) {
      files.push(filename);
    }
  }
  return files;
}

try {
  await access(dist);
} catch {
  await build({ silent: true });
}

const files = await filesIn(dist);
const failures = [];
let initialBytes = 0;
for (const filename of files) {
  const compressed = gzipSync(await readFile(filename)).byteLength;
  const pathname = relative(dist, filename).replaceAll('\\', '/');
  if (pathname.startsWith('app/core/') || pathname.startsWith('app/components/layout/') || pathname === 'app/main.js') {
    initialBytes += compressed;
  }
  if (pathname.startsWith('app/modules/') && pathname.endsWith('.js') && compressed > 15 * 1024) {
    failures.push(`${pathname}: ${compressed} bytes gzip > 15360`);
  }
}
if (initialBytes > 40 * 1024) {
  failures.push(`首屏 JS: ${initialBytes} bytes gzip > 40960`);
}
if (failures.length) {
  throw new Error(`build:budget failed\n${failures.join('\n')}`);
}
console.log(`build:budget passed — initial ${initialBytes} bytes gzip`);
