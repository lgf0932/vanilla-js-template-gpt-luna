import { errorResponse, json, readJson } from '../../core/http.js';
import { getSettings, updateSettings } from './service.js';

export function registerSettingsRoutes(router) {
  router.get('/api/settings', async (_request, context) => json(await getSettings(context.db, context.env), 200, {
    'cache-control': 'private, max-age=30, stale-while-revalidate=60',
  }));

  router.put('/api/settings', async (request, context) => {
    const body = await readJson(request);
    if (!body) {
      return errorResponse('请求体必须是 JSON', 400, 'INVALID_JSON');
    }
    const result = await updateSettings(context.db, context.env, body);
    return result.error ? errorResponse(result.error, 422, 'VALIDATION_ERROR') : json(result);
  });
  return router;
}
