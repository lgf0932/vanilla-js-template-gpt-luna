import test from 'node:test';
import assert from 'node:assert/strict';
import { api, clearAuthToken, storeAuthToken } from './fetcher.js';

class MemoryStorage {
  #values = new Map();
  getItem(key) { return this.#values.get(key) ?? null; }
  setItem(key, value) { this.#values.set(key, String(value)); }
  removeItem(key) { this.#values.delete(key); }
}

test('file mode provides a local API fallback', async () => {
  const previous = {
    location: globalThis.location,
    localStorage: globalThis.localStorage,
    sessionStorage: globalThis.sessionStorage,
  };
  globalThis.location = { protocol: 'file:', href: 'file:///nova/index.html', pathname: '/nova/index.html', hash: '' };
  globalThis.localStorage = new MemoryStorage();
  globalThis.sessionStorage = new MemoryStorage();
  try {
    assert.deepEqual(await api.get('/api/auth/status'), { configured: false });
    await api.post('/api/auth/setup', { password: 'offline-pass-123' });
    const login = await api.post('/api/auth/login', { password: 'offline-pass-123', duration: 'session' });
    storeAuthToken(login.token, login.duration);
    const created = await api.post('/api/notes', { title: 'Offline note', content: 'Local content' });
    assert.equal(created.item.title, 'Offline note');
    assert.equal((await api.get('/api/notes')).total, 1);
    await api.put('/api/settings', { display: { theme: 'dark' } });
    assert.equal((await api.get('/api/settings')).display.theme, 'dark');
  } finally {
    clearAuthToken();
    globalThis.location = previous.location;
    globalThis.localStorage = previous.localStorage;
    globalThis.sessionStorage = previous.sessionStorage;
  }
});
