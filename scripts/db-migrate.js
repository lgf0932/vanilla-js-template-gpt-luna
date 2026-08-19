import { resolveAdapter } from '../server/db/resolver.js';
import { runMigrations } from '../server/db/migrate.js';

const environment = Object.fromEntries([
  'DB_DRIVER',
  'SQLITE_PATH',
  'TURSO_DATABASE_URL',
  'TURSO_AUTH_TOKEN',
].map((key) => [key, process.env[key] ?? '']));
const { adapter, driver } = await resolveAdapter(environment);
try {
  const result = await runMigrations(adapter);
  console.log(`db:migrate passed — driver=${driver}, version=${result.currentVersion}, applied=${result.applied}`);
} finally {
  await adapter.close();
}
