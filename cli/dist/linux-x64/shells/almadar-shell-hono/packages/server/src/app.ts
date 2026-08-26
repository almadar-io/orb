/**
 * Hono Application Setup
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import {
  errorHandler,
  notFoundHandler,
  debugEventsRouter,
  pushRouter,
  pushServiceWorkerHandler,
  PUSH_SERVICE_WORKER_PATH,
  reportsRouter,
  createHooksRouter,
  type AppEnv,
} from '@almadar/server-hono';
import { hookProviders } from './hooks-providers.js';
import { broadcastBusEvent } from './sse.js';
import { registerRoutes } from './routes.js';

export const app = new Hono<AppEnv>();

// Middleware
app.use('*', cors({ origin: (origin) => origin, credentials: true }));

// Health check
app.get('/health', (c) => c.json({ status: 'ok' }));

// Debug event bus endpoints (dev-only, no-op in production)
app.route('/api/debug', debugEventsRouter());

// Web Push surface (browser/push-subscribe): public VAPID key + the shared
// service worker (root-scoped — a SW's max scope is its own directory).
app.route('/api/push', pushRouter);
app.get(PUSH_SERVICE_WORKER_PATH, pushServiceWorkerHandler);

// Inbound webhook ingress (I-19 decision): mounted BEFORE the authenticated
// /api routes — hook senders (Google Calendar watch channels, e-sign status,
// banking callbacks) cannot present a Firebase token, so each provider
// VERIFIES its own signature/channel token and unverified requests get 400.
// Dispatch = SSE bus broadcast to every connected client, so client circuits'
// `listens` fire; the cron pull cycle stays the no-client backstop.
app.route(
  '/api/hooks',
  createHooksRouter({
    // Derived from this app's invoked services (generated hooks-providers.ts, I-26).
    providers: hookProviders(),
    dispatch: (event, payload) => {
      broadcastBusEvent(undefined, {
        type: 'bus',
        event,
        payload,
        source: { orbital: 'webhook', trait: 'ingress' },
        timestamp: Date.now(),
      });
    },
  }),
);

// Register generated routes
registerRoutes(app);

// Server-side report export (Excel/PDF/CSV). Mounted AFTER registerRoutes so
// the /api/* auth middleware it registers covers this route too.
app.route('/api/reports', reportsRouter);

// Error handling
app.notFound(notFoundHandler);
app.onError(errorHandler);
