import { useEffect, useState, type FormEvent } from 'react';
import { FileImage, FileText, Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import { UploadButton, usePendingUploads } from '@/lib/upload';
import type { InfoRecord } from '@/lib/info';

type Form = { title: string; slug: string; description: string; pdfUrl: string; imageUrl: string; isActive: boolean };
const blank: Form = { title: '', slug: '', description: '', pdfUrl: '', imageUrl: '', isActive: true };
const slugify = (value: string) => value.normalize('NFKD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export default function InfoDashboard() {
  const [infos, setInfos] = useState<InfoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<InfoRecord | null>(null);
  const [form, setForm] = useState<Form>(blank);
  const [fileType, setFileType] = useState<'pdf' | 'image'>('pdf');
  const [slugEdited, setSlugEdited] = useState(false);
  const { isUploading, onUploadStateChange } = usePendingUploads();

  async function loadInfos() {
    try {
      const response = await fetch('/api/info?admin=true&limit=100');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal memuat info');
      setInfos(data.infos);
    } catch (error) { setError(error instanceof Error ? error.message : 'Gagal memuat info'); }
    finally { setLoading(false); }
  }
  useEffect(() => { void loadInfos(); }, []);

  function edit(info?: InfoRecord) {
    setEditing(info ?? null); setError(''); setNotice('');
    setForm(info ? { title: info.title, slug: info.slug, description: info.description ?? '', pdfUrl: info.pdfUrl ?? '', imageUrl: info.imageUrl ?? '', isActive: info.isActive } : { ...blank });
    setFileType(info?.imageUrl ? 'image' : 'pdf'); setSlugEdited(!!info); setOpen(true);
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (isUploading || submitting) return;
    if (!form.pdfUrl && !form.imageUrl) { setError('Unggah PDF atau gambar terlebih dahulu.'); return; }
    setSubmitting(true); setError('');
    try {
      const response = await fetch(editing ? `/api/info/manage/${editing.id}` : '/api/info', {
        method: editing ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal menyimpan info');
      setNotice('Info berhasil disimpan.'); setOpen(false); await loadInfos();
    } catch (error) { setError(error instanceof Error ? error.message : 'Gagal menyimpan info'); }
    finally { setSubmitting(false); }
  }
  async function mutate(info: InfoRecord, remove = false) {
    if (remove && !window.confirm(`Hapus info “${info.title}”?`)) return;
    setError(''); setNotice('');
    try {
      const response = await fetch(`/api/info/manage/${info.id}`, {
        method: remove ? 'DELETE' : 'PATCH', headers: { 'Content-Type': 'application/json' },
        ...(remove ? {} : { body: JSON.stringify({ isActive: !info.isActive }) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal memperbarui info');
      setNotice(remove ? 'Info dihapus.' : 'Status info diperbarui.'); await loadInfos();
    } catch (error) { setError(error instanceof Error ? error.message : 'Gagal memperbarui info'); }
  }
  return <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div><h1 className="text-2xl font-bold">Kelola Halaman Info</h1><p className="mt-1 text-sm text-gray-500">Bagikan dokumen, poster, atau pengumuman desa.</p></div>
      <Button onClick={() => edit()}><Plus className="h-4 w-4" />Tambah Halaman Info</Button>
    </div>
    {notice && <Alert role="status" className="border-green-200 bg-green-50 text-green-800"><AlertDescription>{notice}</AlertDescription></Alert>}
    {error && !open && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
    {loading ? <p>Memuat info...</p> : infos.length === 0 ? <Card><CardContent className="py-12 text-center text-gray-500">Belum ada info. Tambahkan PDF atau gambar pertama Anda.</CardContent></Card> :
      <div className="space-y-3">{infos.map(info => <Card key={info.id}><CardContent className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-orange-50 text-orange-600">
            {info.imageUrl ? <img src={info.imageUrl} alt="" className="h-full w-full object-cover" /> : <FileText className="h-6 w-6" />}
          </div>
          <div className="min-w-0"><h2 className="font-semibold">{info.title}</h2>
            {info.description && <p className="mt-1 line-clamp-2 whitespace-pre-line text-sm text-gray-500">{info.description}</p>}
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs"><span className="rounded bg-gray-100 px-2 py-1 text-gray-600 dark:bg-gray-800 dark:text-gray-300">{info.imageUrl ? 'Gambar' : 'PDF'}</span>
              <span className={info.isActive ? 'text-green-700 dark:text-green-400' : 'text-gray-500'}>{info.isActive ? 'Aktif' : 'Nonaktif'}</span>
              <a href={`/info/${info.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:underline">Lihat halaman<ExternalLink className="h-3 w-3" /></a>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => mutate(info)}>{info.isActive ? 'Nonaktifkan' : 'Aktifkan'}</Button>
          <Button size="sm" variant="outline" aria-label={`Edit info ${info.title}`} onClick={() => edit(info)}><Pencil className="h-4 w-4" />Edit</Button>
          <Button size="sm" variant="outline" aria-label={`Hapus info ${info.title}`} onClick={() => mutate(info, true)}><Trash2 className="h-4 w-4" />Hapus</Button>
        </div>
      </CardContent></Card>)}</div>}

    <Dialog open={open} onOpenChange={next => { if (!isUploading && !submitting) setOpen(next); }}>
      <DialogContent className="max-h-[90dvh] max-w-4xl overflow-y-auto">
        <DialogHeader><DialogTitle>{editing ? 'Edit Halaman Info' : 'Tambah Halaman Info'}</DialogTitle><DialogDescription>Isi ringkasan informasi lalu pilih satu lampiran PDF atau gambar.</DialogDescription></DialogHeader>
        <form onSubmit={submit} className="space-y-5 p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2"><Label htmlFor="info-title">Judul</Label><Input id="info-title" placeholder="Contoh: Jadwal pelayanan desa" value={form.title} maxLength={500} required
                onChange={event => { const title = event.target.value; setForm(current => ({ ...current, title, ...(!slugEdited ? { slug: slugify(title) } : {}) })); }} /></div>
              <div className="space-y-2"><Label htmlFor="info-description">Keterangan singkat (opsional)</Label><Textarea id="info-description" placeholder="Ringkasan atau keterangan untuk warga" rows={4} maxLength={500} value={form.description}
                onChange={event => setForm(current => ({ ...current, description: event.target.value }))} /><p className="text-right text-xs text-gray-400">{form.description.length}/500 karakter</p></div>
              <div className="space-y-2"><Label htmlFor="info-slug">Link halaman</Label><Input id="info-slug" placeholder="jadwal-pelayanan-desa" value={form.slug} required maxLength={200} pattern="[a-z0-9]+(-[a-z0-9]+)*"
                onChange={event => { setSlugEdited(true); setForm(current => ({ ...current, slug: event.target.value })); }} /><p className="break-all text-xs text-gray-500">/info/{form.slug || 'link-halaman'}</p></div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={event => setForm(current => ({ ...current, isActive: event.target.checked }))} />Tampilkan di website</label>
            </div>
            <div className="space-y-4">
              <fieldset className="space-y-2" disabled={isUploading || submitting}><legend className="mb-2 text-sm font-medium">Jenis lampiran</legend><div className="grid grid-cols-2 gap-3">
                {(['pdf', 'image'] as const).map(type => <label key={type} className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm ${fileType === type ? 'border-orange-400 bg-orange-50 text-orange-800 dark:bg-orange-950 dark:text-orange-200' : ''}`}>
                  <input type="radio" name="info-file-type" value={type} checked={fileType === type} onChange={() => { setFileType(type); setForm(current => ({ ...current, pdfUrl: '', imageUrl: '' })); }} />
                  {type === 'pdf' ? <FileText className="h-4 w-4" /> : <FileImage className="h-4 w-4" />}{type === 'pdf' ? 'PDF' : 'Gambar'}
                </label>)}
              </div></fieldset>
              {fileType === 'image' ? <ImageUploadField label="Gambar info" required value={form.imageUrl} disabled={submitting} onUploadStateChange={onUploadStateChange}
                onChange={url => setForm(current => ({ ...current, imageUrl: url, pdfUrl: '' }))} /> :
                <div className="space-y-3 rounded-lg border p-4">
                  <p className="text-sm font-medium">Dokumen PDF</p><UploadButton endpoint="pdfUploader" inputLabel="Upload PDF info" disabled={submitting} onUploadStateChange={onUploadStateChange}
                    content={{ button: form.pdfUrl ? 'Ganti PDF' : 'Pilih PDF', allowedContent: 'PDF — maksimal 16 MB' }}
                    onClientUploadComplete={files => { if (files[0]) setForm(current => ({ ...current, pdfUrl: files[0].url, imageUrl: '' })); }} />
                  {form.pdfUrl && <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800"><p>PDF siap ditampilkan.</p><a href={form.pdfUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block underline">Lihat PDF</a></div>}
                </div>}
            </div>
          </div>
          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
          <div className="flex flex-wrap justify-end gap-2 border-t pt-4"><Button type="button" variant="outline" disabled={isUploading || submitting} onClick={() => setOpen(false)}>Batal</Button>
            <Button type="submit" disabled={isUploading || submitting}>{isUploading ? 'Menunggu upload...' : submitting ? 'Menyimpan...' : 'Simpan Info'}</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  </div>;
}
