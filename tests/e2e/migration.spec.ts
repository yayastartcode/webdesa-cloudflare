import { test, expect, request, type APIRequestContext } from '@playwright/test';

const origin = 'http://localhost:8788';
const credentials = { email: 'admin@example.test', password: 'migration-test-password-2026' };
let api: APIRequestContext;
const image = 'https://example.com/village.jpg';
test.describe.serial('Cloudflare migration', () => {
  test.beforeAll(async () => { api = await request.newContext({ baseURL: origin, extraHTTPHeaders: { Origin: origin } }); });
  test.afterAll(async () => { await api.dispose(); });

  test('anonymous permissions, setup and Better Auth sessions', async () => {
    for (const path of ['/api/helpdesk', '/api/helpdesk/123', '/api/info/manage/123', '/api/apb-desa?admin=true']) expect((await api.get(path)).status(), path).toBe(403);
    for (const path of ['/api/posts', '/api/gallery', '/api/info', '/api/employees', '/api/hero-slides', '/api/header-settings', '/api/population-data', '/api/village-info', '/api/village-head-welcome', '/api/apb-desa', '/api/uploads']) expect((await api.post(path, { data: {} })).status(), path).toBe(403);
    expect((await api.post('/api/admin/create', { data: { ...credentials, name: 'Administrator' } })).status()).toBe(403);
    const setup = await api.post('/api/admin/create', { headers: { 'X-Setup-Token': 'local-test-setup-token-only' }, data: { ...credentials, name: 'Administrator' } });
    expect(await setup.text()).toContain('Admin berhasil dibuat');
    expect(setup.status()).toBe(201);
    expect((await api.post('/api/admin/create', { headers: { 'X-Setup-Token': 'local-test-setup-token-only' }, data: { ...credentials, name: 'Administrator' } })).status()).toBe(409);
    expect((await api.post('/api/auth/sign-up/email', { data: { ...credentials, name: 'Attacker', role: 'ADMIN' } })).ok()).toBe(false);
    const login = await api.post('/api/auth/sign-in/email', { data: credentials });
    expect(await login.text()).toContain('ADMIN'); expect(login.status()).toBe(200);
    const session = await api.get('/api/auth/get-session');
    expect((await session.json()).user.role).toBe('ADMIN');
  });

  test('all content APIs retain response contracts and update behavior', async () => {
    const create = async (path: string, data: object) => {
      const response = await api.post(path, { data });
      expect(response.ok(), `${path}: ${await response.text()}`).toBe(true);
      return response.json();
    };
    const header = await create('/api/header-settings', { logoUrl: image, navigationItems: [{ label: 'Berita', href: '/berita', order: 1 }] });
    expect(header.navigationItems[0].href).toBe('/berita');
    expect((await (await api.get('/api/header-settings')).json()).navigationItems).toHaveLength(1);
    const slide = await create('/api/hero-slides', { title: 'Desa', description: 'Selamat datang', imageUrl: image, order: 1 });
    expect((await api.patch(`/api/hero-slides/${slide.id}`, { data: { isActive: false } })).ok()).toBe(true);
    expect((await (await api.get(`/api/hero-slides/${slide.id}`)).json()).isActive).toBe(false);
    await api.patch(`/api/hero-slides/${slide.id}`, { data: { isActive: true } });
    const visi = await create('/api/village-info', { visi: 'Visi desa', misi: 'Misi desa', tujuan: 'Tujuan desa' }); expect(visi.visi).toBe('Visi desa');
    const welcome = await create('/api/village-head-welcome', { content: '# Sambutan' }); expect(welcome.success).toBe(true);
    const population = await create('/api/population-data', { totalPopulation: 100, malePopulation: 40, femalePopulation: 60, households: 20, temporaryResidents: 0, populationMutations: 0 }); expect(population.success).toBe(true);
    const employee = (await create('/api/employees', { name: 'Kepala Desa', position: 'Kepala Desa', photoUrl: image, order: 1 })).data;
    const second = (await create('/api/employees', { name: 'Sekretaris', position: 'Sekretaris', order: 1 })).data;
    expect((await (await api.get(`/api/employees/${employee.id}`)).json()).data.order).toBe(2);
    expect((await api.put(`/api/employees/${employee.id}`, { data: { name: employee.name, position: employee.position, order: 1 } })).ok()).toBe(true);
    expect((await api.delete(`/api/employees/${second.id}`)).ok()).toBe(true);
    const post = (await create('/api/posts', { title: 'Berita Migrasi', content: '<p>Isi berita</p>', imageUrl: image, published: true })).data;
    expect(post.author.name).toBe('Administrator');
    expect((await (await api.get(`/api/posts/${post.id}`)).json()).data.title).toBe('Berita Migrasi');
    const gallery = (await create('/api/gallery', { title: 'Galeri Desa', imageUrl: image, category: 'Kegiatan', order: 0 })).gallery;
    expect((await api.patch(`/api/gallery/${gallery.id}`, { data: { isActive: false } })).ok()).toBe(true);
    expect((await (await api.get(`/api/gallery/${gallery.id}`)).json()).gallery.isActive).toBe(false);
    const info = (await create('/api/info', { title: 'Profil Desa', slug: 'profil-desa', pdfUrl: 'https://example.com/profil.pdf' })).info;
    expect((await api.patch(`/api/info/manage/${info.id}`, { data: { isActive: false } })).ok()).toBe(true);
    await api.patch(`/api/info/manage/${info.id}`, { data: { isActive: true } });
    expect((await (await api.get('/api/info/profil-desa')).json()).data.title).toBe('Profil Desa');
    const budget = (await create('/api/apb-desa', { year: 2026, pendapatanDesa: '123456789.12', belanjaDesa: '98765432.10' })).data;
    expect(Number(budget.pendapatanDesa)).toBe(123456789.12);
    expect((await api.put(`/api/apb-desa/${budget.id}`, { data: { year: 2026, pendapatanDesa: '123456789.13', belanjaDesa: '98765432.10', isActive: true } })).ok()).toBe(true);
    expect(Number((await (await api.get('/api/apb-desa')).json()).data.pendapatanDesa)).toBe(123456789.13);
    for (const path of ['/api/posts?page=0', '/api/gallery?limit=10000', '/api/info?page=oops']) expect((await api.get(path)).status()).toBe(400);
    expect((await api.post('/api/gallery', { data: { title: 'Invalid' } })).status()).toBe(400);
    expect((await api.post('/api/posts', { headers: { Origin: 'https://evil.example' }, data: {} })).status()).toBe(403);
  });

  test('helpdesk and R2 image/PDF uploads', async () => {
    const complaint = await api.post('/api/helpdesk', { data: { nama: 'Warga', nomorWhatsapp: '08123456789', kategoriPengaduan: 'umum', pesanPengaduan: 'Mohon bantuan', recaptchaToken: 'development-mode' } });
    expect(complaint.status()).toBe(201);
    const { id } = await complaint.json();
    expect((await api.patch(`/api/helpdesk/${id}`, { data: { status: 'resolved', response: 'Sudah ditangani' } })).ok()).toBe(true);
    expect((await (await api.get('/api/helpdesk?status=resolved')).json()).helpdesks[0].response).toBe('Sudah ditangani');
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=', 'base64');
    const uploaded = await api.post('/api/uploads?type=image', { headers: { 'Content-Type': 'image/png' }, data: png });
    expect(uploaded.status(), await uploaded.text()).toBe(201);
    const file = await uploaded.json();
    const download = await api.get(file.url); expect(await download.body()).toEqual(png);
    expect(download.headers()['content-type']).toBe('image/png');
    expect((await api.get(file.url, { headers: { 'If-None-Match': download.headers()['etag'] } })).status()).toBe(304);
    const pdf = await api.post('/api/uploads?type=pdf', { headers: { 'Content-Type': 'application/pdf' }, data: Buffer.from('%PDF-1.7\n%%EOF') }); expect(pdf.status()).toBe(201);
    expect((await api.post('/api/uploads?type=image', { headers: { 'Content-Type': 'image/png' }, data: Buffer.from('invalid') })).status()).toBe(415);
    expect((await api.post('/api/uploads?type=image', { headers: { 'Content-Type': 'image/svg+xml' }, data: '<svg/>' })).status()).toBe(415);
    expect((await api.post('/api/uploads?type=image', { headers: { 'Content-Type': 'image/png' }, data: Buffer.alloc(4 * 1024 * 1024 + 1) })).status()).toBe(413);
  });

  test('public pages and dashboard render with original UI', async ({ page }) => {
    await page.route('https://example.com/**', route => route.fulfill({ status: 200, body: '' }));
    const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto('/', { waitUntil: 'domcontentloaded' }); await expect(page.getByRole('navigation')).toBeVisible();
    await page.goto('/berita', { waitUntil: 'domcontentloaded' }); await expect(page.getByText('Berita Migrasi').first()).toBeVisible();
    await page.getByText('Berita Migrasi').first().click(); await expect(page.getByText('Isi berita')).toBeVisible();
    await page.goto('/galeri', { waitUntil: 'domcontentloaded' }); await expect(page.getByText('Galeri').first()).toBeVisible();
    await page.goto('/info/profil-desa', { waitUntil: 'domcontentloaded' }); await expect(page.getByText('Profil Desa').first()).toBeVisible();
    await page.goto('/dashboard/gallery', { waitUntil: 'domcontentloaded' }); await expect(page).toHaveURL(/\/login$/);
    await page.getByLabel('Email', { exact: true }).fill(credentials.email);
    await page.getByLabel('Password', { exact: true }).fill(credentials.password);
    const signedIn = page.waitForResponse(response => response.url().endsWith('/api/auth/sign-in/email') && response.request().method() === 'POST');
    await page.getByRole('button', { name: 'Masuk', exact: true }).click();
    const login = await signedIn;
    expect(login.status(), await login.text()).toBe(200);
    await expect(page).toHaveURL(/\/dashboard$/);
    for (const route of ['posts','header-settings','hero-slides','village-info','village-head-welcome','employees','population-data','gallery','helpdesk','info','apb-desa']) {
      await page.goto(`/dashboard/${route}`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('h1').first(), route).toBeVisible();
      await expect(page).toHaveURL(new RegExp(`/dashboard/${route}$`));
    }
    expect(errors).toEqual([]);
  });
});
