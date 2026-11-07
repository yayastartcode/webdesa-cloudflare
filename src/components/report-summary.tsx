import { Link } from 'react-router-dom';
import type { ReportData } from '@/lib/reports';
export function ReportSummary({ data }: { data: ReportData }) {
  const items = [
    { label: 'Admin Aktif', value: data.users.active, note: `${data.users.total} akun terdaftar`, href: '/dashboard/users' },
    { label: 'Total Berita', value: data.posts.total, note: `${data.posts.published} terbit · ${data.posts.drafts} draf`, href: '/dashboard/posts' },
    { label: 'Pengaduan Belum Selesai', value: data.complaints.pending + data.complaints.in_progress, note: `${data.complaints.total} pengaduan masuk`, href: '/dashboard/helpdesk' },
    { label: 'Foto Galeri Aktif', value: data.gallery.active, note: `${data.gallery.total} item galeri`, href: '/dashboard/gallery' },
  ];
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{items.map(item => <Link key={item.label} to={item.href} className="rounded-xl border bg-white p-5 shadow-sm hover:border-orange-300 focus-visible:outline-2 focus-visible:outline-orange-500 dark:bg-gray-800"><h2 className="text-sm text-gray-500">{item.label}</h2><p className="my-2 text-3xl font-bold">{item.value.toLocaleString('id-ID')}</p><p className="text-xs text-gray-500">{item.note}</p></Link>)}</div>;
}
export function RecentActivity({ data }: { data: ReportData }) {
  return data.recent.length ? <ul className="divide-y dark:divide-gray-700">{data.recent.map((item, index) => <li key={`${item.href}-${index}`} className="py-3 first:pt-0 last:pb-0"><Link to={item.href} className="block break-words text-sm font-medium hover:text-orange-600">{item.label}</Link><p className="mt-1 text-xs text-gray-500">{new Date(item.updatedAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB</p></li>)}</ul> : <p className="text-sm text-gray-500">Belum ada pembaruan konten.</p>;
}
