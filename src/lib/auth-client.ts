import { createAuthClient } from 'better-auth/react';
import { inferAdditionalFields } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  plugins: [inferAdditionalFields({ user: { role: { type: 'string', input: false } } })],
});
export type Session = { user: { id: string; name: string; email: string; role: string; image?: string | null } };
export function useSession() {
  const { data, isPending, error } = authClient.useSession();
  return { data, status: isPending ? 'loading' : (data && !error ? 'authenticated' : 'unauthenticated') };
}
export async function signIn(_provider: string, options: { email: string; password: string; redirect: boolean }) {
  const result = await authClient.signIn.email({ email: options.email, password: options.password });
  return { error: result.error?.message };
}
export async function getSession() {
  return (await authClient.getSession({ fetchOptions: { cache: 'no-store' } })).data;
}
export async function signOut({ callbackUrl }: { callbackUrl: string }) {
  const result = await authClient.signOut();
  if (!result.error) window.location.assign(callbackUrl);
}
