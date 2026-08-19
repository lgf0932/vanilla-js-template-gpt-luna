import { execFileSync } from 'node:child_process';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const ignored = new Set(['node_modules', 'dist', 'data', '.git']);
const forbidden = [
  { pattern: /window\.(alert|confirm|prompt)\s*\(/, message: '禁止使用浏览器内置弹窗' },
  { pattern: /<(dialog|select)(?:\s|>)/i, message: '禁止使用原生 dialog/select 控件' },
];

async function filesIn(directory, extensions = new Set(['.js', '.html', '.css'])) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (ignored.has(entry.name)) {
      continue;
    }
    const filename = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await filesIn(filename, extensions));
    } else if (extensions.has(entry.name.slice(entry.name.lastIndexOf('.')))) {
      files.push(filename);
    }
  }
  return files;
}

const files = await filesIn(root);
const failures = [];
for (const filename of files) {
  const relative = filename.slice(root.length + 1);
  if (filename.endsWith('.js')) {
    try {
      execFileSync(process.execPath, ['--check', filename], { stdio: 'pipe' });
    } catch (error) {
      failures.push(`${relative}: ${error.stderr?.toString().trim() || '语法错误'}`);
    }
  }
  const content = await readFile(filename, 'utf8');
  for (const rule of forbidden) {
    if (rule.pattern.test(content)) {
      failures.push(`${relative}: ${rule.message}`);
    }
  }
}
if (failures.length) {
  throw new Error(`lint failed\n${failures.join('\n')}`);
}
console.log(`lint passed — checked ${files.length} files`);
