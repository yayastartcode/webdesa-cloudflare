"use client";

import { useState, useEffect } from "react";
import Image from "@/components/image";
import Link from "@/lib/router-link";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, X, Menu } from "lucide-react";

interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  category?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
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

export default function GalleryPage() {
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [filteredGalleries, setFilteredGalleries] = useState<GalleryItem[]>([]);
  const [headerSettings, setHeaderSettings] = useState<HeaderSettings | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const fetchGalleries = async () => {
    try {
      const response = await fetch("/api/gallery?isActive=true");
      const data = await response.json();
      if (response.ok) {
        setGalleries(data.galleries);
        setCategories(data.categories);
        setFilteredGalleries(data.galleries);
      }
    } catch (error) {
      console.error("Error fetching galleries:", error);
    }
  };

  const fetchHeaderSettings = async () => {
    try {
      const response = await fetch("/api/header-settings");
      if (response.ok) {
        const data = await response.json();
        setHeaderSettings(data);
      }
    } catch (error) {
      console.error("Error fetching header settings:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchGalleries(), fetchHeaderSettings()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredGalleries(galleries);
    } else {
      setFilteredGalleries(galleries.filter(item => item.category === selectedCategory));
    }
  }, [selectedCategory, galleries]);

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === filteredGalleries.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? filteredGalleries.length - 1 : prev - 1
    );
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") nextImage();
    if (e.key === "ArrowLeft") prevImage();
  };

  useEffect(() => {
    if (lightboxOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [lightboxOpen]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Memuat galeri...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header with forced red background */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              {headerSettings?.logoUrl ? (
                <Image
                  src={headerSettings.logoUrl}
                  alt="Logo Desa Lomaer"
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
                Desa Lomaer
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
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-4">
            Galeri Kegiatan Desa
          </h1>
          <p className="text-center text-gray-600 max-w-2xl mx-auto">
            Dokumentasi berbagai kegiatan dan momen berharga di desa kami
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Filter Kategori:</span>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-gray-600">
            Menampilkan {filteredGalleries.length} dari {galleries.length} foto
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="container mx-auto px-4 pb-12">
        {filteredGalleries.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-500 text-lg">
              {selectedCategory === "all" 
                ? "Belum ada foto dalam galeri" 
                : `Tidak ada foto dalam kategori "${selectedCategory}"`
              }
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGalleries.map((item, index) => (
              <div
                key={item.id}
                className="cursor-pointer group"
                onClick={() => openLightbox(index)}
              >
                <div className="relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:brightness-110 transition-all duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <h3 className="text-white font-semibold text-sm mb-1">{item.title}</h3>
                      {item.category && (
                        <span className="inline-block bg-white/20 text-white text-xs px-2 py-1 rounded">
                          {item.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-7xl w-full h-full max-h-screen p-0 bg-black/95">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
              onClick={closeLightbox}
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Navigation Buttons */}
            {filteredGalleries.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20"
                  onClick={prevImage}
                >
                  <ChevronLeft className="w-8 h-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20"
                  onClick={nextImage}
                >
                  <ChevronRight className="w-8 h-8" />
                </Button>
              </>
            )}

            {/* Image */}
            {filteredGalleries[currentImageIndex] && (
              <div className="relative w-full h-full flex flex-col items-center justify-center p-8">
                <div className="relative max-w-full max-h-[80vh] flex items-center justify-center">
                  <Image
                    src={filteredGalleries[currentImageIndex].imageUrl}
                    alt={filteredGalleries[currentImageIndex].title}
                    width={1200}
                    height={800}
                    className="max-w-full max-h-full object-contain"
                    priority
                  />
                </div>
                
                {/* Image Info */}
                <div className="mt-6 text-center text-white max-w-2xl">
                  <h2 className="text-2xl font-bold mb-2">
                    {filteredGalleries[currentImageIndex].title}
                  </h2>
                  {filteredGalleries[currentImageIndex].description && (
                    <p className="text-gray-300 mb-3">
                      {filteredGalleries[currentImageIndex].description}
                    </p>
                  )}
                  <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
                    {filteredGalleries[currentImageIndex].category && (
                      <span className="bg-white/20 px-3 py-1 rounded">
                        {filteredGalleries[currentImageIndex].category}
                      </span>
                    )}
                    <span>
                      {currentImageIndex + 1} dari {filteredGalleries.length}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}