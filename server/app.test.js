import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { closeDatabase, handleRequest } from './app.js';

const environment = { DB_DRIVER: 'sqlite', SQLITE_PATH: ':memory:' };

async function call(path, options = {}) {
  return handleRequest(new Request(`https://nova.test${path}`, options), environment);
}

test('API supports setup, login, and authenticated notes flow', async () => {
  const status = await call('/api/auth/status');
  assert.equal(status.status, 200);
  assert.deepEqual(await status.json(), { configured: false });

  const setup = await call('/api/auth/setup', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password: 'secure-pass-123' }) });
  assert.equal(setup.status, 201);

  const login = await call('/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password: 'secure-pass-123', duration: '24h' }) });
  assert.equal(login.status, 200);
  const { token } = await login.json();
  assert.ok(token);

  const unauthorized = await call('/api/notes');
  assert.equal(unauthorized.status, 401);
  const created = await call('/api/notes', { method: 'POST', headers: { 'content-type': 'application/json', 'X-Auth-Password': token }, body: JSON.stringify({ title: 'API note', content: 'Saved' }) });
  assert.equal(created.status, 201);
  const list = await call('/api/notes', { headers: { 'X-Auth-Password': token } });
  assert.equal((await list.json()).total, 1);
});

after(async () => closeDatabase());
