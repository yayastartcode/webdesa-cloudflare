"use client";

import { useState, useEffect } from "react";

interface PopulationData {
  id?: string;
  totalPopulation: number;
  malePopulation: number;
  femalePopulation: number;
  households: number;
  temporaryResidents: number;
  populationMutations: number;
}

interface PopulationDemographicsProps {
  data?: PopulationData;
}

export default function PopulationDemographics({ data }: PopulationDemographicsProps) {
  const [populationData, setPopulationData] = useState<PopulationData | null>(null);
  const [loading, setLoading] = useState(true);

  // Default data if none provided
  const defaultData: PopulationData = {
    totalPopulation: 1148,
    malePopulation: 605,
    femalePopulation: 543,
    households: 303,
    temporaryResidents: 73,
    populationMutations: 36
  };

  useEffect(() => {
    if (data) {
      setPopulationData(data);
      setLoading(false);
    } else {
      fetchPopulationData();
    }
  }, [data]);

  const fetchPopulationData = async () => {
    try {
      const response = await fetch('/api/population-data');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setPopulationData(result.data);
        } else {
          setPopulationData(defaultData);
        }
      } else {
        setPopulationData(defaultData);
      }
    } catch (error) {
      console.error('Error fetching population data:', error);
      setPopulationData(defaultData);
    } finally {
      setLoading(false);
    }
  };

  const currentData = populationData || defaultData;

  const stats = [
    {
      number: currentData.totalPopulation.toLocaleString(),
      label: "Penduduk",
      bgColor: "bg-red-500"
    },
    {
      number: currentData.malePopulation.toLocaleString(),
      label: "Laki-Laki",
      bgColor: "bg-red-500"
    },
    {
      number: currentData.households.toLocaleString(),
      label: "Kepala Keluarga",
      bgColor: "bg-red-500"
    },
    {
      number: currentData.femalePopulation.toLocaleString(),
      label: "Perempuan",
      bgColor: "bg-red-500"
    },
    {
      number: currentData.temporaryResidents.toLocaleString(),
      label: "Penduduk Sementara",
      bgColor: "bg-red-500"
    },
    {
      number: currentData.populationMutations.toLocaleString(),
      label: "Mutasi Penduduk",
      bgColor: "bg-red-500"
    }
  ];

  if (loading) {
    return (
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Memuat data kependudukan...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-red-600 mb-4">
            Administrasi Penduduk
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-4xl">
            Sistem digital yang berfungsi mempermudah pengelolaan data dan informasi terkait dengan kependudukan dan pendayagunaannya untuk pelayanan publik yang efektif dan efisien
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center space-x-4">
              {/* Number Box */}
              <div className={`${stat.bgColor} text-white px-6 py-4 rounded-lg min-w-[120px] text-center`}>
                <div className="text-2xl md:text-3xl font-bold">
                  {stat.number}
                </div>
              </div>
              
              {/* Label */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  {stat.label}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Data diperbarui secara berkala • Sumber: Administrasi Desa Kersik
          </p>
        </div>
      </div>
    </section>
  );
}