"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "@/lib/navigation";
import type { Session } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Trash2, Edit, Plus, Save, X } from "lucide-react";
import { apiErrorMessage } from "@/lib/api-error";
import { useToast } from "@/hooks/use-toast";

interface ApbDesaData {
  id: string;
  year: number;
  pendapatanDesa: number;
  belanjaDesa: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  year: string;
  pendapatanDesa: string;
  belanjaDesa: string;
  isActive: boolean;
}

export default function ApbDesaDashboard() {
  const { data: session, status } = useSession() as { data: Session | null; status: string; };
  const router = useRouter();
  const { toast } = useToast();
  
  const [apbData, setApbData] = useState<ApbDesaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    year: '',
    pendapatanDesa: '',
    belanjaDesa: '',
    isActive: true
  });

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      router.push('/login');
      return;
    }
    
    fetchApbData();
  }, [session, status, router]);

  const fetchApbData = async () => {
    try {
      const response = await fetch('/api/apb-desa?admin=true');
      const result = await response.json();
      
      if (response.ok && result.success) {
        setApbData(result.data);
      } else {
        toast({
          title: "Error",
          description: "Gagal memuat data APB Desa",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching APB data:', error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memuat data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.year || !formData.pendapatanDesa || !formData.belanjaDesa) {
      toast({
        title: "Error",
        description: "Semua field harus diisi",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const url = editingId ? `/api/apb-desa/${editingId}` : '/api/apb-desa';
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        toast({
          title: "Sukses",
          description: editingId ? "Data APB berhasil diperbarui" : "Data APB berhasil ditambahkan"
        });
        
        resetForm();
        fetchApbData();
      } else {
        toast({
          title: "Error",
          description: apiErrorMessage(response, result.error, "Permintaan APB Desa gagal."),
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error saving APB data:', error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menyimpan data",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (item: ApbDesaData) => {
    setEditingId(item.id);
    setFormData({
      year: item.year.toString(),
      pendapatanDesa: item.pendapatanDesa.toString(),
      belanjaDesa: item.belanjaDesa.toString(),
      isActive: item.isActive
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data APB ini?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/apb-desa/${id}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        toast({
          title: "Sukses",
          description: "Data APB berhasil dihapus"
        });
        fetchApbData();
      } else {
        toast({
          title: "Error",
          description: apiErrorMessage(response, result.error, "Permintaan APB Desa gagal."),
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting APB data:', error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menghapus data",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      year: '',
      pendapatanDesa: '',
      belanjaDesa: '',
      isActive: true
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID').format(amount);
  };

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!session || !session.user || session.user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manajemen APB Desa</h1>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Tambah APB
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              {editingId ? 'Edit APB Desa' : 'Tambah APB Desa'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="year">Tahun</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    placeholder="2024"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="pendapatanDesa">Pendapatan Desa</Label>
                  <Input
                    id="pendapatanDesa"
                    type="number"
                    step="0.01"
                    value={formData.pendapatanDesa}
                    onChange={(e) => setFormData({ ...formData, pendapatanDesa: e.target.value })}
                    placeholder="4802205800.00"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="belanjaDesa">Belanja Desa</Label>
                  <Input
                    id="belanjaDesa"
                    type="number"
                    step="0.01"
                    value={formData.belanjaDesa}
                    onChange={(e) => setFormData({ ...formData, belanjaDesa: e.target.value })}
                    placeholder="4888222678.00"
                    required
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Aktif</Label>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {editingId ? 'Update' : 'Simpan'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                  className="flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* APB Data List */}
      <div className="grid gap-4">
        {apbData.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">Belum ada data APB Desa</p>
            </CardContent>
          </Card>
        ) : (
          apbData.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                    <div>
                      <p className="text-sm text-gray-500">Tahun</p>
                      <p className="font-semibold">{item.year}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Pendapatan Desa</p>
                      <p className="font-semibold">Rp {formatCurrency(item.pendapatanDesa)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Belanja Desa</p>
                      <p className="font-semibold">Rp {formatCurrency(item.belanjaDesa)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        item.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.isActive ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(item)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="w-3 h-3" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(item.id)}
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Hapus
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}