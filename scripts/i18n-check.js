import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const languages = ['zh-CN', 'zh-TW', 'en'];

function flatten(value, prefix = '', result = new Set()) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const [key, child] of Object.entries(value)) {
      flatten(child, prefix ? `${prefix}.${key}` : key, result);
    }
  } else {
    result.add(prefix);
  }
  return result;
}

async function directoriesWithLocales(directory) {
  const matches = [];
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch {
    return matches;
  }
  const hasLocales = entries.some((entry) => entry.isDirectory() && entry.name === 'locales');
  if (hasLocales) {
    matches.push(join(directory, 'locales'));
  }
  for (const entry of entries) {
    if (entry.isDirectory() && !['node_modules', 'dist', 'data'].includes(entry.name)) {
      matches.push(...await directoriesWithLocales(join(directory, entry.name)));
    }
  }
  return matches;
}

const roots = [join(root, 'app', 'locales'), ...(await directoriesWithLocales(join(root, 'app', 'modules')))];
const failures = [];
for (const localeDirectory of roots) {
  const sets = new Map();
  for (const language of languages) {
    const filename = join(localeDirectory, `${language}.json`);
    try {
      const parsed = JSON.parse(await readFile(filename, 'utf8'));
      sets.set(language, flatten(parsed));
    } catch {
      failures.push(`${localeDirectory}: 缺少或无法解析 ${language}.json`);
    }
  }
  const reference = sets.get(languages[0]);
  if (!reference) {
    continue;
  }
  for (const language of languages.slice(1)) {
    const current = sets.get(language);
    if (!current) {
      continue;
    }
    const missing = [...reference].filter((key) => !current.has(key));
    const extra = [...current].filter((key) => !reference.has(key));
    if (missing.length || extra.length) {
      failures.push(`${localeDirectory} ${language}: missing=[${missing.join(',')}] extra=[${extra.join(',')}]`);
    }
  }
}

if (failures.length) {
  throw new Error(`i18n:check failed\n${failures.join('\n')}`);
}
console.log(`i18n:check passed — ${roots.length} locale groups`);
