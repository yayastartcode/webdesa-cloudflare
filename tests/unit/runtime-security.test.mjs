import { beforeAll, afterAll, expect, it } from 'vitest';
import { hash } from 'bcryptjs';
import { startRuntime } from '../runtime.mjs';
import { convertSnapshot } from '../../scripts/convert-postgres.mjs';
import { legacyTables } from '../../scripts/legacy-tables.mjs';
let runtime;
beforeAll(async () => { runtime = await startRuntime(8799, 'production'); });
afterAll(async () => { await runtime?.dispose(); });
it('rejects development CAPTCHA bypass when the server is configured for production', async () => {
  const response = await runtime.dispatchFetch('http://localhost:8799/api/helpdesk', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:8799' },
    body: JSON.stringify({ nama: 'Warga', nomorWhatsapp: '08123456789', kategoriPengaduan: 'umum', pesanPengaduan: 'Test', recaptchaToken: 'development-mode' }),
  });
  expect(response.status).toBe(400);
  expect((await response.json()).error).toBe('Verifikasi reCAPTCHA gagal');
});
it('imports a PostgreSQL snapshot into D1 and signs in with its original bcrypt password', async () => {
  const snapshot = Object.fromEntries(Object.keys(legacyTables).map(table => [table, []]));
  const date = '2025-07-22T00:00:00.000Z';
  snapshot.users = [{ id: 'original-admin-id', name: "O'Connor", email: 'admin@example.test', emailVerified: null, image: null, password: await hash('admin123', 12), role: 'ADMIN', createdAt: date, updatedAt: date }];
  snapshot.apb_desa = [{ id: 'original-budget', year: 2025, pendapatanDesa: '9999999999999.99', belanjaDesa: '123456789.12', isActive: true, createdAt: date, updatedAt: date }];
  const db = await runtime.getD1Database('DB');
  for (const statement of convertSnapshot(snapshot).split('\n').filter(line => !line.startsWith('--') && line.trim())) await db.prepare(statement).run();
  const budget = await db.prepare('SELECT pendapatanDesa FROM apb_desa').first();
  expect(budget.pendapatanDesa).toBe(999999999999999);
  const login = await runtime.dispatchFetch('http://localhost:8799/api/auth/sign-in/email', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:8799', 'CF-Connecting-IP': '127.0.0.1' },
    body: JSON.stringify({ email: 'admin@example.test', password: 'admin123' }),
  });
  expect(login.status).toBe(200);
  const result = await login.json(); expect(result.user.id).toBe('original-admin-id'); expect(result.user.role).toBe('ADMIN');
});
