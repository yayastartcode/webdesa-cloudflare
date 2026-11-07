"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "@/lib/navigation";
import { useEffect, useState } from "react";
import type { Session } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Save, Users } from "lucide-react";

interface PopulationData {
  id?: string;
  totalPopulation: number;
  malePopulation: number;
  femalePopulation: number;
  households: number;
  temporaryResidents: number;
  populationMutations: number;
}

export default function PopulationDataPage() {
  const { data: session, status } = useSession() as { data: Session | null; status: string; };
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState<PopulationData>({
    totalPopulation: 0,
    malePopulation: 0,
    femalePopulation: 0,
    households: 0,
    temporaryResidents: 0,
    populationMutations: 0
  });

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/login");
      return;
    }
    
    if (!session.user || session.user.role !== "ADMIN") {
      router.push("/");
      return;
    }
    
    fetchPopulationData();
  }, [session, status, router]);

  const fetchPopulationData = async () => {
    try {
      const response = await fetch('/api/population-data');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setFormData(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching population data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof PopulationData, value: string) => {
    const numValue = parseInt(value) || 0;
    setFormData(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    // Validate that male + female = total
    if (formData.malePopulation + formData.femalePopulation !== formData.totalPopulation) {
      setMessage({
        type: 'error',
        text: 'Jumlah penduduk laki-laki dan perempuan harus sama dengan total penduduk'
      });
      setIsSaving(false);
      return;
    }

    try {
      const response = await fetch('/api/population-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      
      if (result.success) {
        setMessage({
          type: 'success',
          text: 'Data kependudukan berhasil disimpan'
        });
        setFormData(result.data);
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'Gagal menyimpan data kependudukan'
        });
      }
    } catch (error) {
      console.error('Error saving population data:', error);
      setMessage({
        type: 'error',
        text: 'Terjadi kesalahan saat menyimpan data'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data kependudukan...</p>
        </div>
      </div>
    );
  }

  if (!session || !session.user || session.user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">

              <div className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-orange-600" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Kelola Data Kependudukan
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {message && (
            <Alert className={`mb-6 ${message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
              <AlertDescription className={message.type === 'error' ? 'text-red-800' : 'text-green-800'}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Data Administrasi Penduduk</CardTitle>
              <CardDescription>
                Kelola data statistik kependudukan desa untuk ditampilkan di halaman utama
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Total Population */}
                <div className="space-y-2">
                  <Label htmlFor="totalPopulation">Total Penduduk</Label>
                  <Input
                    id="totalPopulation"
                    type="number"
                    min="0"
                    value={formData.totalPopulation}
                    onChange={(e) => handleInputChange('totalPopulation', e.target.value)}
                    placeholder="Masukkan total penduduk"
                  />
                </div>

                {/* Households */}
                <div className="space-y-2">
                  <Label htmlFor="households">Kepala Keluarga</Label>
                  <Input
                    id="households"
                    type="number"
                    min="0"
                    value={formData.households}
                    onChange={(e) => handleInputChange('households', e.target.value)}
                    placeholder="Masukkan jumlah kepala keluarga"
                  />
                </div>

                {/* Male Population */}
                <div className="space-y-2">
                  <Label htmlFor="malePopulation">Penduduk Laki-Laki</Label>
                  <Input
                    id="malePopulation"
                    type="number"
                    min="0"
                    value={formData.malePopulation}
                    onChange={(e) => handleInputChange('malePopulation', e.target.value)}
                    placeholder="Masukkan jumlah penduduk laki-laki"
                  />
                </div>

                {/* Female Population */}
                <div className="space-y-2">
                  <Label htmlFor="femalePopulation">Penduduk Perempuan</Label>
                  <Input
                    id="femalePopulation"
                    type="number"
                    min="0"
                    value={formData.femalePopulation}
                    onChange={(e) => handleInputChange('femalePopulation', e.target.value)}
                    placeholder="Masukkan jumlah penduduk perempuan"
                  />
                </div>

                {/* Temporary Residents */}
                <div className="space-y-2">
                  <Label htmlFor="temporaryResidents">Penduduk Sementara</Label>
                  <Input
                    id="temporaryResidents"
                    type="number"
                    min="0"
                    value={formData.temporaryResidents}
                    onChange={(e) => handleInputChange('temporaryResidents', e.target.value)}
                    placeholder="Masukkan jumlah penduduk sementara"
                  />
                </div>

                {/* Population Mutations */}
                <div className="space-y-2">
                  <Label htmlFor="populationMutations">Mutasi Penduduk</Label>
                  <Input
                    id="populationMutations"
                    type="number"
                    min="0"
                    value={formData.populationMutations}
                    onChange={(e) => handleInputChange('populationMutations', e.target.value)}
                    placeholder="Masukkan jumlah mutasi penduduk"
                  />
                </div>
              </div>

              {/* Validation Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Catatan:</strong> Jumlah penduduk laki-laki dan perempuan harus sama dengan total penduduk.
                  <br />
                  Saat ini: {formData.malePopulation} + {formData.femalePopulation} = {formData.malePopulation + formData.femalePopulation}
                  {formData.malePopulation + formData.femalePopulation !== formData.totalPopulation && (
                    <span className="text-red-600 dark:text-red-400 block mt-1">
                      ⚠️ Tidak sesuai dengan total penduduk ({formData.totalPopulation})
                    </span>
                  )}
                </p>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{isSaving ? 'Menyimpan...' : 'Simpan Data'}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
