import { api } from '../../lib/fetcher.js';

export const settingsApi = {
  get() { return api.get('/api/settings'); },
  update(settings) { return api.put('/api/settings', settings); },
  health() { return api.get('/api/health'); },
};
