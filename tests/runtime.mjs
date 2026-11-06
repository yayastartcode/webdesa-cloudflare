import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { randomBytes } from 'node:crypto';

export const setupToken = 'local-test-setup-token-only';
export async function startRuntime(port = 8788, appEnv = 'development') {
  const runtime = new Miniflare(convertV4MiniflareOptions({
    port, host: '127.0.0.1', modules: true,
    scriptPath: '.wrangler/test-worker/index.js',
    compatibilityDate: '2026-11-06', compatibilityFlags: ['nodejs_compat'],
    d1Databases: ['DB'], r2Buckets: ['UPLOADS'],
    bindings: { APP_ENV: appEnv, BETTER_AUTH_URL: `http://localhost:${port}`, BETTER_AUTH_SECRET: randomBytes(48).toString('hex'), SETUP_TOKEN: setupToken },
    serviceBindings: { ASSETS: async (request) => {
      const pathname = decodeURIComponent(new URL(request.url).pathname);
      const file = path.resolve('dist', '.' + pathname);
      if (file !== path.resolve('dist') && !file.startsWith(path.resolve('dist') + path.sep)) return new Response('Not found', { status: 404 });
      const mime = { '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };
      try { return new Response(await readFile(file), { headers: { 'Content-Type': mime[path.extname(file)] ?? 'application/octet-stream' } }); }
      catch { return new Response(await readFile('dist/index.html'), { headers: { 'Content-Type': 'text/html' } }); }
    } },
  }));
  await runtime.ready;
  const db = await runtime.getD1Database('DB');
  for (const file of (await readdir('drizzle')).filter(file => file.endsWith('.sql')).sort()) {
    const source = await readFile(`drizzle/${file}`, 'utf8');
    for (const statement of source.split('--> statement-breakpoint').map(part => part.trim()).filter(Boolean)) await db.prepare(statement).run();
  }
  return runtime;
}
