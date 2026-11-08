# Audit penyimpanan konten — 8 November 2026

## Bukti pemeriksaan

Pemilik melaporkan klien telah mengisi visi, misi, dan tujuan melalui domain utama. Pemeriksaan read-only menemukan belum ada baris `village_info` pada D1 Production maupun Preview. Pengaturan section belum memiliki override, sehingga visi/misi diaktifkan secara bawaan. API publik `/api/village-info` mengembalikan `null` dengan `Cache-Control: no-store` dan `CF-Cache-Status: DYNAMIC`.

Deployment Production yang sedang melayani domain telah diperiksa langsung: origin `https://desalomaer.com`, binding DB `6664377e-13f3-41d6-9414-881b1f0e04b9`, dan bucket Production. Ini cocok dengan konfigurasi project, serta terpisah dari staging. Tidak ditemukan bukti bahwa isian klien tersimpan ke database staging. Karena request klien sebelumnya tidak terekam beserta statusnya, penyebab pasti kegagalan request tersebut tidak dapat dinyatakan sebagai fakta.

Analitik HTTP adaptif Cloudflare untuk 7–8 November juga diperiksa: pada endpoint ini hanya ditemukan kelompok GET, tanpa kelompok POST. Respons 504 yang terlihat berasal dari `earlyHintsCache`, sedangkan kelompok permintaan browser/pengunjung mengembalikan 200. Karena analitik adaptif dapat memakai sampling, ini bukan bukti mutlak bahwa klien tidak menekan Simpan atau bahwa request tidak pernah dikirim.

## Masalah yang ditemukan dan diperbaiki

1. Hook toast lama menyimpan pesan dalam memori tanpa komponen yang merendernya. Validasi dan kegagalan simpan di visi/misi, sambutan, pegawai, dan APB dapat berlalu tanpa pesan terlihat. Notifikasi kini dirender global di dashboard, dapat ditutup, dan error bertahan sampai ditutup/diganti pesan terbaru.
2. Visi/misi sekarang menjelaskan ketiga kolom wajib, menandai kolom kosong, dan menampilkan kesalahan HTTP/sesi beserta kode request. Pesan berhasil baru diberikan setelah GET terpisah mengonfirmasi seluruh isi tersimpan.
3. Isian visi/misi yang belum disimpan dipertahankan dalam sessionStorage tab, per akun dan origin. Setelah muat ulang/login kembali pada tab yang sama, draf dapat dipulihkan atau dibuang secara eksplisit. Draf bukan salinan server dan akan hilang saat tab ditutup.
4. Dashboard menandai situs utama vs staging menggunakan konteks dari server. Staging mempunyai peringatan dan tautan langsung ke dashboard Production. Editor juga memperingatkan ketika section terkait dinonaktifkan di beranda.
5. Beranda mengambil hero, header, visi/misi, sambutan, dan pegawai secara independen. Error/JSON rusak pada satu sumber tidak menghalangi pemuatan sumber lain.
6. Pembacaan dan pembaruan singleton visi/misi, sambutan, dan penduduk memilih record terbaru dengan urutan deterministik yang sama, termasuk jika terdapat duplikasi historis.
7. Pembaruan header dan penggantian navigasi dibuat atomik; admin membaca item aktif maupun nonaktif. Item nonaktif tidak lagi hilang dari editor dan terhapus saat pengaturan lain disimpan.
8. Status `isActive` pada pembuatan APB dihormati. Kegagalan memuat data penduduk/sambutan terlihat, dan penyimpanan diblokir sampai data awal berhasil dibaca.
9. Respons API memiliki `X-Request-ID`; penolakan write dicatat sebagai metadata environment, path, method, status, dan ID tersebut. Nilai form, password, dan token tidak dicatat oleh logging tambahan ini. API tetap memakai no-store, sementara cache file upload dipertahankan.

## Validasi dan batas pemeriksaan

Pengujian menggunakan database/R2 lokal sementara, termasuk runtime dalam mode Production. Skenario meliputi isian tidak lengkap, kegagalan 503, sesi 403, pemulihan draf, reload setelah simpan, render halaman publik tanpa login, kegagalan sumber hero, section nonaktif, notifikasi menu lain, APB nonaktif, duplikasi singleton, dan navigasi nonaktif.

Tidak ada teks visi/misi buatan atau akun uji yang ditulis ke Production. Percobaan pembuatan akun diagnostik berhak USER melalui database Production ditolak pemeriksaan persetujuan otomatis dan tidak dilanjutkan melalui jalur lain. Verifikasi live menggunakan pembacaan publik dan metadata deployment; pengujian authenticated write klien sebenarnya tetap dilakukan menggunakan akun pemilik pada alur aplikasi.

Isi awal klien tidak tersedia di server untuk dipulihkan. Jika form lama masih terbuka, salin isinya sebelum reload; draf otomatis baru melindungi pengetikan setelah versi perbaikan dimuat. Pengujian ini mengurangi kegagalan senyap tetapi tidak menjamin koneksi atau sesi pengguna tidak akan pernah gagal.

Hasil lokal: build berhasil; lint tanpa error (22 warning yang sudah ada); 10 pengujian unit dan 16 pengujian browser lulus. Setelah penyempurnaan pemulihan draf saat readback gagal, 4 skenario browser terkait dijalankan ulang dan lulus.
