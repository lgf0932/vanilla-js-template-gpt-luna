import { api } from '../../lib/fetcher.js';

export const notesApi = {
  list(params = {}) {
    const query = new URLSearchParams(params);
    return api.get(`/api/notes?${query.toString()}`);
  },
  create(note) { return api.post('/api/notes', note); },
  update(id, note) { return api.put(`/api/notes/${id}`, note); },
  remove(id) { return api.delete(`/api/notes/${id}`); },
};
