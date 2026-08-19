import { D1Adapter } from './adapters/d1.adapter.js';
import { SqliteAdapter } from './adapters/sqlite.adapter.js';
import { TursoAdapter } from './adapters/turso.adapter.js';

function envValue(env, key, fallback = '') {
  const value = env?.[key] ?? globalThis.process?.env?.[key];
  return value === '' || value === undefined || value === null ? fallback : value;
}

export async function resolveAdapter(env = {}) {
  const explicit = envValue(env, 'DB_DRIVER');
  if (explicit === 'sqlite') {
    return { adapter: new SqliteAdapter(envValue(env, 'SQLITE_PATH', './data/dev.sqlite')), driver: 'sqlite' };
  }
  if (explicit === 'd1' || (!explicit && env.DB)) {
    return { adapter: new D1Adapter(env.DB), driver: 'd1' };
  }
  const production = envValue(env, 'NODE_ENV') === 'production';
  if (explicit === 'turso' || (!explicit && (production || !globalThis.process?.versions?.node))) {
    return {
      adapter: new TursoAdapter(envValue(env, 'TURSO_DATABASE_URL'), envValue(env, 'TURSO_AUTH_TOKEN')),
      driver: 'turso',
    };
  }
  return { adapter: new SqliteAdapter(envValue(env, 'SQLITE_PATH', './data/dev.sqlite')), driver: 'sqlite' };
}

export { envValue };
