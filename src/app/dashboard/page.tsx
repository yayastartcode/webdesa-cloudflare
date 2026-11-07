import { Link } from 'react-router-dom';
import { useSession } from '@/lib/auth-client';
import { useReports } from '@/lib/use-reports';
import { ReportSummary, RecentActivity } from '@/components/report-summary';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
const actions = [
  ['Kelola Pengguna', '/dashboard/users'], ['Lihat Laporan', '/dashboard/reports'],
  ['Kelola Berita Desa', '/dashboard/posts'], ['Atur Tampilan Beranda', '/dashboard/homepage-settings'],
  ['Kelola Header & Navigasi', '/dashboard/header-settings'], ['Kelola Hero Slider', '/dashboard/hero-slides'],
  ['Kelola Visi, Misi & Tujuan', '/dashboard/village-info'], ['Kelola Sambutan Kepala Desa', '/dashboard/village-head-welcome'],
  ['Kelola Pegawai Desa', '/dashboard/employees'], ['Kelola Data Kependudukan', '/dashboard/population-data'],
  ['Kelola Helpdesk', '/dashboard/helpdesk'], ['Kelola Halaman Info', '/dashboard/info'],
  ['Kelola Peta & Kontak', '/dashboard/village-contact'], ['Kelola Galeri Kegiatan', '/dashboard/gallery'],
  ['Kelola APB Desa', '/dashboard/apb-desa'],
];
export default function DashboardPage() {
  const { data: session } = useSession();
  const { data, loading, error, refresh } = useReports();
  return <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
    <div><h1 className="text-2xl font-bold">Dashboard</h1><p className="mt-2 text-sm text-gray-500">Selamat datang, {session?.user.name || 'Administrator'}. Kelola website Desa Lomaer dari sini.</p></div>
    {error && <Alert role="alert" variant="destructive"><AlertDescription>{error}</AlertDescription><Button className="mt-3" variant="outline" disabled={loading} onClick={() => void refresh()}>Coba lagi</Button></Alert>}
    {loading && !data && <p role="status" className="text-sm text-gray-500">Memuat ringkasan dashboard…</p>}
    {data && <><ReportSummary data={data} /><p className="text-xs text-gray-500">Data diperbarui {new Date(data.generatedAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB</p></>}
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <Card><CardHeader><CardTitle>Aksi Cepat</CardTitle><CardDescription>Kelola akun, konten, dan tampilan website.</CardDescription></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2">{actions.map(([label, href]) => <Button key={href} variant="outline" asChild className="h-auto min-h-11 justify-start whitespace-normal text-left"><Link to={href}>{label}</Link></Button>)}</CardContent></Card>
      <Card><CardHeader><CardTitle>Aktivitas Terbaru</CardTitle><CardDescription>Pembaruan konten yang tersimpan di website.</CardDescription></CardHeader><CardContent>{data ? <RecentActivity data={data} /> : <p className="text-sm text-gray-500">{loading ? 'Memuat aktivitas…' : 'Aktivitas belum dapat dimuat.'}</p>}</CardContent></Card>
    </div>
  </div>;
}
