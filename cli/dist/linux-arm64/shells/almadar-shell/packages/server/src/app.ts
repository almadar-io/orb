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
} from '@almadar/server';
import { registerRoutes } from './routes.js';

export const app: Express = express();

// Middleware
app.use(helmet());
// CORS: env-driven allowlist (CORS_ORIGIN) — never reflect arbitrary origins with credentials.
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Debug event bus endpoints (dev-only, no-op in production)
app.use('/api/debug', debugEventsRouter());

// Register generated routes
registerRoutes(app);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);
