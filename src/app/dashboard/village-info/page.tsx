"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Save, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VillageInfo {
  id: string;
  visi: string;
  misi: string;
  tujuan: string;
  createdAt: string;
  updatedAt: string;
}

export default function VillageInfoPage() {
  const [villageInfo, setVillageInfo] = useState<VillageInfo | null>(null);
  const [formData, setFormData] = useState({
    visi: "",
    misi: "",
    tujuan: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchVillageInfo();
  }, []);

  const fetchVillageInfo = async () => {
    try {
      const response = await fetch('/api/village-info');
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setVillageInfo(data);
          setFormData({
            visi: data.visi,
            misi: data.misi,
            tujuan: data.tujuan
          });
        }
      }
    } catch (error) {
      console.error('Error fetching village info:', error);
      toast({
        title: "Error",
        description: "Gagal mengambil informasi desa",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.visi.trim() || !formData.misi.trim() || !formData.tujuan.trim()) {
      toast({
        title: "Error",
        description: "Semua field harus diisi",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/village-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        setVillageInfo(data);
        toast({
          title: "Berhasil",
          description: "Informasi desa berhasil disimpan"
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal menyimpan');
      }
    } catch (error) {
      console.error('Error saving village info:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal menyimpan informasi desa",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat informasi desa...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">

          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Kelola Visi, Misi & Tujuan Desa
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Atur informasi visi, misi, dan tujuan desa yang akan ditampilkan di halaman utama
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => window.open('/', '_blank')}
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Preview
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </div>

      {/* Form */}
      <div className="grid gap-6">
        {/* Visi */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🎯 Visi Desa
            </CardTitle>
            <CardDescription>
              Gambaran masa depan yang ingin dicapai oleh desa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="visi">Visi Desa</Label>
              <Textarea
                id="visi"
                placeholder="Masukkan visi desa..."
                value={formData.visi}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('visi', e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Misi */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🚀 Misi Desa
            </CardTitle>
            <CardDescription>
              Langkah-langkah strategis untuk mencapai visi desa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="misi">Misi Desa</Label>
              <Textarea
                id="misi"
                placeholder="Masukkan misi desa..."
                value={formData.misi}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('misi', e.target.value)}
                rows={6}
                className="resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tujuan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🎯 Tujuan Desa
            </CardTitle>
            <CardDescription>
              Sasaran konkret yang ingin dicapai dalam jangka waktu tertentu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="tujuan">Tujuan Desa</Label>
              <Textarea
                id="tujuan"
                placeholder="Masukkan tujuan desa..."
                value={formData.tujuan}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('tujuan', e.target.value)}
                rows={6}
                className="resize-none"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info */}
      {villageInfo && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <p>Terakhir diperbarui: {new Date(villageInfo.updatedAt).toLocaleString('id-ID')}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
