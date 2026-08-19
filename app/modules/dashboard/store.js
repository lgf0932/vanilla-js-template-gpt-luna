import { createStore } from '../../core/store.js';

export const dashboardStore = createStore({ loading: true, error: '', summary: null });
