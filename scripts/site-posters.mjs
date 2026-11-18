#!/usr/bin/env node
/**
 * First-paint help for a built site: a picture of each route shown at once while the engine starts, and
 * preload hints so the engine, the program and the language pack download beside the script instead of after it.
 *
 * Usage: node site-posters.mjs --dist <built site> --routes <routes.json> --client <dir whose node_modules has playwright>
 * Writes posters/<route>-phone.jpg and posters/<route>-desktop.jpg and edits every route document in place.
 * The picture shows only at the widths it was taken for (phones, and windows at least 1360 px wide) and is removed
 * as soon as the canvas draws or the visitor touches the page.
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { createRequire } from 'node:module';
import { parseArgs } from 'node:util';

const { values } = parseArgs({ options: { dist: { type: 'string' }, routes: { type: 'string' }, client: { type: 'string' } } });
if (!values.dist || !values.routes || !values.client) {
  console.error('usage: site-posters.mjs --dist <dir> --routes <routes.json> --client <dir>');
  process.exit(2);
}
const dist = path.resolve(values.dist);
const { chromium } = createRequire(path.join(path.resolve(values.client), 'package.json'))('playwright');
const listed = JSON.parse(fs.readFileSync(values.routes, 'utf8'));
const routes = (Array.isArray(listed) ? listed : listed.routes).filter((r) => r.notFound !== true && r.access !== 'authenticated');

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.orb': 'application/json', '.wasm': 'application/wasm', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  const wanted = decodeURIComponent(new URL(req.url, 'http://local').pathname);
  for (const candidate of [wanted, `${wanted}.html`, path.join(wanted, 'index.html'), '/index.html']) {
    const file = path.join(dist, candidate);
    if (file.startsWith(dist) && fs.existsSync(file) && fs.statSync(file).isFile()) {
      res.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream' });
      fs.createReadStream(file).pipe(res);
      return;
    }
  }
  res.writeHead(404).end();
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const local = `http://127.0.0.1:${server.address().port}`;

const SIZES = [
  { name: 'phone', width: 390, height: 844, scale: 2 },
  { name: 'desktop', width: 1440, height: 900, scale: 1 },
];
const slug = (route) => (route.path === '/' ? 'home' : route.path.replace(/^\//, '').replace(/[^A-Za-z0-9]+/g, '-'));
const documentOf = (route) => path.join(dist, route.path === '/' ? 'index.html' : path.join(route.path, 'index.html'));

fs.mkdirSync(path.join(dist, 'posters'), { recursive: true });
// the installed Chrome paints the canvas as a visitor's browser does; the bundled build draws it paler
const browser = await chromium.launch({ channel: 'chrome', args: ['--headless=new'] });
const taken = [];
const jobs = SIZES.flatMap((size) => routes.filter((route) => fs.existsSync(documentOf(route))).map((route) => ({ size, route })));
const contexts = new Map();
for (const size of SIZES) contexts.set(size.name, await browser.newContext({ viewport: { width: size.width, height: size.height }, deviceScaleFactor: size.scale }));
const work = async () => {
  for (let job = jobs.shift(); job !== undefined; job = jobs.shift()) {
    const { size, route } = job;
    const page = await contexts.get(size.name).newPage();
    await page.goto(local + route.path, { waitUntil: 'networkidle' });
    // a route with no canvas (a documentation page) is already its own first paint
    const scene = await page.evaluate(() => document.querySelector('.orbital-scene-canvas') !== null);
    const drawn = scene && (await page
      .waitForFunction(() => [...document.querySelectorAll('canvas')].some((c) => typeof c.orbitalContrastAudit === 'function'), null, { timeout: 20000 })
      .then(() => true, () => false));
    if (drawn) {
      await page.waitForTimeout(2500);
      const file = `posters/${slug(route)}-${size.name}.jpg`;
      await page.screenshot({ path: path.join(dist, file), type: 'jpeg', quality: 72 });
      taken.push(file);
    }
    await page.close();
  }
};
await Promise.all(Array.from({ length: 6 }, work));
await browser.close();
server.close();

const assets = fs.existsSync(path.join(dist, 'assets')) ? fs.readdirSync(path.join(dist, 'assets')) : [];
const engine = assets.find((f) => f.endsWith('.wasm'));
const preloads = [
  engine ? `<link rel="preload" as="fetch" crossorigin href="/assets/${engine}" type="application/wasm">` : '',
  fs.existsSync(path.join(dist, 'program.client.orb')) ? '<link rel="preload" as="fetch" crossorigin href="/program.client.orb">' : '',
  fs.existsSync(path.join(dist, 'language.json')) ? '<link rel="preload" as="fetch" crossorigin href="/language.json">' : '',
].join('');
const REMOVE = `(function(){var p=document.getElementById('orb-poster');if(!p)return;var gone=false;function off(){if(gone)return;gone=true;p.remove();}function look(){if(gone)return;var cs=document.querySelectorAll('canvas');for(var i=0;i<cs.length;i++){if(typeof cs[i].orbitalContrastAudit==='function'){requestAnimationFrame(function(){requestAnimationFrame(function(){setTimeout(off,120);});});return;}}requestAnimationFrame(look);}requestAnimationFrame(look);['wheel','touchstart','keydown','pointerdown'].forEach(function(e){addEventListener(e,off,{once:true,passive:true});});setTimeout(off,20000);})();`;
let edited = 0;
for (const route of routes) {
  const file = documentOf(route);
  if (!fs.existsSync(file)) continue;
  let html = fs.readFileSync(file, 'utf8');
  if (html.includes('id="orb-poster"')) continue;
  const phone = `posters/${slug(route)}-phone.jpg`;
  const desktop = `posters/${slug(route)}-desktop.jpg`;
  const hasBoth = taken.includes(phone) && taken.includes(desktop);
  const style = hasBoth
    ? `<style>#orb-poster{display:none;position:fixed;inset:0;z-index:2147483000;pointer-events:none;overflow:hidden}#orb-poster img{position:absolute;top:0;display:none}@media (max-width:520px){#orb-poster{display:block}#orb-poster .p{display:block;left:0;width:100%;height:auto}}@media (min-width:1360px){#orb-poster{display:block}#orb-poster .d{display:block;left:50%;width:1440px;height:auto;transform:translateX(-50%)}}</style><link rel="preload" as="image" href="/${phone}" media="(max-width:520px)"><link rel="preload" as="image" href="/${desktop}" media="(min-width:1360px)">`
    : '';
  const overlay = hasBoth ? `<div id="orb-poster" aria-hidden="true"><img class="p" alt="" src="/${phone}"><img class="d" alt="" src="/${desktop}"></div><script>${REMOVE}</script>` : '';
  if (!html.includes('</head>') || !/<body[^>]*>/.test(html)) throw new Error(`site-posters: ${file} has no head or body`);
  html = html.replace('</head>', `${preloads}${style}</head>`).replace(/<body[^>]*>/, (open) => `${open}${overlay}`);
  fs.writeFileSync(file, html);
  edited += 1;
}
console.log(`site-posters: ${taken.length} picture(s), ${edited} document(s) edited`);
