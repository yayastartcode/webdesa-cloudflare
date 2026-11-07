"use client";
import { ImageUploadField } from '@/components/ui/image-upload-field';
import { usePendingUploads } from '@/lib/upload';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash2, Edit, Eye, Plus, ImagePlus, Images, CheckCircle2 } from "lucide-react";
import Image from "@/components/image";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const { isUploading, onUploadStateChange } = usePendingUploads();
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
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
      } else {
        throw new Error(data.error || "Gagal memuat galeri.");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Gagal memuat galeri.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleries();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading || submitting) return;
    if (!formData.title.trim() || !formData.imageUrl) {
      setError("Isi judul kegiatan dan unggah foto terlebih dahulu.");
      return;
    }

    setSubmitting(true);
    setError("");
    setNotice("");
    try {
      const url = editingItem ? `/api/gallery/${editingItem.id}` : "/api/gallery";
      const method = editingItem ? "PATCH" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, title: formData.title.trim(), category: formData.category.trim() }),
      });

      if (response.ok) {
        await fetchGalleries();
        resetForm();
        setIsDialogOpen(false);
        setNotice(editingItem ? "Galeri berhasil diperbarui." : "Galeri berhasil ditambahkan dan ditampilkan di website.");
      } else {
        const result = await response.json();
        setError(result.error || "Terjadi kesalahan. Silakan coba lagi.");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: GalleryItem) => {
    setError("");
    setNotice("");
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

    setError(""); setNotice("");
    try {
      const response = await fetch(`/api/gallery/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchGalleries();
        setNotice("Item galeri berhasil dihapus.");
      } else {
        const result = await response.json();
        setError(result.error || "Terjadi kesalahan. Silakan coba lagi.");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Terjadi kesalahan saat menghapus.");
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    setError(""); setNotice("");
    try {
      const response = await fetch(`/api/gallery/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        await fetchGalleries();
        setNotice("Status galeri diperbarui.");
      } else {
        const result = await response.json();
        setError(result.error || "Gagal memperbarui status.");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Gagal memperbarui status.");
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
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Kelola Galeri Kegiatan</h1>
          <p className="mt-1 text-sm text-gray-500">Bagikan foto dan cerita kegiatan desa kepada warga.</p>
        </div>
        <Button onClick={() => { resetForm(); setError(""); setNotice(""); setIsDialogOpen(true); }}>
          <Plus className="h-4 w-4" />Tambah Galeri
        </Button>
      </div>
      {notice && <Alert role="status" className="border-green-200 bg-green-50 text-green-800"><CheckCircle2 className="h-4 w-4" /><AlertDescription>{notice}</AlertDescription></Alert>}
      {error && !isDialogOpen && <Alert variant="destructive" role="alert"><AlertDescription>{error}</AlertDescription></Alert>}
      <Dialog open={isDialogOpen} onOpenChange={open => { if (!isUploading && !submitting) setIsDialogOpen(open); }}>
        <DialogContent aria-labelledby="gallery-dialog-title" aria-describedby="gallery-dialog-description" className="flex max-h-[90dvh] max-w-4xl flex-col overflow-hidden">
          <DialogHeader className="shrink-0 border-b px-5 py-5 pr-12 text-left sm:px-6">
            <DialogTitle><span id="gallery-dialog-title">{editingItem ? "Edit Galeri Kegiatan" : "Tambah Galeri Kegiatan"}</span></DialogTitle>
            <DialogDescription><span id="gallery-dialog-description">Unggah satu foto, lalu lengkapi informasi kegiatannya.</span></DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex min-h-0 flex-col">
            <div className="min-h-0 space-y-5 overflow-y-auto p-5 sm:p-6">
              <div className="grid items-start gap-6 md:grid-cols-2">
                <section aria-labelledby="gallery-photo-heading" className="min-w-0 space-y-4 rounded-xl bg-gray-50 p-4 dark:bg-gray-900">
                  <div className="flex items-start gap-3">
                    <span className="rounded-lg bg-orange-100 p-2 text-orange-700"><ImagePlus className="h-5 w-5" /></span>
                    <div><h2 id="gallery-photo-heading" className="font-semibold">Foto kegiatan</h2><p className="mt-1 text-sm text-gray-500">Pilih foto yang jelas dan mewakili kegiatan.</p></div>
                  </div>
                  <ImageUploadField label="Gambar galeri" required value={formData.imageUrl} disabled={submitting}
                    previewClassName="aspect-[4/3] max-h-72 w-full rounded-lg border bg-white object-contain dark:bg-gray-800"
                    onChange={url => setFormData(current => ({ ...current, imageUrl: url }))}
                    onUploadStateChange={onUploadStateChange} />
                  {!formData.imageUrl && <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 text-center text-gray-400 dark:border-gray-700"><Images className="h-9 w-9" /><p className="text-sm">Pratinjau foto akan muncul di sini</p></div>}
                  <p className="text-xs leading-relaxed text-gray-500">Satu foto untuk setiap item galeri. Anda dapat menambah item lain untuk foto kegiatan berikutnya.</p>
                </section>
                <fieldset disabled={submitting} className="min-w-0 space-y-5">
                  <legend className="mb-4 font-semibold">Informasi kegiatan</legend>
                  <div className="space-y-2"><Label htmlFor="gallery-title">Judul kegiatan <span aria-hidden="true">*</span></Label>
                    <Input id="gallery-title" value={formData.title} onChange={e => setFormData(current => ({ ...current, title: e.target.value }))} placeholder="Contoh: Kerja bakti membersihkan desa" required maxLength={500} />
                  </div>
                  <div className="space-y-2"><Label htmlFor="gallery-description">Deskripsi (opsional)</Label>
                    <Textarea id="gallery-description" value={formData.description} onChange={e => setFormData(current => ({ ...current, description: e.target.value }))} placeholder="Ceritakan kegiatan, waktu, atau peserta yang terlibat." rows={4} maxLength={4000} />
                    <p className="text-xs text-gray-500">Keterangan ini akan ditampilkan bersama foto.</p>
                  </div>
                  <div className="space-y-2"><Label htmlFor="gallery-category">Kategori (opsional)</Label>
                    <Input id="gallery-category" list="gallery-categories" value={formData.category} onChange={e => setFormData(current => ({ ...current, category: e.target.value }))} placeholder="Contoh: Sosial, Budaya, Olahraga" maxLength={4000} />
                    <datalist id="gallery-categories">{categories.map(category => <option key={category} value={category} />)}</datalist>
                    <p className="text-xs text-gray-500">Pilih kategori yang sudah ada atau ketik kategori baru.</p>
                  </div>
                  <div className="space-y-2"><Label htmlFor="gallery-order">Urutan tampil</Label>
                    <Input id="gallery-order" type="number" min={0} max={10000} step={1} value={formData.order} onChange={e => setFormData(current => ({ ...current, order: Number(e.target.value) }))} className="max-w-32" required aria-describedby="gallery-order-help" />
                    <p id="gallery-order-help" className="text-xs text-gray-500">Angka lebih kecil tampil lebih awal. Gunakan 0 untuk urutan pertama.</p>
                  </div>
                </fieldset>
              </div>
              {error && <Alert variant="destructive" role="alert"><AlertDescription>{error}</AlertDescription></Alert>}
            </div>
            <div className="flex shrink-0 flex-col gap-3 border-t bg-white p-4 dark:bg-gray-800 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p role="status" className="text-xs text-gray-500">{isUploading ? "Mengunggah foto, mohon tunggu…" : "* Wajib diisi"}</p>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" disabled={isUploading || submitting} onClick={() => setIsDialogOpen(false)}>Batal</Button>
                <Button type="submit" disabled={submitting || isUploading}>{isUploading ? "Menunggu upload…" : submitting ? "Menyimpan…" : editingItem ? "Simpan Perubahan" : "Simpan Galeri"}</Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

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
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        aria-label={`Edit ${item.title}`}
                          onClick={() => handleEdit(item)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        aria-label={`${item.isActive ? "Nonaktifkan" : "Aktifkan"} ${item.title}`}
                        variant={item.isActive ? "secondary" : "default"}
                        onClick={() => toggleStatus(item.id, item.isActive)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        aria-label={`Hapus ${item.title}`}
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