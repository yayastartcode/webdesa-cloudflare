import { count, desc } from 'drizzle-orm';
import { hash } from 'bcryptjs';
import type { RouteContext } from '../../context';
import { createDb } from '../../db/store';
import { user } from '../../db/schema';
import { readBody } from '../../validation';
export const userFields = { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt, updatedAt: user.updatedAt };
export function createHandlers({ env, session }: RouteContext) {
  const db = createDb(env.DB);
  async function GET(request: Request) {
    if (session?.user.role !== 'ADMIN') return Response.json({ error: 'Unauthorized' }, { status: 403 });
    const params = new URL(request.url).searchParams;
    const page = Number(params.get('page') ?? 1), limit = Number(params.get('limit') ?? 20);
    const [data, [total]] = await db.batch([
      db.select(userFields).from(user).orderBy(desc(user.createdAt), user.id).limit(limit).offset((page - 1) * limit),
      db.select({ value: count() }).from(user),
    ]);
    return Response.json({ success: true, data, pagination: { page, limit, total: total.value, totalPages: Math.ceil(total.value / limit) } });
  }
  async function POST(request: Request) {
    if (session?.user.role !== 'ADMIN') return Response.json({ error: 'Unauthorized' }, { status: 403 });
    const data = await readBody(request, 'admin-users');
    const id = crypto.randomUUID(), now = Date.now(), password = await hash(data.password, 12);
    // The actor check runs inside the same atomic D1 batch as creation, so a
    // revoked administrator cannot create a new administrator from a stale request.
    const results = await env.DB.batch([
      env.DB.prepare(`INSERT INTO users (id,name,email,role,emailVerified,createdAt,updatedAt)
        SELECT ?,?,?,'ADMIN',0,?,? WHERE EXISTS (SELECT 1 FROM users WHERE id=? AND role='ADMIN')
        AND NOT EXISTS (SELECT 1 FROM users WHERE lower(email)=?)`).bind(id, data.name, data.email, now, now, session.user.id, data.email),
      env.DB.prepare(`INSERT INTO accounts (id,accountId,providerId,userId,password,createdAt,updatedAt)
        SELECT ?,?,'credential',?,?,?,? WHERE EXISTS (SELECT 1 FROM users WHERE id=?)`).bind(crypto.randomUUID(), id, id, password, now, now, id),
    ]);
    if (!results[0].meta.changes) {
      const duplicate = await env.DB.prepare('SELECT id FROM users WHERE lower(email)=?').bind(data.email).first();
      return Response.json({ error: duplicate ? 'Email sudah digunakan.' : 'Akses admin tidak lagi aktif.' }, { status: duplicate ? 409 : 403 });
    }
    return Response.json({ success: true, data: { id, name: data.name, email: data.email, role: 'ADMIN', createdAt: new Date(now), updatedAt: new Date(now) } }, { status: 201 });
  }
  return { GET, POST };
}
