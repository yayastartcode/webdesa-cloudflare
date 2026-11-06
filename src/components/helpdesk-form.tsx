"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, MessageSquare, AlertCircle, CheckCircle } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";

interface HelpdeskFormData {
  nama: string;
  nomorWhatsapp: string;
  kategoriPengaduan: string;
  pesanPengaduan: string;
}

const HelpdeskForm = () => {
  const [formData, setFormData] = useState<HelpdeskFormData>({
    nama: "",
    nomorWhatsapp: "",
    kategoriPengaduan: "",
    pesanPengaduan: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [recaptchaValue, setRecaptchaValue] = useState<string | null>(null);
  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
  const isRecaptchaEnabled = recaptchaSiteKey && recaptchaSiteKey !== 'your-recaptcha-site-key-here';

  const handleInputChange = (field: keyof HelpdeskFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate reCAPTCHA (only if enabled)
    if (isRecaptchaEnabled && !recaptchaValue) {
      alert("Silakan verifikasi reCAPTCHA terlebih dahulu");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const response = await fetch("/api/helpdesk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          recaptchaToken: isRecaptchaEnabled ? recaptchaValue : 'development-mode'
        }),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setFormData({
          nama: "",
          nomorWhatsapp: "",
          kategoriPengaduan: "",
          pesanPengaduan: ""
        });
        setRecaptchaValue(null);
        // Reset reCAPTCHA
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
        }
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.nama && formData.nomorWhatsapp && formData.kategoriPengaduan && formData.pesanPengaduan && (isRecaptchaEnabled ? recaptchaValue : true);

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Helpdesk Desa
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Sampaikan keluhan, saran, atau pertanyaan Anda kepada kami. Tim helpdesk desa siap membantu menyelesaikan permasalahan Anda.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-red-600" />
                Form Pengaduan
              </CardTitle>
              <CardDescription>
                Isi formulir di bawah ini untuk menyampaikan pengaduan atau pertanyaan Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submitStatus === "success" && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  <span>Pengaduan Anda berhasil dikirim. Tim kami akan segera menindaklanjuti.</span>
                </div>
              )}

              {submitStatus === "error" && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800">
                  <AlertCircle className="h-5 w-5" />
                  <span>Terjadi kesalahan saat mengirim pengaduan. Silakan coba lagi.</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="nama">Nama Lengkap *</Label>
                  <Input
                    id="nama"
                    type="text"
                    placeholder="Masukkan nama lengkap Anda"
                    value={formData.nama}
                    onChange={(e) => handleInputChange("nama", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nomorWhatsapp" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Nomor WhatsApp *
                  </Label>
                  <Input
                    id="nomorWhatsapp"
                    type="tel"
                    placeholder="Contoh: 08123456789"
                    value={formData.nomorWhatsapp}
                    onChange={(e) => handleInputChange("nomorWhatsapp", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kategoriPengaduan">Kategori Pengaduan *</Label>
                  <Select
                    value={formData.kategoriPengaduan}
                    onValueChange={(value) => handleInputChange("kategoriPengaduan", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori pengaduan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="umum">Umum</SelectItem>
                      <SelectItem value="kesehatan">Kesehatan</SelectItem>
                      <SelectItem value="keamanan">Keamanan</SelectItem>
                      <SelectItem value="kebersihan">Kebersihan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pesanPengaduan">Pesan Pengaduan *</Label>
                  <Textarea
                    id="pesanPengaduan"
                    placeholder="Jelaskan detail pengaduan atau pertanyaan Anda..."
                    value={formData.pesanPengaduan}
                    onChange={(e) => handleInputChange("pesanPengaduan", e.target.value)}
                    rows={5}
                    required
                  />
                </div>

                {/* reCAPTCHA */}
                {isRecaptchaEnabled ? (
                  <div className="flex justify-center">
                    <ReCAPTCHA
                      ref={recaptchaRef}
                      sitekey={recaptchaSiteKey!}
                      onChange={setRecaptchaValue}
                      onExpired={() => setRecaptchaValue(null)}
                    />
                  </div>
                ) : (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800">
                      <strong>Mode Pengembangan:</strong> reCAPTCHA tidak dikonfigurasi. 
                      Untuk produksi, silakan tambahkan kunci reCAPTCHA di file .env.local
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={!isFormValid || isSubmitting}
                >
                  {isSubmitting ? "Mengirim..." : "Kirim Pengaduan"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default HelpdeskForm;