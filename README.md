# Webdesa Cloudflare — staging terpisah

Aplikasi Desa Gimpubia menggunakan React + Vite pada Cloudflare Pages, Pages Functions untuk API, D1 + Drizzle, R2 untuk gambar/PDF, dan Better Auth untuk sesi administrator. Seluruh halaman dan komponen UI lama tetap digunakan.

## Staging

Repository ini berdiri terpisah dari `yayastartcode/webdesa`. Branch aktif adalah `migration/cloudflare`.

Preview: https://migration-cloudflare.webdesa-cloudflare-staging.pages.dev

Project Pages: `webdesa-cloudflare-staging`. Production branch Pages adalah `production` dan tidak dideploy. Preview memakai database `webdesa-cloudflare-staging` dan bucket `webdesa-cloudflare-staging-uploads` yang baru, tanpa data/file production lama. Secret Better Auth disimpan pada konfigurasi preview Cloudflare.

Untuk mengaktifkan setup admin, tetapkan secret `SETUP_TOKEN` sendiri di **Cloudflare Pages → webdesa-cloudflare-staging → Settings → Variables and Secrets → Preview**, deploy ulang preview, lalu buka `/setup`. Hapus token setelah setup. Tidak ada akun/password demo. CAPTCHA pengaduan tetap fail-closed sampai kunci reCAPTCHA frontend/backend dikonfigurasi.

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
