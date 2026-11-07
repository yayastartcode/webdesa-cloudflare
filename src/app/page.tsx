"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadDemo } from "@/components/upload-demo";
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
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [headerSettings, setHeaderSettings] = useState<HeaderSettings | null>(null);
  const [villageInfo, setVillageInfo] = useState<VillageInfo | null>(null);
  const [villageHeadWelcome, setVillageHeadWelcome] = useState<VillageHeadWelcome | undefined>(undefined);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch hero slides
        const heroSlidesResponse = await fetch('/api/hero-slides');
        if (heroSlidesResponse.ok) {
          const slides = await heroSlidesResponse.json();
          setHeroSlides(slides);
        } else {
          console.error('Failed to fetch hero slides');
        }

        // Fetch header settings
        const headerResponse = await fetch('/api/header-settings');
        if (headerResponse.ok) {
          const headerData = await headerResponse.json();
          setHeaderSettings(headerData);
        } else {
          console.error('Failed to fetch header settings');
        }

        // Fetch village info
        const villageInfoResponse = await fetch('/api/village-info');
        if (villageInfoResponse.ok) {
          const villageData = await villageInfoResponse.json();
          setVillageInfo(villageData);
        } else {
          console.error('Failed to fetch village info');
        }

        // Fetch village head welcome
        const villageHeadWelcomeResponse = await fetch('/api/village-head-welcome');
        if (villageHeadWelcomeResponse.ok) {
          const welcomeData = await villageHeadWelcomeResponse.json();
          if (welcomeData.success) {
            setVillageHeadWelcome(welcomeData.data || undefined);
          }
        } else {
          console.error('Failed to fetch village head welcome');
        }

        // Fetch employees
        const employeesResponse = await fetch('/api/employees');
        if (employeesResponse.ok) {
          const employeesData = await employeesResponse.json();
          if (employeesData.success) {
            setEmployees(employeesData.data || []);
          }
        } else {
          console.error('Failed to fetch employees');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
      <VillageInfoSection villageInfo={villageInfo} />

      {/* Village Head Welcome Section */}
      <VillageHeadWelcomeSection 
        welcome={villageHeadWelcome} 
        logoUrl={headerSettings?.logoUrl || undefined}
      />

      {/* Employee Slider Section */}
      <EmployeeSlider employees={employees} />

      {/* Population Demographics */}
          <PopulationDemographics />

          {/* APB Desa Section */}
          <ApbDesaSection />

          {/* Berita List */}
          <BeritaList />

      {/* Village Maps Section */}
      <VillageMaps />

      {/* Helpdesk Section */}
      <HelpdeskForm />

      {/* Gallery Preview Section */}
      <GalleryPreview />

    

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
