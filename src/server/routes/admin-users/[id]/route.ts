import { and, eq, exists, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/sqlite-core';
import { hash } from 'bcryptjs';
import type { RouteContext } from '../../../context';
import { createDb } from '../../../db/store';
import { user, account, session as sessions } from '../../../db/schema';
import { userFields } from '../route';
import { readBody } from '../../../validation';
export function createHandlers({ env, session }: RouteContext) {
  const db = createDb(env.DB);
  async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    if (session?.user.role !== 'ADMIN') return Response.json({ error: 'Unauthorized' }, { status: 403 });
    const { id } = await params;
    const data = await readBody(request, 'admin-users-update');
    const [target] = await db.select(userFields).from(user).where(eq(user.id, id));
    if (!target) return Response.json({ error: 'Akun tidak ditemukan.' }, { status: 404 });
    const actor = alias(user, 'acting_admin');
    const activeActor = exists(db.select({ value: sql`1` }).from(actor).where(and(eq(actor.id, session.user.id), eq(actor.role, 'ADMIN'))));
    if (data.action === 'rename') {
      const [updated] = await db.update(user).set({ name: data.name, updatedAt: new Date() }).where(and(eq(user.id, id), activeActor)).returning(userFields);
      if (!updated) return Response.json({ error: 'Akses admin tidak lagi aktif.' }, { status: 403 });
      return Response.json({ success: true, data: updated });
    }
    if (data.action === 'set-access') {
      if (id === session.user.id) return Response.json({ error: 'Anda tidak dapat menonaktifkan atau mengubah akses akun sendiri.' }, { status: 409 });
      // Atomic actor check + no self-disable preserves at least one active admin,
      // including simultaneous requests by two administrators disabling each other.
      const [updated] = await db.batch([
        db.update(user).set({ role: data.enabled ? 'ADMIN' : 'USER', updatedAt: new Date() }).where(and(eq(user.id, id), activeActor)).returning(userFields),
        db.delete(sessions).where(and(eq(sessions.userId, id), activeActor)),
      ]);
      if (!updated.length) return Response.json({ error: 'Akses admin tidak lagi aktif.' }, { status: 403 });
      return Response.json({ success: true, data: updated[0] });
    }
    const credential = and(eq(account.userId, id), eq(account.providerId, 'credential'), activeActor);
    const [existingCredential] = await db.select({ id: account.id }).from(account).where(credential);
    if (!existingCredential) return Response.json({ error: 'Password akun ini tidak dapat diperbarui.' }, { status: 409 });
    const [updated] = await db.batch([
      db.update(account).set({ password: await hash(data.password, 12), updatedAt: new Date() }).where(credential).returning({ id: account.id }),
      db.delete(sessions).where(and(eq(sessions.userId, id), activeActor)),
    ]);
    if (!updated.length) return Response.json({ error: 'Password akun ini tidak dapat diperbarui.' }, { status: 409 });
    return Response.json({ success: true, message: 'Password diperbarui. Semua sesi akun ini telah diakhiri.', signedOut: id === session.user.id });
  }
  return { PATCH };
}
