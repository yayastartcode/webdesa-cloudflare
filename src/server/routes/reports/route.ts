import { count, desc, eq, sql } from 'drizzle-orm';
import type { RouteContext } from '../../context';
import { createDb } from '../../db/store';
import { user, post, employee, gallery, info, helpdesk, populationData, apbDesa } from '../../db/schema';
export function createHandlers({ env, session }: RouteContext) {
  const db = createDb(env.DB);
  const totalActive = (column: typeof post.published | typeof gallery.isActive | typeof user.role) => sql<number>`coalesce(sum(case when ${column} in (1, 'ADMIN') then 1 else 0 end),0)`.mapWith(Number);
  async function GET() {
    if (session?.user.role !== 'ADMIN') return Response.json({ error: 'Unauthorized' }, { status: 403 });
    const [users, posts, employees, galleries, infos, complaints, population, budget, recentPosts, recentGallery, recentComplaints, recentBudget] = await db.batch([
      db.select({ total: count(), active: totalActive(user.role) }).from(user),
      db.select({ total: count(), published: totalActive(post.published) }).from(post),
      db.select({ total: count() }).from(employee),
      db.select({ total: count(), active: totalActive(gallery.isActive) }).from(gallery),
      db.select({ total: count(), active: sql<number>`coalesce(sum(case when ${info.isActive}=1 then 1 else 0 end),0)`.mapWith(Number) }).from(info),
      db.select({ status: helpdesk.status, total: count() }).from(helpdesk).groupBy(helpdesk.status),
      db.select({ totalPopulation: populationData.totalPopulation, malePopulation: populationData.malePopulation, femalePopulation: populationData.femalePopulation, households: populationData.households, temporaryResidents: populationData.temporaryResidents, populationMutations: populationData.populationMutations, updatedAt: populationData.updatedAt }).from(populationData).orderBy(desc(populationData.updatedAt)).limit(1),
      db.select({ year: apbDesa.year, pendapatanDesa: apbDesa.pendapatanDesa, belanjaDesa: apbDesa.belanjaDesa, updatedAt: apbDesa.updatedAt }).from(apbDesa).where(eq(apbDesa.isActive, true)).orderBy(desc(sql`${apbDesa.year}=${new Date().getFullYear()}`), desc(apbDesa.year)).limit(1),
      db.select({ title: post.title, updatedAt: post.updatedAt }).from(post).orderBy(desc(post.updatedAt)).limit(3),
      db.select({ title: gallery.title, updatedAt: gallery.updatedAt }).from(gallery).orderBy(desc(gallery.updatedAt)).limit(3),
      db.select({ updatedAt: helpdesk.updatedAt }).from(helpdesk).orderBy(desc(helpdesk.updatedAt)).limit(3),
      db.select({ year: apbDesa.year, updatedAt: apbDesa.updatedAt }).from(apbDesa).orderBy(desc(apbDesa.updatedAt)).limit(3),
    ]);
    const statusCounts = { total: 0, pending: 0, in_progress: 0, resolved: 0, closed: 0 };
    for (const row of complaints) {
      statusCounts.total += row.total;
      if (row.status === 'pending' || row.status === 'in_progress' || row.status === 'resolved' || row.status === 'closed') statusCounts[row.status] = row.total;
    }
    const recent = [
      ...recentPosts.map(row => ({ label: `Berita: ${row.title}`, updatedAt: row.updatedAt, href: '/dashboard/posts' })),
      ...recentGallery.map(row => ({ label: `Galeri: ${row.title}`, updatedAt: row.updatedAt, href: '/dashboard/gallery' })),
      ...recentComplaints.map(row => ({ label: 'Pengaduan warga diperbarui', updatedAt: row.updatedAt, href: '/dashboard/helpdesk' })),
      ...recentBudget.map(row => ({ label: `APB Desa ${row.year}`, updatedAt: row.updatedAt, href: '/dashboard/apb-desa' })),
    ].sort((a,b) => b.updatedAt.getTime() - a.updatedAt.getTime()).slice(0,5);
    return Response.json({ success: true, data: { generatedAt: new Date(), users: users[0], posts: { ...posts[0], drafts: posts[0].total - posts[0].published }, employees: employees[0].total, gallery: galleries[0], info: infos[0], complaints: statusCounts, population: population[0] ?? null, budget: budget[0] ?? null, recent } });
  }
  return { GET };
}
