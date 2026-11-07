"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export default function BeritaPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [headerSettings, setHeaderSettings] = useState<HeaderSettings | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const postsPerPage = 6;

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch posts
      const postsResponse = await fetch(`/api/posts?page=${currentPage}&limit=${postsPerPage}`);
      if (postsResponse.ok) {
        const postsData = await postsResponse.json();
        setPosts(postsData.data || []);
        setTotalPages(postsData.pagination?.totalPages || 1);
      }

      // Fetch header settings
      const headerResponse = await fetch("/api/header-settings");
      if (headerResponse.ok) {
        const headerData = await headerResponse.json();
        setHeaderSettings(headerData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const stripHtmlTags = (html: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    const plainText = stripHtmlTags(content);
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength) + '...';
  };

  const extractFirstImageFromContent = (htmlContent: string): string | null => {
    try {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      const firstImg = tempDiv.querySelector('img');
      return firstImg ? firstImg.src : null;
    } catch (error) {
      console.error('Error extracting image from content:', error);
      return null;
    }
  };

  const getDisplayImage = (post: Post): string | null => {
    if (post.imageUrl) {
      return post.imageUrl;
    }
    return extractFirstImageFromContent(post.content);
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

  return (
    <div className="min-h-screen bg-white">
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
      
      {/* Hero Section */}
      <div className="bg-red-600 text-white py-8 pt-24">
        <div className="container mx-auto px-4">
          <div className="text-left">
            <h1 className="text-3xl font-bold mb-2">Berita Desa</h1>
            <p className="text-red-100">
              Menyajikan informasi terbaru tentang peristiwa, berita terkini, dan artikel-artikel jurnalistik dari Desa Lomaer
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {posts.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Belum Ada Berita</h2>
            <p className="text-gray-600">Berita akan segera hadir. Silakan kembali lagi nanti.</p>
          </div>
        ) : (
          <>
            {/* News Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {posts.map((post) => (
                <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white">
                  {/* Image */}
                  {getDisplayImage(post) && (
                    <div className="aspect-video overflow-hidden">
                      <img 
                        src={getDisplayImage(post)!} 
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <CardContent className="p-4">
                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      <Link href={`/berita/${post.id}`} className="hover:text-red-600 transition-colors">
                        {post.title}
                      </Link>
                    </h3>
                    
                    {/* Content Preview */}
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {truncateContent(post.content, 100)}
                    </p>
                    
                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>Administrator</span>
                      </div>
                   
                    </div>
                    
                    {/* Date Badge */}
                    <div className="flex justify-between items-center">
                      <Badge className="bg-red-600 text-white text-xs px-2 py-1">
                        {formatDate(post.createdAt)}
                      </Badge>
                      <Badge className="bg-red-600 text-white text-xs px-2 py-1">
                        {new Date(post.createdAt).getFullYear()}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Sebelumnya
                </Button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}
                    className={currentPage === page ? "bg-red-600 hover:bg-red-700" : ""}
                  >
                    {page}
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Selanjutnya
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}