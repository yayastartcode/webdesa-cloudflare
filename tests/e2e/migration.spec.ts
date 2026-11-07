import { request as httpRequest } from 'node:http';
import { test, expect, request, type Page, type Locator, type APIRequestContext } from '@playwright/test';

const origin = 'http://localhost:8788';
const credentials = { email: 'admin@example.test', password: 'migration-test-password-2026' };
let api: APIRequestContext;
const image = 'https://example.com/village.jpg';
const imageBytes = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=', 'base64');
async function uploadImage(page: Page, label: string) {
  const field = page.getByRole('group', { name: label, exact: true });
  const response = page.waitForResponse(r => r.url().endsWith('/api/uploads?type=image') && r.request().method() === 'POST');
  await field.locator('input[type="file"]').setInputFiles({ name: 'village.png', mimeType: 'image/png', buffer: imageBytes });
  const result = await response;
  expect(result.status(), await result.text()).toBe(201);
  const { url } = await result.json();
  await expect(field.getByRole('img')).toHaveAttribute('src', url);
  return url as string;
}
async function saveImageForm(page: Page, path: string, method: string, button: Locator) {
  const response = page.waitForResponse(r => r.url().endsWith(path) && r.request().method() === method);
  await button.click();
  const result = await response;
  expect(result.ok()).toBe(true);
  // Check persistence through an independent read, without depending on a browser
  // retaining a response body after its fetch handler has already consumed it.
  const payload = result.request().postDataJSON();
  let lookup = path;
  if (method === 'POST' && path === '/api/posts') lookup += '?admin=true&limit=100';
  if (method === 'POST' && path === '/api/gallery') lookup += '?limit=100';
  const persisted = await api.get(lookup);
  expect(persisted.ok()).toBe(true);
  const value = await persisted.json();
  if (method === 'POST' && (path === '/api/posts' || path === '/api/employees')) {
    return { data: value.data.find((row: { title?: string; name?: string }) => path === '/api/posts' ? row.title === payload.title : row.name === payload.name) };
  }
  if (method === 'POST' && path === '/api/gallery') return { gallery: value.galleries.find((row: { title: string }) => row.title === payload.title) };
  if (method === 'POST' && path === '/api/hero-slides') return value.find((row: { title: string }) => row.title === payload.title);
  return value;
}
test.describe.serial('Cloudflare migration', () => {
  test.beforeAll(async () => { api = await request.newContext({ baseURL: origin, extraHTTPHeaders: { Origin: origin } }); });
  test.afterAll(async () => { await api.dispose(); });

  test('anonymous permissions, setup and Better Auth sessions', async () => {
    for (const path of ['/api/posts?admin=true', '/api/helpdesk', '/api/helpdesk/123', '/api/info/manage/123', '/api/apb-desa?admin=true']) expect((await api.get(path)).status(), path).toBe(403);
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

  test('drafts persist in the admin list and stay private until published', async () => {
    const visitor = await request.newContext({ baseURL: origin });
    try {
      const payload = { title: 'Draft API regression', content: '<p>Konten draft</p>', published: false };
      const created = await api.post('/api/posts', { data: payload });
      expect(created.ok()).toBe(true);
      const { data: draft } = await created.json();
      expect((await (await api.get('/api/posts?admin=true')).json()).data.some((post: { id: string }) => post.id === draft.id)).toBe(true);
      expect((await (await visitor.get('/api/posts')).json()).data.some((post: { id: string }) => post.id === draft.id)).toBe(false);
      expect((await visitor.get(`/api/posts/${draft.id}`)).status()).toBe(404);
      expect((await api.get(`/api/posts/${draft.id}`)).status()).toBe(200);
      expect((await api.put(`/api/posts/${draft.id}`, { data: { ...payload, published: true } })).ok()).toBe(true);
      expect((await visitor.get(`/api/posts/${draft.id}`)).status()).toBe(200);
      expect((await (await visitor.get('/api/posts')).json()).data.some((post: { id: string }) => post.id === draft.id)).toBe(true);
      expect((await api.delete(`/api/posts/${draft.id}`)).ok()).toBe(true);
    } finally { await visitor.dispose(); }
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
    // Send only headers so the early 413 cannot race a client writing a large body.
    const { cookies } = await api.storageState();
    const oversizedStatus = await new Promise<number>((resolve, reject) => {
      const upload = httpRequest(new URL('/api/uploads?type=image', origin), {
        method: 'POST', headers: {
          'Content-Type': 'image/png', 'Content-Length': 4 * 1024 * 1024 + 1,
          Origin: origin, Cookie: cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; '),
        },
      }, response => { response.resume(); resolve(response.statusCode ?? 0); response.on('end', () => upload.destroy()); });
      upload.on('error', reject);
      upload.setTimeout(5000, () => upload.destroy(new Error('Oversized upload response timed out')));
      upload.end();
    });
    expect(oversizedStatus).toBe(413);
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
      const back = page.getByRole('link', { name: 'Kembali ke Dashboard', exact: true });
      await expect(back).toHaveCount(1);
      await expect(back).toHaveAttribute('href', '/dashboard');
      await expect(page.getByRole('navigation', { name: 'Navigasi admin', exact: true }).locator('[aria-current="page"]')).toHaveAttribute('href', `/dashboard/${route}`);
      await back.click();
      await expect(page).toHaveURL(/\/dashboard$/);

    }
    await page.goto('/dashboard/posts', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Tambah Berita', exact: true }).click();
    await page.getByPlaceholder('Masukkan judul berita').fill('Draft dari editor Tiptap');
    await page.locator('.tiptap-editor [contenteditable="true"]').fill('Isi berita yang disimpan dari editor.');
    const saved = page.waitForResponse(response => response.url().endsWith('/api/posts') && response.request().method() === 'POST');
    await page.getByRole('button', { name: 'Simpan Berita', exact: true }).click();
    expect((await saved).status()).toBe(200);
    await expect(page.getByRole('heading', { name: 'Draft dari editor Tiptap', exact: true })).toBeVisible();
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Draft dari editor Tiptap', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Edit Draft dari editor Tiptap', exact: true }).click();
    await expect(page.locator('.tiptap-editor [contenteditable="true"]')).toContainText('Isi berita yang disimpan dari editor.');
    await page.getByRole('switch').click();
    await expect(page.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    await page.getByRole('button', { name: 'Simpan Perubahan', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Simpan Perubahan', exact: true })).toHaveCount(0);
    await page.goto('/berita', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Draft dari editor Tiptap').first()).toBeVisible();
    await page.goto('/dashboard/gallery', { waitUntil: 'domcontentloaded' });
    await page.getByRole('navigation', { name: 'Navigasi admin', exact: true }).getByRole('link', { name: 'Pengaduan Warga', exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard\/helpdesk$/);
    await expect(page.getByRole('navigation', { name: 'Navigasi admin', exact: true }).locator('[aria-current="page"]')).toHaveAttribute('href', '/dashboard/helpdesk');
    await page.screenshot({ path: 'work/nav-desktop.png', fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    const mobileButton = page.getByRole('button', { name: 'Buka menu admin', exact: true });
    await expect(mobileButton).toBeVisible();
    await mobileButton.click();
    const mobileNav = page.getByRole('navigation', { name: 'Navigasi admin seluler', exact: true });
    await expect(mobileNav).toBeVisible();
    await page.screenshot({ path: 'work/nav-mobile.png', fullPage: true });
    await mobileNav.getByRole('link', { name: 'APB Desa', exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard\/apb-desa$/);
    await expect(mobileNav).toHaveCount(0);
    await expect(mobileButton).toHaveAttribute('aria-expanded', 'false');
    await page.getByRole('link', { name: 'Kembali ke Dashboard', exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await mobileButton.click();
    await page.keyboard.press('Escape');
    await expect(mobileNav).toHaveCount(0);
    await expect(mobileButton).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
  test('news covers, inline editor images, employee photos and logos upload and persist', async ({ page }) => {
    await page.context().addCookies((await api.storageState()).cookies);
    await page.route('https://example.com/**', route => route.fulfill({ body: '' }));
    await page.goto('/dashboard/posts', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Tambah Berita', exact: true }).click();
    await page.getByPlaceholder('Masukkan judul berita').fill('Berita upload');
    await page.locator('.tiptap-editor [contenteditable="true"]').fill('Berita dengan foto.');
    const field = page.getByRole('group', { name: 'Gambar berita', exact: true });
    let release!: () => void;
    const gate = new Promise<void>(resolve => { release = resolve; });
    const delayedUpload = async (route: import('@playwright/test').Route) => { await gate; await route.continue(); };
    await page.route('**/api/uploads?type=image', delayedUpload);
    const uploading = page.waitForResponse(r => r.url().endsWith('/api/uploads?type=image'));
    await field.locator('input[type="file"]').setInputFiles({ name: 'cover.png', mimeType: 'image/png', buffer: imageBytes });
    await expect(page.getByRole('button', { name: 'Simpan Berita', exact: true })).toBeDisabled();
    await page.getByPlaceholder('Masukkan judul berita').fill('Berita upload terbaru');
    release();
    const cover = (await (await uploading).json()).url;
    await expect(field.getByRole('img')).toHaveAttribute('src', cover);
    await page.unroute('**/api/uploads?type=image', delayedUpload);
    await field.locator('input[type="file"]').setInputFiles({ name: 'invalid.txt', mimeType: 'text/plain', buffer: Buffer.from('no image') });
    await expect(field.getByRole('alert')).toContainText('Jenis file tidak didukung');
    await expect(field.getByRole('img')).toHaveAttribute('src', cover);
    await field.locator('input[type="file"]').setInputFiles({ name: 'large.png', mimeType: 'image/png', buffer: Buffer.alloc(4 * 1024 * 1024 + 1) });
    await expect(field.getByRole('alert')).toContainText('Ukuran file terlalu besar');
    const inlineUpload = page.waitForResponse(r => r.url().endsWith('/api/uploads?type=image'));
    await page.getByLabel('Upload gambar dalam konten', { exact: true }).setInputFiles({ name: 'inline.png', mimeType: 'image/png', buffer: Buffer.concat([imageBytes, Buffer.alloc(600_000)]) });
    const inline = (await (await inlineUpload).json()).url;
    await expect(page.getByRole('img', { name: 'inline.png', exact: true })).toHaveAttribute('src', inline);
    const post = (await saveImageForm(page, '/api/posts', 'POST', page.getByRole('button', { name: 'Simpan Berita', exact: true }))).data;
    expect(post.title).toBe('Berita upload terbaru'); expect(post.imageUrl).toBe(cover);
    expect(post.content).toContain(inline); expect(post.content).not.toContain('data:image'); expect(post.content.length).toBeLessThan(5000);
    await page.getByRole('button', { name: 'Edit Berita upload terbaru', exact: true }).click();
    const editedCover = await uploadImage(page, 'Gambar berita');
    expect((await saveImageForm(page, `/api/posts/${post.id}`, 'PUT', page.getByRole('button', { name: 'Simpan Perubahan', exact: true }))).data.imageUrl).toBe(editedCover);

    await page.goto('/dashboard/employees', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Tambah Pegawai', exact: true }).first().click();
    await page.getByLabel('Nama Lengkap', { exact: true }).fill('Pegawai upload');
    await page.getByLabel('Jabatan', { exact: true }).fill('Sekretaris');
    const photo = await uploadImage(page, 'Foto pegawai');
    const employee = (await saveImageForm(page, '/api/employees', 'POST', page.getByRole('button', { name: 'Simpan', exact: true }))).data;
    expect(employee.photoUrl).toBe(photo);
    await page.getByRole('button', { name: 'Edit Pegawai upload', exact: true }).click();
    const updatedPhoto = await uploadImage(page, 'Foto pegawai');
    expect((await saveImageForm(page, `/api/employees/${employee.id}`, 'PUT', page.getByRole('button', { name: 'Simpan', exact: true }))).data.photoUrl).toBe(updatedPhoto);

    await page.goto('/dashboard/header-settings', { waitUntil: 'domcontentloaded' });
    const logo = await uploadImage(page, 'Logo website');
    expect((await saveImageForm(page, '/api/header-settings', 'POST', page.getByRole('button', { name: 'Simpan Pengaturan', exact: true }))).logoUrl).toBe(logo);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('group', { name: 'Logo website', exact: true }).getByRole('img')).toHaveAttribute('src', logo);
  });

  test('gallery, new and existing slide images, and welcome images upload and persist', async ({ page }) => {
    await page.context().addCookies((await api.storageState()).cookies);
    await page.route('https://example.com/**', route => route.fulfill({ body: '' }));
    page.on('dialog', dialog => dialog.accept());
    await page.goto('/dashboard/gallery', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Tambah Item', exact: true }).click();
    await page.getByPlaceholder('Masukkan judul kegiatan').fill('Galeri upload');
    const galleryImage = await uploadImage(page, 'Gambar galeri');
    const gallery = (await saveImageForm(page, '/api/gallery', 'POST', page.getByRole('button', { name: 'Simpan', exact: true }))).gallery;
    expect(gallery.imageUrl).toBe(galleryImage);
    await page.getByRole('button', { name: 'Edit Galeri upload', exact: true }).click();
    const replacement = await uploadImage(page, 'Gambar galeri');
    expect((await saveImageForm(page, `/api/gallery/${gallery.id}`, 'PATCH', page.getByRole('button', { name: 'Perbarui', exact: true }))).gallery.imageUrl).toBe(replacement);

    await page.goto('/dashboard/hero-slides', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Add New Slide', exact: true }).click();
    await page.getByLabel('Title *', { exact: true }).fill('Slide upload');
    await page.getByLabel('Description *', { exact: true }).fill('Gambar desa');
    const slideImage = await uploadImage(page, 'Gambar slide');
    const slide = await saveImageForm(page, '/api/hero-slides', 'POST', page.getByRole('button', { name: 'Add Slide', exact: true }));
    expect(slide.imageUrl).toBe(slideImage);
    const changedSlide = await uploadImage(page, 'Gambar slide Slide upload');
    const saveSlide = page.getByRole('group', { name: 'Gambar slide Slide upload', exact: true }).locator('..').getByRole('button', { name: 'Simpan gambar', exact: true });
    expect((await saveImageForm(page, `/api/hero-slides/${slide.id}`, 'PATCH', saveSlide)).imageUrl).toBe(changedSlide);

    await page.goto('/dashboard/village-head-welcome', { waitUntil: 'domcontentloaded' });
    const welcomeUpload = page.waitForResponse(r => r.url().endsWith('/api/uploads?type=image'));
    await page.getByLabel('Upload gambar dalam sambutan', { exact: true }).setInputFiles({ name: 'welcome.png', mimeType: 'image/png', buffer: imageBytes });
    const welcomeImage = (await (await welcomeUpload).json()).url;
    await expect(page.locator('textarea')).toHaveValue(new RegExp(welcomeImage));
    const welcome = await saveImageForm(page, '/api/village-head-welcome', 'POST', page.getByRole('button', { name: 'Simpan', exact: true }));
    expect(welcome.data.content).toContain(`![Gambar sambutan](${welcomeImage})`);
  });

});
