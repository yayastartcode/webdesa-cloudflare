import { eq } from 'drizzle-orm';
import type { RouteContext } from '../../context';
import { createDb } from '../../db/store';
import { homepageSettings } from '../../db/schema';
import { defaultHomeSections } from '../../../lib/home-sections';
import { readBody } from '../../validation';

export function createHandlers({ env, session }: RouteContext) {
  const db = createDb(env.DB);
  async function GET() {
    const [row] = await db.select().from(homepageSettings).where(eq(homepageSettings.id, 'homepage'));
    return Response.json({ success: true, data: { sections: { ...defaultHomeSections, ...row?.sections } } });
  }
  async function PUT(request: Request) {
    if (session?.user.role !== 'ADMIN') return Response.json({ error: 'Unauthorized' }, { status: 403 });
    const data = await readBody(request, 'homepage-settings');
    await db.insert(homepageSettings).values({ id: 'homepage', sections: data.sections })
      .onConflictDoUpdate({ target: homepageSettings.id, set: { sections: data.sections, updatedAt: new Date() } });
    return Response.json({ success: true, data, message: 'Tampilan beranda berhasil disimpan' });
  }
  return { GET, PUT };
}
