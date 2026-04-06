/**
 * Bun-native server entry point for `orb serve`
 *
 * Serves both the Hono API and the built client static files.
 * No @hono/node-server needed: Bun serves Hono natively.
 *
 * @packageDocumentation
 */

import { env, logger } from '@almadar/server-hono';
import { app } from './app.js';
import { serveStatic } from 'hono/bun';
import { join } from 'path';

const PORT = Number(env.PORT) || 3030;
const clientDist = join(import.meta.dir, '../../client/dist');

// Seed mock data
if (env.USE_MOCK_DATA || env.NODE_ENV !== 'production') {
  try {
    const { initializeMockData } = await import(/* @vite-ignore */ './seedMockData.js' as string);
    await initializeMockData();
  } catch {
    logger.warn('seedMockData.ts not found - skipping mock data seeding');
  }
}

// Serve built client static files
app.use('/*', serveStatic({ root: clientDist }));

// SPA fallback: serve index.html for client-side routes
app.get('*', async (c) => {
  const file = Bun.file(join(clientDist, 'index.html'));
  if (await file.exists()) {
    return c.html(await file.text());
  }
  return c.json({ error: 'Client not built' }, 404);
});

logger.info(`Server running on http://localhost:${PORT}`);

export default {
  fetch: app.fetch,
  port: PORT,
};
