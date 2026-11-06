import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { compare, hash } from 'bcryptjs';
import type { Database } from './db/store';
import * as schema from './db/schema';
import type { AppEnv } from './context';

export function createAuth(db: Database, env: AppEnv) {
  if (!env.BETTER_AUTH_SECRET || env.BETTER_AUTH_SECRET.length < 32) throw new Error('BETTER_AUTH_SECRET must have at least 32 characters');
  return betterAuth({
    database: drizzleAdapter(db, { provider: 'sqlite', schema }),
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: [env.BETTER_AUTH_URL],
    emailAndPassword: {
      enabled: true, disableSignUp: true, minPasswordLength: 12,
      // Retain compatibility with imported NextAuth bcrypt credentials.
      password: { hash: (password) => hash(password, 12), verify: ({ hash: digest, password }) => compare(password, digest) },
    },
    user: { additionalFields: { role: { type: 'string', required: false, defaultValue: 'USER', input: false } } },
    advanced: { useSecureCookies: env.APP_ENV !== 'development', ipAddress: { ipAddressHeaders: ['cf-connecting-ip'] } },
    rateLimit: { enabled: true, storage: 'database' },
  });
}
