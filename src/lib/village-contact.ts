export const defaultVillageContact = {
  officeName: 'Kantor Desa Lomaer',
  address: 'Desa Lomaer',
  openingHours: 'Senin - Jumat\n08:00 - 16:00',
  phone: '', whatsapp: '', email: '', mapLink: '',
  mapEmbedUrl: '',
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
