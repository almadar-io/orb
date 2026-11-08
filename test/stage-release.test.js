import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PLATFORMS, languageRange, parseArgs, platformManifest, wrapperManifest } from '../scripts/stage-release.mjs';

test('the language range is read from the orb --version line', () => {
  assert.equal(languageRange('orb 19.1.0 (language ^1)\n'), '^1');
  assert.equal(languageRange('orb 19.2.0 (language >=1.0 <1.4)'), '>=1.0 <1.4');
});

test('control: a version line without a language range is refused', () => {
  assert.throws(() => languageRange('orb 19.1.0'), /names no language range/);
});

test('every flag is required and comes as a pair', () => {
  assert.deepEqual(parseArgs(['--version', '1.2.3', '--from', '/t', '--profile', 'dist', '--out', '/o']), {
    version: '1.2.3',
    from: '/t',
    profile: 'dist',
    out: '/o',
  });
  assert.throws(() => parseArgs(['--version', '1.2.3']), /--from is required/);
  assert.throws(() => parseArgs(['--version']), /flag value pairs/);
});

test('a platform package declares its os, cpu and the range its orb reads', () => {
  const linux = PLATFORMS.find((p) => p.name === 'linux-arm64');
  assert.deepEqual(platformManifest(linux, '19.2.0', '^1'), {
    name: '@almadar/orb-linux-arm64',
    version: '19.2.0',
    description: 'Orb CLI binary for linux-arm64',
    license: 'BSL-1.1',
    repository: { type: 'git', url: 'https://github.com/almadar-io/orb.git' },
    os: ['linux'],
    cpu: ['arm64'],
    orbReads: '^1',
  });
});

test('the wrapper pins every platform package to the release version', () => {
  const source = { name: '@almadar/orb', version: '2.0.0', optionalDependencies: { '@almadar/orb-darwin-arm64': '19.0.0', '@almadar/orb-linux-x64': '19.0.0' } };
  const stamped = wrapperManifest(source, '19.2.0');
  assert.equal(stamped.version, '19.2.0');
  assert.deepEqual(stamped.optionalDependencies, { '@almadar/orb-darwin-arm64': '19.2.0', '@almadar/orb-linux-x64': '19.2.0' });
  assert.equal(source.version, '2.0.0', 'control: the source manifest is not changed');
});

test('the five platforms each name a build target, and Linux add-ons are glibc builds beside a static orb', () => {
  assert.deepEqual(PLATFORMS.map((p) => p.name), ['darwin-arm64', 'darwin-x64', 'linux-x64', 'linux-arm64', 'windows-x64']);
  for (const p of PLATFORMS.filter((p) => p.os === 'linux')) {
    assert.match(p.target, /-musl$/);
    assert.match(p.addonTarget, /-gnu$/);
  }
});
