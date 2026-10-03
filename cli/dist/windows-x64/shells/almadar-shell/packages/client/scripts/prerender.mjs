#!/usr/bin/env node
/**
 * Prerender a built site: serve `dist/` (unknown paths fall back to
 * index.html, like the host), visit every static route the compiler listed
 * in routes.json in a headless browser, and write each route's rendered HTML
 * to `dist/<route>/index.html`, plus sitemap.xml and robots.txt.
 *
 * Usage: node scripts/prerender.mjs --routes ../../routes.json --origin https://orb.almadar.io [--dist dist]
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import { routeFile, sitemap, robots } from './prerender-lib.mjs';

const { values } = parseArgs({
  options: { routes: { type: 'string' }, origin: { type: 'string' }, dist: { type: 'string', default: 'dist' } },
});
if (!values.routes || !values.origin) {
  console.error('usage: prerender.mjs --routes <routes.json> --origin <https://site> [--dist dist]');
  process.exit(2);
}
const dist = path.resolve(values.dist);
const routes = JSON.parse(fs.readFileSync(values.routes, 'utf8'));
const shell = fs.readFileSync(path.join(dist, 'index.html'));
const types = { '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2' };

const server = http.createServer((req, res) => {
  const url = decodeURIComponent((req.url ?? '/').split('?')[0]);
  const file = path.join(dist, url);
  if (file.startsWith(dist) && fs.existsSync(file) && fs.statSync(file).isFile()) {
    res.writeHead(200, { 'content-type': types[path.extname(file)] ?? 'application/octet-stream' });
    res.end(fs.readFileSync(file));
    return;
  }
  res.writeHead(200, { 'content-type': 'text/html' });
  res.end(shell);
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const local = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch();
const failures = [];
const rendered = new Map();
for (const route of routes) {
  const out = routeFile(route.path);
  if (out === null) continue;
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(local + route.path, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !document.querySelector('[data-loading-state]'), null, { timeout: 15000 });
  if (errors.length > 0) failures.push(`${route.path}: ${errors.join(' | ')}`);
  rendered.set(out, await page.content());
  await page.close();
}
await browser.close();
server.close();

if (failures.length > 0) {
  console.error(`prerender: ${failures.length} route(s) threw while rendering:\n${failures.join('\n')}`);
  process.exit(1);
}
for (const [out, html] of rendered) {
  fs.mkdirSync(path.dirname(path.join(dist, out)), { recursive: true });
  fs.writeFileSync(path.join(dist, out), html);
}
fs.writeFileSync(path.join(dist, 'sitemap.xml'), sitemap(routes, values.origin));
fs.writeFileSync(path.join(dist, 'robots.txt'), robots(values.origin));
console.log(`prerender: ${rendered.size} route(s) written to ${dist}`);
