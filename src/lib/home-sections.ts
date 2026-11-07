export const homeSectionOptions = [
  { key: 'villageInfo', label: 'Visi, Misi & Tujuan', description: 'Arah pembangunan dan tujuan pemerintah desa.', href: '/dashboard/village-info' },
  { key: 'villageHeadWelcome', label: 'Sambutan Kepala Desa', description: 'Pesan sambutan untuk pengunjung website.', href: '/dashboard/village-head-welcome' },
  { key: 'employees', label: 'Pegawai Desa', description: 'Daftar perangkat desa. Tampil setelah data pegawai diisi.', href: '/dashboard/employees' },
  { key: 'population', label: 'Statistik Penduduk', description: 'Ringkasan kependudukan. Tampil setelah data penduduk diisi.', href: '/dashboard/population-data' },
  { key: 'apb', label: 'APB Desa', description: 'Ringkasan anggaran. Tampil setelah ada data APB yang aktif.', href: '/dashboard/apb-desa' },
  { key: 'news', label: 'Berita Terkini', description: 'Berita desa yang sudah dipublikasikan.', href: '/dashboard/posts' },
  { key: 'maps', label: 'Peta & Kontak', description: 'Lokasi kantor dan cara warga menghubungi pemerintah desa.', href: '/dashboard/village-contact' },
  { key: 'helpdesk', label: 'Form Pengaduan', description: 'Form untuk warga. Tampil setelah reCAPTCHA dikonfigurasi.', href: '/dashboard/helpdesk' },
  { key: 'gallery', label: 'Galeri Kegiatan', description: 'Foto kegiatan yang sudah diisi dan diaktifkan.', href: '/dashboard/gallery' },
] as const;
export type HomeSectionKey = typeof homeSectionOptions[number]['key'];
export type HomeSections = Record<HomeSectionKey, boolean>;
export const defaultHomeSections: HomeSections = {
  villageInfo: true, villageHeadWelcome: true, employees: true, population: true,
  apb: true, news: true, maps: true, helpdesk: true, gallery: true,
};
