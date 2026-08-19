import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../../shared/constants.js';
import { asNonEmptyString, asOptionalString, asPositiveInteger } from '../../../shared/validation.js';
import {
  COUNT_NOTES,
  DELETE_NOTE,
  GET_NOTE,
  INSERT_NOTE,
  LIST_NOTES,
  UPDATE_NOTE,
} from '../../db/query/notes.queries.js';

function normalizeNoteInput(input) {
  const title = asNonEmptyString(input?.title, 200);
  const content = asOptionalString(input?.content, 20000);
  if (!title || content === null) {
    return null;
  }
  return { title, content };
}

export async function listNotes(db, searchParams) {
  const page = asPositiveInteger(searchParams.get('page'), 1);
  const limit = asPositiveInteger(searchParams.get('limit'), DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
  const offset = (page - 1) * limit;
  const [rows, countRows] = await Promise.all([
    db.query(LIST_NOTES, [limit, offset]),
    db.query(COUNT_NOTES),
  ]);
  return { items: rows, page, limit, total: Number(countRows[0]?.count ?? 0) };
}

export async function getNote(db, id) {
  const rows = await db.query(GET_NOTE, [id]);
  return rows[0] ?? null;
}

export async function createNote(db, input) {
  const note = normalizeNoteInput(input);
  if (!note) {
    return { error: '标题不能为空，内容不能超过限制' };
  }
  const result = await db.execute(INSERT_NOTE, [note.title, note.content]);
  return getNote(db, Number(result.lastInsertRowid));
}

export async function updateNote(db, id, input) {
  const note = normalizeNoteInput(input);
  if (!note) {
    return { error: '标题不能为空，内容不能超过限制' };
  }
  const result = await db.execute(UPDATE_NOTE, [note.title, note.content, id]);
  if (!result.changes) {
    return null;
  }
  return getNote(db, id);
}

export async function deleteNote(db, id) {
  const result = await db.execute(DELETE_NOTE, [id]);
  return result.changes > 0;
}
