import { api, clearAuthToken, getAuthToken, storeAuthToken } from '../lib/fetcher.js';

export class AuthController extends EventTarget {
  #status = { configured: false, authenticated: false };

  constructor() {
    super();
    globalThis.addEventListener('nova-auth-expired', () => {
      clearAuthToken();
      this.#status = { ...this.#status, authenticated: false };
      this.dispatchEvent(new CustomEvent('auth-change', { detail: this.#status }));
    });
  }

  async status() {
    const result = await api.get('/api/auth/status');
    let authenticated = Boolean(getAuthToken());
    if (authenticated) {
      try { authenticated = Boolean((await api.get('/api/auth/session')).authenticated); } catch { authenticated = false; clearAuthToken(); }
    }
    this.#status = { ...result, authenticated };
    return this.#status;
  }

  async setup(password) {
    await api.post('/api/auth/setup', { password });
    return this.login(password, 'session');
  }

  async login(password, duration = '24h') {
    const result = await api.post('/api/auth/login', { password, duration });
    storeAuthToken(result.token, result.duration);
    this.#status = { configured: true, authenticated: true };
    this.dispatchEvent(new CustomEvent('auth-change', { detail: this.#status }));
    return result;
  }

  logout() {
    clearAuthToken();
    this.#status = { ...this.#status, authenticated: false };
    this.dispatchEvent(new CustomEvent('auth-change', { detail: this.#status }));
  }

  isAuthenticated() { return Boolean(getAuthToken()); }
  get statusValue() { return this.#status; }
}
