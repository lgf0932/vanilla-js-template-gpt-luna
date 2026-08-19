export const DASHBOARD_NOTE_COUNT = `
  SELECT COUNT(*) AS count
  FROM notes_data
`;

export const DASHBOARD_RECENT_NOTES = `
  SELECT id, title, content, updated_at
  FROM notes_data
  ORDER BY updated_at DESC, id DESC
  LIMIT ?
`;
