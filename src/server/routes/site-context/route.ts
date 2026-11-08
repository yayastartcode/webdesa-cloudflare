import type { RouteContext } from '../../context';
export function createHandlers({ env, session }: RouteContext) {
  async function GET() {
    if (session?.user.role !== 'ADMIN') return Response.json({ error: 'Unauthorized' }, { status: 403 });
    return Response.json({ success: true, data: { environment: env.APP_ENV, canonicalOrigin: new URL(env.BETTER_AUTH_URL).origin, primaryOrigin: 'https://desalomaer.com' } });
  }
  return { GET };
}
