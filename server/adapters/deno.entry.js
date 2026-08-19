import { handleRequest } from '../app.js';

const env = Object.fromEntries(
  ['AUTH_PASSWORD_HASH', 'ENCRYPTION_KEY', 'DB_DRIVER', 'TURSO_DATABASE_URL', 'TURSO_AUTH_TOKEN', 'SQLITE_PATH']
    .map((key) => [key, Deno.env.get(key) ?? '']),
);

if (import.meta.main) {
  Deno.serve((request) => handleRequest(request, env));
}

export default (request) => handleRequest(request, env);
