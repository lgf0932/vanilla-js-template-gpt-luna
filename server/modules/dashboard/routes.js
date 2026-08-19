import { json } from '../../core/http.js';
import { getDashboardSummary } from './service.js';

export function registerDashboardRoutes(router) {
  router.get('/api/dashboard', async (_request, context) => {
    return json(await getDashboardSummary(context.db), 200, {
      'cache-control': 'private, max-age=15, stale-while-revalidate=30',
    });
  });
  return router;
}
