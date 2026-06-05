/**
 * generate-home-example-schema.ts
 *
 * Regenerates src/data/home-example-schema.json (the Preview tab's schema) from
 * HOME_EXAMPLE_CODE (the Code tab's source) so the two never drift.
 *
 * Pipeline (same `orbital` binary the docs/playground use):
 *   HOME_EXAMPLE_CODE (.lolo) --emit orb--> .orb JSON --resolve--> resolved .orb
 *
 * Run after editing src/data/home-example.ts:
 *   npx tsx scripts/generate-home-example-schema.ts
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir, homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { HOME_EXAMPLE_CODE } from '../src/data/home-example';

const ORBITAL_BIN = process.env.ORBITAL_BIN ?? join(homedir(), 'bin/orbital');
const OUT = resolve(__dirname, '../src/data/home-example-schema.json');

function run(args: string[], input?: string): string {
  return execFileSync(ORBITAL_BIN, args, {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    input,
  });
}

function main(): void {
  const dir = mkdtempSync(join(tmpdir(), 'orb-home-'));
  const loloPath = join(dir, 'home-example.lolo');
  const orbPath = join(dir, 'home-example.orb');
  writeFileSync(loloPath, HOME_EXAMPLE_CODE);

  // .lolo -> canonical .orb JSON
  writeFileSync(orbPath, run(['emit', 'orb', loloPath]));
  // .orb -> fully resolved (inline + compose + enrich) schema for the runtime
  const resolved = run(['resolve', orbPath]);

  // Pretty-print + validate it parses before writing.
  const schema = JSON.parse(resolved);
  writeFileSync(OUT, JSON.stringify(schema, null, 2) + '\n');
  const traits = schema.orbitals?.[0]?.traits?.length ?? 0;
  console.log(`Wrote ${OUT} (${traits} traits, ${resolved.length} bytes resolved).`);
}

main();
