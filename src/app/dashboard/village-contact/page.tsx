import { useEffect, useState, type FormEvent } from 'react';
import { Save, MapPin, Phone } from 'lucide-react';
import { defaultVillageContact, isGoogleMapEmbed, isGoogleMapLink, mapUrlFromInput, type VillageContact } from '@/lib/village-contact';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function VillageContactPage() {
  const [form, setForm] = useState<VillageContact>(defaultVillageContact);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    let mounted = true;
    fetch('/api/village-contact').then(async response => {
      const result = await response.json(); if (!response.ok) throw new Error('Gagal memuat peta dan kontak');
      if (mounted) setForm(result.data);
    }).catch(() => { if (mounted) setError('Gagal memuat peta dan kontak'); }).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);
  const change = (key: keyof VillageContact, value: string) => setForm(current => ({ ...current, [key]: value }));
  const preview = mapUrlFromInput(form.mapEmbedUrl);
  async function submit(event: FormEvent) {
    event.preventDefault(); if (saving) return;
    setError(''); setNotice('');
    if (!isGoogleMapEmbed(preview)) { setError('Gunakan URL atau kode sematan dari Google Maps.'); return; }
    if (!isGoogleMapLink(form.mapLink.trim())) { setError('Gunakan tautan Google Maps yang valid.'); return; }
    setSaving(true);
    try {
      const body = { ...form, mapEmbedUrl: preview, mapLink: form.mapLink.trim(), email: form.email.trim(), phone: form.phone.trim(), whatsapp: form.whatsapp.trim() };
      const response = await fetch('/api/village-contact', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Gagal menyimpan');
      setForm(result.data); setNotice('Peta dan kontak berhasil disimpan. Perubahan tampil di beranda dan halaman Kontak.');
    } catch (error) { setError(error instanceof Error ? error.message : 'Gagal menyimpan'); }
    finally { setSaving(false); }
  }
  return <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
    <div><h1 className="text-2xl font-bold">Peta & Kontak</h1><p className="mt-1 text-sm text-gray-500">Atur lokasi kantor dan cara warga menghubungi pemerintah desa.</p></div>
    {notice && <Alert role="status" className="border-green-200 bg-green-50 text-green-800"><AlertDescription>{notice}</AlertDescription></Alert>}
    {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
    {loading ? <p>Memuat peta dan kontak...</p> : <form onSubmit={submit} className="space-y-6">
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" />Lokasi kantor</CardTitle><CardDescription>Isi alamat dan sematan peta untuk warga.</CardDescription></CardHeader><CardContent className="space-y-4">
          <div className="space-y-2"><Label htmlFor="contact-office">Nama kantor</Label><Input id="contact-office" value={form.officeName} required maxLength={200} onChange={event => change('officeName', event.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="contact-address">Alamat</Label><Textarea id="contact-address" value={form.address} required maxLength={1000} rows={3} onChange={event => change('address', event.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="contact-map">Sematan Google Maps</Label><Textarea id="contact-map" value={form.mapEmbedUrl} maxLength={16000} rows={4} onChange={event => change('mapEmbedUrl', event.target.value)} />
            <p className="text-xs text-gray-500">Google Maps → Bagikan → Sematkan peta. Tempel URL sematan atau kode iframe di sini. Kosongkan jika peta tidak ingin ditampilkan.</p></div>
          <div className="space-y-2"><Label htmlFor="contact-map-link">Tautan Google Maps (opsional)</Label><Input id="contact-map-link" value={form.mapLink} placeholder="https://maps.app.goo.gl/..." maxLength={4000} onChange={event => change('mapLink', event.target.value)} /></div>
          {preview && isGoogleMapEmbed(preview) && <div className="overflow-hidden rounded-lg border"><iframe title="Pratinjau peta kantor" src={preview} loading="lazy" className="h-64 w-full border-0" referrerPolicy="no-referrer-when-downgrade" /></div>}
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Phone className="h-5 w-5" />Kontak & layanan</CardTitle><CardDescription>Kontak ini tampil untuk publik di website.</CardDescription></CardHeader><CardContent className="space-y-4">
          <div className="space-y-2"><Label htmlFor="contact-hours">Jam layanan</Label><Textarea id="contact-hours" value={form.openingHours} rows={3} maxLength={500} placeholder="Senin - Jumat, 08.00 - 16.00 WITA" onChange={event => change('openingHours', event.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="contact-phone">Nomor telepon (opsional)</Label><Input id="contact-phone" type="tel" value={form.phone} maxLength={40} placeholder="+62..." onChange={event => change('phone', event.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="contact-whatsapp">WhatsApp (opsional)</Label><Input id="contact-whatsapp" type="tel" value={form.whatsapp} maxLength={40} placeholder="62812..." onChange={event => change('whatsapp', event.target.value)} /><p className="text-xs text-gray-500">Gunakan kode negara, misalnya 62812...</p></div>
          <div className="space-y-2"><Label htmlFor="contact-email">Email (opsional)</Label><Input id="contact-email" type="email" value={form.email} maxLength={254} placeholder="kantor@desa.id" onChange={event => change('email', event.target.value)} /></div>
          <a href="/contact" target="_blank" rel="noopener noreferrer" className="inline-block text-sm text-blue-600 hover:underline">Lihat halaman Kontak</a>
        </CardContent></Card>
      </div>
      <div className="flex justify-end"><Button type="submit" disabled={saving}><Save className="h-4 w-4" />{saving ? 'Menyimpan...' : 'Simpan Peta & Kontak'}</Button></div>
    </form>}
  </div>;
}
