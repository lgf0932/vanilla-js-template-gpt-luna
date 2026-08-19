import {
  GET_SETTING,
  LIST_SETTINGS,
  UPSERT_SETTING,
} from '../db/query/settings.queries.js';

export async function getSetting(db, key, fallback = null) {
  const rows = await db.query(GET_SETTING, [key]);
  return rows[0]?.value ?? fallback;
}

export async function setSetting(db, key, value) {
  await db.execute(UPSERT_SETTING, [key, value, new Date().toISOString()]);
  return value;
}

export async function getSettingsSnapshot(db) {
  const rows = await db.query(LIST_SETTINGS);
  return new Map(rows.map((row) => [row.key, row.value]));
}

export function parseJsonSetting(value, fallback = null) {
  if (typeof value !== 'string') {
    return fallback;
  }
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}
