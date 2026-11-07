export const defaultVillageContact = {
  officeName: 'Kantor Desa Gimpubia',
  address: 'Gimpubia, Kec. Pinembani, Kabupaten Donggala, Sulawesi Tengah',
  openingHours: 'Senin - Jumat\n08:00 - 16:00 WITA',
  phone: '', whatsapp: '', email: '', mapLink: '',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31913.123053851446!2d119.70672850000001!3d-1.0562395!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2d8c75f9ebfa2169%3A0xd9db005d197e03a7!2sGimpubia%2C%20Kec.%20Pinembani%2C%20Kabupaten%20Donggala%2C%20Sulawesi%20Tengah!5e0!3m2!1sid!2sid!4v1753144275546!5m2!1sid!2sid',
};
export type VillageContact = typeof defaultVillageContact;
const googleHosts = ['google.com', 'www.google.com', 'maps.google.com', 'google.co.id', 'www.google.co.id', 'maps.google.co.id'];
export function isGoogleMapEmbed(value: string) {
  if (!value) return true;
  try { const url = new URL(value); return url.protocol === 'https:' && googleHosts.includes(url.hostname) && /^\/maps\/embed(?:\/|$)/.test(url.pathname) && !url.username && !url.password; }
  catch { return false; }
}
export function isGoogleMapLink(value: string) {
  if (!value) return true;
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password && (['maps.app.goo.gl', 'goo.gl'].includes(url.hostname) || googleHosts.includes(url.hostname) && /^\/maps(?:\/|$)/.test(url.pathname)); }
  catch { return false; }
}
export function mapUrlFromInput(value: string) {
  const src = value.match(/<iframe\b[^>]*\bsrc=["']([^"']+)["']/i)?.[1];
  return (src ?? value).trim().replaceAll('&amp;', '&');
}
export function whatsappUrl(value: string) {
  let number = value.replace(/\D/g, '');
  if (number.startsWith('0')) number = '62' + number.slice(1);
  return `https://wa.me/${number}`;
}
