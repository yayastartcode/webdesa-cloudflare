# Webdesa Cloudflare — staging terpisah

Aplikasi Desa Lomaer menggunakan React + Vite pada Cloudflare Pages, Pages Functions untuk API, D1 + Drizzle, R2 untuk gambar/PDF, dan Better Auth untuk sesi administrator. Seluruh halaman dan komponen UI lama tetap digunakan.

## Staging

Repository ini berdiri terpisah dari `yayastartcode/webdesa`. Branch aktif adalah `migration/cloudflare`.

Preview: https://migration-cloudflare.webdesa-cloudflare-staging.pages.dev

Project Pages: `webdesa-cloudflare-staging`. Production branch Pages adalah `production`; preview tetap memakai `migration/cloudflare`. Preview memakai database `webdesa-cloudflare-staging` dan bucket `webdesa-cloudflare-staging-uploads` yang baru, tanpa data/file production lama. Secret Better Auth disimpan pada konfigurasi preview Cloudflare.

Untuk mengaktifkan setup admin, tetapkan secret `SETUP_TOKEN` sendiri di **Cloudflare Pages → webdesa-cloudflare-staging → Settings → Variables and Secrets → Preview**, deploy ulang preview, lalu buka `/setup`. Hapus token setelah setup. Tidak ada akun/password demo. CAPTCHA pengaduan tetap fail-closed sampai kunci reCAPTCHA frontend/backend dikonfigurasi.

## Production

Website utama: **https://desalomaer.com**. `www.desalomaer.com` diarahkan permanen ke alamat utama dengan path/query tetap dipertahankan. Project Pages tetap `webdesa-cloudflare-staging`; deployment Production memakai branch metadata `production`, sementara Git tetap dikerjakan di `migration/cloudflare`.

Production memakai D1 `webdesa-cloudflare-production` dan bucket `webdesa-cloudflare-production-uploads`, terpisah dari preview. Data awal disalin dari staging, termasuk akun admin dan hash password; sesi lama, kode verifikasi, dan rate limit tidak disalin. Pengguna masuk kembali dengan akun yang sama. Perubahan data setelah aktivasi tidak tersinkron antara staging dan Production.

Variabel Production: `APP_ENV=production`, `BETTER_AUTH_URL=https://desalomaer.com`, serta secret Better Auth tersendiri yang disimpan di Cloudflare. Setup awal dinonaktifkan karena admin sudah disalin; akun berikutnya ditambahkan dari Kelola Pengguna. Form pengaduan tetap menunggu konfigurasi kunci reCAPTCHA frontend/backend dan domain Google yang sesuai.

Blok `env.production` pada Wrangler mencatat resource dan origin Production. Konfigurasi top-level tetap memakai placeholder agar perintah generik tidak mengarah ke resource remote Production. Deployment berikutnya ke Production memerlukan persetujuan pemilik; workflow GitHub hanya menjalankan pemeriksaan dan tidak melakukan deploy otomatis. Jangan mengubah branch `main` atau repo asal.

Lihat [catatan aktivasi Production](docs/production.md) untuk pemeriksaan dan pemulihan.

## Pengembangan lokal

Gunakan Node.js 22.12+ atau 24 dan npm.

```sh
npm ci
cp .dev.vars.example .dev.vars
cp .env.example .env
# Edit .dev.vars: isi secret acak minimal 32 karakter dan token setup sendiri.
npm run db:migrate:local
npm run build
npm run preview
```

Buka `http://localhost:8788`. Buat administrator melalui `/setup` dengan token dari `.dev.vars`. Tidak ada akun atau password demo yang dibuat otomatis. Setelah setup, hapus `SETUP_TOKEN` dan login melalui `/login`.

Untuk HMR, jalankan `npm run preview` pada terminal pertama dan `npm run dev` pada terminal kedua, lalu buka `http://localhost:5173`. Set `BETTER_AUTH_URL=http://localhost:5173` di `.dev.vars` untuk mode ini; Vite meneruskan `/api` ke Pages Functions pada port 8788. Kembalikan ke `http://localhost:8788` untuk preview build.

`APP_ENV=development` hanya untuk simulasi lokal. Konfigurasi repository secara default memakai `production`: cookie aman dan validasi CAPTCHA tidak dilewati di luar mode development.

## Upload gambar dan foto

Form berita, foto pegawai, logo, galeri, hero slide (baru dan lama), serta gambar di dalam editor berita/sambutan menyediakan upload langsung dengan pratinjau. Format JPG, PNG, WebP, dan GIF maksimal 4 MB. File baru disimpan di R2 dan konten memakai URL file, bukan data base64. Form tidak dapat disimpan selama upload berlangsung. URL gambar lama tetap dapat digunakan melalui pilihan “Gunakan URL gambar”.

Form tambah/edit galeri memisahkan foto dan informasi kegiatan, menyediakan pratinjau foto, saran kategori, petunjuk urutan tampil, dan pesan hasil penyimpanan langsung di halaman. Tombol simpan tetap terlihat saat isi form digulir di ponsel. Form tidak dapat ditutup selama upload atau penyimpanan berlangsung.

## Halaman Info dan Peta & Kontak

