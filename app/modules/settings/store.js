import { createStore } from '../../core/store.js';

export const settingsStore = createStore({
  display: { theme: 'system', language: 'zh-CN' },
  sessionDefault: '24h',
  profile: {},
  loading: true,
  error: '',
});
