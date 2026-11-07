import { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSession } from './lib/auth-client';
import { DashboardLayout } from './components/dashboard-layout';
import '@fontsource/geist/latin.css';
import '@fontsource/geist-mono/latin.css';
import './app/globals.css';
const HomepageSettingsPage = lazy(() => import('./app/dashboard/homepage-settings/page'));
const ContactPage = lazy(() => import('./app/contact/page'));
const ContactSettingsPage = lazy(() => import('./app/dashboard/village-contact/page'));
const Page0 = lazy(() => import('./app/berita/[id]/page'));
const Page1 = lazy(() => import('./app/berita/page'));
const Page2 = lazy(() => import('./app/dashboard/apb-desa/page'));
const Page3 = lazy(() => import('./app/dashboard/employees/page'));
const Page4 = lazy(() => import('./app/dashboard/gallery/page'));
const Page5 = lazy(() => import('./app/dashboard/header-settings/page'));
const Page6 = lazy(() => import('./app/dashboard/helpdesk/page'));
const Page7 = lazy(() => import('./app/dashboard/hero-slides/page'));
const Page8 = lazy(() => import('./app/dashboard/info/page'));
const Page9 = lazy(() => import('./app/dashboard/page'));
const Page10 = lazy(() => import('./app/dashboard/population-data/page'));
const Page11 = lazy(() => import('./app/dashboard/posts/page'));
const Page12 = lazy(() => import('./app/dashboard/village-head-welcome/page'));
const Page13 = lazy(() => import('./app/dashboard/village-info/page'));
const Page14 = lazy(() => import('./app/galeri/page'));
const Page15 = lazy(() => import('./app/info/[slug]/page'));
const Page16 = lazy(() => import('./app/login/page'));
const Page17 = lazy(() => import('./app/page'));
const Page18 = lazy(() => import('./app/setup/page'));

function Admin({ children }: { children: React.ReactNode }) {
  const { data, status } = useSession();
  if (status === 'loading') return <p className="p-8">Memuat dashboard...</p>;
  if (!data) return <Navigate to="/login" replace />;
  if (data.user.role !== 'ADMIN') return <Navigate to="/" replace />;
  return children;
}
createRoot(document.getElementById('root')!).render(
  <BrowserRouter><Suspense fallback={<p className="p-8">Memuat...</p>}><Routes>
    <Route path="/contact" element={<ContactPage />} />
    <Route path="/kontak" element={<Navigate to="/contact" replace />} />
    <Route path="/berita/:id" element={<Page0 />} />
    <Route path="/berita" element={<Page1 />} />
    <Route path="/dashboard" element={<Admin><DashboardLayout /></Admin>}>
      <Route path="homepage-settings" element={<HomepageSettingsPage />} />
      <Route path="village-contact" element={<ContactSettingsPage />} />
      <Route path="apb-desa" element={<Page2 />} />
      <Route path="employees" element={<Page3 />} />
      <Route path="gallery" element={<Page4 />} />
      <Route path="header-settings" element={<Page5 />} />
      <Route path="helpdesk" element={<Page6 />} />
      <Route path="hero-slides" element={<Page7 />} />
      <Route path="info" element={<Page8 />} />
      <Route index element={<Page9 />} />
      <Route path="population-data" element={<Page10 />} />
      <Route path="posts" element={<Page11 />} />
      <Route path="village-head-welcome" element={<Page12 />} />
      <Route path="village-info" element={<Page13 />} />
    </Route>
    <Route path="/galeri" element={<Page14 />} />
    <Route path="/info/:slug" element={<Page15 />} />
    <Route path="/login" element={<Page16 />} />
    <Route path="/" element={<Page17 />} />
    <Route path="/setup" element={<Page18 />} />
    <Route path="*" element={<main className="p-8"><h1>Halaman tidak ditemukan</h1><a href="/">Kembali ke beranda</a></main>} />
  </Routes></Suspense></BrowserRouter>
);
