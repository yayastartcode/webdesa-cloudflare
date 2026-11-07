"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "@/lib/navigation";
import type { Session } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function DashboardPage() {
  const { data: session, status } = useSession() as { data: Session | null; status: string; };
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/login");
      return;
    }
    
    if (!session.user || session.user.role !== "ADMIN") {
      router.push("/");
      return;
    }
    
    setIsLoading(false);
  }, [session, status, router]);


  if (isLoading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session || !session.user || session.user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Main Content */}
      <section className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
          <Alert className="mb-6">
            <AlertDescription>
              Selamat datang di dashboard admin Desa Lomaer! Anda berhasil masuk sebagai administrator.
            </AlertDescription>
          </Alert>

          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-black dark:text-white">Total Pengguna</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-gray-500 dark:text-gray-400"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-black dark:text-white">1</div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Admin aktif
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-black dark:text-white">Total Postingan</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-gray-500 dark:text-gray-400"
                >
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <path d="M2 10h20" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-black dark:text-white">0</div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Belum ada postingan
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-black dark:text-white">Upload Gambar</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-gray-500 dark:text-gray-400"
                >
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                  <circle cx="12" cy="13" r="3" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-black dark:text-white">0</div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Gambar terupload
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-black dark:text-white">Status Sistem</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-gray-500 dark:text-gray-400"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Online</div>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Sistem berjalan normal
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Aksi Cepat</CardTitle>
                <CardDescription>
                  Kelola konten dan pengguna dengan mudah
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => window.location.href = '/dashboard/posts'}
                >
                  Kelola Berita Desa
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                  onClick={() => window.location.href = '/dashboard/header-settings'}
                >
                  Kelola Header & Navigasi
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                  onClick={() => window.location.href = '/dashboard/hero-slides'}
                >
                  Kelola Hero Slider
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                  onClick={() => window.location.href = '/dashboard/village-info'}
                >
                  Kelola Visi, Misi & Tujuan
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                  onClick={() => window.location.href = '/dashboard/village-head-welcome'}
                >
                  Kelola Sambutan Kepala Desa
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                  onClick={() => window.location.href = '/dashboard/employees'}
                >
                  Kelola Pegawai Desa
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                  onClick={() => window.location.href = '/dashboard/population-data'}
                >
                  Kelola Data Kependudukan
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                  onClick={() => window.location.href = '/dashboard/helpdesk'}
                >
                  Kelola Helpdesk
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                  onClick={() => window.location.href = '/dashboard/info'}
                >
                  Kelola Halaman Info
                </Button>
                <Button variant="outline" className="w-full text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                  onClick={() => window.location.href = '/dashboard/village-contact'}>Kelola Peta & Kontak</Button>
                <Button className="w-full" variant="outline" onClick={() => window.location.href = '/dashboard/homepage-settings'}>Atur Tampilan Beranda</Button>
                <Button 
                  variant="outline" 
                  className="w-full text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                  onClick={() => window.location.href = '/dashboard/gallery'}
                >
                  Kelola Galeri Kegiatan
                </Button>
                <Button variant="outline" className="w-full text-gray-900 dark:text-white border-gray-300 dark:border-gray-600">
                  Kelola Pengguna
                </Button>
                <Button variant="outline" className="w-full text-gray-900 dark:text-white border-gray-300 dark:border-gray-600">
                  Lihat Laporan
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Aktivitas Terbaru</CardTitle>
                <CardDescription>
                  Pantau aktivitas sistem terkini
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Sistem dimulai</p>
                      <p className="text-xs text-gray-500">Baru saja</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Admin login</p>
                      <p className="text-xs text-gray-500">Baru saja</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">Belum ada aktivitas lain</p>
                      <p className="text-xs text-gray-400">-</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}