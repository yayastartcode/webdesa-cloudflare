import { and, asc, desc, eq } from 'drizzle-orm';
import type { RouteContext } from '../../context';
import { createDb } from '../../db/store';
import { headerSettings, navigationItem } from '../../db/schema';
import { readBody } from '../../validation';
export function createHandlers({ env, session }: RouteContext) {
  const db = createDb(env.DB);
  const latest = () => db.select().from(headerSettings).orderBy(desc(headerSettings.updatedAt), desc(headerSettings.createdAt), asc(headerSettings.id)).limit(1);
  async function read(id: string, admin: boolean) {
    const [row] = await db.select().from(headerSettings).where(eq(headerSettings.id, id));
    const items = await db.select().from(navigationItem).where(admin ? eq(navigationItem.headerSettingsId, id) : and(eq(navigationItem.headerSettingsId, id), eq(navigationItem.isActive, true))).orderBy(asc(navigationItem.order));
    return { ...row, navigationItems: items };
  }
  async function GET(request: Request) {
    const admin = new URL(request.url).searchParams.get('admin') === 'true';
    if (admin && session?.user.role !== 'ADMIN') return Response.json({ error: 'Unauthorized' }, { status: 403 });
    const [row] = await latest();
    return Response.json(row ? await read(row.id, admin) : null);
  }
  async function POST(request: Request) {
    if (session?.user.role !== 'ADMIN') return Response.json({ error: 'Unauthorized' }, { status: 403 });
    const data = await readBody(request, 'header-settings');
    const [old] = await latest(); const id = old?.id ?? crypto.randomUUID();
    const write = db.insert(headerSettings).values({ id, logoUrl: data.logoUrl ?? null }).onConflictDoUpdate({ target: headerSettings.id, set: { logoUrl: data.logoUrl ?? null, updatedAt: new Date() } });
    if (data.navigationItems) {
      const clear = db.delete(navigationItem).where(eq(navigationItem.headerSettingsId, id));
      const items = data.navigationItems.map((item, index) => ({ ...item, id: crypto.randomUUID(), order: item.order ?? index + 1, isActive: item.isActive ?? true, headerSettingsId: id }));
      if (items.length) await db.batch([write, clear, db.insert(navigationItem).values(items)]);
      else await db.batch([write, clear]);
    } else await write;
    return Response.json(await read(id, true));
  }
  return { GET, POST };
}
