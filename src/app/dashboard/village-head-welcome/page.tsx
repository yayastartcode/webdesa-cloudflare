"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/lib/navigation";
import { lazy } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Dynamically import the markdown editor to avoid SSR issues
const MDEditor = lazy(
  () => import("@uiw/react-md-editor")
);

// Remove the incorrect Markdown import - @uiw/react-md-editor doesn't export Markdown component

interface VillageHeadWelcome {
  id?: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function VillageHeadWelcomePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [welcome, setWelcome] = useState<VillageHeadWelcome>({ content: "" });
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchWelcome();
  }, []);

  const fetchWelcome = async () => {
    try {
      const response = await fetch("/api/village-head-welcome");
      const data = await response.json();
      
      if (data.success) {
        setWelcome(data.data);
        setContent(data.data.content || "");
      }
    } catch (error) {
      console.error("Error fetching welcome:", error);
      toast({
        title: "Error",
        description: "Gagal memuat sambutan kepala desa",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Konten sambutan tidak boleh kosong",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/village-head-welcome", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      const data = await response.json();

      if (data.success) {
        setWelcome(data.data);
        toast({
          title: "Berhasil",
          description: "Sambutan kepala desa berhasil disimpan"
        });
      } else {
        throw new Error(data.error || "Failed to save");
      }
    } catch (error) {
      console.error("Error saving welcome:", error);
      toast({
        title: "Error",
        description: "Gagal menyimpan sambutan kepala desa",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Memuat sambutan kepala desa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Kembali ke Dashboard</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Kelola Sambutan Kepala Desa
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Edit sambutan kepala desa yang akan ditampilkan di halaman utama
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center space-x-2"
            >
              <Eye className="h-4 w-4" />
              <span>{showPreview ? "Edit" : "Preview"}</span>
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? "Menyimpan..." : "Simpan"}</span>
            </Button>
          </div>
        </div>

        {/* Editor */}
        <Card>
          <CardHeader>
            <CardTitle>Sambutan Kepala Desa</CardTitle>
            <CardDescription>
              Gunakan editor di bawah ini untuk menulis sambutan kepala desa. 
              Anda dapat menggunakan format Markdown untuk styling teks.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {showPreview ? (
                <MDEditor
                  value={content}
                  onChange={(val) => setContent(val || "")}
                  preview="preview"
                  height={400}
                  data-color-mode="light"
                  visibleDragbar={false}
                />
              ) : (
                <MDEditor
                  value={content}
                  onChange={(val) => setContent(val || "")}
                  preview="edit"
                  height={400}
                  data-color-mode="light"
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Current Content Info */}
        {welcome.updatedAt && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Informasi Konten</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600 dark:text-gray-400">Terakhir diperbarui:</span>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(welcome.updatedAt).toLocaleString("id-ID")}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-600 dark:text-gray-400">Jumlah karakter:</span>
                  <p className="text-gray-900 dark:text-white">
                    {content.length} karakter
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}