import { createHandlers as siteContextHandlers } from './routes/site-context/route';
import { createHandlers as adminUsersHandlers } from './routes/admin-users/route';
import { createHandlers as adminUserHandlers } from './routes/admin-users/[id]/route';
import { createHandlers as reportsHandlers } from './routes/reports/route';
import { createHandlers as homepageSettingsHandlers } from './routes/homepage-settings/route';
import { createHandlers as villageContactHandlers } from './routes/village-contact/route';
import { ZodError } from 'zod';
import { readBody, allBodies } from './validation';
import { createDb, createStore } from './db/store';
import { createAuth } from './auth';
import { createAdmin } from './setup';
import { upload, readUpload } from './uploads';
import type { AppEnv } from './context';
import { createHandlers as route0 } from './routes/admin/check/route';
import { createHandlers as route2 } from './routes/apb-desa/[id]/route';
import { createHandlers as route3 } from './routes/apb-desa/route';
import { createHandlers as route4 } from './routes/employees/[id]/route';
import { createHandlers as route5 } from './routes/employees/route';
import { createHandlers as route6 } from './routes/gallery/[id]/route';
import { createHandlers as route7 } from './routes/gallery/route';
import { createHandlers as route8 } from './routes/header-settings/route';
import { createHandlers as route9 } from './routes/helpdesk/[id]/route';
import { createHandlers as route10 } from './routes/helpdesk/route';
import { createHandlers as route11 } from './routes/hero-slides/[id]/route';
import { createHandlers as route12 } from './routes/hero-slides/route';
import { createHandlers as route13 } from './routes/info/[slug]/route';
import { createHandlers as route14 } from './routes/info/manage/[id]/route';
import { createHandlers as route15 } from './routes/info/route';
import { createHandlers as route16 } from './routes/population-data/route';
import { createHandlers as route17 } from './routes/posts/[id]/route';
import { createHandlers as route18 } from './routes/posts/route';
import { createHandlers as route19 } from './routes/village-head-welcome/route';
import { createHandlers as route20 } from './routes/village-info/route';

