export const LIST_NOTES = `
  SELECT id, title, content, created_at, updated_at
  FROM notes_data
  ORDER BY updated_at DESC, id DESC
  LIMIT ? OFFSET ?
`;

export const COUNT_NOTES = `
  SELECT COUNT(*) AS count
  FROM notes_data
`;

export const GET_NOTE = `
  SELECT id, title, content, created_at, updated_at
  FROM notes_data
  WHERE id = ?
  LIMIT 1
`;

export const INSERT_NOTE = `
  INSERT INTO notes_data (title, content, created_at, updated_at)
  VALUES (?, ?, datetime('now'), datetime('now'))
`;

export const UPDATE_NOTE = `
  UPDATE notes_data
  SET title = ?, content = ?, updated_at = datetime('now')
  WHERE id = ?
`;

export const DELETE_NOTE = `
  DELETE FROM notes_data
  WHERE id = ?
`;

export const LIST_RECENT_NOTES = `
  SELECT id, title, content, created_at, updated_at
  FROM notes_data
  ORDER BY updated_at DESC, id DESC
  LIMIT ?
`;
