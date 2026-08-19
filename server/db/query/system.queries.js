export const SELECT_ONE = 'SELECT 1 AS ok';

export const INSERT_DEMO_NOTE = `
  INSERT INTO notes_data (title, content, created_at, updated_at)
  SELECT ?, ?, datetime('now'), datetime('now')
  WHERE NOT EXISTS (SELECT 1 FROM notes_data)
`;
