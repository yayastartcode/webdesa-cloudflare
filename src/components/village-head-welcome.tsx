"use client";

import { useState, useEffect } from "react";
import Image from "@/components/image";
import { lazy } from "react";
import { Card, CardContent } from "@/components/ui/card";

// Dynamically import the markdown renderer to avoid SSR issues
const Markdown = lazy(
  () => import("@uiw/react-md-editor").then((mod) => ({ default: mod.default.Markdown }))
);

interface VillageHeadWelcome {
  id?: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

interface VillageHeadWelcomeSectionProps {
  welcome?: VillageHeadWelcome;
  logoUrl?: string;
}

export default function VillageHeadWelcomeSection({ 
  welcome, 
  logoUrl 
}: VillageHeadWelcomeSectionProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Default content if no welcome message is provided
  const defaultContent = `# Sambutan Kepala Desa Gimpubia

**Assalamu Alaikum Warahmatullahi Wabarakatu.**

Website ini hadir sebagai wujud transformasi desa Gimpubia menjadi desa yang mampu memanfaatkan teknologi informasi dan komunikasi. Terintegrasi kedalam sistem online, Keterbukaan informasi publik, pelayanan publik dan kegiatan perekonomian di desa, guna mewujudkan desa Kersik sebagai desa wisata yang berkelanjutan, adaptasi dan mitigasi terhadap perubahan iklim serta menjadi desa yang mandiri.

Terima kasih kepada semua pihak yang telah banyak memberi dukungan dan kontribusi baik berupa pemikiran, tenaga, maupun materi dalam pembangunan website ini.

*Kepala Desa Gimpubia*`;

  const content = welcome?.content || defaultContent;

  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <Card className="overflow-hidden shadow-lg">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              {/* Logo Section - Left Side */}
              <div className="lg:col-span-4 bg-gradient-to-br from-green-600 to-green-700 p-8 flex flex-col items-center justify-center text-white">
                <div className="text-center space-y-6">
                  {/* Village Logo */}
                  <div className="flex justify-center">
                    {logoUrl ? (
                      <Image
                        src={logoUrl}
                        alt="Logo Desa Kersik"
                        width={120}
                        height={120}
                        className="w-30 h-30 object-contain bg-white rounded-full p-2 shadow-lg"
                      />
                    ) : (
                      <div className="w-30 h-30 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-2xl">🏛️</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Village Info */}
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold">Desa Gimpubia</h2>
                    <p className="text-green-100 text-sm">
                      Kabupaten Donggala
                    </p>
                    <p className="text-green-100 text-sm">
                      Provinsi Sulawesi Tengah
                    </p>
                  </div>
                  
                  {/* Decorative Element */}
                  <div className="flex justify-center space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full opacity-60"></div>
                    <div className="w-2 h-2 bg-white rounded-full opacity-80"></div>
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
              
              {/* Content Section - Right Side */}
              <div className="lg:col-span-8 p-8 lg:p-12">
                <div className="prose prose-lg max-w-none dark:prose-invert">
                  {isClient ? (
                    <Markdown 
                      source={content} 
                      style={{ 
                        backgroundColor: 'transparent',
                        color: 'inherit'
                      }}
                    />
                  ) : (
                    <div className="space-y-4">
                      <h1 className="text-3xl font-bold text-red-600 mb-4">
                        Sambutan Kepala Desa Kersik
                      </h1>
                      <div className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        <p className="mb-4">
                          <strong>Assalamu Alaikum Warahmatullahi Wabarakatu.</strong>
                        </p>
                        <p className="mb-4">
                          Website ini hadir sebagai wujud transformasi desa Kersik menjadi desa yang mampu memanfaatkan 
                          teknologi informasi dan komunikasi. Terintegrasi kedalam sistem online, Keterbukaan informasi 
                          publik, pelayanan publik dan kegiatan perekonomian di desa, guna mewujudkan desa Kersik sebagai 
                          desa wisata yang berkelanjutan, adaptasi dan mitigasi terhadap perubahan iklim serta menjadi desa 
                          yang mandiri.
                        </p>
                        <p className="mb-4">
                          Terima kasih kepada semua pihak yang telah banyak memberi dukungan dan kontribusi baik berupa 
                          pemikiran, tenaga, maupun materi dalam pembangunan website ini.
                        </p>
                        <p className="text-right italic">
                          Kepala Desa Kersik
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}