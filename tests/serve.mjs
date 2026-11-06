import { startRuntime } from './runtime.mjs';
const runtime = await startRuntime();
console.log('Local test runtime ready');
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, async () => { await runtime.dispose(); process.exit(0); });
