#!/usr/bin/env node
/**
 * First-paint help for a built site: a picture of each route shown at once while the engine starts, and
 * preload hints so the engine, the program and the language pack download beside the script instead of after it.
 *
 * Usage: node site-posters.mjs --dist <built site> --routes <routes.json> --client <dir whose node_modules has playwright>
 * Writes posters/<route>-phone.jpg and posters/<route>-desktop.jpg and edits every route document in place.
 * The picture shows only at the widths it was taken for (phones, and windows at least 1360 px wide) and is removed
 * as soon as the canvas draws or the visitor touches the page. A canvas route also opens on a loader in Orb's Clay Print look,
 * shown at every width under the poster and faded out once the canvas draws.
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
const scenes = new Set();
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
    if (scene) scenes.add(route.path);
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
// A canvas route paints nothing until the engine starts, so it opens on a loader in Orb's own Clay Print look:
// the two-ink 1s Orb bobbing on paper, shown at every width under the poster and faded out once the canvas draws.
const ORB = '<svg viewBox="0 0 100 100" width="96" height="96" aria-hidden="true"><defs><pattern id="orbLoadDots" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.5" fill="#1F1D2B"/></pattern><mask id="orbLoadShade"><circle cx="49" cy="51" r="36" fill="#fff"/><circle cx="40" cy="41" r="31" fill="#000"/></mask></defs><circle cx="54.5" cy="55.5" r="36" fill="#2F5BEA"/><circle cx="49" cy="51" r="36" fill="#FF5B3A"/><circle cx="49" cy="51" r="36" fill="url(#orbLoadDots)" mask="url(#orbLoadShade)" opacity="0.55"/><ellipse cx="36" cy="37" rx="8.5" ry="5.5" transform="rotate(-32 36 37)" fill="#FFFBF3"/><circle cx="49" cy="51" r="36" stroke="#1F1D2B" stroke-width="5" fill="none"/><circle cx="49" cy="51" r="4.5" fill="#1F1D2B"/></svg>';
const LOADING = { en: 'Loading Orb', ar: 'جارٍ تحميل Orb', sl: 'Nalagam Orb' };
const langOf = (route) => (route.path === '/ar' || route.path.startsWith('/ar/') ? 'ar' : route.path === '/sl' || route.path.startsWith('/sl/') ? 'sl' : 'en');
const LOADER_STYLE = '<style>#orb-loader{position:fixed;inset:0;z-index:2147482000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;background:#F7F0E3 radial-gradient(rgba(31,29,43,.07) 1.2px,transparent 1.3px) 0 0/9px 9px;transition:opacity .28s ease}#orb-loader.gone{opacity:0}#orb-loader .orb{animation:orbLoadBob 1.1s cubic-bezier(.45,0,.55,1) infinite;transform-origin:50% 90%}#orb-loader .shadow{width:64px;height:10px;border-radius:50%;background:rgba(31,29,43,.18);margin-top:-10px;animation:orbLoadShadow 1.1s cubic-bezier(.45,0,.55,1) infinite}#orb-loader .dots{display:flex;gap:9px}#orb-loader .dots i{width:10px;height:10px;border-radius:50%;border:2px solid #1F1D2B;animation:orbLoadDot 1.1s ease-in-out infinite}#orb-loader .dots i:nth-child(1){background:#FF5B3A}#orb-loader .dots i:nth-child(2){background:#2F5BEA;animation-delay:.15s}#orb-loader .dots i:nth-child(3){background:#FFFBF3;animation-delay:.3s}@keyframes orbLoadBob{0%,100%{transform:translateY(0) scale(1.06,.94)}12%{transform:translateY(0) scale(1,1)}50%{transform:translateY(-26px) scale(.97,1.03)}88%{transform:translateY(0) scale(1,1)}}@keyframes orbLoadShadow{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(.62);opacity:.55}}@keyframes orbLoadDot{0%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}@media (prefers-reduced-motion:reduce){#orb-loader .orb,#orb-loader .shadow,#orb-loader .dots i{animation:none}}</style>';
const LOADER_REMOVE = `(function(){var l=document.getElementById('orb-loader');if(!l)return;var gone=false;function off(){if(gone)return;gone=true;l.classList.add('gone');setTimeout(function(){l.remove();},320);}function look(){if(gone)return;var cs=document.querySelectorAll('canvas');for(var i=0;i<cs.length;i++){if(typeof cs[i].orbitalContrastAudit==='function'){requestAnimationFrame(function(){requestAnimationFrame(function(){setTimeout(off,120);});});return;}}requestAnimationFrame(look);}requestAnimationFrame(look);setTimeout(off,20000);})();`;
const loaderFor = (route) => `<div id="orb-loader" role="status" aria-live="polite" aria-label="${LOADING[langOf(route)]}"><div class="orb">${ORB}</div><div class="shadow"></div><div class="dots" aria-hidden="true"><i></i><i></i><i></i></div></div><script>${LOADER_REMOVE}</script>`;
let edited = 0;
for (const route of routes) {
  const file = documentOf(route);
  if (!fs.existsSync(file)) continue;
  let html = fs.readFileSync(file, 'utf8');
  if (html.includes('id="orb-poster"') || html.includes('id="orb-loader"')) continue;
  const phone = `posters/${slug(route)}-phone.jpg`;
  const desktop = `posters/${slug(route)}-desktop.jpg`;
  const hasBoth = taken.includes(phone) && taken.includes(desktop);
  const style = hasBoth
    ? `<style>#orb-poster{display:none;position:fixed;inset:0;z-index:2147483000;pointer-events:none;overflow:hidden}#orb-poster img{position:absolute;top:0;display:none}@media (max-width:520px){#orb-poster{display:block}#orb-poster .p{display:block;left:0;width:100%;height:auto}}@media (min-width:1360px){#orb-poster{display:block}#orb-poster .d{display:block;left:50%;width:1440px;height:auto;transform:translateX(-50%)}}</style><link rel="preload" as="image" href="/${phone}" media="(max-width:520px)"><link rel="preload" as="image" href="/${desktop}" media="(min-width:1360px)">`
    : '';
  const overlay = hasBoth ? `<div id="orb-poster" aria-hidden="true"><img class="p" alt="" src="/${phone}"><img class="d" alt="" src="/${desktop}"></div><script>${REMOVE}</script>` : '';
  if (!html.includes('</head>') || !/<body[^>]*>/.test(html)) throw new Error(`site-posters: ${file} has no head or body`);
  const scene = scenes.has(route.path);
  html = html.replace('</head>', `${preloads}${scene ? LOADER_STYLE : ''}${style}</head>`).replace(/<body[^>]*>/, (open) => `${open}${scene ? loaderFor(route) : ''}${overlay}`);
  fs.writeFileSync(file, html);
  edited += 1;
}
console.log(`site-posters: ${taken.length} picture(s), ${edited} document(s) edited`);
