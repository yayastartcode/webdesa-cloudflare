"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface ApbDesaData {
  id: string;
  year: number;
  pendapatanDesa: number;
  belanjaDesa: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ApbDesaSection() {
  const [apbData, setApbData] = useState<ApbDesaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApbData = async () => {
      try {
        const response = await fetch('/api/apb-desa');
        const result = await response.json();
        
        if (result.success) {
          setApbData(result.data);
        } else {
          setError('Gagal memuat data APB Desa');
        }
      } catch (error) {
        console.error('Error fetching APB Desa data:', error);
        setError('Terjadi kesalahan saat memuat data');
      } finally {
        setLoading(false);
      }
    };

    fetchApbData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount).replace('IDR', 'Rp');
  };

  const formatCurrencyShort = (amount: number) => {
    return new Intl.NumberFormat('id-ID').format(amount);
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-600">Memuat data APB Desa...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error || !apbData) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-red-600">{error || 'Data APB Desa tidak tersedia'}</p>
          </div>
        </div>
      </section>
    );
  }

  const currentYear = new Date().getFullYear();
  const displayYear = apbData.year || currentYear;

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-red-600 mb-4">
              APB DESA {displayYear}
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Akses cepat dan transparan terhadap APB Desa serta proyek pembangunan
            </p>
          </div>

          {/* APB Cards */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Pendapatan Desa */}
            <Card className="bg-white shadow-lg border-0 overflow-hidden">
              <CardContent className="p-8">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-600 mb-6">
                    Pendapatan Desa
                  </h3>
                  <div className="text-4xl font-bold text-gray-800 mb-2">
                    Rp{formatCurrencyShort(apbData.pendapatanDesa)},00
                  </div>
                  <div className="w-full h-1 bg-gray-200 rounded-full mt-6">
                    <div className="h-1 bg-green-500 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Belanja Desa */}
            <Card className="bg-white shadow-lg border-0 overflow-hidden">
              <CardContent className="p-8">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-600 mb-6">
                    Belanja Desa
                  </h3>
                  <div className="text-4xl font-bold text-gray-800 mb-2">
                    Rp{formatCurrencyShort(apbData.belanjaDesa)},00
                  </div>
                  <div className="w-full h-1 bg-gray-200 rounded-full mt-6">
                    <div className="h-1 bg-blue-500 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Info */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              Data APB Desa Tahun {displayYear} • Diperbarui: {new Date(apbData.updatedAt).toLocaleDateString('id-ID')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}