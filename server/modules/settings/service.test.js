import test from 'node:test';
import assert from 'node:assert/strict';
import { SqliteAdapter } from '../../db/adapters/sqlite.adapter.js';
import { runMigrations } from '../../db/migrate.js';
import { getSetting } from '../../core/settings.js';
import { getSettings, updateSettings } from './service.js';

test('settings encrypts profile fields before persistence', async () => {
  const db = new SqliteAdapter(':memory:');
  await runMigrations(db);
  try {
    const environment = { ENCRYPTION_KEY: 'test-only-envelope-key' };
    const result = await updateSettings(db, environment, { profile: { name: 'Nova', email: 'nova@example.com' } });
    assert.equal(result.profile.name, 'Nova');
    const raw = await getSetting(db, 'settings:profile');
    assert.ok(raw.includes(':'));
    assert.equal(raw.includes('nova@example.com'), false);
    assert.deepEqual((await getSettings(db, environment)).profile, { name: 'Nova', email: 'nova@example.com' });
    assert.match((await updateSettings(db, {}, { profile: { name: 'Blocked' } })).error, /ENCRYPTION_KEY/);
  } finally {
    await db.close();
  }
});
