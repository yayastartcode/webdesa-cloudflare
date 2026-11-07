"use client";

import { useState, useEffect } from "react";
import Image from "@/components/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SlideData {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

interface HeroSliderProps {
  slides?: SlideData[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export default function HeroSlider({ 
  slides, 
  autoPlay = true, 
  autoPlayInterval = 5000 
}: HeroSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Default slides if none provided
  const defaultSlides: SlideData[] = [
    {
      id: "1",
      title: "Selamat Datang di Desa Lomaer",
      description: "Menghubungkan masyarakat desa dengan teknologi terdepan untuk pelayanan yang lebih baik dan transparansi yang optimal.",
      imageUrl: "/api/placeholder/1920/800"
    },
    {
      id: "2",
      title: "Layanan Digital Terpadu",
      description: "Akses berbagai layanan desa secara online, mulai dari administrasi hingga informasi terkini tentang program desa.",
      imageUrl: "/api/placeholder/1920/800"
    },
    {
      id: "3",
      title: "Transparansi & Akuntabilitas",
      description: "Pantau perkembangan desa, anggaran, dan program-program yang sedang berjalan dengan mudah dan transparan.",
      imageUrl: "/api/placeholder/1920/800"
    }
  ];

  const slideData = slides && slides.length > 0 ? slides : defaultSlides;

  useEffect(() => {
    if (!autoPlay || slideData.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideData.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, slideData.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slideData.length) % slideData.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slideData.length);
  };

  if (slideData.length === 0) {
    return null;
  }

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Slides */}
      {slideData.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src={slide.imageUrl}
              alt={slide.title}
              fill
              className="object-cover"
              priority={index === 0}
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40" />
          </div>

          {/* Content */}
          <div className="relative z-10 h-full flex items-center">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl">
                <div className="space-y-6 text-white">
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight animate-fade-in-up">
                    {slide.title}
                  </h1>
                  <p className="text-lg md:text-xl text-gray-200 max-w-2xl animate-fade-in-up animation-delay-200">
                    {slide.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      {slideData.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all duration-300 backdrop-blur-sm"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all duration-300 backdrop-blur-sm"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {slideData.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
          <div className="flex space-x-3">
            {slideData.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "bg-white scale-125"
                    : "bg-white/50 hover:bg-white/75"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 right-8 z-20">
        <div className="flex flex-col items-center space-y-2 text-white/70">
          <span className="text-sm font-medium">Scroll</span>
          <div className="w-px h-12 bg-white/30 relative">
            <div className="absolute top-0 w-px h-6 bg-white animate-bounce" />
          </div>
        </div>
      </div>
    </div>
  );
}