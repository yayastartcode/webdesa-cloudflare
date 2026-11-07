"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Employee {
  id: string;
  name: string;
  position: string;
  photoUrl?: string;
  order: number;
}

interface EmployeeSliderProps {
  employees: Employee[];
}

export default function EmployeeSlider({ employees }: EmployeeSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1);
      } else if (window.innerWidth < 768) {
        setItemsPerView(2);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(3);
      } else {
        setItemsPerView(4);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, employees.length - itemsPerView);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(Math.min(index, maxIndex));
  };

  if (!employees || employees.length === 0) return null;

  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Pegawai Desa Lomaer
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Berkenalan dengan tim pegawai desa yang siap melayani masyarakat dengan dedikasi dan profesionalisme
          </p>
        </div>

        {/* Slider Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          {employees.length > itemsPerView && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Slider Content */}
          <div className="overflow-hidden mx-8">
            <div 
              className="flex transition-transform duration-300 ease-in-out"
              style={{
                transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`
              }}
            >
              {employees.map((employee) => (
                <div
                  key={employee.id}
                  className="flex-shrink-0 px-3"
                  style={{ width: `${100 / itemsPerView}%` }}
                >
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    {/* Photo */}
                    <div className="relative h-64 bg-gradient-to-br from-red-500 to-red-600">
                      {employee.photoUrl ? (
                        <img
                          src={employee.photoUrl}
                          alt={employee.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="h-16 w-16 text-white/70" />
                        </div>
                      )}
                      {/* Red overlay for consistency with the design */}
                      <div className="absolute inset-0 bg-red-500/20"></div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-6 text-center">
                      <h3 className="text-xl font-bold text-white mb-2 bg-red-500 px-4 py-2 rounded">
                        {employee.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                        {employee.position}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Indicator */}
          {employees.length > itemsPerView && (
            <div className="flex justify-center mt-8 space-x-2">
              {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                    index === currentIndex
                      ? "bg-red-500"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Auto-play indicator */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {employees.length} Pegawai • Geser untuk melihat lebih banyak
          </p>
        </div>
      </div>
    </section>
  );
}