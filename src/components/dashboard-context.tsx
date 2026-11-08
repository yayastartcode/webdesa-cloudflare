import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { homeSectionOptions, type HomeSections } from '@/lib/home-sections';
type SiteContext = { environment: string; canonicalOrigin: string; primaryOrigin: string };
export function DashboardContext() {
  const { pathname } = useLocation();
  const [site, setSite] = useState<SiteContext | null>(null);
  const [sections, setSections] = useState<HomeSections | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/site-context', { cache: 'no-store', signal: controller.signal }).then(async response => { if (response.ok) setSite((await response.json()).data); }).catch(() => {});
    return () => controller.abort();
  }, []);
  useEffect(() => {
    const controller = new AbortController(); setSections(null);
    fetch('/api/homepage-settings', { cache: 'no-store', signal: controller.signal }).then(async response => { if (response.ok) setSections((await response.json()).data.sections); }).catch(() => {});
    return () => controller.abort();
  }, [pathname]);
  const section = homeSectionOptions.find(item => item.href === pathname);
  return <div className="space-y-2 px-4 pt-3 print:hidden sm:px-6">
    {site && <div role="note" className={`rounded-lg border px-3 py-2 text-sm ${site.environment === 'production' ? 'border-green-200 bg-green-50 text-green-900' : 'border-amber-300 bg-amber-50 text-amber-950'}`}>
      {site.environment === 'production' ? <>Situs utama: <strong>{new URL(site.canonicalOrigin).host}</strong>. Perubahan disimpan untuk website ini.</> : site.environment === 'staging' ? <>Mode latihan/staging. Perubahan di sini tidak tampil di situs utama. <a className="font-semibold underline" href={`${site.primaryOrigin}/dashboard`}>Buka dashboard desalomaer.com</a></> : <>Lingkungan pengembangan lokal.</>}
    </div>}
    {section && sections?.[section.key] === false && <div role="note" className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950">Section <strong>{section.label}</strong> disembunyikan di beranda. Data tetap dapat disimpan. <Link className="font-semibold underline" to="/dashboard/homepage-settings">Aktifkan melalui Tampilan Beranda</Link>.</div>}
  </div>;
}
