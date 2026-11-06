"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/lib/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff } from "lucide-react";

export default function SetupPage() {
  const [setupToken, setSetupToken] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("admin@desasa.com");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [adminExists, setAdminExists] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if admin already exists
    checkAdminExists();
  }, []);

  const checkAdminExists = async () => {
    try {
      const response = await fetch("/api/admin/check");
      if (response.ok) {
        const data = await response.json();
        setAdminExists(data.exists);
      }
    } catch (error) {
      console.error("Error checking admin:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Password tidak cocok");
      setIsLoading(false);
      return;
    }

    if (password.length < 12) {
      setError("Password minimal 12 karakter");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/admin/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Setup-Token": setupToken,
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Admin berhasil dibuat! Anda akan diarahkan ke halaman login.");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(data.error || "Gagal membuat admin");
      }
    } catch (error) {
      setError("Terjadi kesalahan saat membuat admin");
    } finally {
      setIsLoading(false);
    }
  };

  if (adminExists) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Setup Selesai</CardTitle>
            <CardDescription className="text-center">
              Admin sudah ada dalam sistem
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Alert className="mb-4">
              <AlertDescription>
                Sistem sudah dikonfigurasi. Silakan login dengan akun admin yang ada.
              </AlertDescription>
            </Alert>
            <Button 
              onClick={() => router.push("/login")}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              Ke Halaman Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Setup Admin Desasa</CardTitle>
          <CardDescription className="text-center">
            Buat akun administrator untuk mengelola sistem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="setup-token">Token Setup</Label>
              <Input id="setup-token" type="password" value={setupToken} onChange={(e) => setSetupToken(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                type="text"
                placeholder="Administrator Desasa"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@desasa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={12}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={12}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-orange-600 hover:bg-orange-700"
              disabled={isLoading}
            >
              {isLoading ? "Membuat Admin..." : "Buat Admin"}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>Setelah setup selesai, Anda dapat login dengan kredensial ini.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}