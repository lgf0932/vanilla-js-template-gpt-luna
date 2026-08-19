import { AUTH_HEADER } from '../../shared/constants.js';

const LOCAL_TOKEN_KEY = 'nova.auth.token';
const SESSION_TOKEN_KEY = 'nova.auth.session';
const LOCAL_PASSWORD_KEY = 'nova.file.password.hash';
const LOCAL_DATA_KEY = 'nova.file.data';
let localProfile = {};

function storageGet(storage, key) {
  try { return storage?.getItem(key); } catch { return null; }
}

function storageSet(storage, key, value) {
  try { storage?.setItem(key, value); } catch {}
}

function storageRemove(storage, key) {
  try { storage?.removeItem(key); } catch {}
}

function isFileMode() {
  return globalThis.location?.protocol === 'file:';
}

export function getAuthToken() {
  return storageGet(globalThis.sessionStorage, SESSION_TOKEN_KEY) || storageGet(globalThis.localStorage, LOCAL_TOKEN_KEY);
}

export function storeAuthToken(token, duration) {
  clearAuthToken();
  const storage = duration === 'session' ? globalThis.sessionStorage : globalThis.localStorage;
  const key = duration === 'session' ? SESSION_TOKEN_KEY : LOCAL_TOKEN_KEY;
  storageSet(storage, key, token);
}

export function clearAuthToken() {
  storageRemove(globalThis.sessionStorage, SESSION_TOKEN_KEY);
  storageRemove(globalThis.localStorage, LOCAL_TOKEN_KEY);
}

export class ApiError extends Error {
  constructor(message, status, code = 'API_ERROR') {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

function localData() {
  try {
    const value = JSON.parse(storageGet(globalThis.localStorage, LOCAL_DATA_KEY) || '{}');
    return {
      notes: Array.isArray(value.notes) ? value.notes : [],
      settings: value.settings || { display: { theme: 'system', language: 'zh-CN' }, sessionDefault: '24h' },
    };
  } catch {
    return { notes: [], settings: { display: { theme: 'system', language: 'zh-CN' }, sessionDefault: '24h' } };
  }
}

function saveLocalData(data) {
  storageSet(globalThis.localStorage, LOCAL_DATA_KEY, JSON.stringify(data));
}

function localBody(options) {
  try { return options.body ? JSON.parse(options.body) : {}; } catch { return {}; }
}

async function localPasswordHash(password) {
  const bytes = new TextEncoder().encode(password);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, '0')).join('');
}

function localToken() {
  return `local.${globalThis.crypto?.randomUUID?.() || `${Date.now()}.${Math.random()}`}`;
}

function localError(message, status, code) {
  throw new ApiError(message, status, code);
}

function localNoteId(pathname) {
  const match = pathname.match(/^\/api\/notes\/(\d+)$/);
  return match ? Number(match[1]) : null;
}

