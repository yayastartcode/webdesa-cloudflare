"use client";

import { useState, useEffect } from "react";
import type { HomeSections } from '@/lib/home-sections';
import Header from "@/components/header";
import HeroSlider from "@/components/hero-slider";
import VillageInfoSection from "@/components/village-info";
import VillageHeadWelcomeSection from "@/components/village-head-welcome";
import EmployeeSlider from "@/components/employee-slider";
import PopulationDemographics from "@/components/population-demographics";
import ApbDesaSection from "@/components/apb-desa";
import BeritaList from "@/components/berita-list";
import VillageMaps from "@/components/village-maps";
import HelpdeskForm from "@/components/helpdesk-form";
import GalleryPreview from "@/components/gallery-preview";

interface HeroSlide {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  order: number;
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

interface VillageInfo {
  id: string;
  visi: string;
  misi: string;
  tujuan: string;
}

interface VillageHeadWelcome {
  id?: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Employee {
  id: string;
  name: string;
  position: string;
  photoUrl?: string;
  order: number;
}

export default function Home() {
  const [sections, setSections] = useState<HomeSections | null>(null);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [headerSettings, setHeaderSettings] = useState<HeaderSettings | null>(null);
  const [villageInfo, setVillageInfo] = useState<VillageInfo | null>(null);
  const [villageHeadWelcome, setVillageHeadWelcome] = useState<VillageHeadWelcome | undefined>(undefined);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/homepage-settings', { cache: 'no-store', signal: controller.signal }).then(async response => {
      if (response.ok) { const result = await response.json(); if (result.success) setSections(result.data.sections); }
    }).catch(error => { if (!controller.signal.aborted) console.error('Error fetching homepage settings:', error); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const load = async <T,>(path: string, apply: (data: T) => void) => {
      try {
        const response = await fetch(path, { cache: 'no-store', signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!controller.signal.aborted) apply(data);
      } catch (error) { if (!controller.signal.aborted) console.error('Error fetching homepage content:', path, error); }
    };
    void load<HeroSlide[]>('/api/hero-slides', setHeroSlides).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    void load<HeaderSettings | null>('/api/header-settings', setHeaderSettings);
    void load<VillageInfo | null>('/api/village-info', setVillageInfo);
    void load<{ success: boolean; data?: VillageHeadWelcome }>('/api/village-head-welcome', result => { if (result.success) setVillageHeadWelcome(result.data); });
    void load<{ success: boolean; data?: Employee[] }>('/api/employees', result => { if (result.success) setEmployees(result.data || []); });
    return () => controller.abort();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <Header 
        logoUrl={headerSettings?.logoUrl || undefined}
        navigationItems={headerSettings?.navigationItems || []}
      />

      {/* Hero Slider */}
      {!loading && <HeroSlider slides={heroSlides} />}

      {/* Village Info Section */}
      {sections?.villageInfo && <VillageInfoSection villageInfo={villageInfo} />}

      {/* Village Head Welcome Section */}
      {sections?.villageHeadWelcome && <VillageHeadWelcomeSection
        welcome={villageHeadWelcome} 
        logoUrl={headerSettings?.logoUrl || undefined}
      />}

      {/* Employee Slider Section */}
      {sections?.employees && <EmployeeSlider employees={employees} />}

      {/* Population Demographics */}
          {sections?.population && <PopulationDemographics />}

          {/* APB Desa Section */}
          {sections?.apb && <ApbDesaSection />}

          {/* Berita List */}
          {sections?.news && <BeritaList />}

      {/* Village Maps Section */}
      {sections?.maps && <VillageMaps />}

      {/* Helpdesk Section */}
      {sections?.helpdesk && <HelpdeskForm />}

      {/* Gallery Preview Section */}
      {sections?.gallery && <GalleryPreview />}

    

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600 dark:text-gray-300">
            <p>Dibuat dengan ❤️ untuk Indonesia</p>
            <p className="text-sm mt-2">
              Powered by Desa Lomaer
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
