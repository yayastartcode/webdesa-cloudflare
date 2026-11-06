import { timingSafeEqual } from 'node:crypto';
import { hash } from 'bcryptjs';
import type { Database } from './db/store';
import { user, account, setupLock } from './db/schema';
import type { AppEnv } from './context';

export async function createAdmin(request: Request, db: Database, env: AppEnv) {
  if (!env.SETUP_TOKEN) return Response.json({ error: 'Setup dinonaktifkan' }, { status: 403 });
  const input = request.headers.get('X-Setup-Token') ?? '';
  const [expected, actual] = await Promise.all([env.SETUP_TOKEN, input].map(value => crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))));
  if (!timingSafeEqual(new Uint8Array(expected), new Uint8Array(actual))) return Response.json({ error: 'Token setup tidak valid' }, { status: 403 });
  const reader = request.body?.getReader();
  if (!reader) return Response.json({ error: 'Data tidak valid' }, { status: 400 });
  const parts: Uint8Array[] = []; let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > 4096) { await reader.cancel(); return Response.json({ error: 'Request terlalu besar' }, { status: 413 }); }
    parts.push(value);
  }
  const body = await new Blob(parts as BlobPart[]).text();
  const { email, password, name } = JSON.parse(body);
  if (typeof email !== 'string' || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || typeof password !== 'string' || password.length < 12 || password.length > 128 || typeof name !== 'string' || !name.trim()) return Response.json({ error: 'Nama, email valid, dan password minimal 12 karakter wajib diisi' }, { status: 400 });
  if ((await db.select({ id: user.id }).from(user)).length) return Response.json({ error: 'Admin sudah ada dalam sistem' }, { status: 409 });
  const id = crypto.randomUUID();
  try {
    await db.batch([
      db.insert(setupLock).values({ id: 1 }),
      db.insert(user).values({ id, email: email.toLowerCase().trim(), name: name.trim(), role: 'ADMIN' }),
      db.insert(account).values({ id: crypto.randomUUID(), userId: id, accountId: id, providerId: 'credential', password: await hash(password, 12) }),
    ]);
    return Response.json({ message: 'Admin berhasil dibuat', user: { id, email, name, role: 'ADMIN' } }, { status: 201 });
  } catch {
    return Response.json({ error: 'Admin sudah ada dalam sistem' }, { status: 409 });
  }
}
