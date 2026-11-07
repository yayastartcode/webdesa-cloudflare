# Production Desa Lomaer

Aktivasi disetujui pemilik pada 7 November 2026. Target `https://desalomaer.com` dan `www.desalomaer.com` sebelumnya mengarah ke project Pages yang belum mempunyai deployment Production.

## Target

| Komponen | Production | Preview staging |
| --- | --- | --- |
| Pages project | `webdesa-cloudflare-staging` | project yang sama |
| Branch deployment | `production` | `migration/cloudflare` |
| Origin autentikasi | `https://desalomaer.com` | `https://migration-cloudflare.webdesa-cloudflare-staging.pages.dev` |
| D1 | `webdesa-cloudflare-production` (`6664377e-13f3-41d6-9414-881b1f0e04b9`) | `webdesa-cloudflare-staging` (`342f5660-bcd0-4727-9709-c3d37cbb85b3`) |
| R2 | `webdesa-cloudflare-production-uploads` | `webdesa-cloudflare-staging-uploads` |

Kedua custom domain berstatus active. CNAME tetap menunjuk `webdesa-cloudflare-staging.pages.dev` dengan proxy aktif. Rule zona `desalomaer_www_canonical` mengarahkan host `www.desalomaer.com` ke HTTPS apex dengan status 301, mempertahankan path dan query. HTTP pada apex juga diarahkan ke HTTPS. Host lain tidak masuk dalam aturan ini.

## Konfigurasi dan data

Production mengaktifkan `nodejs_compat`, compatibility date `2026-11-06`, binding `DB` dan `UPLOADS`, `APP_ENV=production`, serta origin autentikasi sesuai tabel. Secret Better Auth dibuat khusus Production dan tidak disimpan di repo. `SETUP_TOKEN` Production dihapus setelah akun awal disalin; token Preview tidak diubah.

Migrasi `0000`, `0001`, dan `0002` diterapkan ke database Production baru yang kosong. Data dibaca sebagai satu batch snapshot dari 17 tabel aplikasi staging dan diimpor dengan parameter SQL terikat. Semua baris dibandingkan kembali dan foreign keys diperiksa. ID, relasi, timestamp, boolean, jumlah APB dalam integer sen, serta hash password dipertahankan. URL absolut yang menunjuk origin staging pada konten salinan diganti ke origin Production. Isi staging tetap dipertahankan.

Sesi, rate limit, dan kode verifikasi staging tidak disalin. Semua pengguna harus masuk kembali pada domain Production dengan email/password yang sama. Bucket sumber saat aktivasi kosong; bucket Production sudah disiapkan untuk upload berikutnya. Perubahan setelah salinan awal tersimpan secara terpisah di masing-masing environment.

Tidak ada akun uji, password admin baru, atau data contoh yang ditambahkan ke Production. Repo asal `yayastartcode/webdesa` dan branch `main` tidak diubah.

## Verifikasi

Sebelum deploy: typegen, lint, dan build proyek; pemeriksaan aplikasi terakhir mencakup 22 pengujian unit/integrasi/browser. GitHub Actions juga memeriksa perubahan konfigurasi ini.

Setelah deploy: periksa status deployment Production, HTML/frontend assets, API publik, admin setup disabled, penolakan API private tanpa sesi, respons login untuk kredensial tidak valid, serta redirect WWW dengan path/query. Uji login akun sebenarnya dilakukan pemilik melalui `/login`; password tidak diminta atau dikirim lewat chat.

Kunci reCAPTCHA belum dikonfigurasi; form pengaduan otomatis tersembunyi sampai frontend/backend dan domain Google siap. Ini tidak menghalangi aktivasi halaman dan fitur admin lainnya.

## Deployment berikutnya dan pemulihan

Pengembangan tetap di `migration/cloudflare`; tidak ada workflow deploy otomatis. Deployment Production harus mendapat persetujuan pemilik. Saat menggunakan CLI, pilih project tersebut dan branch deployment `production`, pastikan blok Production dan secret/binding Cloudflare benar. Jangan mempromosikan dengan mengganti branch Production project menjadi `migration/cloudflare`, karena itu mengubah perilaku deployment preview.

Simpan database dan bucket Production selama pemulihan. Deployment kode dapat dikembalikan ke deployment Production sebelumnya melalui Pages setelah tersedia; pemulihan kode tidak mengembalikan perubahan database/R2. Untuk aktivasi pertama, jangan mengalihkan domain ke staging tanpa menyesuaikan origin autentikasi dan mengkaji perubahan data yang sudah masuk. Gunakan D1 Time Travel dan backup terverifikasi jika pemulihan data diperlukan, dengan persetujuan pemilik sebelum penimpaan.
