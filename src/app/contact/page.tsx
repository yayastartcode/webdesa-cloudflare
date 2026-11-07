import { useEffect, useState } from 'react';
import Header from '@/components/header';
import VillageMaps from '@/components/village-maps';

type HeaderData = { logoUrl?: string; navigationItems: { id: string; label: string; href: string; order: number }[] };
export default function ContactPage() {
  const [header, setHeader] = useState<HeaderData | null>(null);
  useEffect(() => { fetch('/api/header-settings').then(async response => { if (response.ok) setHeader(await response.json()); }).catch(() => {}); }, []);
  return <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
    <Header logoUrl={header?.logoUrl} navigationItems={header?.navigationItems} />
    <div className="bg-red-600 px-4 pb-10 pt-36 text-center text-white"><h1 className="text-3xl font-bold">Kontak & Lokasi</h1><p className="mt-3 text-red-100">Informasi layanan dan lokasi kantor desa.</p></div>
    <VillageMaps />
  </div>;
}
