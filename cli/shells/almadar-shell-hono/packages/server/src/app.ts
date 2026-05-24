/**
 * Hono Application Setup
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import {
  errorHandler,
  notFoundHandler,
  debugEventsRouter,
  type AppEnv,
} from '@almadar/server-hono';
import { registerRoutes } from './routes.js';

export const app = new Hono<AppEnv>();

// Middleware
app.use('*', cors({ origin: (origin) => origin, credentials: true }));

// Health check
app.get('/health', (c) => c.json({ status: 'ok' }));

// Debug event bus endpoints (dev-only, no-op in production)
app.route('/api/debug', debugEventsRouter());

// Register generated routes
registerRoutes(app);

// Error handling
app.notFound(notFoundHandler);
app.onError(errorHandler);
