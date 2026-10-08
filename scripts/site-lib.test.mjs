import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applySeo, applyStudioRelease, findOrganism, installerLabel } from './site-lib.mjs';

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

test('the organism is found only under an organisms folder', () => {
  const files = ['websites/atoms/std-almadar-orb.orb', 'websites/organisms/std-almadar-orb.orb', 'websites/organisms/std-almadar-orb-x.orb'];
  assert.equal(findOrganism(files, 'std-almadar-orb'), 'websites/organisms/std-almadar-orb.orb');
  assert.equal(findOrganism(files, 'std-missing'), undefined);
});

test('SEO metadata identifies Orb and the canonical page URL', () => {
  const html = applySeo('<html><head><title>Almadar App</title></head><body></body></html>', 'https://orb.almadar.io/docs/');
  assert.match(html, /<title>Orb — Build full-stack apps from state machines<\/title>/);
  assert.match(html, /<meta name="description" content="Orb is an open-source language/);
  assert.match(html, /<link rel="canonical" href="https:\/\/orb\.almadar\.io\/docs\/">/);
  assert.match(html, /<meta property="og:title" content="Orb — Build full-stack apps from state machines">/);
  assert.match(html, /<meta name="twitter:card" content="summary">/);
});
