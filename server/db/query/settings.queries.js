export const CREATE_SETTINGS_TABLE = `
  CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`;

export const GET_SETTING = `
  SELECT key, value, updated_at
  FROM app_settings
  WHERE key = ?
  LIMIT 1
`;

export const LIST_SETTINGS = `
  SELECT key, value, updated_at
  FROM app_settings
  ORDER BY key ASC
`;

export const UPSERT_SETTING = `
  INSERT INTO app_settings (key, value, updated_at)
  VALUES (?, ?, ?)
  ON CONFLICT(key) DO UPDATE SET
    value = excluded.value,
    updated_at = excluded.updated_at
`;
