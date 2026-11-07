import type { HomeSections } from '../../lib/home-sections';
import { sqliteTable, text, integer, customType, uniqueIndex } from 'drizzle-orm/sqlite-core';

// Store APB amounts as exact integer rupiah cents, expose numbers to the existing UI.
const money = customType<{ data: number; driverData: number }>({
  dataType: () => 'integer',
  toDriver: (value) => {
    const cents = Math.round(value * 100);
    if (!Number.isFinite(value) || !Number.isSafeInteger(cents)) throw new Error('Invalid amount');
    return cents;
  },
  fromDriver: (value) => value / 100,
});
const timestamps = () => ({
  createdAt: integer('createdAt', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()).$onUpdate(() => new Date()),
});

export const user = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('emailVerified', { mode: 'boolean' }).notNull().default(false),
  image: text('image'),
  role: text('role', { enum: ['USER', 'ADMIN'] }).notNull().default('USER'),
  ...timestamps(),
});
export const session = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  token: text('token').notNull().unique(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  expiresAt: integer('expiresAt', { mode: 'timestamp_ms' }).notNull(),
  ipAddress: text('ipAddress'), userAgent: text('userAgent'),
  ...timestamps(),
});
export const account = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(), providerId: text('providerId').notNull(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'), refreshToken: text('refreshToken'), idToken: text('idToken'),
  accessTokenExpiresAt: integer('accessTokenExpiresAt', { mode: 'timestamp_ms' }),
  refreshTokenExpiresAt: integer('refreshTokenExpiresAt', { mode: 'timestamp_ms' }),
  scope: text('scope'), password: text('password'), ...timestamps(),
}, (t) => [uniqueIndex('account_provider_unique').on(t.providerId, t.accountId)]);
export const verification = sqliteTable('verifications', {
  id: text('id').primaryKey(), identifier: text('identifier').notNull(), value: text('value').notNull(),
  expiresAt: integer('expiresAt', { mode: 'timestamp_ms' }).notNull(), ...timestamps(),
});
// A single primary key serializes concurrent setup attempts in a D1 batch.
export const setupLock = sqliteTable('setup_lock', { id: integer('id').primaryKey() });

export const post = sqliteTable('posts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  content: text('content'),
  published: integer('published', { mode: 'boolean' }).notNull().default(false),
  imageUrl: text('imageUrl'),
  authorId: text('authorId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  ...timestamps(),
});

export const headerSettings = sqliteTable('header_settings', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  logoUrl: text('logoUrl'),
  ...timestamps(),
});

export const navigationItem = sqliteTable('navigation_items', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  label: text('label').notNull(),
  href: text('href').notNull(),
  order: integer('order').notNull(),
  isActive: integer('isActive', { mode: 'boolean' }).notNull().default(true),
  headerSettingsId: text('headerSettingsId').notNull().references(() => headerSettings.id, { onDelete: 'cascade' }),
  ...timestamps(),
});

export const heroSlide = sqliteTable('hero_slides', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  description: text('description').notNull(),
  imageUrl: text('imageUrl').notNull(),
  order: integer('order').notNull(),
  isActive: integer('isActive', { mode: 'boolean' }).notNull().default(true),
  ...timestamps(),
});

export const villageInfo = sqliteTable('village_info', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  visi: text('visi').notNull(),
  misi: text('misi').notNull(),
  tujuan: text('tujuan').notNull(),
  ...timestamps(),
});

export const villageHeadWelcome = sqliteTable('village_head_welcome', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  content: text('content').notNull(),
  ...timestamps(),
});

export const populationData = sqliteTable('population_data', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  totalPopulation: integer('totalPopulation').notNull(),
  malePopulation: integer('malePopulation').notNull(),
  femalePopulation: integer('femalePopulation').notNull(),
  households: integer('households').notNull(),
  temporaryResidents: integer('temporaryResidents').notNull(),
  populationMutations: integer('populationMutations').notNull(),
  ...timestamps(),
});

export const employee = sqliteTable('employees', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  position: text('position').notNull(),
  photoUrl: text('photoUrl'),
  order: integer('order').notNull(),
  isActive: integer('isActive', { mode: 'boolean' }).notNull().default(true),
  ...timestamps(),
});

export const helpdesk = sqliteTable('helpdesk', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  nama: text('nama').notNull(),
  nomorWhatsapp: text('nomorWhatsapp').notNull(),
  kategoriPengaduan: text('kategoriPengaduan').notNull(),
  pesanPengaduan: text('pesanPengaduan').notNull(),
  status: text('status').notNull().default("pending"),
  response: text('response'),
  ...timestamps(),
});

export const info = sqliteTable('info', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  pdfUrl: text('pdfUrl').notNull(),
  imageUrl: text('imageUrl'),
  description: text('description'),
  isActive: integer('isActive', { mode: 'boolean' }).notNull().default(true),
  ...timestamps(),
});

export const gallery = sqliteTable('gallery', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  description: text('description'),
  imageUrl: text('imageUrl').notNull(),
  category: text('category'),
  isActive: integer('isActive', { mode: 'boolean' }).notNull().default(true),
  order: integer('order').notNull().default(0),
  ...timestamps(),
});

export const apbDesa = sqliteTable('apb_desa', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  year: integer('year').notNull().unique(),
  pendapatanDesa: money('pendapatanDesa').notNull(),
  belanjaDesa: money('belanjaDesa').notNull(),
  isActive: integer('isActive', { mode: 'boolean' }).notNull().default(true),
  ...timestamps(),
});

export const rateLimit = sqliteTable('rate_limit', {
  id: text('id').primaryKey(),
  key: text('key').notNull().unique(),
  count: integer('count').notNull(),
  lastRequest: integer('lastRequest').notNull(),
});


export const villageContact = sqliteTable('village_contact', {
  id: text('id').primaryKey(),
  officeName: text('officeName').notNull(),
  address: text('address').notNull(),
  openingHours: text('openingHours').notNull(),
  phone: text('phone').notNull().default(''),
  whatsapp: text('whatsapp').notNull().default(''),
  email: text('email').notNull().default(''),
  mapEmbedUrl: text('mapEmbedUrl').notNull().default(''),
  mapLink: text('mapLink').notNull().default(''),
  ...timestamps(),
});

export const homepageSettings = sqliteTable('homepage_settings', {
  id: text('id').primaryKey(),
  sections: text('sections', { mode: 'json' }).$type<HomeSections>().notNull(),
  ...timestamps(),
});
