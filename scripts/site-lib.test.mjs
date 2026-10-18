import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyStudioRelease, installerLabel, posterSources } from './site-lib.mjs';

const downloads = (name, config) => ({ name, reference: { ref: 'Downloads.orbitals.OrbDownloads', ...(config ? { config } : {}) } });
const release = {
  version: '0.9.0',
  installers: [
    { os: 'mac', arch: 'arm64', ext: 'dmg', size: 104857600, url: 'https://x/a.dmg' },
    { os: 'linux', arch: 'x64', ext: 'deb', size: 94371840, url: 'https://x/b.deb' },
  ],
};

test('every Downloads orbital gets the release, keeping its own config', () => {
  const schema = { orbitals: [downloads('DownloadsEN'), downloads('DownloadsAR', { pathPrefix: { default: '/ar', type: 'unknown' } }), { name: 'HomeEN', reference: { ref: 'Home.orbitals.OrbHome' } }] };
  assert.equal(applyStudioRelease(schema, release), 2);
  const [en, ar, home] = schema.orbitals;
  assert.equal(en.reference.config.studioVersion.default, '0.9.0');
  assert.deepEqual(ar.reference.config.pathPrefix, { default: '/ar', type: 'unknown' });
  assert.deepEqual(ar.reference.config.studioInstallers.default, [
    { os: 'mac', label: 'Apple Silicon · 100 MB', url: 'https://x/a.dmg' },
    { os: 'linux', label: '.deb · x64 · 90 MB', url: 'https://x/b.deb' },
  ]);
  assert.equal(home.reference.config, undefined);
});

test('an unreleased manifest leaves the schema untouched', () => {
  const schema = { orbitals: [downloads('DownloadsEN')] };
  assert.equal(applyStudioRelease(schema, { version: null, installers: [] }), 0);
  assert.equal(schema.orbitals[0].reference.config, undefined);
});

test('a release with no Downloads orbital to carry it is an error', () => {
  assert.throws(() => applyStudioRelease({ orbitals: [] }, release), /Downloads/);
});

test('installer labels name the architecture, and the package format on linux', () => {
  assert.equal(installerLabel({ os: 'mac', arch: 'x64', ext: 'dmg' }), 'Intel');
  assert.equal(installerLabel({ os: 'win', arch: 'arm64', ext: 'exe' }), 'ARM64');
  assert.equal(installerLabel({ os: 'linux', arch: 'arm64', ext: 'AppImage' }), 'AppImage · ARM64');
});


const tourTrait = (name, from, config) => ({
  name,
  sourceBehavior: { behavior: from, alias: 'Demo', originalName: 'DemoTour' },
  config: Object.fromEntries(Object.entries(config).map(([k, v]) => [k, { default: v }])),
});
const site = (...traits) => ({ orbitals: [{ name: 'Home', traits }] });
const none = () => false;

test('an image-presented demo asks for its source behavior to be captured, once', () => {
  const schema = site(
    tourTrait('CrmEN', 'almadar-behaviors/std-demo-crm', { presentation: 'image', poster: '/posters/crm.webp' }),
    tourTrait('CrmAR', 'almadar-behaviors/std-demo-crm', { presentation: 'image', poster: '/posters/crm.webp' }),
  );
  assert.deepEqual(posterSources(schema, none), ['almadar-behaviors/std-demo-crm']);
});

test('control: a live demo is not captured even when it declares a poster', () => {
  const schema = site(tourTrait('Crm', 'almadar-behaviors/std-demo-crm', { presentation: 'live', poster: '/posters/crm.webp' }));
  assert.deepEqual(posterSources(schema, none), []);
});

test('a poster already on disk is not recaptured; a missing dark variant is', () => {
  const have = (p) => p === '/posters/crm.webp';
  const schema = site(
    tourTrait('Crm', 'almadar-behaviors/std-demo-crm', { presentation: 'image', poster: '/posters/crm.webp' }),
    tourTrait('Shop', 'almadar-behaviors/std-demo-shop', { presentation: 'image', poster: '/posters/crm.webp', posterDark: '/posters/shop-dark.webp' }),
  );
  assert.deepEqual(posterSources(schema, have), ['almadar-behaviors/std-demo-shop']);
});

test('edge: an image demo with no poster is refused, naming the trait', () => {
  assert.throws(() => posterSources(site(tourTrait('Crm', 'x', { presentation: 'image', poster: '' })), none), /Crm/);
});

test('edge: an image demo that is not composed from a behavior is refused', () => {
  const schema = site({ name: 'Inline', config: { presentation: { default: 'image' }, poster: { default: '/p.webp' } } });
  assert.throws(() => posterSources(schema, none), /Inline/);
});
