import { createServer } from 'node:http';
import { handleRequest } from '../app.js';

async function bodyBuffer(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export async function toWebRequest(request) {
  const protocol = request.headers['x-forwarded-proto'] || 'http';
  const host = request.headers.host || 'localhost';
  const body = ['GET', 'HEAD'].includes(request.method) ? undefined : await bodyBuffer(request);
  return new Request(`${protocol}://${host}${request.url}`, {
    method: request.method,
    headers: request.headers,
    body,
  });
}

export async function writeWebResponse(response, nodeResponse) {
  nodeResponse.statusCode = response.status;
  response.headers.forEach((value, key) => nodeResponse.setHeader(key, value));
  if (response.body) {
    const buffer = Buffer.from(await response.arrayBuffer());
    nodeResponse.end(buffer);
  } else {
    nodeResponse.end();
  }
}

export function createApiServer(env = {}) {
  return createServer(async (request, response) => {
    try {
      const webRequest = await toWebRequest(request);
      await writeWebResponse(await handleRequest(webRequest, env), response);
    } catch (error) {
      console.error(error);
      response.statusCode = 500;
      response.end('Internal Server Error');
    }
  });
}

export function startNodeServer({ env = {}, port = 8787, hostname = '0.0.0.0' } = {}) {
  const server = createApiServer(env);
  server.listen(port, hostname);
  return server;
}

export default { fetch: handleRequest };
