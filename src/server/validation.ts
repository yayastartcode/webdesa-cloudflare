import { isGoogleMapEmbed, isGoogleMapLink } from '../lib/village-contact';
import { z } from 'zod';
const short = z.string().min(1).max(500);
const content = z.string().max(500_000);
const optionalText = z.string().max(4000).nullable().optional();
const imageUrl = z.string().max(4000).refine(value => !value || value.startsWith('/api/uploads/') || /^https:\/\//.test(value), 'Invalid URL').nullable().optional();
const order = z.number().int().min(0).max(10000);
const numericString = z.union([z.string().regex(/^\d{1,13}(\.\d{1,2})?$/), z.number().finite().nonnegative().max(9999999999999.99)]).transform(String);
export const bodies = {
  'homepage-settings': z.object({ sections: z.object({
    villageInfo: z.boolean(), villageHeadWelcome: z.boolean(), employees: z.boolean(), population: z.boolean(),
    apb: z.boolean(), news: z.boolean(), maps: z.boolean(), helpdesk: z.boolean(), gallery: z.boolean(),
  }).strict() }).strict(),
  'village-contact': z.object({
    officeName: z.string().trim().min(1).max(200), address: z.string().trim().min(1).max(1000),
    openingHours: z.string().max(500), phone: z.string().max(40).regex(/^\+?[\d\s().-]*$/),
    whatsapp: z.string().max(40).regex(/^\+?[\d\s().-]*$/), email: z.union([z.literal(''), z.email().max(254)]),
    mapEmbedUrl: z.string().max(8192).refine(isGoogleMapEmbed, 'Gunakan URL sematan Google Maps'),
    mapLink: z.string().max(4000).refine(isGoogleMapLink, 'Gunakan tautan Google Maps'),
  }),
  posts: z.object({ title: short, content, imageUrl, published: z.boolean().optional() }),
  'header-settings': z.object({ logoUrl: imageUrl, navigationItems: z.array(z.object({ label: short, href: z.string().max(2000).refine(v => /^\/(?!\/)|^https:\/\//.test(v)), order: order.optional(), isActive: z.boolean().optional() })).max(100).optional() }),
  'hero-slides': z.object({ title: short, description: content, imageUrl: imageUrl.unwrap().unwrap(), order, isActive: z.boolean().optional() }),
  'village-info': z.object({ visi: content, misi: content, tujuan: content }),
  'village-head-welcome': z.object({ content }),
  'population-data': z.object(Object.fromEntries(['totalPopulation','malePopulation','femalePopulation','households','temporaryResidents','populationMutations'].map(key => [key, z.number().int().min(0).max(1_000_000_000)]))),
  employees: z.object({ name: short, position: short, photoUrl: imageUrl, order }),
  helpdesk: z.object({ nama: short, nomorWhatsapp: short, kategoriPengaduan: z.enum(['umum','kesehatan','keamanan','kebersihan']), pesanPengaduan: content, recaptchaToken: z.string().min(1).max(8192) }),
  'helpdesk-update': z.object({ status: z.enum(['pending','in_progress','resolved','closed']).optional(), response: optionalText }),
  'hero-slides-update': z.object({ title: short.optional(), description: content.optional(), imageUrl, order: order.optional(), isActive: z.boolean().optional() }),
  info: z.object({ title: short, slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(200), pdfUrl: imageUrl, imageUrl, description: z.string().max(500).nullable().optional(), isActive: z.boolean().optional() }),
  gallery: z.object({ title: short, description: optionalText, imageUrl: imageUrl.unwrap().unwrap(), category: optionalText, order: order.optional(), isActive: z.boolean().optional() }),
  'apb-desa': z.object({ year: z.union([z.number().int().min(1900).max(9999), z.string().regex(/^[0-9]{4}$/)]).transform(String), pendapatanDesa: numericString, belanjaDesa: numericString, isActive: z.boolean().optional() }),
};
export const updateBodies = {
  'info-update': bodies.info.partial(),
  'gallery-update': bodies.gallery.partial(),
};
export const allBodies = { ...bodies, ...updateBodies };
export async function readBody<K extends keyof typeof allBodies>(request: { json(): Promise<unknown> }, resource: K): Promise<z.infer<(typeof allBodies)[K]>> {
  const value = await request.json();
  // The resource key selects the validator and its inferred return type.
  return allBodies[resource].parse(value) as z.infer<(typeof allBodies)[K]>;
}
