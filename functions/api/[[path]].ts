import { handleApi } from '../../src/server/api';
import type { AppEnv } from '../../src/server/context';
export const onRequest: PagesFunction<AppEnv> = ({ request, env }) => handleApi(request, env);
