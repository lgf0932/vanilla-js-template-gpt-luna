import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleRequest, initializeDatabase } from '../server/app.js';
import { toWebRequest, writeWebResponse } from '../server/adapters/node.entry.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const staticRoot = root;
const hostname = '0.0.0.0';
const defaultPort = 8787;

function parsePort(args, environmentPort) {
  let value = environmentPort || defaultPort;
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === '--port' || argument === '-p') {
      const nextValue = args[index + 1];
      if (!nextValue || nextValue.startsWith('-')) {
        throw new Error('缺少端口值。用法：node scripts/dev-server.js [--port <1-65535>]');
      }
      value = nextValue;
      index += 1;
      continue;
    }
    if (argument.startsWith('--port=') || argument.startsWith('-p=')) {
      value = argument.slice(argument.indexOf('=') + 1);
      continue;
    }
    throw new Error(`未知参数：${argument}。用法：node scripts/dev-server.js [--port <1-65535>]`);
  }

  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`端口无效：${value}。端口必须是 1 到 65535 之间的整数。`);
  }
  return port;
}

let port;
try {
  port = parsePort(process.argv.slice(2), process.env.PORT);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
const environment = Object.fromEntries([
  'AUTH_PASSWORD_HASH',
  'ENCRYPTION_KEY',
  'DB_DRIVER',
  'TURSO_DATABASE_URL',
  'TURSO_AUTH_TOKEN',
  'SQLITE_PATH',
].map((key) => [key, process.env[key] ?? '']));

try {
  await initializeDatabase(environment);
} catch (error) {
  console.error(`数据库初始化失败：${error.message}`);
  process.exit(1);
}

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

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`端口 ${port} 已被占用，请改用 --port 指定其它端口。`);
  } else {
    console.error(error);
  }
  process.exitCode = 1;
});

server.listen(port, hostname, () => {
  console.log(`Nova listening on http://${hostname}:${port}`);
});
