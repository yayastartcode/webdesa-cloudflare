import { Suspense, useEffect, useState, type ComponentProps } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/header';
import VillageInfoSection from '@/components/village-info';
import VillageHeadWelcomeSection from '@/components/village-head-welcome';
import EmployeeSlider from '@/components/employee-slider';
import { Button } from '@/components/ui/button';

type HeaderData = ComponentProps<typeof Header>;
type VillageInfo = ComponentProps<typeof VillageInfoSection>['villageInfo'];
type Welcome = ComponentProps<typeof VillageHeadWelcomeSection>['welcome'];
type Employees = ComponentProps<typeof EmployeeSlider>['employees'];

export default function AboutPage() {
  const [header, setHeader] = useState<HeaderData | null>(null);
  const [info, setInfo] = useState<VillageInfo>(null);
  const [welcome, setWelcome] = useState<Welcome>();
  const [employees, setEmployees] = useState<Employees>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState<string[]>([]);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setFailed([]);
    const load = async <T,>(path: string, label: string, apply: (value: T) => void) => {
      try {
        const response = await fetch(path, { cache: 'no-store', signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const value = await response.json();
        if (!controller.signal.aborted) apply(value);
      } catch {
        if (!controller.signal.aborted) setFailed(current => [...current, label]);
      }
    };
    void Promise.all([
      load<HeaderData | null>('/api/header-settings', 'navigasi', setHeader),
      load<VillageInfo>('/api/village-info', 'visi, misi dan tujuan', setInfo),
      load<{ success: boolean; data?: Welcome }>('/api/village-head-welcome', 'sambutan', value => {
        if (!value.success) throw new Error('Invalid welcome response');
        setWelcome(value.data);
      }),
      load<{ success: boolean; data?: Employees }>('/api/employees', 'pegawai desa', value => {
        if (!value.success) throw new Error('Invalid employee response');
        setEmployees(value.data ?? []);
      }),
    ]).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [attempt]);
  const hasInfo = info && [info.visi, info.misi, info.tujuan].some(value => value.trim());
  const hasWelcome = !!welcome?.content.trim();
  return <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
    <Header logoUrl={header?.logoUrl} navigationItems={header?.navigationItems} />
    <main>
      <div className="bg-red-600 px-4 pb-12 pt-40 text-center text-white">
        <p className="mb-3 text-sm text-red-100"><Link className="underline underline-offset-4" to="/">Beranda</Link> / Tentang</p>
        <h1 className="text-3xl font-bold sm:text-4xl">Tentang Desa Lomaer</h1>
        <p className="mx-auto mt-4 max-w-2xl text-red-100">Mengenal arah pembangunan desa, sambutan kepala desa, serta pegawai yang melayani masyarakat Desa Lomaer.</p>
        <nav aria-label="Bagian tentang desa" className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
          {hasInfo && <a className="rounded-full border border-white/50 px-4 py-2 hover:bg-red-700" href="#visi-misi">Visi, Misi & Tujuan</a>}
          {hasWelcome && <a className="rounded-full border border-white/50 px-4 py-2 hover:bg-red-700" href="#sambutan">Sambutan Kepala Desa</a>}
          {employees.length > 0 && <a className="rounded-full border border-white/50 px-4 py-2 hover:bg-red-700" href="#pegawai">Pegawai Desa</a>}
        </nav>
      </div>
      {loading && <p role="status" className="p-6 text-center text-gray-600">Memuat profil desa…</p>}
      {failed.length > 0 && <div role="alert" className="mx-auto mt-6 max-w-3xl rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-950">
        <p>Sebagian informasi belum dapat dimuat: {failed.join(', ')}.</p>
        <Button className="mt-3" variant="outline" disabled={loading} onClick={() => setAttempt(current => current + 1)}>Coba lagi</Button>
      </div>}
      {hasInfo && <div id="visi-misi" className="scroll-mt-32"><VillageInfoSection villageInfo={info} /></div>}
      {hasWelcome && <section id="sambutan" aria-label="Sambutan Kepala Desa" className="scroll-mt-32"><Suspense fallback={<p className="p-6 text-center">Memuat sambutan…</p>}><VillageHeadWelcomeSection welcome={welcome} logoUrl={header?.logoUrl} /></Suspense></section>}
      {employees.length > 0 && <div id="pegawai" className="scroll-mt-32"><EmployeeSlider employees={employees} /></div>}
    </main>
    <footer className="border-t bg-white px-4 py-8 text-center text-sm text-gray-600 dark:bg-gray-900 dark:text-gray-300">
      <p>Pemerintah Desa Lomaer</p>
      <div className="mt-3 flex justify-center gap-6"><Link className="underline underline-offset-4" to="/">Kembali ke Beranda</Link><Link className="underline underline-offset-4" to="/contact">Kontak & Lokasi</Link></div>
    </footer>
  </div>;
}
