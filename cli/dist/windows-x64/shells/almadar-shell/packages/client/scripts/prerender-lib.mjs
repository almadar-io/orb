/**
 * Pure helpers for prerender.mjs: where a route's HTML lands, and the
 * sitemap/robots files for the routes the compiler declared in routes.json.
 */
import path from 'node:path';

/** `/` → `index.html`, `/ar/blog/why` → `ar/blog/why/index.html`. Routes with `:params` are not static. */
export function routeFile(routePath) {
  if (routePath.split('/').some((segment) => segment.startsWith(':'))) return null;
  const trimmed = routePath.replace(/^\/+|\/+$/g, '');
  return trimmed === '' ? 'index.html' : path.posix.join(trimmed, 'index.html');
}

export function sitemap(routes, origin) {
  const base = origin.replace(/\/+$/, '');
  const urls = routes
    .filter((r) => routeFile(r.path) !== null)
    .map((r) => `  <url><loc>${base}${r.path === '/' ? '/' : r.path}</loc></url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}

export function robots(origin) {
  return `User-agent: *\nAllow: /\nSitemap: ${origin.replace(/\/+$/, '')}/sitemap.xml\n`;
}
