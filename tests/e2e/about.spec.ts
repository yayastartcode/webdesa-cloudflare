import { test, expect } from '@playwright/test';

const info = { id: 'village', visi: 'Lomaer maju bersama warga', misi: 'Pelayanan terbuka\nPemberdayaan warga', tujuan: 'Kesejahteraan masyarakat' };
const welcome = { id: 'welcome', content: '## Sambutan Kepala Desa\n\nSelamat datang di profil Desa Lomaer.' };
const employees = [{ id: 'employee', name: 'Nama Perangkat Uji', position: 'Sekretaris Desa', order: 1 }];

test('about shows shared village content without depending on homepage visibility and supports Indonesian alias', async ({ page }) => {
  await page.route('**/api/header-settings', route => route.fulfill({ json: null }));
  await page.route('**/api/village-info', route => route.fulfill({ json: info }));
  await page.route('**/api/village-head-welcome', route => route.fulfill({ json: { success: true, data: welcome } }));
  await page.route('**/api/employees', route => route.fulfill({ json: { success: true, data: employees } }));
  await page.route('**/api/homepage-settings', route => route.fulfill({ json: { success: true, data: { sections: {} } } }));
  await page.goto('/tentang');
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.getByRole('heading', { name: 'Tentang Desa Lomaer', exact: true })).toBeVisible();
  await expect(page.getByText(info.visi, { exact: true })).toBeVisible();
  await expect(page.getByText('Selamat datang di profil Desa Lomaer.', { exact: true })).toBeVisible();
  await expect(page.getByText(employees[0].name, { exact: true })).toBeVisible();
  await page.getByRole('navigation', { name: 'Bagian tentang desa' }).getByRole('link', { name: 'Visi, Misi & Tujuan', exact: true }).click();
  await expect(page).toHaveURL(/\/about#visi-misi$/);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.reload();
  await expect(page.getByText(info.visi, { exact: true })).toBeVisible();
});

test('about skips missing content without inventing village information or empty notifications', async ({ page }) => {
  await page.route('**/api/header-settings', route => route.fulfill({ json: null }));
  await page.route('**/api/village-info', route => route.fulfill({ json: null }));
  await page.route('**/api/village-head-welcome', route => route.fulfill({ json: { success: true, data: null } }));
  await page.route('**/api/employees', route => route.fulfill({ json: { success: true, data: [] } }));
  await page.goto('/about');
  await expect(page.getByRole('status')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Tentang Desa Lomaer', exact: true })).toBeVisible();
  await expect(page.locator('#visi-misi, #sambutan, #pegawai')).toHaveCount(0);
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page.getByRole('link', { name: 'Kontak & Lokasi', exact: true }).click();
  await expect(page).toHaveURL(/\/contact$/);
});

test('failed profile resource leaves other sections visible and can be retried', async ({ page }) => {
  let fail = true;
  await page.route('**/api/header-settings', route => route.fulfill({ json: null }));
  await page.route('**/api/village-info', route => fail ? route.fulfill({ status: 503, json: { error: 'Unavailable' } }) : route.fulfill({ json: info }));
  await page.route('**/api/village-head-welcome', route => route.fulfill({ json: { success: true, data: welcome } }));
  await page.route('**/api/employees', route => route.fulfill({ json: { success: true, data: employees } }));
  await page.goto('/about');
  await expect(page.getByRole('alert')).toContainText('visi, misi dan tujuan');
  await expect(page.getByText(employees[0].name, { exact: true })).toBeVisible();
  await expect(page.getByText('Selamat datang di profil Desa Lomaer.', { exact: true })).toBeVisible();
  fail = false;
  await page.getByRole('button', { name: 'Coba lagi', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.getByText(info.visi, { exact: true })).toBeVisible();
});
