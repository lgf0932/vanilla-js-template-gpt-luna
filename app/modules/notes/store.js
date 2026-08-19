import { createStore } from '../../core/store.js';

export const notesStore = createStore({
  items: [],
  total: 0,
  loading: false,
  error: '',
  editing: null,
});
