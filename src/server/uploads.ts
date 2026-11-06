import type { AppEnv } from './context';
const types: Record<string, { extension: string; signature: (bytes: Uint8Array) => boolean }> = {
  'image/jpeg': { extension: 'jpg', signature: b => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  'image/png': { extension: 'png', signature: b => [137,80,78,71,13,10,26,10].every((n, i) => b[i] === n) },
  'image/gif': { extension: 'gif', signature: b => new TextDecoder().decode(b.slice(0, 6)).match(/^GIF8[79]a$/) !== null },
  'image/webp': { extension: 'webp', signature: b => new TextDecoder().decode(b.slice(0, 4)) === 'RIFF' && new TextDecoder().decode(b.slice(8, 12)) === 'WEBP' },
  'application/pdf': { extension: 'pdf', signature: b => new TextDecoder().decode(b.slice(0, 5)) === '%PDF-' },
};
export async function upload(request: Request, env: AppEnv) {
  const pdf = new URL(request.url).searchParams.get('type') === 'pdf';
  const type = request.headers.get('Content-Type') ?? '';
  const format = types[type];
  if (!format || (pdf ? type !== 'application/pdf' : !type.startsWith('image/'))) return Response.json({ error: 'Jenis file tidak didukung' }, { status: 415 });
  const max = (pdf ? 16 : 4) * 1024 * 1024;
  if (Number(request.headers.get('Content-Length')) > max) return Response.json({ error: 'File terlalu besar' }, { status: 413 });
  const reader = request.body?.getReader();
  if (!reader) return Response.json({ error: 'File kosong' }, { status: 400 });
  const parts: Uint8Array[] = []; let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) { await reader.cancel(); return Response.json({ error: 'File terlalu besar' }, { status: 413 }); }
    parts.push(value);
  }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const part of parts) { bytes.set(part, offset); offset += part.byteLength; }
  if (!format.signature(bytes)) return Response.json({ error: 'Isi file tidak sesuai jenisnya' }, { status: 415 });
  const key = `${crypto.randomUUID()}.${format.extension}`;
  await env.UPLOADS.put(key, bytes, { httpMetadata: { contentType: type, cacheControl: 'public, max-age=31536000, immutable' } });
  const url = `/api/uploads/${key}`;
  return Response.json({ key, url, ufsUrl: url }, { status: 201 });
}
export async function readUpload(request: Request, env: AppEnv) {
  const key = new URL(request.url).pathname.slice('/api/uploads/'.length);
  if (!/^[a-f0-9-]{36}\.(jpg|png|gif|webp|pdf)$/.test(key)) return new Response('Not found', { status: 404 });
  const object = await env.UPLOADS.get(key);
  if (!object) return new Response('Not found', { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers); headers.set('ETag', object.httpEtag);
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Content-Security-Policy', "default-src 'none'; sandbox");
  if (request.headers.get('If-None-Match') === object.httpEtag) return new Response(null, { status: 304, headers });
  return new Response(request.method === 'HEAD' ? null : object.body, { headers });
}
