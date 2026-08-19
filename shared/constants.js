export const AUTH_HEADER = 'X-Auth-Password';

export const AUTH_DURATIONS = Object.freeze({
  '4h': 4 * 60 * 60 * 1000,
  '8h': 8 * 60 * 60 * 1000,
  '12h': 12 * 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '14d': 14 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
  '90d': 90 * 24 * 60 * 60 * 1000,
  session: 0,
});

export const SETTINGS_KEYS = Object.freeze([
  'settings:display',
  'settings:auth:session_default',
  'settings:profile',
]);

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export const MODULE_IDS = Object.freeze(['dashboard', 'notes', 'settings']);
