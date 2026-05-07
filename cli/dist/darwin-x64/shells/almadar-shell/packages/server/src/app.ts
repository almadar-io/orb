/**
 * Express Application Setup
 */

import express, { type Express } from 'express';
import cors from 'cors';
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
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
