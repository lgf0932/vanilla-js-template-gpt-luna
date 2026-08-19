import { authenticateRequest } from './auth.js';
import { errorResponse, withSecurityHeaders } from './http.js';

const rateBuckets = new Map();
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 120;

function clientKey(request) {
  return request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
}

function isRateLimited(request) {
  const key = clientKey(request);
  const now = Date.now();
  const bucket = rateBuckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  bucket.count += 1;
  return bucket.count > RATE_LIMIT;
}

function addCors(response, request) {
  const headers = new Headers(response.headers);
  const origin = request.headers.get('origin');
  if (origin) {
    headers.set('access-control-allow-origin', origin);
    headers.set('vary', 'Origin');
  }
  headers.set('access-control-allow-headers', 'Content-Type, X-Auth-Password');
  headers.set('access-control-allow-methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export async function runMiddleware(request, context, route, next) {
  if (request.method === 'OPTIONS') {
    return addCors(new Response(null, { status: 204 }), request);
  }
  if (isRateLimited(request)) {
    return addCors(withSecurityHeaders(errorResponse('请求过于频繁，请稍后再试', 429, 'RATE_LIMITED')), request);
  }
  if (!route.publicRoute) {
    const auth = await authenticateRequest(request, context.db, context.env);
    if (!auth.authenticated) {
      return addCors(withSecurityHeaders(errorResponse(auth.configured ? '鉴权令牌无效或已过期' : '请先设置管理密码', 401, 'UNAUTHORIZED')), request);
    }
    context.auth = auth;
  }
  try {
    const response = await next(context);
    const withCache = route.cacheControl && response.status === 200
      ? (() => {
        const headers = new Headers(response.headers);
        headers.set('cache-control', route.cacheControl);
        return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
      })()
      : response;
    return addCors(withSecurityHeaders(withCache), request);
  } catch (error) {
    console.error(error);
    return addCors(withSecurityHeaders(errorResponse('服务器内部错误', 500, 'INTERNAL_ERROR')), request);
  }
}
