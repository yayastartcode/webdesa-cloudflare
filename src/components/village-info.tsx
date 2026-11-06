"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface VillageInfo {
  id: string;
  visi: string;
  misi: string;
  tujuan: string;
}

interface VillageInfoProps {
  villageInfo: VillageInfo | null;
}

export default function VillageInfoSection({ villageInfo }: VillageInfoProps) {
  // Default content if no village info is provided
  const defaultContent = {
    visi: "Menjadi desa yang maju, mandiri, dan sejahtera dengan memanfaatkan teknologi digital untuk pelayanan terbaik bagi masyarakat.",
    misi: "1. Meningkatkan kualitas pelayanan publik melalui digitalisasi\n2. Memberdayakan masyarakat dalam bidang ekonomi dan sosial\n3. Melestarikan budaya dan kearifan lokal\n4. Menciptakan tata kelola pemerintahan yang transparan dan akuntabel\n5. Mengembangkan infrastruktur desa yang berkelanjutan",
    tujuan: "1. Tercapainya pelayanan publik yang efisien dan transparan\n2. Meningkatnya kesejahteraan ekonomi masyarakat desa\n3. Terpeliharanya nilai-nilai budaya dan gotong royong\n4. Terwujudnya lingkungan desa yang bersih dan sehat\n5. Terbangunnya infrastruktur yang mendukung kemajuan desa"
  };

  const content = villageInfo || defaultContent;

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Visi, Misi & Tujuan Desa
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Komitmen kami untuk membangun desa yang lebih baik dan sejahtera bagi seluruh masyarakat
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Visi */}
          <Card className="h-full hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎯</span>
              </div>
              <CardTitle className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                Visi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-center">
                {content.visi}
              </p>
            </CardContent>
          </Card>

          {/* Misi */}
          <Card className="h-full hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🚀</span>
              </div>
              <CardTitle className="text-2xl font-bold text-green-600 dark:text-green-400">
                Misi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {content.misi.split('\n').map((item, index) => (
                  <p key={index} className="mb-2 last:mb-0">
                    {item}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tujuan */}
          <Card className="h-full hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎯</span>
              </div>
              <CardTitle className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                Tujuan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {content.tujuan.split('\n').map((item, index) => (
                  <p key={index} className="mb-2 last:mb-0">
                    {item}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}