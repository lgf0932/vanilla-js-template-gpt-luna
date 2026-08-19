import { CREATE_SETTINGS_TABLE, GET_SETTING, UPSERT_SETTING } from './query/settings.queries.js';

const VERSION_KEY = 'settings:migrations:version';
const embeddedMigrations = [{
  version: 1,
  name: '0001_core_init.sql',
  sql: `
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS notes_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS notes_tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS notes_tags_bindings (
      note_id INTEGER NOT NULL REFERENCES notes_data(id) ON DELETE CASCADE,
      tag_id INTEGER NOT NULL REFERENCES notes_tags(id) ON DELETE CASCADE,
      PRIMARY KEY (note_id, tag_id)
    );
    CREATE INDEX IF NOT EXISTS idx_notes_data_updated_at ON notes_data(updated_at DESC);
  `,
}];

function splitStatements(sql) {
  return sql.split(';').map((statement) => statement.trim()).filter(Boolean);
}

async function loadMigrations(directory) {
  if (!globalThis.process?.versions?.node) {
    return embeddedMigrations;
  }
  const { readdir, readFile } = await import('node:fs/promises');
  const files = (await readdir(directory))
    .filter((file) => /^\d{4}_.+\.sql$/.test(file))
    .sort();
  return Promise.all(files.map(async (file) => ({
    version: Number(file.slice(0, 4)),
    name: file,
    sql: await readFile(new URL(file, directory), 'utf8'),
  })));
}

export async function runMigrations(db, directory = null) {
  await db.execute(CREATE_SETTINGS_TABLE);
  const versionRows = await db.query(GET_SETTING, [VERSION_KEY]);
  const currentVersion = Number(versionRows[0]?.value ?? 0);
  const defaultDirectory = new URL('./migrations/', import.meta.url);
  const migrations = await loadMigrations(directory || defaultDirectory);
  let appliedVersion = currentVersion;
  for (const migration of migrations.sort((left, right) => left.version - right.version)) {
    if (migration.version <= currentVersion) {
      continue;
    }
    await db.transaction(async (transaction) => {
      for (const statement of splitStatements(migration.sql)) {
        await transaction.execute(statement);
      }
      await transaction.execute(UPSERT_SETTING, [VERSION_KEY, String(migration.version), new Date().toISOString()]);
    });
    appliedVersion = migration.version;
  }
  return { currentVersion: appliedVersion, applied: appliedVersion - currentVersion };
}

export { VERSION_KEY, embeddedMigrations };
