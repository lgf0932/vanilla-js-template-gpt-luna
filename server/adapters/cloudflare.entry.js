import { handleRequest } from '../app.js';

export default {
  fetch(request, env) {
    return handleRequest(request, env);
  },
};
