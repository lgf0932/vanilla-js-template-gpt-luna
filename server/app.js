import { AUTH_DURATIONS } from '../shared/constants.js';
import { configurePassword, getPasswordHash, hasPassword, isValidPassword, issueToken, verifyPassword, verifyToken } from './core/auth.js';
import { createRequestContext } from './core/context.js';
import { runMiddleware } from './core/middleware.js';
import { errorResponse, json, readJson } from './core/http.js';
import { Router } from './core/router.js';
import { resolveAdapter } from './db/resolver.js';
import { runMigrations } from './db/migrate.js';
import { registerDashboardRoutes } from './modules/dashboard/routes.js';
import { registerNotesRoutes } from './modules/notes/routes.js';
import { registerSettingsRoutes } from './modules/settings/routes.js';

const router = new Router();
let databasePromise;
let databaseEnvironment;

async function databaseFor(env) {
  if (!databasePromise || databaseEnvironment !== env) {
    databaseEnvironment = env;
    databasePromise = resolveAdapter(env).then(async ({ adapter, driver }) => {
      await runMigrations(adapter);
      return { adapter, driver };
    });
  }
  return databasePromise;
}

router.get('/api/health', async (_request, context) => {
  const configured = await hasPassword(context.db, context.env);
  return json({ ok: true, driver: context.driver, configured });
}, { publicRoute: true, cacheControl: 'no-store' });

router.get('/api/auth/status', async (_request, context) => {
  return json({ configured: await hasPassword(context.db, context.env) }, 200, { 'cache-control': 'no-store' });
}, { publicRoute: true, cacheControl: 'no-store' });

router.post('/api/auth/setup', async (request, context) => {
  if (await hasPassword(context.db, context.env)) {
    return errorResponse('管理密码已经设置', 409, 'ALREADY_CONFIGURED');
  }
  const body = await readJson(request);
  if (!body || !isValidPassword(body.password)) {
    return errorResponse('密码长度需要为 8 到 256 个字符', 422, 'VALIDATION_ERROR');
  }
  await configurePassword(context.db, body.password);
  return json({ configured: true }, 201);
}, { publicRoute: true });

router.post('/api/auth/login', async (request, context) => {
  const body = await readJson(request);
  if (!body || typeof body.password !== 'string') {
    return errorResponse('请输入管理密码', 422, 'VALIDATION_ERROR');
  }
  const passwordHash = await getPasswordHash(context.db, context.env);
  if (!passwordHash || !(await verifyPassword(body.password, passwordHash))) {
    return errorResponse('密码不正确', 401, 'INVALID_CREDENTIALS');
  }
  const duration = Object.hasOwn(AUTH_DURATIONS, body.duration) ? body.duration : '24h';
  const token = await issueToken(passwordHash, duration);
  return json({ token, duration });
}, { publicRoute: true });

router.get('/api/auth/session', async (request, context) => {
  const passwordHash = await getPasswordHash(context.db, context.env);
  const token = request.headers.get('X-Auth-Password');
  return json({ authenticated: await verifyTokenSafe(token, passwordHash) }, 200, { 'cache-control': 'no-store' });
}, { publicRoute: true });

async function verifyTokenSafe(token, passwordHash) {
  if (!token || !passwordHash) {
    return false;
  }
  return verifyToken(token, passwordHash);
}

registerDashboardRoutes(router);
registerNotesRoutes(router);
registerSettingsRoutes(router);

export async function handleRequest(request, env = {}) {
  let db;
  try {
    const database = await databaseFor(env);
    db = database.adapter;
  } catch (error) {
    console.error(error);
    return errorResponse('数据库初始化失败，请检查运行时配置', 503, 'DATABASE_UNAVAILABLE');
  }
  const route = router.match(request);
  if (!route) {
    return errorResponse('请求路径不存在', 404, 'NOT_FOUND');
  }
  const context = createRequestContext({ db, env, route, driver: (await databaseFor(env)).driver });
  return runMiddleware(request, context, route, (nextContext) => route.handler(request, nextContext));
}

export function getRouter() {
  return router;
}

export async function closeDatabase() {
  if (databasePromise) {
    const database = await databasePromise;
    await database.adapter.close();
    databasePromise = null;
    databaseEnvironment = null;
  }
}

