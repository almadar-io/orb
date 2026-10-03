import { describe, it, expect } from 'vitest';
import { routeFile, sitemap, robots } from './prerender-lib.mjs';

describe('prerender helpers', () => {
  it('maps routes to their index.html', () => {
    expect(routeFile('/')).toBe('index.html');
    expect(routeFile('/ar')).toBe('ar/index.html');
    expect(routeFile('/ar/blog/why')).toBe('ar/blog/why/index.html');
  });

  it('control: a route with params is not static', () => {
    expect(routeFile('/posts/:id')).toBeNull();
  });

  it('lists every static route in the sitemap', () => {
    const xml = sitemap([{ path: '/' }, { path: '/ar' }, { path: '/posts/:id' }], 'https://orb.almadar.io/');
    expect(xml).toContain('<loc>https://orb.almadar.io/</loc>');
    expect(xml).toContain('<loc>https://orb.almadar.io/ar</loc>');
    expect(xml).not.toContain(':id');
  });

  it('points robots at the sitemap', () => {
    expect(robots('https://almadar.io')).toContain('Sitemap: https://almadar.io/sitemap.xml');
  });
});
