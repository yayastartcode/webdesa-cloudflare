import { beforeAll, afterAll, expect, it } from 'vitest';
import { startRuntime, setupToken } from '../runtime.mjs';
let runtime;
const origin = 'http://localhost:8797';
const password = 'test-admin-password-2026';
function call(path, cookie = '', method = 'GET', data) {
  return runtime.dispatchFetch(origin + path, { method, headers: { Origin: origin, Cookie: cookie, ...(data ? { 'Content-Type': 'application/json' } : {}) }, ...(data ? { body: JSON.stringify(data) } : {}) });
}
async function login(email, secret = password) {
  const response = await call('/api/auth/sign-in/email', '', 'POST', { email, password: secret });
  expect(response.status).toBe(200);
  return response.headers.getSetCookie().map(value => value.split(';')[0]).join('; ');
}
beforeAll(async () => { runtime = await startRuntime(8797); });
afterAll(async () => { await runtime?.dispose(); });
it('keeps an active administrator during concurrent cross-disabling and revokes reset sessions', async () => {
  const setup = await runtime.dispatchFetch(origin + '/api/admin/create', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', 'X-Setup-Token': setupToken }, body: JSON.stringify({ name: 'First Admin', email: 'first@example.test', password }) });
  expect(setup.status).toBe(201);
  const first = (await setup.json()).user;
  const firstCookie = await login(first.email);
  const secondResponse = await call('/api/admin-users', firstCookie, 'POST', { name: 'Second Admin', email: 'second@example.test', password });
  expect(secondResponse.status).toBe(201);
  const second = (await secondResponse.json()).data;
  const secondCookie = await login(second.email);
  const responses = await Promise.all([
    call(`/api/admin-users/${second.id}`, firstCookie, 'PATCH', { action: 'set-access', enabled: false }),
    call(`/api/admin-users/${first.id}`, secondCookie, 'PATCH', { action: 'set-access', enabled: false }),
  ]);
  expect(responses.map(response => response.status).sort()).toEqual([200, 403]);
  const db = await runtime.getD1Database('DB');
  const active = await db.prepare("SELECT id,email FROM users WHERE role='ADMIN'").all();
  expect(active.results).toHaveLength(1);
  const survivor = active.results[0];
  const survivorCookie = survivor.id === first.id ? firstCookie : secondCookie;
  const revokedCookie = survivor.id === first.id ? secondCookie : firstCookie;
  expect((await call('/api/reports', revokedCookie)).status).toBe(403);
  expect((await call('/api/reports', survivorCookie)).status).toBe(200);
  expect((await call(`/api/admin-users/${survivor.id}`, survivorCookie, 'PATCH', { action: 'set-access', enabled: false })).status).toBe(409);
  const reset = await call(`/api/admin-users/${survivor.id}`, survivorCookie, 'PATCH', { action: 'reset-password', password: 'replacement-admin-password-2026' });
  expect(reset.status).toBe(200); expect((await reset.json()).signedOut).toBe(true);
  expect((await call('/api/reports', survivorCookie)).status).toBe(403);
  expect((await call('/api/reports', await login(survivor.email, 'replacement-admin-password-2026'))).status).toBe(200);
  expect((await db.prepare('SELECT count(*) AS total FROM users').first()).total).toBe(2);
});
