import { cp, mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = join(root, 'dist');

async function removeTestFiles(directory) {
  let entries;
  try { entries = await readdir(directory, { withFileTypes: true }); } catch { return; }
  await Promise.all(entries.map(async (entry) => {
    const filename = join(directory, entry.name);
    if (entry.isDirectory()) return removeTestFiles(filename);
    if (entry.name.endsWith('.test.js')) await rm(filename, { force: true });
  }));
}

export async function build({ silent = false } = {}) {
  await rm(dist, { recursive: true, force: true });
  await mkdir(dist, { recursive: true });
  await cp(join(root, 'index.html'), join(dist, 'index.html'));
  for (const directory of ['app', 'shared', 'public']) {
    await cp(join(root, directory), join(dist, directory), { recursive: true, force: true });
  }
  await removeTestFiles(join(dist, 'app'));
  await writeFile(join(dist, 'build-manifest.json'), JSON.stringify({
    generatedAt: new Date().toISOString(),
    mode: 'zero-build',
    entry: '/app/main.js',
  }, null, 2));
  if (!silent) {
    console.log(`build passed — static output written to ${dist}`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await build();
}
