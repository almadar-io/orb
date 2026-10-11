#!/usr/bin/env node
/**
 * Build the static site from its .lolo organism: compile the installed
 * @almadar-io/behaviors organism (client mode), vite-build it, prerender
 * every route the compiler listed, and copy the static files beside it.
 *
 * Usage: node scripts/build-site.mjs --organism <name> --origin <https://site>
 *          [--static static] [--studio-release src/data/studio-release.json] [--out build]
 * The compiler is the installed @almadar/orb (node_modules/.bin/orb), or ORB_BIN.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { applyStudioRelease } from './site-lib.mjs';

const { values } = parseArgs({
  options: {
    organism: { type: 'string' },
    origin: { type: 'string' },
    static: { type: 'string', default: 'static' },
    'studio-release': { type: 'string' },
    out: { type: 'string', default: 'build' },
  },
});
if (!values.organism || !values.origin) {
  console.error('usage: build-site.mjs --organism <name> --origin <https://site> [--static dir] [--studio-release file] [--out dir]');
  process.exit(2);
}

const root = process.cwd();
const work = path.join(root, '.site');
const app = path.join(work, 'app');
const client = path.join(app, 'packages', 'client');
const out = path.resolve(values.out);
const orb = process.env.ORB_BIN ?? path.join(root, 'node_modules', '.bin', 'orb');
const run = (cmd, args, cwd, env = process.env) => execFileSync(cmd, args, { cwd, env, stdio: 'inherit' });

// `orb` resolves the organism through the installed package's manifest (the
// published package's materialized registry, or a workspace package's live
// `.lolo` — docs/Almadar_Behavior_Packages.md §15) and lowers it to its program.
const located = execFileSync(orb, ['behaviors', 'which', `almadar-behaviors/${values.organism}`], { cwd: root, encoding: 'utf8' }).trim();
const sourceFile = located.replace(/ \(@[^)]*\)$/, '');
const lowered = JSON.parse(execFileSync(orb, ['lower', sourceFile], { cwd: root, encoding: 'utf8', maxBuffer: 1 << 30 }).trim().split('\n')[0]);
if (lowered.error !== undefined) throw new Error(`${values.organism}: ${lowered.error}`);
const program = lowered.orb;
if (values['studio-release']) {
  const filled = applyStudioRelease(program, JSON.parse(fs.readFileSync(values['studio-release'], 'utf8')));
  console.log(`[build-site] studio release → ${filled} Downloads orbital(s)`);
}

fs.rmSync(work, { recursive: true, force: true });
fs.mkdirSync(work, { recursive: true });
const programFile = path.join(work, `${values.organism}.orb`);
fs.writeFileSync(programFile, JSON.stringify(program, null, 2));

run(orb, ['compile', programFile, '--mode', 'client', '-o', app], root);
if (fs.existsSync(values.static)) fs.cpSync(values.static, path.join(client, 'public'), { recursive: true });
run('pnpm', ['install', '--no-frozen-lockfile'], app);
run('pnpm', ['exec', 'playwright', 'install', 'chromium'], client);
// 174 routes in one bundle: the default heap runs out mid-chunking.
run('pnpm', ['exec', 'vite', 'build', '--logLevel', 'warn'], client, { ...process.env, NODE_OPTIONS: '--max-old-space-size=6144' });
run('node', ['scripts/route-documents.mjs', '--manifest', path.join(app, 'routes.json'), '--dist', 'dist'], client);
run('node', ['scripts/prerender.mjs', '--routes', path.join(app, 'routes.json'), '--origin', values.origin, '--dist', 'dist'], client);

fs.rmSync(out, { recursive: true, force: true });
fs.cpSync(path.join(client, 'dist'), out, { recursive: true });
console.log(`[build-site] ${values.organism} → ${path.relative(root, out)}`);
