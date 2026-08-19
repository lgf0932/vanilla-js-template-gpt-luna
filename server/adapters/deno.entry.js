import { handleRequest } from '../app.js';

const env = Object.fromEntries(
  ['AUTH_PASSWORD_HASH', 'ENCRYPTION_KEY', 'DB_DRIVER', 'TURSO_DATABASE_URL', 'TURSO_AUTH_TOKEN', 'SQLITE_PATH']
    .map((key) => [key, Deno.env.get(key) ?? '']),
);
const projectRoot = new URL('../../', import.meta.url);
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

function staticFile(pathname) {
  const decoded = decodeURIComponent(pathname);
  const relative = decoded === '/' ? 'index.html' : decoded.replace(/^\/+/, '');
  if (relative.split('/').includes('..')) return null;
  const file = new URL(relative, projectRoot);
  const normalizedRelative = file.pathname.slice(projectRoot.pathname.length).replace(/^\/+/, '');
  const topLevel = normalizedRelative.split('/')[0];
  if (!['index.html', 'app', 'public', 'shared'].includes(topLevel) || topLevel.startsWith('.')) return null;
  return file.pathname.startsWith(projectRoot.pathname) ? file : null;
}

async function readStatic(file) {
  const body = await Deno.readFile(file);
  const pathname = file.pathname || String(file);
  const extension = pathname.slice(pathname.lastIndexOf('.'));
  return new Response(body, {
    headers: {
      'content-type': contentTypes[extension] || 'application/octet-stream',
      'cache-control': 'no-cache',
    },
  });
}

async function serveStatic(request) {
  const pathname = new URL(request.url).pathname;
  const decoded = decodeURIComponent(pathname);
  const file = staticFile(pathname);
  const isSpaPath = !decoded.includes('.') && !decoded.split('/').includes('..');
  if (!file && !isSpaPath) return new Response('Forbidden', { status: 403 });
  try {
    return await readStatic(file || new URL('index.html', projectRoot));
  } catch {
    if (!isSpaPath) return new Response('Not Found', { status: 404 });
    try {
      return await readStatic(new URL('index.html', projectRoot));
    } catch {
      return new Response('Application shell unavailable', { status: 500 });
    }
  }
}

export function handler(request) {
  const pathname = new URL(request.url).pathname;
  return (pathname === '/api' || pathname.startsWith('/api/'))
    ? handleRequest(request, env)
    : serveStatic(request);
}

if (import.meta.main) {
  Deno.serve(handler);
}

export default handler;
