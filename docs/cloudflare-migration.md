# Migrasi Cloudflare

## Implementasi dan kesetaraan

Halaman publik `/`, `/berita`, `/berita/:id`, `/galeri`, `/info/:slug`, `/login`, `/setup`, serta dashboard dan 11 halaman pengelolaannya dipertahankan. Komponen, teks, Tailwind, editor Tiptap/Markdown, slider, peta, statistik, galeri, PDF, APB, dan formulir pengaduan tetap digunakan. React Router menggantikan routing Next.js; komponen gambar native mempertahankan ukuran, fill, dan prioritas gambar. Font Geist tersedia lokal melalui Fontsource.

Semua endpoint konten mempertahankan bentuk respons yang dipakai UI. API berjalan pada Pages Functions; tidak ada Prisma, NextAuth, UploadThing, atau server Next.js di runtime. Repository Drizzle terbatas pada operasi yang dibutuhkan handler lama, menggunakan parameter SQL terikat. Role, sesi, dan binding selalu diperoleh untuk request tersebut.

Perubahan yang terlihat: setup meminta token dan password minimal 12 karakter, akun demo dihapus, dan upload menggunakan pemilih file R2 pada posisi UI yang sama. Endpoint administrasi/keluhan dilindungi di server. Pembaruan hero slider sekarang mengirim PATCH sesuai kontrak API. Signup publik dinonaktifkan. Cookie NextAuth lama tidak berlaku; pengguna login ulang setelah cutover.

## Menyiapkan Cloudflare Pages

Repository terpisah ini menggunakan Pages project `webdesa-cloudflare-staging`, D1 `webdesa-cloudflare-staging`, dan R2 `webdesa-cloudflare-staging-uploads` yang baru dibuat untuk preview. Tidak ada domain, resource, data, atau file production lama yang dipindahkan. Konfigurasi `env.preview` menunjuk resource staging; konfigurasi top-level tetap berupa placeholder untuk mencegah deploy production yang tidak sengaja.

Sebelum preview remote, buat D1 dan R2 terpisah untuk staging, lalu sesuaikan `database_id`, `database_name`, `bucket_name`, dan `BETTER_AUTH_URL` pada konfigurasi sesuai akun/project yang dipilih. UUID nol dan domain `your-project.pages.dev` adalah placeholder, bukan resource production. Jangan memakai database/bucket production untuk pengujian.

Pengaturan Pages: framework Vite, build command `npm run build`, output `dist`, Node.js 22.12+ atau 24. Pages mengompilasi direktori `functions` terpisah dari bundle frontend. `_routes.json` hanya mengarahkan `/api/*` ke Functions; URL halaman memakai fallback SPA Pages. API yang tidak dikenal mengembalikan JSON 404, bukan HTML.

Untuk setiap lingkungan remote, set `APP_ENV=production`, `BETTER_AUTH_URL` ke origin HTTPS lingkungan tersebut, `BETTER_AUTH_SECRET` acak minimal 32 karakter, dan secret `RECAPTCHA_SECRET_KEY`. Set `VITE_RECAPTCHA_SITE_KEY` saat build frontend. `SETUP_TOKEN` hanya diperlukan jika tidak mengimpor admin lama; hapus setelah setup. Jangan masukkan secret ke repository atau variabel Vite. Daftar origin Better Auth harus sesuai URL preview yang diset, termasuk bila memakai URL preview branch.

Pages tidak mendukung blok observability Workers standalone dalam konfigurasi yang sama. Gunakan Pages Functions logs/tail pada preview; jika API kelak dipisah menjadi Worker standalone, aktifkan logs dan traces pada konfigurasi Worker tersebut. Log kegagalan dispatcher memakai JSON; sebagian handler lama masih memakai format console aslinya.

Tidak ada workflow deploy otomatis yang ditambahkan. Deployment production tetap memerlukan persetujuan pemilik. Repo asal tidak lagi menjadi target push; staging ada pada repository baru `yayastartcode/webdesa-cloudflare`.

## Memindahkan PostgreSQL ke D1

Lakukan terhadap snapshot dan database staging kosong terlebih dahulu. Hentikan penulisan saat snapshot final/cutover agar tidak ada perubahan yang tertinggal. Simpan backup PostgreSQL asli untuk rollback.

