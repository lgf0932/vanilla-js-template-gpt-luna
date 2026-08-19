import { handleRequest } from '../app.js';

export const config = { runtime: 'edge' };

export default function vercelHandler(request) {
  return handleRequest(request, globalThis.process?.env ?? {});
}
