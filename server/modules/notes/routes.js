import { errorResponse, json, noContent, readJson } from '../../core/http.js';
import { createNote, deleteNote, getNote, listNotes, updateNote } from './service.js';

function noteId(context) {
  const id = Number(context.params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function registerNotesRoutes(router) {
  router.get('/api/notes', async (request, context) => {
    return json(await listNotes(context.db, new URL(request.url).searchParams), 200, {
      'cache-control': 'private, max-age=15, stale-while-revalidate=30',
    });
  });

  router.get('/api/notes/:id', async (_request, context) => {
    const id = noteId(context);
    if (!id) {
      return errorResponse('笔记 ID 无效', 400, 'INVALID_ID');
    }
    const note = await getNote(context.db, id);
    return note ? json({ item: note }) : errorResponse('笔记不存在', 404, 'NOT_FOUND');
  });

  router.post('/api/notes', async (request, context) => {
    const body = await readJson(request);
    if (!body) {
      return errorResponse('请求体必须是 JSON', 400, 'INVALID_JSON');
    }
    const note = await createNote(context.db, body);
    return note?.error ? errorResponse(note.error, 422, 'VALIDATION_ERROR') : json({ item: note }, 201);
  });

  router.put('/api/notes/:id', async (request, context) => {
    const id = noteId(context);
    if (!id) {
      return errorResponse('笔记 ID 无效', 400, 'INVALID_ID');
    }
    const body = await readJson(request);
    if (!body) {
      return errorResponse('请求体必须是 JSON', 400, 'INVALID_JSON');
    }
    const note = await updateNote(context.db, id, body);
    if (note?.error) {
      return errorResponse(note.error, 422, 'VALIDATION_ERROR');
    }
    return note ? json({ item: note }) : errorResponse('笔记不存在', 404, 'NOT_FOUND');
  });

  router.delete('/api/notes/:id', async (_request, context) => {
    const id = noteId(context);
    if (!id) {
      return errorResponse('笔记 ID 无效', 400, 'INVALID_ID');
    }
    return (await deleteNote(context.db, id)) ? noContent() : errorResponse('笔记不存在', 404, 'NOT_FOUND');
  });

  return router;
}
