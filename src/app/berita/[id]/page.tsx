"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "@/lib/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, ArrowLeft, Share2, Menu, X } from "lucide-react";
import Link from "@/lib/router-link";

interface Post {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    name: string;
    email: string;
  };
}

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

export default function BeritaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [headerSettings, setHeaderSettings] = useState<HeaderSettings | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch post detail
      const postResponse = await fetch(`/api/posts/${params.id}`);
      if (postResponse.ok) {
        const postData = await postResponse.json();
        if (postData.success && postData.data.published) {
          setPost(postData.data);
        } else {
          setError("Berita tidak ditemukan atau belum dipublikasi");
        }
      } else {
        setError("Berita tidak ditemukan");
      }

      // Fetch header settings
      const headerResponse = await fetch("/api/header-settings");
      if (headerResponse.ok) {
        const headerData = await headerResponse.json();
        setHeaderSettings(headerData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Gagal memuat berita");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleShare = async () => {
    if (navigator.share && post) {
      try {
        await navigator.share({
          title: post.title,
          text: post.content.substring(0, 100) + '...',
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link berhasil disalin ke clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        {/* Fixed Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-red-600 shadow-md">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-2">
                <img 
                  src={headerSettings?.logoUrl || "/logo.png"} 
                  alt="Logo" 
                  className="h-10 w-auto"
                />
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
                        className="text-white hover:text-red-200 transition-colors font-medium"
                      >
                        {item.label}
                      </Link>
                    ))
                ) : (
                  <>
                    <Link href="/" className="text-white hover:text-red-200 transition-colors font-medium">Beranda</Link>
                    <Link href="/berita" className="text-white hover:text-red-200 transition-colors font-medium">Berita</Link>
                    <Link href="/galeri" className="text-white hover:text-red-200 transition-colors font-medium">Galeri</Link>
                  </>
                )}
              </nav>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden text-white hover:text-red-200 transition-colors"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

            {/* Mobile Navigation */}
            {isMobileMenuOpen && (
              <div className="md:hidden py-4 border-t border-red-500">
                <nav className="flex flex-col space-y-2">
                  {headerSettings?.navigationItems && headerSettings.navigationItems.length > 0 ? (
                    headerSettings.navigationItems
                      .sort((a, b) => a.order - b.order)
                      .map((item) => (
                        <Link
                          key={item.id}
                          href={item.href}
                          className="text-white hover:text-red-200 transition-colors font-medium py-2"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      ))
                  ) : (
                    <>
                      <Link href="/" className="text-white hover:text-red-200 transition-colors font-medium py-2" onClick={() => setIsMobileMenuOpen(false)}>Beranda</Link>
                      <Link href="/berita" className="text-white hover:text-red-200 transition-colors font-medium py-2" onClick={() => setIsMobileMenuOpen(false)}>Berita</Link>
                      <Link href="/galeri" className="text-white hover:text-red-200 transition-colors font-medium py-2" onClick={() => setIsMobileMenuOpen(false)}>Galeri</Link>
                    </>
                  )}
                </nav>
              </div>
            )}
          </div>
        </header>
        
        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Memuat berita...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen">
        {/* Fixed Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-red-600 shadow-md">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-2">
                <img 
                  src={headerSettings?.logoUrl || "/logo.png"} 
                  alt="Logo" 
                  className="h-10 w-auto"
                />
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
                        className="text-white hover:text-red-200 transition-colors font-medium"
                      >
                        {item.label}
                      </Link>
                    ))
                ) : (
                  <>
                    <Link href="/" className="text-white hover:text-red-200 transition-colors font-medium">Beranda</Link>
                    <Link href="/berita" className="text-white hover:text-red-200 transition-colors font-medium">Berita</Link>
                    <Link href="/galeri" className="text-white hover:text-red-200 transition-colors font-medium">Galeri</Link>
                  </>
                )}
              </nav>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden text-white hover:text-red-200 transition-colors"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

            {/* Mobile Navigation */}
            {isMobileMenuOpen && (
              <div className="md:hidden py-4 border-t border-red-500">
                <nav className="flex flex-col space-y-2">
                  {headerSettings?.navigationItems && headerSettings.navigationItems.length > 0 ? (
                    headerSettings.navigationItems
                      .sort((a, b) => a.order - b.order)
                      .map((item) => (
                        <Link
                          key={item.id}
                          href={item.href}
                          className="text-white hover:text-red-200 transition-colors font-medium py-2"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      ))
                  ) : (
                    <>
                      <Link href="/" className="text-white hover:text-red-200 transition-colors font-medium py-2" onClick={() => setIsMobileMenuOpen(false)}>Beranda</Link>
                      <Link href="/berita" className="text-white hover:text-red-200 transition-colors font-medium py-2" onClick={() => setIsMobileMenuOpen(false)}>Berita</Link>
                      <Link href="/galeri" className="text-white hover:text-red-200 transition-colors font-medium py-2" onClick={() => setIsMobileMenuOpen(false)}>Galeri</Link>
                    </>
                  )}
                </nav>
              </div>
            )}
          </div>
        </header>
        
        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Berita Tidak Ditemukan</h2>
            <p className="text-gray-600 mb-8">{error || "Berita yang Anda cari tidak tersedia."}</p>
            <Link href="/berita">
              <Button className="bg-red-600 hover:bg-red-700">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali ke Daftar Berita
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-red-600 shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <img 
                src={headerSettings?.logoUrl || "/logo.png"} 
                alt="Logo" 
                className="h-10 w-auto"
              />
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
                      className="text-white hover:text-red-200 transition-colors font-medium"
                    >
                      {item.label}
                    </Link>
                  ))
              ) : (
                <>
                  <Link href="/" className="text-white hover:text-red-200 transition-colors font-medium">Beranda</Link>
                  <Link href="/berita" className="text-white hover:text-red-200 transition-colors font-medium">Berita</Link>
                  <Link href="/galeri" className="text-white hover:text-red-200 transition-colors font-medium">Galeri</Link>
                </>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-white hover:text-red-200 transition-colors"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-red-500">
              <nav className="flex flex-col space-y-2">
                {headerSettings?.navigationItems && headerSettings.navigationItems.length > 0 ? (
                  headerSettings.navigationItems
                    .sort((a, b) => a.order - b.order)
                    .map((item) => (
                      <Link
                        key={item.id}
                        href={item.href}
                        className="text-white hover:text-red-200 transition-colors font-medium py-2"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))
                ) : (
                  <>
                    <Link href="/" className="text-white hover:text-red-200 transition-colors font-medium py-2" onClick={() => setIsMobileMenuOpen(false)}>Beranda</Link>
                    <Link href="/berita" className="text-white hover:text-red-200 transition-colors font-medium py-2" onClick={() => setIsMobileMenuOpen(false)}>Berita</Link>
                    <Link href="/galeri" className="text-white hover:text-red-200 transition-colors font-medium py-2" onClick={() => setIsMobileMenuOpen(false)}>Galeri</Link>
                  </>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>
      
      {/* Breadcrumb */}
      <div className="bg-white border-b pt-20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-red-600">Beranda</Link>
            <span>/</span>
            <Link href="/berita" className="hover:text-red-600">Berita Desa</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{post.title}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <Link href="/berita">
              <Button variant="outline" className="hover:bg-red-50 hover:text-red-600 hover:border-red-200">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali ke Daftar Berita
              </Button>
            </Link>
          </div>

          {/* Article Card */}
          <Card className="overflow-hidden">
            {/* Featured Image */}
            {post.imageUrl && (
              <div className="aspect-video overflow-hidden">
                <img 
                  src={post.imageUrl} 
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <CardContent className="p-8">
              {/* Article Meta */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  {formatDate(post.createdAt)}
                </Badge>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{post.author.name}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{formatTime(post.createdAt)}</span>
                </div>
              </div>
              
              {/* Article Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                {post.title}
              </h1>
              
              {/* Article Content */}
              <div className="prose prose-lg max-w-none">
                <div 
                  className="text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </div>
              
              {/* Article Footer */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Terakhir diperbarui: {formatDate(post.updatedAt)}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleShare}
                    className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Bagikan
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation to other articles */}
          <div className="mt-8 text-center">
            <Link href="/berita">
              <Button className="bg-red-600 hover:bg-red-700">
                Lihat Berita Lainnya
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}