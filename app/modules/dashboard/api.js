import { api } from '../../lib/fetcher.js';

export const dashboardApi = {
  summary() { return api.get('/api/dashboard'); },
};
