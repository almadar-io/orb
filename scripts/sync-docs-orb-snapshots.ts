#!/usr/bin/env tsx
/**
 * sync-docs-orb-snapshots.ts
 *
 * Writes one `<name>.orb.json` per behavior into
 * `docs/reference/behaviors/` from the resolved schemas in
 * `src/data/behavior-catalog.ts`. The MDX pages import these files via
 * `import xSchema from './x.orb.json'`, so they MUST contain fully
 * resolved IR (no `uses:` / `ref:`) — same shape the playground feeds
 * to BrowserPlayground.
 */
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BEHAVIOR_CATALOG } from '../src/data/behavior-catalog.js';

const ORB_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ORB_ROOT, 'docs/reference/behaviors');

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

let written = 0;
for (const [name, entry] of Object.entries(BEHAVIOR_CATALOG)) {
  const outPath = join(OUT_DIR, `${name}.orb.json`);
  writeFileSync(outPath, JSON.stringify(entry.schema, null, 2) + '\n');
  written++;
}

console.log(`Wrote ${written} resolved .orb.json snapshots → ${OUT_DIR}`);
