import { AUTH_DURATIONS, AUTH_HEADER } from '../../shared/constants.js';
import { getSetting, setSetting } from './settings.js';
import {
  base64UrlDecode,
  base64UrlEncode,
  hashPassword,
  hmacSign,
  verifyPassword,
} from './crypto.js';

const PASSWORD_SETTING = 'settings:auth:password_hash';

function envValue(env, key) {
  return env?.[key] ?? globalThis.process?.env?.[key] ?? '';
}

export async function getPasswordHash(db, env) {
  return envValue(env, 'AUTH_PASSWORD_HASH') || getSetting(db, PASSWORD_SETTING, '');
}

export async function hasPassword(db, env) {
  return Boolean(await getPasswordHash(db, env));
}

export async function configurePassword(db, password) {
  const hash = await hashPassword(password);
  await setSetting(db, PASSWORD_SETTING, hash);
  return hash;
}

export async function issueToken(passwordHash, durationKey = '24h', now = Date.now()) {
  const duration = AUTH_DURATIONS[durationKey] ?? AUTH_DURATIONS['24h'];
  const expiresAt = duration === 0 ? 0 : now + duration;
  const payload = base64UrlEncode(JSON.stringify({ exp: expiresAt, nonce: base64UrlEncode(cryptoRandomString()) }));
  const signature = await hmacSign(passwordHash, payload);
  return `${payload}.${signature}`;
}

function cryptoRandomString() {
  const bytes = new Uint8Array(12);
  globalThis.crypto.getRandomValues(bytes);
  return bytes;
}

export async function verifyToken(token, passwordHash, now = Date.now()) {
  if (!token || !passwordHash) {
    return false;
  }
  const [payload, signature] = token.split('.');
  if (!payload || !signature) {
    return false;
  }
  const expected = await hmacSign(passwordHash, payload);
  if (expected !== signature) {
    return false;
  }
  try {
    const data = JSON.parse(base64UrlDecode(payload));
    return data.exp === 0 || (Number.isFinite(data.exp) && data.exp > now);
  } catch {
    return false;
  }
}

export async function authenticateRequest(request, db, env) {
  const passwordHash = await getPasswordHash(db, env);
  if (!passwordHash) {
    return { authenticated: false, configured: false };
  }
  const token = request.headers.get(AUTH_HEADER);
  return {
    authenticated: await verifyToken(token, passwordHash),
    configured: true,
  };
}

export function isValidPassword(password) {
  return typeof password === 'string' && password.length >= 8 && password.length <= 256;
}

export { PASSWORD_SETTING, verifyPassword };
