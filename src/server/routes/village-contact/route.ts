import { eq } from 'drizzle-orm';
import type { RouteContext } from '../../context';
import { createDb } from '../../db/store';
import { villageContact } from '../../db/schema';
import { defaultVillageContact } from '../../../lib/village-contact';
import { readBody } from '../../validation';

export function createHandlers({ env, session }: RouteContext) {
  const db = createDb(env.DB);
  async function GET() {
    const [row] = await db.select().from(villageContact).where(eq(villageContact.id, 'village'));
    return Response.json({ success: true, data: row ?? defaultVillageContact });
  }
  async function PUT(request: Request) {
    if (session?.user.role !== 'ADMIN') return Response.json({ error: 'Unauthorized' }, { status: 403 });
    const data = await readBody(request, 'village-contact');
    const [row] = await db.insert(villageContact).values({ id: 'village', ...data })
      .onConflictDoUpdate({ target: villageContact.id, set: { ...data, updatedAt: new Date() } }).returning();
    return Response.json({ success: true, data: row, message: 'Peta dan kontak berhasil disimpan' });
  }
  return { GET, PUT };
}
