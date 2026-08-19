import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleRequest } from '../server/app.js';
import { toWebRequest, writeWebResponse } from '../server/adapters/node.entry.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const staticRoot = root;
const port = Number(process.env.PORT || 8787);
const hostname = '0.0.0.0';
const environment = Object.fromEntries([
  'AUTH_PASSWORD_HASH',
  'ENCRYPTION_KEY',
  'DB_DRIVER',
  'TURSO_DATABASE_URL',
  'TURSO_AUTH_TOKEN',
  'SQLITE_PATH',
].map((key) => [key, process.env[key] ?? '']));

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const relative = decoded === '/' ? 'index.html' : decoded.replace(/^\/+/, '');
  const topLevel = relative.split('/')[0];
  if (!['index.html', 'app', 'public', 'shared'].includes(topLevel) || topLevel.startsWith('.')) return null;
  const candidate = resolve(staticRoot, normalize(relative));
  return candidate === staticRoot || candidate.startsWith(`${staticRoot}/`) ? candidate : null;
}

async function serveStatic(request, response) {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  let filename = safePath(pathname);
  if (!filename) {
    response.statusCode = 403;
    response.end('Forbidden');
    return;
  }
  try {
    const fileStat = await stat(filename);
    if (fileStat.isDirectory()) {
      filename = join(filename, 'index.html');
    }
    const body = await readFile(filename);
    response.statusCode = 200;
    response.setHeader('content-type', contentTypes[extname(filename)] || 'application/octet-stream');
    response.setHeader('cache-control', process.env.NODE_ENV === 'production' ? 'public, max-age=31536000, immutable' : 'no-cache');
    response.end(body);
  } catch {
    if (pathname.includes('.')) {
      response.statusCode = 404;
      response.end('Not Found');
      return;
    }
    try {
      const body = await readFile(join(staticRoot, 'index.html'));
      response.statusCode = 200;
      response.setHeader('content-type', contentTypes['.html']);
      response.end(body);
    } catch {
      response.statusCode = 500;
      response.end('Application shell unavailable');
    }
  }
}

const server = createServer(async (request, response) => {
  try {
    if (request.url?.startsWith('/api/')) {
      await writeWebResponse(await handleRequest(await toWebRequest(request), environment), response);
      return;
    }
    await serveStatic(request, response);
  } catch (error) {
    console.error(error);
    response.statusCode = 500;
    response.end('Internal Server Error');
  }
});

server.listen(port, hostname, () => {
  console.log(`Nova listening on http://${hostname}:${port}`);
});
