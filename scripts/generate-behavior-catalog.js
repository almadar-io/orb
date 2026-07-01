#!/usr/bin/env node
/**
 * generate-behavior-catalog.js
 *
 * Thin wrapper kept for backwards compatibility. The canonical generator now
 * lives in `tools/almadar-pattern-sync` and emits JSON assets under
 * `static/playground/` instead of a giant TS file. It is invoked as:
 *
 *   npx @almadar-io/almadar-pattern-sync orb-website
 *
 * This script runs the local build of that tool from the monorepo root so
 * CI steps and package scripts keep working without waiting for a publish.
 */
const { execFileSync } = require('node:child_process');
const { resolve } = require('node:path');

const REPO_ROOT = resolve(__dirname, '../../..');
const SYNC_BIN = resolve(REPO_ROOT, 'tools/almadar-pattern-sync/dist/index.js');

try {
  execFileSync(process.execPath, [SYNC_BIN, 'orb-website', ...process.argv.slice(2)], {
    cwd: REPO_ROOT,
    stdio: 'inherit',
  });
} catch (err) {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
}
