import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Save, Eye } from 'lucide-react';
import { useSession } from '@/lib/auth-client';
import { apiErrorMessage } from '@/lib/api-error';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
type Fields = { visi: string; misi: string; tujuan: string };
type VillageInfo = Fields & { id: string; updatedAt: string };
const empty: Fields = { visi: '', misi: '', tujuan: '' };
const labels = { visi: 'Visi Desa', misi: 'Misi Desa', tujuan: 'Tujuan Desa' };
const keys = Object.keys(labels) as (keyof Fields)[];
const same = (a: Fields, b: Fields) => keys.every(key => a[key] === b[key]);
export default function VillageInfoPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const draftKey = session?.user.id ? `village-info-draft:${session.user.id}` : null;
  const [form, setForm] = useState<Fields>(empty);
  const [saved, setSaved] = useState<VillageInfo | null>(null);
  const [loading, setLoading] = useState(true), [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false), [hasDraft, setHasDraft] = useState(false);
  const clearDraft = () => { try { if (draftKey) sessionStorage.removeItem(draftKey); } catch { /* Storage can be disabled by the browser. */ } setHasDraft(false); };
  const load = useCallback(async () => {
    if (!draftKey) return;
    setLoading(true); setLoadFailed(false);
    try {
      const response = await fetch('/api/village-info', { cache: 'no-store' });
      const value = await response.json().catch(() => null);
      if (!response.ok) throw new Error(apiErrorMessage(response, value?.error, 'Gagal memuat informasi desa.'));
      setSaved(value); const fields: Fields = value ?? { ...empty };
      let restored: Fields | null = null;
      try { const draft = JSON.parse(sessionStorage.getItem(draftKey) ?? 'null'); if (draft && keys.every(key => typeof draft[key] === 'string')) restored = draft; } catch { /* Keep server data when local storage is unavailable. */ }
      if (restored && same(restored, fields)) { try { sessionStorage.removeItem(draftKey); } catch { /* The server already has these exact values. */ } }
      setForm(restored && !same(restored, fields) ? restored : fields);
      setHasDraft(!!restored && !same(restored, fields));
    } catch (error) { setLoadFailed(true); toast({ title: 'Data belum dapat dimuat', description: error instanceof Error ? error.message : 'Gagal memuat informasi desa.', variant: 'destructive' }); }
    finally { setLoading(false); }
  }, [draftKey, toast]);
  useEffect(() => { void load(); }, [load]);
  function change(key: keyof Fields, value: string) {
    setForm(current => { const next = { ...current, [key]: value }; try { if (draftKey) sessionStorage.setItem(draftKey, JSON.stringify(next)); } catch { /* Inputs still work without storage. */ } return next; });
    setHasDraft(true);
  }
  async function save() {
    if (saving || loading || loadFailed) return;
    const values = Object.fromEntries(keys.map(key => [key, form[key].trim()])) as Fields;
    const missing = keys.filter(key => !values[key]);
    if (missing.length) { toast({ title: 'Isian belum lengkap', description: `Isi kolom: ${missing.map(key => labels[key]).join(', ')}. Perubahan belum disimpan.`, variant: 'destructive' }); document.getElementById(missing[0])?.focus(); return; }
    setSaving(true);
    try {
      const response = await fetch('/api/village-info', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(apiErrorMessage(response, result?.error, 'Gagal menyimpan informasi desa. Isian Anda tetap ada.'));
      const check = await fetch('/api/village-info', { cache: 'no-store' });
      const verified = await check.json().catch(() => null);
      if (!check.ok || !verified || !same(values, verified)) throw new Error('Hasil penyimpanan belum dapat dikonfirmasi. Isian tetap ada; periksa kembali sebelum menutup halaman.');
      setForm(values); setSaved(verified); clearDraft();
      toast({ title: 'Berhasil disimpan', description: 'Visi, misi, dan tujuan sudah tersimpan dan diverifikasi. Gunakan Preview untuk memeriksa beranda.' });
    } catch (error) { toast({ title: 'Penyimpanan belum berhasil', description: error instanceof Error ? error.message : 'Terjadi kesalahan. Isian Anda tetap ada.', variant: 'destructive' }); }
    finally { setSaving(false); }
  }
  return <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-2xl font-bold">Kelola Visi, Misi & Tujuan Desa</h1><p className="mt-2 text-sm text-gray-500">Ketiga kolom wajib diisi. Klik Simpan dan tunggu konfirmasi berhasil sebelum memeriksa website.</p></div><div className="flex gap-2"><Button variant="outline" asChild><a href="/" target="_blank" rel="noopener noreferrer"><Eye className="h-4 w-4" />Preview</a></Button><Button disabled={saving || loading || loadFailed} onClick={() => void save()}><Save className="h-4 w-4" />{saving ? 'Menyimpan…' : 'Simpan'}</Button></div></div>
    {loading && <p role="status">Memuat informasi desa…</p>}
    {loadFailed && <Alert variant="destructive"><AlertDescription>Data tersimpan belum dapat dimuat. Penyimpanan dinonaktifkan sampai data berhasil dibaca.</AlertDescription><Button className="col-start-2 mt-3 justify-self-start" variant="outline" onClick={() => void load()}>Coba lagi</Button></Alert>}
    {hasDraft && <Alert role="status" className="border-blue-200 bg-blue-50"><AlertDescription>Isian belum tersimpan. Draf disimpan sementara pada tab ini agar dapat dipulihkan jika halaman dimuat ulang atau perlu login kembali.</AlertDescription><Button className="col-start-2 mt-2 justify-self-start" variant="outline" disabled={saving} onClick={() => { setForm(saved ?? { ...empty }); clearDraft(); }}>Gunakan data tersimpan</Button></Alert>}
    {!loading && keys.map(key => <Card key={key}><CardHeader><CardTitle>{labels[key]}</CardTitle></CardHeader><CardContent><Label htmlFor={key}>{labels[key]} (wajib)</Label><Textarea id={key} value={form[key]} onChange={event => change(key, event.target.value)} disabled={saving || loadFailed} rows={key === 'visi' ? 4 : 6} maxLength={500000} className="mt-2" placeholder={`Masukkan ${key} desa…`} /></CardContent></Card>)}
    {saved && <p className="text-xs text-gray-500">Terakhir disimpan {new Date(saved.updatedAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB · <Link to="/dashboard/homepage-settings" className="text-blue-600 underline">Periksa pengaturan tampil di beranda</Link></p>}
  </div>;
}
