import type { createStore } from './db/store';
export type AppEnv = Omit<CloudflareBindings, "APP_ENV" | "BETTER_AUTH_URL"> & {
  APP_ENV: string;
  BETTER_AUTH_URL: string;
  BETTER_AUTH_SECRET: string;
  SETUP_TOKEN?: string;
  RECAPTCHA_SECRET_KEY?: string;
};
export type RouteContext = {
  store: ReturnType<typeof createStore>;
  session: { user: { id: string; email: string; name: string; role?: string | null } } | null;
  env: AppEnv;
};