type Handler = (request: Request, context: { params: Promise<{ id: string; slug: string }> }) => Promise<Response>;
const routes = [
  { path: '/api/site-context', create: siteContextHandlers },
  { path: '/api/admin-users', create: adminUsersHandlers },
  { path: '/api/admin-users/[id]', create: adminUserHandlers },
  { path: '/api/reports', create: reportsHandlers },
  { path: '/api/homepage-settings', create: homepageSettingsHandlers },
  { path: '/api/village-contact', create: villageContactHandlers },
  { path: '/api/admin/check', create: route0 },
  { path: '/api/apb-desa', create: route3 },
  { path: '/api/employees', create: route5 },
  { path: '/api/gallery', create: route7 },
  { path: '/api/header-settings', create: route8 },
  { path: '/api/helpdesk', create: route10 },
  { path: '/api/hero-slides', create: route12 },
  { path: '/api/info', create: route15 },
  { path: '/api/population-data', create: route16 },
  { path: '/api/posts', create: route18 },
  { path: '/api/village-head-welcome', create: route19 },
  { path: '/api/village-info', create: route20 },
  { path: '/api/apb-desa/[id]', create: route2 },
  { path: '/api/employees/[id]', create: route4 },
  { path: '/api/gallery/[id]', create: route6 },
  { path: '/api/helpdesk/[id]', create: route9 },
  { path: '/api/hero-slides/[id]', create: route11 },
  { path: '/api/info/[slug]', create: route13 },
  { path: '/api/info/manage/[id]', create: route14 },
  { path: '/api/posts/[id]', create: route17 },

];
const json = (error: string, status: number) => Response.json({ error }, { status });
async function dispatchApi(request: Request, env: AppEnv): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/$/, '');
  const mutating = !['GET', 'HEAD', 'OPTIONS'].includes(request.method);
  const origin = request.headers.get('Origin');
  if (mutating && ((origin && origin !== new URL(env.BETTER_AUTH_URL).origin) || request.headers.get('Sec-Fetch-Site') === 'cross-site')) return json('Origin tidak diizinkan', 403);
  try {
    const db = createDb(env.DB);
    const auth = createAuth(db, env);
    if (path.startsWith('/api/auth/')) return await auth.handler(request);
    const session = await auth.api.getSession({ headers: request.headers });
    const isAdmin = session?.user.role === 'ADMIN';
    if (path.startsWith('/api/uploads/')) {
      if (request.method !== 'GET' && request.method !== 'HEAD') return json('Method not allowed', 405);
      return await readUpload(request, env);
    }
    if (path === '/api/uploads') {
      if (request.method !== 'POST') return json('Method not allowed', 405);
      if (!isAdmin) return json('Unauthorized', 403);
      return await upload(request, env);
    }
    if (path === '/api/admin/create') {
      if (request.method !== 'POST') return json('Method not allowed', 405);
      return await createAdmin(request, db, env);
    }
    // Never expose complaints or administration-only reads to public visitors.
    const privateRead = path === '/api/site-context' || path === '/api/reports' || path === '/api/admin-users' || path.startsWith('/api/admin-users/') || path.startsWith('/api/helpdesk') && !(path === '/api/helpdesk' && request.method === 'POST')
      || path.startsWith('/api/info/manage/') || url.searchParams.get('admin') === 'true';
    const publicWrite = path === '/api/helpdesk' && request.method === 'POST';
    if ((privateRead || (mutating && !publicWrite)) && !isAdmin) return json('Unauthorized', 403);
    for (const route of routes) {
      const pattern = '^' + route.path.replace('[id]', '([^/]+)').replace('[slug]', '([^/]+)') + '$';
      const match = path.match(new RegExp(pattern));
      if (!match) continue;
      const handlers: Partial<Record<string, Handler>> = route.create({ store: createStore(db), session, env });
      const handler = handlers[request.method];
      if (!handler) return json('Method not allowed', 405);
      if (mutating && !request.headers.get('Content-Type')?.startsWith('application/json') && request.method !== 'DELETE') return json('Content-Type harus application/json', 415);
      // Bound request parsing even when Content-Length is absent.
      if (mutating && request.body) {
        const reader = request.body.getReader();
        const chunks: Uint8Array[] = []; let length = 0;
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          length += value.length;
          if (length > 1024 * 1024) { await reader.cancel(); return json('Request terlalu besar', 413); }
          chunks.push(value);
        }
        request = new Request(request, { body: new Blob(chunks as BlobPart[]) });
      }
      for (const key of ['page', 'limit']) {
        const value = url.searchParams.get(key);
        if (value !== null && (!/^\d+$/.test(value) || Number(value) < 1 || !Number.isSafeInteger(Number(value)) || (key === 'limit' && Number(value) > 100))) return json('Pagination tidak valid', 400);
      }
      if (mutating && request.method !== 'DELETE') {
        let key = route.path.split('/')[2];
        if (route.path.includes('[id]') && ['info', 'gallery', 'hero-slides', 'helpdesk', 'admin-users'].includes(key)) key += '-update';
        if (key in allBodies) await readBody(request.clone(), key as keyof typeof allBodies);
      }
      const parameter = decodeURIComponent(match[1] ?? '');
      const response = await handler(request, { params: Promise.resolve({ id: parameter, slug: parameter }) });
      response.headers.set('Cache-Control', 'no-store');
      response.headers.set('X-Content-Type-Options', 'nosniff');
      return response;
    }
    return json('Endpoint tidak ditemukan', 404);
  } catch (error) {
    if (error instanceof ZodError || error instanceof SyntaxError) return json('Data tidak valid', 400);
    console.error(JSON.stringify({ event: 'api_error', path, message: error instanceof Error ? error.message : String(error) }));
    return json('Terjadi kesalahan server', 500);
  }
}

export async function handleApi(request: Request, env: AppEnv): Promise<Response> {
  const requestId = crypto.randomUUID();
  const response = await dispatchApi(request, env);
  const headers = new Headers(response.headers);
  headers.set('X-Request-ID', requestId);
  if (!new URL(request.url).pathname.startsWith('/api/uploads/')) headers.set('Cache-Control', 'no-store');
  if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method) && response.status >= 400) {
    console.warn(JSON.stringify({ event: 'write_rejected', requestId, environment: env.APP_ENV, method: request.method, path: new URL(request.url).pathname, status: response.status }));
  }
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
