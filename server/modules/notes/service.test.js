import test from 'node:test';
import assert from 'node:assert/strict';
import { SqliteAdapter } from '../../db/adapters/sqlite.adapter.js';
import { runMigrations } from '../../db/migrate.js';
import { createNote, deleteNote, listNotes, updateNote } from './service.js';

test('notes service supports CRUD with pagination', async () => {
  const db = new SqliteAdapter(':memory:');
  await runMigrations(db);
  try {
    const created = await createNote(db, { title: 'First note', content: 'Context' });
    assert.equal(created.title, 'First note');
    const page = await listNotes(db, new URLSearchParams({ page: '1', limit: '10' }));
    assert.equal(page.total, 1);
    assert.equal(page.items[0].content, 'Context');
    const updated = await updateNote(db, created.id, { title: 'Renamed', content: 'Next step' });
    assert.equal(updated.title, 'Renamed');
    assert.equal(await deleteNote(db, created.id), true);
    assert.equal((await listNotes(db, new URLSearchParams())).total, 0);
  } finally {
    await db.close();
  }
});
