import { readFile } from 'node:fs/promises';

const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
for (const field of ['dependencies', 'devDependencies']) {
  const value = packageJson[field];
  if (!value || Object.keys(value).length > 0) {
    throw new Error(`${field} 必须为空对象`);
  }
}
console.log('deps:check passed — no third-party dependencies');
