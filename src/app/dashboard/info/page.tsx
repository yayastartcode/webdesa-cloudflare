"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { UploadButton } from "@/lib/upload";

interface InfoPage {
  id: string;
  title: string;
  slug: string;
  pdfUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  title: string;
  slug: string;
  pdfUrl: string;
}

export default function InfoDashboard() {
  const [infos, setInfos] = useState<InfoPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInfo, setEditingInfo] = useState<InfoPage | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    slug: "",
    pdfUrl: "",
  });

  const fetchInfos = async () => {
    try {
      const response = await fetch("/api/info");
      const data = await response.json();
      if (response.ok) {
        setInfos(data.infos);
      } else {
        setError(data.error || "Gagal memuat data");
      }
    } catch (error) {
      setError("Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInfos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const url = editingInfo ? `/api/info/manage/${editingInfo.id}` : "/api/info";
      const method = editingInfo ? "PATCH" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setFormData({ title: "", slug: "", pdfUrl: "" });
        setIsDialogOpen(false);
        setEditingInfo(null);
        fetchInfos();
      } else {
        setError(data.error || "Terjadi kesalahan");
      }
    } catch (error) {
      setError("Terjadi kesalahan saat menyimpan data");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (info: InfoPage) => {
    setEditingInfo(info);
    setFormData({
      title: info.title,
      slug: info.slug,
      pdfUrl: info.pdfUrl,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus halaman info ini?")) {
      return;
    }

    try {
      const response = await fetch(`/api/info/manage/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        fetchInfos();
      } else {
        setError(data.error || "Gagal menghapus data");
      }
    } catch (error) {
      setError("Terjadi kesalahan saat menghapus data");
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/info/manage/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        fetchInfos();
      } else {
        setError(data.error || "Gagal mengubah status");
      }
    } catch (error) {
      setError("Terjadi kesalahan saat mengubah status");
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }));
  };

  const resetForm = () => {
    setFormData({ title: "", slug: "", pdfUrl: "" });
    setEditingInfo(null);
    setError("");
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Memuat data...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Kelola Halaman Info</h1>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>Tambah Halaman Info</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingInfo ? "Edit Halaman Info" : "Tambah Halaman Info"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Judul</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Masukkan judul halaman"
                  required
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="slug-halaman"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  URL: /info/{formData.slug}
                </p>
              </div>
              <div>
                <Label htmlFor="pdfUrl">File PDF</Label>
                {formData.pdfUrl ? (
                  <div className="space-y-2">
                    <div className="p-2 bg-green-50 border border-green-200 rounded">
                      <p className="text-sm text-green-700">File PDF telah dipilih</p>
                      <a 
                        href={formData.pdfUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Lihat file
                      </a>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, pdfUrl: "" }))}
                    >
                      Ganti File
                    </Button>
                  </div>
                ) : (
                  <UploadButton
                    endpoint="pdfUploader"
                    onClientUploadComplete={(res) => {
                      if (res?.[0]?.url) {
                        setFormData(prev => ({ ...prev, pdfUrl: res[0].url }));
                      }
                    }}
                    onUploadError={(error: Error) => {
                      setError(`Upload error: ${error.message}`);
                    }}
                  />
                )}
              </div>
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <p className="text-red-700">{error}</p>
                </Alert>
              )}
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting || !formData.pdfUrl}>
                  {submitting ? "Menyimpan..." : editingInfo ? "Update" : "Simpan"}
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

      {message && (
        <Alert className="mb-4 border-green-200 bg-green-50">
          <p className="text-green-700">{message}</p>
        </Alert>
      )}

      {error && !isDialogOpen && (
        <Alert className="mb-4 border-red-200 bg-red-50">
          <p className="text-red-700">{error}</p>
        </Alert>
      )}

      <div className="grid gap-4">
        {infos.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-gray-500">Belum ada halaman info yang dibuat.</p>
          </Card>
        ) : (
          infos.map((info) => (
            <Card key={info.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{info.title}</h3>
                    <Badge variant={info.isActive ? "default" : "secondary"}>
                      {info.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    Slug: <span className="font-mono">{info.slug}</span>
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    URL: <a 
                      href={`/info/${info.slug}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      /info/{info.slug}
                    </a>
                  </p>
                  <p className="text-xs text-gray-500">
                    Dibuat: {format(new Date(info.createdAt), "dd MMMM yyyy HH:mm", { locale: id })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleStatus(info.id, info.isActive)}
                  >
                    {info.isActive ? "Nonaktifkan" : "Aktifkan"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(info)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(info.id)}
                  >
                    Hapus
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}