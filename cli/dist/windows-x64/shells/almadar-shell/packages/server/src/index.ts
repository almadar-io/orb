/**
 * Server Entry Point
 */

import { initializeFirebase, env, logger } from '@almadar/server';

// Initialize Firebase before anything else uses it. When no credentials
// are configured (local dev without FIREBASE_*/FIRESTORE_EMULATOR_HOST),
// boot anyway — a purely client-side app must still serve.
try {
  initializeFirebase();
} catch (e) {
  const message = e instanceof Error ? e.message : String(e);
  // In production the real data source IS Firebase (env.ts refuses to boot with
  // USE_MOCK_DATA=true there), so swallowing this leaves a server that starts
  // cleanly and then throws on the first request. Fail at boot instead.
  if (env.NODE_ENV === 'production') {
    logger.error(`Firebase is required when NODE_ENV=production — refusing to start: ${message}`);
    throw e;
  }
  logger.warn(`Firebase not configured — auth/db routes disabled: ${message}`);
}

import { app } from './app.js';

const PORT = env.PORT || 3030;

async function start(): Promise<void> {
  // Seed mock data when USE_MOCK_DATA is enabled
  if (env.USE_MOCK_DATA) {
    try {
      const { initializeMockData } = await import(/* @vite-ignore */ './seedMockData.js' as string);
      await initializeMockData();
    } catch {
      logger.warn('seedMockData.ts not found — skipping mock data seeding');
    }
  }

  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
}

start();
