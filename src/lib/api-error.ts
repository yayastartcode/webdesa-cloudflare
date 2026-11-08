export function apiErrorMessage(response: Response, message?: string, fallback = 'Permintaan gagal. Silakan coba kembali.') {
  const reference = response.headers.get('X-Request-ID');
  let description = message || fallback;
  if (response.status === 401 || response.status === 403) description = message === 'Origin tidak diizinkan'
    ? 'Alamat dashboard tidak sesuai dengan layanan penyimpanan. Buka kembali dashboard melalui alamat website yang benar dan masuk ulang.'
    : 'Sesi login telah berakhir atau izin akses tidak berlaku. Isian belum disimpan. Silakan masuk kembali dengan akun admin.';
  return reference ? `${description}\nKode pemeriksaan: ${reference}` : description;
}