async function localRequest(path, options = {}) {
  const url = new URL(path, globalThis.location.href);
  const method = (options.method || 'GET').toUpperCase();
  const body = localBody(options);
  const configured = Boolean(storageGet(globalThis.localStorage, LOCAL_PASSWORD_KEY));

  if (url.pathname === '/api/auth/status' && method === 'GET') return { configured };
  if (url.pathname === '/api/auth/setup' && method === 'POST') {
    if (configured) localError('管理密码已经设置', 409, 'ALREADY_CONFIGURED');
    if (typeof body.password !== 'string' || body.password.length < 8) localError('密码至少需要 8 个字符', 422, 'VALIDATION_ERROR');
    storageSet(globalThis.localStorage, LOCAL_PASSWORD_KEY, await localPasswordHash(body.password));
    return { configured: true };
  }
  if (url.pathname === '/api/auth/login' && method === 'POST') {
    const passwordHash = storageGet(globalThis.localStorage, LOCAL_PASSWORD_KEY);
    if (!passwordHash || passwordHash !== await localPasswordHash(body.password || '')) localError('密码不正确', 401, 'INVALID_CREDENTIALS');
    return { token: localToken(), duration: body.duration || '24h' };
  }
  if (url.pathname === '/api/auth/session' && method === 'GET') {
    return { authenticated: configured && Boolean(getAuthToken()) };
  }
  if (url.pathname === '/api/health' && method === 'GET') {
    return { ok: true, driver: 'local', configured };
  }

  if (!configured || !getAuthToken()) localError('请先登录离线工作台', 401, 'UNAUTHORIZED');
  const data = localData();

  if (url.pathname === '/api/dashboard' && method === 'GET') {
    return {
      metrics: { notes: data.notes.length, modules: 3, status: 'ready' },
      recentNotes: [...data.notes].sort((left, right) => right.updated_at.localeCompare(left.updated_at)).slice(0, 5),
    };
  }

  if (url.pathname === '/api/notes' && method === 'GET') {
    const page = Math.max(1, Number(url.searchParams.get('page') || 1));
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit') || 20)));
    const items = [...data.notes].sort((left, right) => right.updated_at.localeCompare(left.updated_at));
    return { items: items.slice((page - 1) * limit, page * limit), page, limit, total: items.length };
  }

  const id = localNoteId(url.pathname);
  if (id && method === 'GET') {
    const item = data.notes.find((note) => note.id === id);
    return item ? { item } : localError('笔记不存在', 404, 'NOT_FOUND');
  }
  if (url.pathname === '/api/notes' && method === 'POST') {
    if (typeof body.title !== 'string' || !body.title.trim()) localError('标题不能为空', 422, 'VALIDATION_ERROR');
    const now = new Date().toISOString();
    const item = { id: data.notes.reduce((max, note) => Math.max(max, note.id), 0) + 1, title: body.title.trim(), content: typeof body.content === 'string' ? body.content : '', created_at: now, updated_at: now };
    data.notes.push(item);
    saveLocalData(data);
    return { item };
  }
  if (id && method === 'PUT') {
    const item = data.notes.find((note) => note.id === id);
    if (!item) localError('笔记不存在', 404, 'NOT_FOUND');
    if (typeof body.title !== 'string' || !body.title.trim()) localError('标题不能为空', 422, 'VALIDATION_ERROR');
    item.title = body.title.trim();
    item.content = typeof body.content === 'string' ? body.content : '';
    item.updated_at = new Date().toISOString();
    saveLocalData(data);
    return { item };
  }
  if (id && method === 'DELETE') {
    const index = data.notes.findIndex((note) => note.id === id);
    if (index < 0) localError('笔记不存在', 404, 'NOT_FOUND');
    data.notes.splice(index, 1);
    saveLocalData(data);
    return null;
  }

  if (url.pathname === '/api/settings' && method === 'GET') {
    return { ...data.settings, profile: localProfile };
  }
  if (url.pathname === '/api/settings' && method === 'PUT') {
    if (body.display && typeof body.display === 'object') {
      data.settings.display = { ...data.settings.display, theme: body.display.theme || data.settings.display.theme, language: body.display.language || data.settings.display.language };
    }
    if (body.sessionDefault) data.settings.sessionDefault = body.sessionDefault;
    if (body.profile && typeof body.profile === 'object') {
      // 文件模式不将个人资料写入 localStorage；刷新后会清空，避免明文落盘。
      localProfile = Object.fromEntries(Object.entries(body.profile).filter(([key]) => ['name', 'email', 'phone', 'address'].includes(key)));
    }
    saveLocalData(data);
    return { ...data.settings, profile: localProfile };
  }

  localError('请求路径不存在', 404, 'NOT_FOUND');
}

export async function request(path, options = {}) {
  if (isFileMode()) return localRequest(path, options);
  const headers = new Headers(options.headers || {});
  headers.set('accept', 'application/json');
  if (options.body && !headers.has('content-type')) headers.set('content-type', 'application/json');
  const token = getAuthToken();
  if (token) headers.set(AUTH_HEADER, token);
  const response = await fetch(path, { ...options, headers });
  let payload = null;
  try { payload = await response.json(); } catch {}
  if (!response.ok) {
    if (response.status === 401 && token) globalThis.dispatchEvent(new CustomEvent('nova-auth-expired'));
    throw new ApiError(payload?.error?.message || '请求失败', response.status, payload?.error?.code);
  }
  return payload;
}

export const api = {
  get(path) { return request(path); },
  post(path, body) { return request(path, { method: 'POST', body: JSON.stringify(body) }); },
  put(path, body) { return request(path, { method: 'PUT', body: JSON.stringify(body) }); },
  delete(path) { return request(path, { method: 'DELETE' }); },
};
