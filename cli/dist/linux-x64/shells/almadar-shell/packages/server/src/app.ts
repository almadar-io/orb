/**
 * Express Application Setup
 */

import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import {
  env,
  logger,
  errorHandler,
  notFoundHandler,
  debugEventsRouter,
  personasRouter,
  pushRouter,
  pushServiceWorkerHandler,
  PUSH_SERVICE_WORKER_PATH,
  reportsRouter,
  createHooksRouter,
} from '@almadar/server';
import { hookProviders } from './hooks-providers.js';
import { broadcastBusEvent } from './sse.js';
import { registerRoutes } from './routes.js';

export const app: Express = express();

// Middleware
app.use(helmet());
// CORS: env-driven allowlist (CORS_ORIGIN) — never reflect arbitrary origins with credentials.
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
// Rate limiting protects deployed apps; verification walkers and local dev
// fire hundreds of bridge events per minute and must not be throttled —
// ORB_DISABLE_RATE_LIMIT=1 (set by the verify harness) bypasses it.
if (process.env.ORB_DISABLE_RATE_LIMIT !== '1') {
  app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false }));
}

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Debug event bus endpoints (dev-only, no-op in production)
app.use('/api/debug', debugEventsRouter());

// Web Push surface (browser/push-subscribe): public VAPID key + the shared
// service worker (root-scoped — a SW's max scope is its own directory).
app.use('/api/push', pushRouter);
app.get(PUSH_SERVICE_WORKER_PATH, pushServiceWorkerHandler);

// Inbound webhook ingress (I-19 decision): mounted BEFORE the authenticated
// /api routes — hook senders (Google Calendar watch channels, e-sign status,
// banking callbacks) cannot present a Firebase token, so each provider
// VERIFIES its own signature/channel token and unverified requests get 400.
// Providers are DERIVED from this app's invoked services (generated
// hooks-providers.ts, I-26). Dispatch = SSE bus broadcast to every connected
// client, so client circuits' `listens` fire; cron pull stays the backstop.
app.use(
  '/api/hooks',
  createHooksRouter({
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

// Dev persona roster (no-op unless ALLOW_DEV_AUTH_BYPASS). Mounted BEFORE
// registerRoutes, which applies authenticateFirebase to /api — a pre-login
// persona picker cannot present a token it does not have yet.
app.use('/api', personasRouter());

// Register generated routes
registerRoutes(app);

// Server-side report export (Excel/PDF/CSV). Mounted AFTER registerRoutes so
// the /api auth middleware it registers covers this route too.
app.use('/api/reports', reportsRouter);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);
