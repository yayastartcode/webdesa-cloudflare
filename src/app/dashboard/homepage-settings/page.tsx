import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ExternalLink, LockKeyhole, Save } from 'lucide-react';
import { defaultHomeSections, homeSectionOptions, type HomeSections } from '@/lib/home-sections';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function HomepageSettingsPage() {
  const [sections, setSections] = useState<HomeSections>(defaultHomeSections);
  const [saved, setSaved] = useState<HomeSections | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/homepage-settings');
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Gagal memuat pengaturan.');
      setSections(result.data.sections); setSaved(result.data.sections);
    } catch (error) { setError(error instanceof Error ? error.message : 'Gagal memuat pengaturan.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const dirty = saved !== null && JSON.stringify(sections) !== JSON.stringify(saved);
  const selected = Object.values(sections).filter(Boolean).length;
  async function save(event: FormEvent) {
    event.preventDefault();
    if (loading || saving || !saved || !dirty) return;
    setSaving(true); setError(''); setNotice('');
    try {
      const response = await fetch('/api/homepage-settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sections }) });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Gagal menyimpan pengaturan.');
      setSaved({ ...sections }); setNotice('Tampilan beranda berhasil disimpan.');
    } catch (error) { setError(error instanceof Error ? error.message : 'Gagal menyimpan pengaturan.'); }
    finally { setSaving(false); }
  }
  return <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><h1 className="text-2xl font-bold">Tampilan Beranda</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-500">Centang bagian yang ingin ditampilkan di beranda. Konten tersimpan dan halaman detail tetap tersedia saat section disembunyikan.</p></div>
      <a href="/" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-lg border bg-white px-3 text-sm dark:bg-gray-800"><ExternalLink className="h-4 w-4" />Lihat beranda</a>
    </div>
    {notice && <Alert role="status" className="border-green-200 bg-green-50 text-green-800"><CheckCircle2 className="h-4 w-4" /><AlertDescription>{notice}</AlertDescription></Alert>}
    {error && <Alert variant="destructive" role="alert"><AlertDescription>{error}</AlertDescription>{!saved && <Button type="button" variant="outline" className="mt-3" disabled={loading} onClick={() => void load()}>Coba lagi</Button>}</Alert>}
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><LockKeyhole className="h-5 w-5 text-orange-600" />Bagian utama</CardTitle><CardDescription>Selalu ditampilkan untuk menjaga identitas dan akses utama website.</CardDescription></CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-3">{[
        ['Header & navigasi', 'Identitas desa dan akses ke halaman website.'],
        ['Hero utama', 'Sambutan pertama dan judul utama beranda.'],
        ['Footer', 'Identitas penutup website.'],
      ].map(([label, description]) => <label key={label} className="flex items-start gap-3 rounded-lg border bg-gray-50 p-4 dark:bg-gray-900"><input type="checkbox" aria-label={label} checked disabled readOnly className="mt-1 h-4 w-4 shrink-0" /><span><span className="block text-sm font-medium">{label}</span><span className="mt-1 block text-xs leading-relaxed text-gray-500">{description}</span><span className="mt-2 block text-xs font-medium text-orange-700 dark:text-orange-400">Selalu tampil</span></span></label>)}</CardContent>
    </Card>
    <form onSubmit={save} className="space-y-5">
      <fieldset disabled={loading || saving || !saved} className="min-w-0 space-y-4">
        <legend className="mb-2 text-lg font-semibold">Section yang dapat diatur</legend>
        <p className="text-sm text-gray-500">{loading ? 'Memuat pengaturan…' : `${selected} dari ${homeSectionOptions.length} section diaktifkan.`} Bagian yang memerlukan data tetap tersembunyi sampai datanya tersedia.</p>
        <div className="grid gap-3 md:grid-cols-2">{homeSectionOptions.map(option => <div key={option.key} className={`rounded-xl border p-4 ${sections[option.key] ? 'border-orange-200 bg-orange-50/40 dark:border-orange-900 dark:bg-orange-950/20' : 'bg-white dark:bg-gray-800'}`}>
          <label className="flex cursor-pointer items-start gap-3"><input type="checkbox" aria-label={`Tampilkan ${option.label}`} aria-describedby={`section-${option.key}-description`} checked={sections[option.key]} onChange={event => { setSections(current => ({ ...current, [option.key]: event.target.checked })); setNotice(''); }} className="mt-1 h-5 w-5 shrink-0 accent-orange-600" />
            <span className="min-w-0"><span className="block font-medium">{option.label}</span><span id={`section-${option.key}-description`} className="mt-1 block text-sm leading-relaxed text-gray-500">{option.description}</span></span>
          </label>
          <div className="ml-8 mt-3 flex flex-wrap items-center justify-between gap-2 text-xs"><span className={sections[option.key] ? 'font-medium text-green-700 dark:text-green-400' : 'text-gray-500'}>{sections[option.key] ? 'Diaktifkan' : 'Disembunyikan'}</span><Link to={option.href} className="font-medium text-blue-600 hover:underline">Kelola konten</Link></div>
        </div>)}</div>
      </fieldset>
      <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-4 shadow-sm dark:bg-gray-900">
        <p role="status" className="text-sm text-gray-500">{dirty ? 'Perubahan belum disimpan' : 'Simpan untuk menerapkan perubahan ke beranda.'}</p>
        <div className="flex flex-wrap gap-2"><Button type="button" variant="outline" disabled={loading || saving || !saved} onClick={() => { setSections({ ...defaultHomeSections }); setNotice(''); }}>Pulihkan bawaan</Button><Button type="submit" disabled={loading || saving || !saved || !dirty}><Save className="h-4 w-4" />{saving ? 'Menyimpan…' : 'Simpan Tampilan'}</Button></div>
      </div>
    </form>
  </div>;
}
