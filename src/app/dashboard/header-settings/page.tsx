"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "@/lib/navigation";
import type { Session } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, Plus, GripVertical } from "lucide-react";
import { UploadButton } from "@/lib/upload";

interface NavigationItem {
  id?: string;
  label: string;
  href: string;
  order: number;
  isActive: boolean;
}

interface HeaderSettings {
  id: string;
  logoUrl: string | null;
  navigationItems: NavigationItem[];
}

export default function HeaderSettingsPage() {
  const { data: session, status } = useSession() as { data: Session | null; status: string; };
  const router = useRouter();
  const [headerSettings, setHeaderSettings] = useState<HeaderSettings | null>(null);
  const [logoUrl, setLogoUrl] = useState("");
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([
    { label: "Beranda", href: "/", order: 1, isActive: true },
    { label: "Tentang", href: "/about", order: 2, isActive: true },
    { label: "Layanan", href: "/services", order: 3, isActive: true },
    { label: "Berita", href: "/news", order: 4, isActive: true },
    { label: "Galeri", href: "/galeri", order: 5, isActive: true },
    { label: "Kontak", href: "/contact", order: 6, isActive: true },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session || !session.user || session.user.role !== "ADMIN") {
      router.push("/");
      return;
    }

    fetchHeaderSettings();
  }, [session, status, router]);

  const fetchHeaderSettings = async () => {
    try {
      const response = await fetch("/api/header-settings");
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setHeaderSettings(data);
          setLogoUrl(data.logoUrl || "");
          if (data.navigationItems && data.navigationItems.length > 0) {
            setNavigationItems(data.navigationItems);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching header settings:", error);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/header-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          logoUrl: logoUrl || null,
          navigationItems: navigationItems.map((item, index) => ({
            ...item,
            order: index + 1
          }))
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setHeaderSettings(data);
        setMessage("Pengaturan header berhasil disimpan!");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Gagal menyimpan pengaturan header");
      }
    } catch (error) {
      setError("Terjadi kesalahan saat menyimpan pengaturan header");
    } finally {
      setIsLoading(false);
    }
  };

  const addNavigationItem = () => {
    setNavigationItems([...navigationItems, {
      label: "Menu Baru",
      href: "/new-page",
      order: navigationItems.length + 1,
      isActive: true
    }]);
  };

  const removeNavigationItem = (index: number) => {
    setNavigationItems(navigationItems.filter((_, i) => i !== index));
  };

  const updateNavigationItem = (index: number, field: keyof NavigationItem, value: string | boolean) => {
    const updated = [...navigationItems];
    updated[index] = { ...updated[index], [field]: value };
    setNavigationItems(updated);
  };

  const moveNavigationItem = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === navigationItems.length - 1)) {
      return;
    }

    const updated = [...navigationItems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
    setNavigationItems(updated);
  };

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Pengaturan Header
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Kelola logo dan menu navigasi untuk header website
          </p>
        </div>

        {message && (
          <Alert className="mb-6">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Logo Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-black dark:text-white">Logo Website</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Upload logo yang akan ditampilkan di header
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logoUrl" className="text-black dark:text-white">URL Logo</Label>
                <Input
                  id="logoUrl"
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="text-gray-900 dark:text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-black dark:text-white">Upload Logo Baru</Label>
                <UploadButton
                  endpoint="imageUploader"
                  onClientUploadComplete={(res) => {
                    if (res && res[0]) {
                      setLogoUrl(res[0].ufsUrl);
                      setMessage("Logo berhasil diupload!");
                    }
                  }}
                  onUploadError={(error: Error) => {
                    setError(`Upload error: ${error.message}`);
                  }}
                />
              </div>

              {logoUrl && (
                <div className="space-y-2">
                  <Label className="text-black dark:text-white">Preview Logo</Label>
                  <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                    <img
                      src={logoUrl}
                      alt="Logo Preview"
                      className="h-12 w-auto object-contain"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-black dark:text-white">
                Menu Navigasi
                <Button onClick={addNavigationItem} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Menu
                </Button>
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Kelola menu navigasi yang akan ditampilkan di header
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {navigationItems.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <GripVertical className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">Menu {index + 1}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => moveNavigationItem(index, 'up')}
                          disabled={index === 0}
                        >
                          ↑
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => moveNavigationItem(index, 'down')}
                          disabled={index === navigationItems.length - 1}
                        >
                          ↓
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeNavigationItem(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-black dark:text-white">Label Menu</Label>
                        <Input
                          value={item.label}
                          onChange={(e) => updateNavigationItem(index, 'label', e.target.value)}
                          placeholder="Nama menu"
                          className="text-gray-900 dark:text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-black dark:text-white">Link URL</Label>
                        <Input
                          value={item.href}
                          onChange={(e) => updateNavigationItem(index, 'href', e.target.value)}
                          placeholder="/halaman"
                          className="text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`active-${index}`}
                        checked={item.isActive}
                        onChange={(e) => updateNavigationItem(index, 'isActive', e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor={`active-${index}`} className="text-black dark:text-white">Aktif</Label>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isLoading} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
              {isLoading ? "Menyimpan..." : "Simpan Pengaturan"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}