"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Camera } from "lucide-react";
import Link from "@/lib/router-link";
import Image from "@/components/image";

interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  category?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export default function GalleryPreview() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGalleryItems = async () => {
      try {
        const response = await fetch('/api/gallery?limit=6&isActive=true');
        if (response.ok) {
          const data = await response.json();
          setGalleryItems(data.galleries || []);
        } else {
          console.error('Failed to fetch gallery items');
        }
      } catch (error) {
        console.error('Error fetching gallery items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryItems();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Galeri Kegiatan
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Dokumentasi kegiatan dan momen penting di desa
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-64 animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (galleryItems.length === 0) {
    return (
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Galeri Kegiatan
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Dokumentasi kegiatan dan momen penting di desa
            </p>
          </div>
          <div className="text-center py-12">
            <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Belum ada foto dalam galeri
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Galeri Kegiatan
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Dokumentasi kegiatan dan momen penting di desa
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {galleryItems.map((item, index) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
                
                {/* Category Badge */}
                {item.category && (
                  <Badge 
                    variant="secondary" 
                    className="absolute top-3 left-3 bg-white/90 text-gray-900 hover:bg-white"
                  >
                    {item.category}
                  </Badge>
                )}
                
                {/* Title Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                  <h3 className="text-white font-semibold text-lg mb-1 line-clamp-2">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-white/80 text-sm line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link href="/galeri">
            <Button className="bg-red-600 hover:bg-red-700 text-white">
              Lihat Semua Galeri
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}