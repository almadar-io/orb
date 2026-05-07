/**
 * Server Entry Point
 */

import { initializeFirebase, env, logger } from '@almadar/server';

// Initialize Firebase before anything else uses it
initializeFirebase();

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
