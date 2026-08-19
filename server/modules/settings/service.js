import { asOneOf, isPlainObject } from '../../../shared/validation.js';
import { decryptSecret, encryptSecret } from '../../core/crypto.js';
import { getSetting, parseJsonSetting, setSetting } from '../../core/settings.js';

const DISPLAY_DEFAULT = { theme: 'system', language: 'zh-CN' };
const SESSION_DEFAULT = '24h';
const PROFILE_KEY = 'settings:profile';

function envValue(env, key) {
  return env?.[key] ?? globalThis.process?.env?.[key] ?? '';
}

export async function getSettings(db, env) {
  const display = parseJsonSetting(await getSetting(db, 'settings:display', ''), DISPLAY_DEFAULT);
  const sessionDefault = await getSetting(db, 'settings:auth:session_default', SESSION_DEFAULT);
  let profile = {};
  const encryptedProfile = await getSetting(db, PROFILE_KEY, '');
  if (encryptedProfile && envValue(env, 'ENCRYPTION_KEY')) {
    try { profile = JSON.parse(await decryptSecret(encryptedProfile, envValue(env, 'ENCRYPTION_KEY'))); } catch { profile = {}; }
  }
  return { display, sessionDefault, profile };
}

export async function updateSettings(db, env, input) {
  if (!isPlainObject(input)) return { error: '设置格式无效' };
  const current = await getSettings(db, env);
  if (input.display !== undefined) {
    const display = isPlainObject(input.display) ? {
      theme: asOneOf(input.display.theme, ['system', 'light', 'dark'], current.display.theme),
      language: asOneOf(input.display.language, ['zh-CN', 'zh-TW', 'en'], current.display.language),
    } : current.display;
    await setSetting(db, 'settings:display', JSON.stringify(display));
  }
  if (input.sessionDefault !== undefined) {
    const sessionDefault = asOneOf(input.sessionDefault, ['4h', '8h', '12h', '24h', '7d', '14d', '30d', '90d', 'session'], current.sessionDefault);
    await setSetting(db, 'settings:auth:session_default', sessionDefault);
  }
  if (input.profile !== undefined) {
    if (!isPlainObject(input.profile) || !envValue(env, 'ENCRYPTION_KEY')) return { error: '个人资料需要配置 ENCRYPTION_KEY 后才能保存' };
    const profile = Object.fromEntries(Object.entries(input.profile).filter(([key]) => ['name', 'email', 'phone', 'address'].includes(key)));
    await setSetting(db, PROFILE_KEY, await encryptSecret(JSON.stringify(profile), envValue(env, 'ENCRYPTION_KEY')));
  }
  return getSettings(db, env);
}
