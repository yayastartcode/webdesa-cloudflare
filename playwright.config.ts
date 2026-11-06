import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e', workers: 1, timeout: 60_000,
  use: { baseURL: 'http://localhost:8788', headless: true, trace: 'retain-on-failure' },
  webServer: { command: 'npm run cf:build && node tests/serve.mjs', url: 'http://localhost:8788/api/admin/check', timeout: 60_000, reuseExistingServer: false },
});