1. Pada mesin yang memiliki akses database lama, ekspor snapshot read-only menggunakan `scripts/export-postgres.sql`. Gunakan `psql --quiet --no-psqlrc --tuples-only --no-align --file scripts/export-postgres.sql` dengan koneksi database dari konfigurasi lokal mesin tersebut. Arahkan stdout ke `work/postgres.json`. Jangan menyalin kredensial ke chat/commit.
2. Jalankan `npm run db:convert -- work/postgres.json work/d1-import.sql`. File baru dibuat dengan permission 0600 dan tidak ditimpa jika sudah ada. Snapshot dan SQL memuat informasi pribadi serta hash password; simpan privat, jangan commit. Direktori `work/` diabaikan Git.
3. Terapkan migrasi schema ke D1 **lokal/staging kosong**. Untuk lokal: `npm run db:migrate:local`, lalu `npx wrangler d1 execute webdesa --local --file work/d1-import.sql`. Untuk staging remote, review target/config dan jalankan apply/execute dengan `--remote` hanya setelah target diset dengan benar. Skrip konversi tidak melakukan koneksi atau penulisan remote.
4. Periksa jumlah baris per tabel, relasi author/navigation, login akun lama, tanggal, status, konten berita, dan nilai APB. SQL import memakai INSERT biasa: duplikasi ditolak; setelah kegagalan impor, pulihkan/buat ulang staging kosong sebelum mengulang. Import besar perlu dibagi sesuai batas D1 yang berlaku.

ID, slug, tanggal, boolean, dan referensi relasi dipertahankan. Nilai Decimal APB diekspor sebagai teks, lalu dikonversi menjadi integer sen; API mengembalikannya sebagai angka untuk UI. Hash bcrypt disalin ke akun Better Auth `credential` dan diverifikasi dengan bcrypt. Nama kosong memakai email sebagai fallback karena Better Auth memerlukan nama. Email dinormalisasi menjadi lowercase; periksa duplikasi yang hanya berbeda kapitalisasi sebelum impor. Tabel sesi, verification token, dan akun provider NextAuth tidak diimpor karena aplikasinya memakai login credentials; sesi harus dibuat ulang.

## Memindahkan file lama

URL HTTPS UploadThing yang tersimpan tetap dipertahankan agar konten lama tetap dapat dibuka selama sumber file masih aktif. Upload baru langsung menggunakan R2 melalui `/api/uploads`; gambar dibatasi 4 MB dan PDF 16 MB. Tipe MIME dan signature file diverifikasi. SVG tidak diterima. File disajikan melalui binding R2 tanpa perlu bucket publik.

Pemindahan byte file UploadThing lama belum dijalankan karena membutuhkan inventaris/data dan akses sumber. Sebelum menonaktifkan UploadThing, salin seluruh file ke bucket R2 staging, cocokkan checksum, ukuran, dan tipe; perbarui semua `imageUrl`, `photoUrl`, `logoUrl`, `pdfUrl`, URL di konten HTML/Markdown, serta referensi bersarang. Verifikasi semua halaman setelah URL diganti. Pertahankan sumber lama sampai salinan dan rollback tervalidasi.

## Batas validasi dan cutover

Build, tipe, API workerd/D1/R2, serta halaman browser diuji lokal dengan data sintetis. Pengujian tersebut tidak membuktikan konfigurasi akun Cloudflare, domain, reCAPTCHA Google sungguhan, atau data/file production. Migrasi SPA juga mengubah SSR/metadata Next.js menjadi HTML entry statis; jika SEO artikel memerlukan HTML per artikel, rencanakan prerender/SSR terpisah sebelum cutover.

Review preview staging dan bandingkan desain desktop/mobile dengan situs lama menggunakan snapshot data yang sama. Verifikasi CAPTCHA dengan domain staging terdaftar. Setelah persetujuan, ambil backup final, migrasikan data/file, lakukan smoke test, baru alihkan trafik. Untuk rollback, arahkan trafik kembali ke aplikasi Next.js dan database PostgreSQL yang dipertahankan; perubahan data setelah cutover harus direkonsiliasi terlebih dahulu.
