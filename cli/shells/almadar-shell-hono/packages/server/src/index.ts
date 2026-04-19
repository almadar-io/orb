/**
 * Server Entry Point
 */

import { initializeFirebase, env, logger } from '@almadar/server-hono';

// Initialize Firebase before anything else uses it
initializeFirebase();

import { serve } from '@hono/node-server';
import { app } from './app.js';

const PORT = env.PORT || 3030;

async function start(): Promise<void> {
  // Seed mock data when USE_MOCK_DATA is enabled
  if (env.USE_MOCK_DATA) {
    try {
      const { initializeMockData } = await import(/* @vite-ignore */ './seedMockData.js' as string);
      await initializeMockData();
    } catch {
      logger.warn('seedMockData.ts not found - skipping mock data seeding');
    }
  }

  serve({ fetch: app.fetch, port: PORT }, () => {
    logger.info(`Server running on port ${PORT}`);
  });
}

start();
