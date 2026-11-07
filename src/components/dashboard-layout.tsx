import { useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  ArrowLeft, ChevronRight, ExternalLink, FileText, Image, Images, LayoutDashboard,
  LogOut, MapPin, Megaphone, Menu, MessageSquare, Navigation, Newspaper, Target, Users, Wallet, X,
} from 'lucide-react';
import { signOut, useSession } from '@/lib/auth-client';

const sections = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/dashboard/posts', label: 'Berita Desa', icon: Newspaper },
  { path: '/dashboard/header-settings', label: 'Header & Navigasi', icon: Navigation },
  { path: '/dashboard/hero-slides', label: 'Hero Slider', icon: Images },
  { path: '/dashboard/village-info', label: 'Visi, Misi & Tujuan', icon: Target },
  { path: '/dashboard/village-head-welcome', label: 'Sambutan Kepala Desa', icon: Megaphone },
  { path: '/dashboard/employees', label: 'Pegawai Desa', icon: Users },
  { path: '/dashboard/population-data', label: 'Data Penduduk', icon: Users },
  { path: '/dashboard/helpdesk', label: 'Pengaduan Warga', icon: MessageSquare },
  { path: '/dashboard/info', label: 'Halaman Info', icon: FileText },
  { path: '/dashboard/gallery', label: 'Galeri Kegiatan', icon: Image },
  { path: '/dashboard/village-contact', label: 'Peta & Kontak', icon: MapPin },
  { path: '/dashboard/apb-desa', label: 'APB Desa', icon: Wallet },
];

export function DashboardLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const { pathname } = useLocation();
  const { data: session } = useSession();
  const current = sections.find(section => section.path === pathname);
  const category = pathname !== '/dashboard';
  const links = () => sections.map(({ path, label, icon: Icon }) => (
    <NavLink key={path} to={path} end onClick={() => setMenuOpen(false)}
      className={({ isActive }) => `flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-orange-500 ${isActive
        ? 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'}`}>
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />{label}
    </NavLink>
  ));

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white">
      <a href="#dashboard-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:p-3 focus:text-gray-900">Lewati ke konten</a>
      <header className="sticky top-0 z-40 border-b bg-white dark:bg-gray-900" onKeyDown={event => {
        if (event.key === 'Escape' && menuOpen) { setMenuOpen(false); menuButton.current?.focus(); }
      }}>
        <div className="flex h-16 items-center justify-between gap-2 px-3 sm:px-6">
          <div className="flex items-center gap-2">
            <button ref={menuButton} type="button" className="flex h-11 w-11 items-center justify-center rounded-lg hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-orange-500 dark:hover:bg-gray-800 lg:hidden"
              aria-label={menuOpen ? 'Tutup menu admin' : 'Buka menu admin'} aria-expanded={menuOpen} aria-controls="admin-mobile-menu"
              onClick={() => setMenuOpen(open => !open)}>
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="whitespace-nowrap text-lg font-bold text-orange-600 dark:text-orange-400">Desasa Admin</Link>
          </div>
          <div className="flex items-center gap-1 sm:gap-4">
            <span className="hidden text-sm text-gray-500 dark:text-gray-400 xl:inline">{session?.user.name || session?.user.email}</span>
            <Link to="/" target="_blank" rel="noopener noreferrer" aria-label="Lihat website" title="Lihat website"
              className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-800">
              <ExternalLink className="h-4 w-4" aria-hidden="true" /><span className="hidden sm:inline">Lihat website</span>
            </Link>
            <button type="button" aria-label="Keluar" title="Keluar" onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex min-h-11 items-center gap-2 rounded-lg border px-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-800">
              <LogOut className="h-4 w-4" aria-hidden="true" /><span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav id="admin-mobile-menu" aria-label="Navigasi admin seluler" className="max-h-[70dvh] overflow-y-auto border-t p-3 lg:hidden">
            {links()}
          </nav>
        )}
      </header>
      <div className="grid lg:grid-cols-[15rem_minmax(0,1fr)]">
        <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] overflow-y-auto border-r bg-white p-4 dark:bg-gray-900 lg:block">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Kelola desa</p>
          <nav aria-label="Navigasi admin" className="space-y-1">{links()}</nav>
        </aside>
        <main id="dashboard-content" tabIndex={-1} className="min-w-0 focus:outline-none">
          {category && (
            <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-white px-4 py-3 dark:bg-gray-900 sm:px-6">
              <Link to="/dashboard" className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-gray-600 hover:text-orange-600 dark:text-gray-300 dark:hover:text-orange-400">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />Kembali ke Dashboard
              </Link>
              <nav aria-label="Lokasi halaman" className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                <Link to="/dashboard" className="hover:underline">Dashboard</Link>
                <ChevronRight className="h-3 w-3" aria-hidden="true" /><span aria-current="page">{current?.label}</span>
              </nav>
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
