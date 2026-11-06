"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UploadButton } from "@/lib/upload";
import { Trash2, Edit, Eye, Plus } from "lucide-react";
import Image from "@/components/image";

interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  category?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  order: number;
}

export default function GalleryManagement() {
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    imageUrl: "",
    category: "",
    order: 0,
  });

  const fetchGalleries = async () => {
    try {
      const response = await fetch("/api/gallery");
      const data = await response.json();
      if (response.ok) {
        setGalleries(data.galleries);
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Error fetching galleries:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleries();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.imageUrl) {
      alert("Title dan gambar wajib diisi!");
      return;
    }

    setSubmitting(true);
    try {
      const url = editingItem ? `/api/gallery/${editingItem.id}` : "/api/gallery";
      const method = editingItem ? "PATCH" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchGalleries();
        resetForm();
        setIsDialogOpen(false);
        alert(editingItem ? "Item galeri berhasil diperbarui!" : "Item galeri berhasil ditambahkan!");
      } else {
        const error = await response.json();
        alert(error.error || "Terjadi kesalahan");
      }
    } catch (error) {
      console.error("Error submitting gallery:", error);
      alert("Terjadi kesalahan saat menyimpan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: GalleryItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || "",
      imageUrl: item.imageUrl,
      category: item.category || "",
      order: item.order,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus item ini?")) return;

    try {
      const response = await fetch(`/api/gallery/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchGalleries();
        alert("Item galeri berhasil dihapus!");
      } else {
        const error = await response.json();
        alert(error.error || "Terjadi kesalahan");
      }
    } catch (error) {
      console.error("Error deleting gallery:", error);
      alert("Terjadi kesalahan saat menghapus");
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/gallery/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        await fetchGalleries();
      }
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      imageUrl: "",
      category: "",
      order: 0,
    });
    setEditingItem(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Memuat...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Kelola Galeri Kegiatan</h1>
          <p className="text-gray-600 mt-2">Kelola foto-foto kegiatan desa</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Edit Item Galeri" : "Tambah Item Galeri"}
              </DialogTitle>
              <DialogDescription>
                {editingItem ? "Perbarui informasi item galeri" : "Tambahkan item baru ke galeri kegiatan"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Judul *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Masukkan judul kegiatan"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Deskripsi</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Masukkan deskripsi kegiatan (opsional)"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Kategori</label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Masukkan kategori (contoh: Sosial, Budaya, Olahraga)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Urutan</label>
                <Input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  placeholder="Urutan tampil (0 = paling awal)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Gambar *</label>
                {formData.imageUrl && (
                  <div className="mb-4">
                    <Image
                      src={formData.imageUrl}
                      alt="Preview"
                      width={200}
                      height={150}
                      className="rounded-lg object-cover"
                    />
                  </div>
                )}
                <UploadButton
                  endpoint="imageUploader"
                  onClientUploadComplete={(res) => {
                    if (res?.[0]) {
                      setFormData({ ...formData, imageUrl: res[0].url });
                    }
                  }}
                  onUploadError={(error: Error) => {
                    alert(`Upload error: ${error.message}`);
                  }}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Menyimpan..." : editingItem ? "Perbarui" : "Simpan"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Batal
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Item Galeri</CardTitle>
          <CardDescription>
            Total: {galleries.length} item
          </CardDescription>
        </CardHeader>
        <CardContent>
          {galleries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Belum ada item galeri. Tambahkan item pertama!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {galleries.map((item) => (
                <div key={item.id} className="border rounded-lg overflow-hidden">
                  <div className="relative h-48">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 text-xs rounded ${item.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                        {item.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                    {item.description && (
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">{item.description}</p>
                    )}
                    {item.category && (
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mb-2">
                        {item.category}
                      </span>
                    )}
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={item.isActive ? "secondary" : "default"}
                        onClick={() => toggleStatus(item.id, item.isActive)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}