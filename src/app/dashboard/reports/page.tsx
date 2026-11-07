import { Link } from 'react-router-dom';
import { RefreshCw, Printer } from 'lucide-react';
import { useReports } from '@/lib/use-reports';
import { ReportSummary, RecentActivity } from '@/components/report-summary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
const number = (value: number) => value.toLocaleString('id-ID');
const money = (value: number) => value.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
export default function ReportsPage() {
  const { data, loading, error, refresh } = useReports();
  return <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-2xl font-bold">Laporan Ringkas</h1><p className="mt-2 text-sm text-gray-500">Ringkasan data tersimpan pada website Desa Lomaer.</p>{data && <p className="mt-1 text-xs text-gray-500">Diperbarui {new Date(data.generatedAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB</p>}</div><div className="flex gap-2 print:hidden"><Button variant="outline" disabled={loading} onClick={() => void refresh()}><RefreshCw className="h-4 w-4" />Perbarui</Button><Button disabled={!data || loading} onClick={() => window.print()}><Printer className="h-4 w-4" />Cetak Laporan</Button></div></div>
    {error && <Alert role="alert" variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
    {loading && !data && <p role="status">Memuat laporan…</p>}
    {data && <><ReportSummary data={data} />
      <div className="grid items-start gap-6 md:grid-cols-2">
        <Card><CardHeader><CardTitle>Pengaduan Warga</CardTitle></CardHeader><CardContent><dl className="space-y-3">{[['Menunggu', data.complaints.pending], ['Diproses', data.complaints.in_progress], ['Selesai', data.complaints.resolved], ['Ditutup', data.complaints.closed], ['Total pengaduan', data.complaints.total]].map(([label,value]) => <div key={label} className="flex justify-between gap-4 border-b pb-2"><dt>{label}</dt><dd className="font-semibold">{number(Number(value))}</dd></div>)}</dl><Link to="/dashboard/helpdesk" className="mt-4 inline-block text-sm text-blue-600 hover:underline">Kelola pengaduan</Link></CardContent></Card>
        <Card><CardHeader><CardTitle>Konten Website</CardTitle></CardHeader><CardContent><dl className="space-y-3">{[['Berita terbit', data.posts.published], ['Draf berita', data.posts.drafts], ['Pegawai terdaftar', data.employees], ['Galeri aktif', data.gallery.active], ['Halaman info aktif', data.info.active]].map(([label,value]) => <div key={label} className="flex justify-between gap-4 border-b pb-2"><dt>{label}</dt><dd className="font-semibold">{number(Number(value))}</dd></div>)}</dl></CardContent></Card>
        <Card><CardHeader><CardTitle>Data Penduduk</CardTitle></CardHeader><CardContent>{data.population ? <dl className="space-y-3">{[['Total penduduk', data.population.totalPopulation], ['Laki-laki', data.population.malePopulation], ['Perempuan', data.population.femalePopulation], ['Kepala keluarga', data.population.households], ['Penduduk sementara', data.population.temporaryResidents], ['Mutasi penduduk', data.population.populationMutations]].map(([label,value]) => <div key={label} className="flex justify-between gap-4 border-b pb-2"><dt>{label}</dt><dd className="font-semibold">{number(Number(value))}</dd></div>)}</dl> : <p className="text-sm text-gray-500">Data penduduk belum diisi.</p>}<Link to="/dashboard/population-data" className="mt-4 inline-block text-sm text-blue-600 hover:underline">Kelola data penduduk</Link></CardContent></Card>
        <Card><CardHeader><CardTitle>APB Desa{data.budget ? ` ${data.budget.year}` : ''}</CardTitle></CardHeader><CardContent>{data.budget ? <dl className="space-y-4"><div><dt className="text-sm text-gray-500">Pendapatan desa</dt><dd className="mt-1 break-words text-xl font-semibold">{money(data.budget.pendapatanDesa)}</dd></div><div><dt className="text-sm text-gray-500">Belanja desa</dt><dd className="mt-1 break-words text-xl font-semibold">{money(data.budget.belanjaDesa)}</dd></div><p className="text-xs text-gray-500">Data aktif tahun berjalan, atau tahun aktif terbaru jika belum tersedia.</p></dl> : <p className="text-sm text-gray-500">Belum ada APB Desa yang aktif.</p>}<Link to="/dashboard/apb-desa" className="mt-4 inline-block text-sm text-blue-600 hover:underline">Kelola APB Desa</Link></CardContent></Card>
      </div><Card><CardHeader><CardTitle>Aktivitas Terbaru</CardTitle></CardHeader><CardContent><RecentActivity data={data} /></CardContent></Card>
    </>}
  </div>;
}
