"use client";

import { useState, useEffect } from "react";
import { useParams } from "@/lib/navigation";
import Image from "@/components/image";
import Link from "@/lib/router-link";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  order: number;
}

interface HeaderSettings {
  id: string;
  logoUrl: string | null;
  navigationItems: NavigationItem[];
}

interface Info {
  id: string;
  title: string;
  slug: string;
  pdfUrl: string;
  imageUrl?: string | null;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function InfoPage() {
  const params = useParams();
  const [info, setInfo] = useState<Info | null>(null);
  const [headerSettings, setHeaderSettings] = useState<HeaderSettings | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch info data
      const infoResponse = await fetch(`/api/info/${params.slug}`);
      if (infoResponse.ok) {
        const infoData = await infoResponse.json();
        if (infoData.success) {
          setInfo(infoData.data);
        } else {
          setError("Halaman tidak ditemukan");
        }
      } else {
        setError("Halaman tidak ditemukan");
      }

      // Fetch header settings
      const headerResponse = await fetch("/api/header-settings");
      if (headerResponse.ok) {
        const headerData = await headerResponse.json();
        setHeaderSettings(headerData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Gagal memuat halaman");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.slug) {
      fetchData();
    }
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat halaman...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !info) {
    return (
      <div className="min-h-screen">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Halaman Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-8">{error || "Halaman yang Anda cari tidak tersedia."}</p>
          <Link href="/">
            <Button className="bg-red-600 hover:bg-red-700">
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Red Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              {headerSettings?.logoUrl ? (
                <Image
                  src={headerSettings.logoUrl}
                  alt="Logo Desasa"
                  width={40}
                  height={40}
                  className="w-10 h-10 object-contain"
                />
              ) : (
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-bold text-lg">🇮🇩</span>
                </div>
              )}
              <span className="text-xl font-bold text-white">
                Desasa
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {headerSettings?.navigationItems && headerSettings.navigationItems.length > 0 ? (
                headerSettings.navigationItems
                  .sort((a, b) => a.order - b.order)
                  .map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="font-medium text-white hover:text-orange-300 transition-colors duration-300"
                    >
                      {item.label}
                    </Link>
                  ))
              ) : (
                // Default navigation items
                <>
                  <Link href="/" className="font-medium text-white hover:text-orange-300 transition-colors duration-300">
                    Beranda
                  </Link>
                  <Link href="/about" className="font-medium text-white hover:text-orange-300 transition-colors duration-300">
                    Tentang
                  </Link>
                  <Link href="/services" className="font-medium text-white hover:text-orange-300 transition-colors duration-300">
                    Layanan
                  </Link>
                  <Link href="/news" className="font-medium text-white hover:text-orange-300 transition-colors duration-300">
                    Berita
                  </Link>
                  <Link href="/galeri" className="font-medium text-white hover:text-orange-300 transition-colors duration-300">
                    Galeri
                  </Link>
                  <Link href="/contact" className="font-medium text-white hover:text-orange-300 transition-colors duration-300">
                    Kontak
                  </Link>
                </>
              )}
              <Link href="/login">
                <Button className="bg-white text-red-600 hover:bg-gray-100 transition-all duration-300">
                  Masuk
                </Button>
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-red-600 border-t border-red-500 shadow-lg">
            <div className="px-4 py-2 space-y-1">
              {headerSettings?.navigationItems && headerSettings.navigationItems.length > 0 ? (
                headerSettings.navigationItems
                  .sort((a, b) => a.order - b.order)
                  .map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="block px-3 py-2 text-white hover:bg-red-700 rounded-md transition-colors duration-300"
                    >
                      {item.label}
                    </Link>
                  ))
              ) : (
                // Default navigation items
                <>
                  <Link href="/" className="block px-3 py-2 text-white hover:bg-red-700 rounded-md transition-colors duration-300">
                    Beranda
                  </Link>
                  <Link href="/about" className="block px-3 py-2 text-white hover:bg-red-700 rounded-md transition-colors duration-300">
                    Tentang
                  </Link>
                  <Link href="/services" className="block px-3 py-2 text-white hover:bg-red-700 rounded-md transition-colors duration-300">
                    Layanan
                  </Link>
                  <Link href="/news" className="block px-3 py-2 text-white hover:bg-red-700 rounded-md transition-colors duration-300">
                    Berita
                  </Link>
                  <Link href="/galeri" className="block px-3 py-2 text-white hover:bg-red-700 rounded-md transition-colors duration-300">
                    Galeri
                  </Link>
                  <Link href="/contact" className="block px-3 py-2 text-white hover:bg-red-700 rounded-md transition-colors duration-300">
                    Kontak
                  </Link>
                </>
              )}
              <Link href="/login" className="block px-3 py-2">
                <Button className="w-full bg-white text-red-600 hover:bg-gray-100 transition-all duration-300">
                  Masuk
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
      
      {/* Page Header with top padding for fixed header */}
      <div className="bg-white shadow-sm pt-16">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">{info.title}</h1>
          {info.description && <p className="mt-3 max-w-3xl whitespace-pre-line text-gray-600">{info.description}</p>}
          <p className="text-gray-600 mt-2">
            Dipublikasikan pada {new Date(info.createdAt).toLocaleDateString('id-ID', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="container mx-auto px-4 py-6">
        {info.imageUrl ? (
          <div className="overflow-hidden rounded-lg border bg-white p-2 shadow-sm sm:p-4">
            <img src={info.imageUrl} alt={info.title} className="mx-auto h-auto max-w-full rounded object-contain" />
          </div>
        ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Dokumen PDF</h2>
              <a
                href={info.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Unduh PDF
              </a>
            </div>
          </div>
          
          {/* PDF Embed */}
          <div className="relative">
            <iframe
              src={`${info.pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
              className="w-full h-[800px] border-0"
              title={info.title}
              loading="lazy"
            />
          </div>
          
          {/* Fallback for browsers that don't support iframe PDF viewing */}
          <noscript>
            <div className="p-6 text-center">
              <p className="text-gray-600 mb-4">
                Browser Anda tidak mendukung tampilan PDF. Silakan unduh file untuk melihatnya.
              </p>
              <a
                href={info.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Unduh PDF
              </a>
            </div>
          </noscript>
        </div>
        
        )}

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}