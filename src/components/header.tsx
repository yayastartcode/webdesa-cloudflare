"use client";

import { useState, useEffect } from "react";
import Link from "@/lib/router-link";
import Image from "@/components/image";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  order: number;
}

interface HeaderProps {
  logoUrl?: string;
  navigationItems?: NavigationItem[];
}

export default function Header({ logoUrl, navigationItems = [] }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Default navigation items if none provided
  const defaultNavItems: NavigationItem[] = [
    { id: "1", label: "Beranda", href: "/", order: 1 },
    { id: "2", label: "Tentang", href: "/about", order: 2 },
    { id: "3", label: "Layanan", href: "/services", order: 3 },
    { id: "4", label: "Berita", href: "/news", order: 4 },
    { id: "5", label: "Galeri", href: "/galeri", order: 5 },
    { id: "6", label: "Kontak", href: "/contact", order: 6 },
  ];

  const navItems = navigationItems.length > 0 ? navigationItems : defaultNavItems;
  const sortedNavItems = navItems.sort((a, b) => a.order - b.order);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 py-4 transition-all duration-300 ${
        isScrolled
          ? "bg-red-600 shadow-lg backdrop-blur-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt="Logo Desa Lomaer"
                width={96}
                height={96}
                className="w-24 h-24 object-contain"
              />
            ) : (
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                <span className="text-red-600 font-bold text-2xl">🇮🇩</span>
              </div>
            )}
            <span
              className={`text-xl font-bold transition-colors duration-300 ${
                isScrolled ? "text-white" : "text-white drop-shadow-lg"
              }`}
            >
              Desa Lomaer <br />
              Website Resmi Desa
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {sortedNavItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`font-medium transition-colors duration-300 hover:text-orange-300 ${
                  isScrolled ? "text-white" : "text-white drop-shadow-lg"
                }`}
              >
                {item.label}
              </Link>
            ))}

          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className={`w-6 h-6 ${isScrolled ? "text-white" : "text-white drop-shadow-lg"}`} />
            ) : (
              <Menu className={`w-6 h-6 ${isScrolled ? "text-white" : "text-white drop-shadow-lg"}`} />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div
            className={`md:hidden py-4 border-t transition-all duration-300 ${
              isScrolled ? "border-red-500" : "border-white/30"
            }`}
          >
            <nav className="flex flex-col space-y-4">
              {sortedNavItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`font-medium transition-colors duration-300 hover:text-orange-300 ${
                    isScrolled ? "text-white" : "text-white drop-shadow-lg"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button
                  variant={isScrolled ? "secondary" : "outline"}
                  className={`w-full transition-all duration-300 ${
                    isScrolled
                      ? "bg-white text-red-600 hover:bg-gray-100"
                      : "bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm"
                  }`}
                >
                  Masuk
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}