Menu Halaman Info menyediakan judul, keterangan singkat maksimal 500 karakter, link halaman, status tampil, serta satu lampiran PDF (maksimal 16 MB) atau gambar (maksimal 4 MB). PDF lama tetap dapat dibuka dan diedit.

Menu Peta & Kontak mengatur nama kantor, alamat, jam layanan, telepon, WhatsApp, email, sematan Google Maps, dan tautan peta. Perubahan ditampilkan di beranda dan `/contact`. Sematan menerima URL Google Maps atau kode iframe dari fitur Bagikan → Sematkan peta. Jalankan migrasi D1 terbaru sebelum memakai fitur ini.

## Bagian beranda yang belum diisi

APB Desa, statistik penduduk, pegawai, berita, dan galeri di beranda tampil setelah data tersedia. Data kosong, permintaan yang gagal, dan proses pemuatan tidak menampilkan banner atau bagian kosong. Nilai tersimpan sebesar 0 tetap ditampilkan. Statistik tidak memakai angka contoh. Foto hero yang belum diisi memakai latar gradasi. Kartu kontak dan jam layanan yang kosong disembunyikan; form pengaduan tampil setelah kunci reCAPTCHA frontend dikonfigurasi. Pesan pengelolaan data di dashboard dan keadaan kosong pada halaman daftar tetap tersedia.

## Tampilkan atau sembunyikan section

Menu **Tampilan Beranda** (`/dashboard/homepage-settings`) menyediakan checklist untuk sembilan section: visi/misi/tujuan, sambutan kepala desa, pegawai, statistik penduduk, APB, berita, peta/kontak, pengaduan, dan galeri. Semua diaktifkan secara bawaan. Header/navigasi, hero utama, serta footer selalu tampil dan tidak dapat dinonaktifkan melalui API. Pengaturan hanya berlaku di beranda; konten dan halaman tersendiri tetap tersedia. Section yang membutuhkan data tetap mengikuti aturan data kosong di atas.

Perubahan harus disimpan dengan **Simpan Tampilan**. **Pulihkan bawaan** mencentang semua section, lalu simpan untuk menerapkan. Pengaturan tersimpan di D1 dan berlaku untuk seluruh pengunjung. Jalankan migrasi D1 terbaru sebelum menggunakan fitur ini. Jika pengaturan gagal dimuat, beranda tetap menampilkan bagian utama dan menunggu pengaturan tersedia untuk menampilkan section lainnya.

## Akun admin dan laporan

**Kelola Pengguna** (`/dashboard/users`) menyediakan daftar akun dengan pagination, tambah admin (nama, email, password 12–128 karakter), ubah nama, reset password, serta aktif/nonaktif akses dashboard. Pendaftaran publik tetap dinonaktifkan. Penonaktifan mengubah akses akun menjadi non-admin tanpa menghapus akun atau konten; sesi dicabut saat akses berubah atau password direset. Reset password akun sendiri mengharuskan masuk kembali. Email akun tetap menjadi identitas login saat dibuat.

Akun yang sedang digunakan tidak dapat dinonaktifkan. Pemeriksaan hak admin dilakukan kembali dalam operasi database atomik agar dua admin yang saling menonaktifkan tidak menghilangkan seluruh akses admin. API daftar akun dan laporan hanya dapat dibaca admin; password/hash, token sesi, dan alamat IP tidak dikirim pada daftar akun.

**Laporan Ringkas** (`/dashboard/reports`) menampilkan jumlah akun/admin aktif, berita terbit/draf, pegawai, galeri/info aktif, pengaduan per status, data penduduk, APB aktif, dan pembaruan konten terakhir. Data belum diisi ditandai di halaman admin; angka dashboard dan aktivitas berasal dari data tersimpan. Tersedia perbarui data dan cetak laporan. Jumlah foto pada ringkasan adalah item galeri, bukan seluruh file di bucket R2.

## Validasi

```sh
npm run cf:typegen
npm run lint
npm run build
npm test
npx playwright install chromium
npm run test:e2e
```

Pengujian memakai workerd/Miniflare, database D1 dan bucket R2 sementara; tidak memakai resource remote. Pengujian API mencakup permission, setup, login, CRUD semua domain, pagination, pengaduan, serta upload gambar/PDF. Pengujian browser mencakup halaman publik, detail dinamis, login, dan seluruh halaman dashboard. Uji konversi data memeriksa login bcrypt lama dan penyimpanan nilai APB dalam sen pada D1.

## Struktur

- `src/app`: halaman React asli; `src/main.tsx`: routing dan penjagaan dashboard.
- `src/server/routes`: logika API asli, dipindahkan ke factory per request.
- `src/server/db`: skema Drizzle dan repository D1; `drizzle`: migrasi SQLite.
- `functions/api/[[path]].ts`: entry point Pages Functions.
- `src/server/auth.ts`: Better Auth + Drizzle, role admin hanya di server.
- `src/server/uploads.ts`: upload dan penyajian R2 dengan validasi tipe/ukuran.
- `prisma/`: skema/migrasi PostgreSQL historis sebagai referensi konversi; tidak digunakan saat build/runtime.

Lihat [panduan migrasi](docs/cloudflare-migration.md) untuk pemindahan data, konfigurasi Pages, dan batas validasi.
