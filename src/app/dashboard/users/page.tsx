import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Plus, Pencil, KeyRound, ShieldCheck } from 'lucide-react';
import { useSession } from '@/lib/auth-client';
import type { AdminUser } from '@/lib/admin-users';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
type Editor = { mode: 'create' | 'rename' | 'reset-password'; target?: AdminUser };
export default function UsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [page, setPage] = useState(1), [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true), [busy, setBusy] = useState(false);
  const [error, setError] = useState(''), [notice, setNotice] = useState('');
  const [editor, setEditor] = useState<Editor | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmation: '' });
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin-users?page=${page}&limit=20`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Gagal memuat akun.');
      setUsers(result.data); setTotal(result.pagination.total);
    } catch (error) { setError(error instanceof Error ? error.message : 'Gagal memuat akun.'); }
    finally { setLoading(false); }
  }, [page]);
  useEffect(() => { void load(); }, [load]);
  function open(mode: Editor['mode'], target?: AdminUser) {
    setForm({ name: target?.name ?? '', email: target?.email ?? '', password: '', confirmation: '' });
    setError(''); setNotice(''); setEditor({ mode, target });
  }
  async function save(event: FormEvent) {
    event.preventDefault(); if (!editor || busy) return;
    if (editor.mode !== 'rename' && form.password !== form.confirmation) { setError('Konfirmasi password tidak sesuai.'); return; }
    setBusy(true); setError('');
    try {
      const body = editor.mode === 'create' ? { name: form.name, email: form.email, password: form.password } : editor.mode === 'rename' ? { action: 'rename', name: form.name } : { action: 'reset-password', password: form.password };
      const response = await fetch(editor.mode === 'create' ? '/api/admin-users' : `/api/admin-users/${editor.target!.id}`, { method: editor.mode === 'create' ? 'POST' : 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Gagal menyimpan akun.');
      if (result.signedOut) { window.location.assign('/login'); return; }
      setEditor(null); setNotice(editor.mode === 'reset-password' ? result.message : 'Akun admin berhasil disimpan.');
      setForm({ name: '', email: '', password: '', confirmation: '' }); await load();
    } catch (error) { setError(error instanceof Error ? error.message : 'Gagal menyimpan akun.'); }
    finally { setBusy(false); }
  }
  async function setAccess(target: AdminUser) {
    const enabled = target.role !== 'ADMIN';
    if (!window.confirm(`${enabled ? 'Aktifkan' : 'Nonaktifkan'} akses dashboard untuk ${target.email}?${enabled ? '' : ' Sesi akun akan diakhiri dan kontennya tetap tersimpan.'}`)) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const response = await fetch(`/api/admin-users/${target.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'set-access', enabled }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Gagal mengubah akses.');
      setNotice(enabled ? 'Akses dashboard diaktifkan.' : 'Akses dashboard dinonaktifkan. Konten tetap tersimpan.'); await load();
    } catch (error) { setError(error instanceof Error ? error.message : 'Gagal mengubah akses.'); }
    finally { setBusy(false); }
  }
  const title = editor?.mode === 'create' ? 'Tambah Admin' : editor?.mode === 'rename' ? 'Ubah Nama Admin' : 'Reset Password Admin';
  return <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-2xl font-bold">Kelola Pengguna</h1><p className="mt-2 max-w-2xl text-sm text-gray-500">Atur akun admin website. Menonaktifkan akses dashboard akan mengakhiri sesi akun dan mempertahankan kontennya.</p></div><Button disabled={busy} onClick={() => open('create')}><Plus className="h-4 w-4" />Tambah Admin</Button></div>
    {notice && <Alert role="status" className="border-green-200 bg-green-50 text-green-800"><AlertDescription>{notice}</AlertDescription></Alert>}
    {error && !editor && <Alert role="alert" variant="destructive"><AlertDescription>{error}</AlertDescription><Button className="mt-3" variant="outline" disabled={loading} onClick={() => { setError(''); void load(); }}>Coba lagi</Button></Alert>}
    {loading && <p role="status" className="text-sm text-gray-500">Memuat akun…</p>}
    <div className="space-y-3">{users.map(item => <Card key={item.id}><CardContent className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="break-words font-semibold">{item.name}</h2>{item.id === session?.user.id && <span className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-700">Akun Anda</span>}</div><p className="mt-1 break-all text-sm text-gray-500">{item.email}</p><p className={`mt-2 text-xs font-medium ${item.role === 'ADMIN' ? 'text-green-700 dark:text-green-400' : 'text-gray-500'}`}>{item.role === 'ADMIN' ? 'Admin aktif' : 'Akses dashboard nonaktif'}</p></div><div className="flex shrink-0 flex-wrap gap-2"><Button size="sm" variant="outline" disabled={busy} aria-label={`Ubah nama ${item.email}`} onClick={() => open('rename', item)}><Pencil />Ubah Nama</Button><Button size="sm" variant="outline" disabled={busy} aria-label={`Reset password ${item.email}`} onClick={() => open('reset-password', item)}><KeyRound />Reset Password</Button><Button size="sm" variant="outline" disabled={busy || item.id === session?.user.id} title={item.id === session?.user.id ? 'Akun sendiri tidak dapat dinonaktifkan.' : undefined} aria-label={`${item.role === 'ADMIN' ? 'Nonaktifkan' : 'Aktifkan'} akses ${item.email}`} onClick={() => void setAccess(item)}><ShieldCheck />{item.role === 'ADMIN' ? 'Nonaktifkan Akses' : 'Aktifkan Akses'}</Button></div></CardContent></Card>)}</div>
    {!loading && !users.length && !error && <p>Belum ada akun.</p>}
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500"><p>{total} akun · Halaman {page} dari {Math.max(1, Math.ceil(total / 20))}</p><div className="flex gap-2"><Button variant="outline" disabled={loading || busy || page === 1} onClick={() => setPage(current => current - 1)}>Sebelumnya</Button><Button variant="outline" disabled={loading || busy || page * 20 >= total} onClick={() => setPage(current => current + 1)}>Berikutnya</Button></div></div>
    <Dialog open={!!editor} onOpenChange={open => { if (!open && !busy) { setEditor(null); setError(''); setForm({ name: '', email: '', password: '', confirmation: '' }); } }}><DialogContent aria-labelledby="user-dialog-title" className="max-h-[90dvh] overflow-y-auto"><DialogHeader><DialogTitle><span id="user-dialog-title">{title}</span></DialogTitle><DialogDescription>{editor?.target?.email || 'Akun baru memiliki akses penuh ke dashboard.'}</DialogDescription></DialogHeader><form className="space-y-4 p-6" onSubmit={save}><fieldset disabled={busy} className="space-y-4">
      {editor?.mode !== 'reset-password' && <div className="space-y-2"><Label htmlFor="admin-name">Nama</Label><Input id="admin-name" required maxLength={200} autoComplete="name" value={form.name} onChange={e => setForm(current => ({ ...current, name: e.target.value }))} /></div>}
      {editor?.mode === 'create' && <div className="space-y-2"><Label htmlFor="admin-email">Email</Label><Input id="admin-email" type="email" required maxLength={254} autoComplete="off" value={form.email} onChange={e => setForm(current => ({ ...current, email: e.target.value }))} /></div>}
      {editor?.mode !== 'rename' && <><div className="space-y-2"><Label htmlFor="admin-password">Password baru</Label><Input id="admin-password" type="password" required minLength={12} maxLength={128} autoComplete="new-password" value={form.password} onChange={e => setForm(current => ({ ...current, password: e.target.value }))} /><p className="text-xs text-gray-500">Gunakan 12–128 karakter.</p></div><div className="space-y-2"><Label htmlFor="admin-confirmation">Konfirmasi password</Label><Input id="admin-confirmation" type="password" required minLength={12} maxLength={128} autoComplete="new-password" value={form.confirmation} onChange={e => setForm(current => ({ ...current, confirmation: e.target.value }))} /></div>{editor?.mode === 'reset-password' && <p className="text-sm text-amber-700">Semua sesi akun ini akan diakhiri. Pengguna perlu masuk kembali dengan password baru.</p>}</>}
    </fieldset>{error && <Alert role="alert" variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}<div className="flex justify-end gap-2 border-t pt-4"><Button type="button" variant="outline" disabled={busy} onClick={() => { setEditor(null); setError(''); setForm({ name: '', email: '', password: '', confirmation: '' }); }}>Batal</Button><Button type="submit" disabled={busy}>{busy ? 'Menyimpan…' : editor?.mode === 'reset-password' ? 'Reset Password' : 'Simpan Admin'}</Button></div></form></DialogContent></Dialog>
  </div>;
}
