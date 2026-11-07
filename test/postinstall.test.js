// The npm wrapper's postinstall sets the language up with `orb update --global`. orb 19 installs
// packages itself, so a missing bun must never skip it (a fresh `npx -y @almadar/orb mcp` got
// ORB_LANGUAGE_DATA_NOT_INSTALLED, G-CROSS-480).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { setUpLanguage } = require('../cli/npm/scripts/postinstall.js');
const wrapper = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '../cli/npm/package.json'), 'utf8'));

const binaryName = process.platform === 'win32' ? 'orb.exe' : 'orb';

function platformDir({ binary }) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'orb-platform-'));
  if (binary) fs.writeFileSync(path.join(dir, binaryName), 'binary');
  return dir;
}

function recorder(status) {
  const calls = [];
  const run = (file, args) => {
    calls.push({ file, args });
    return { status };
  };
  return { calls, run };
}

test('with no bun anywhere, the binary sets the language up with update --global', () => {
  const dir = platformDir({ binary: true });
  const { calls, run } = recorder(0);
  assert.equal(setUpLanguage(dir, run), 'set-up');
  assert.deepEqual(calls, [{ file: path.join(dir, binaryName), args: ['update', '--global'] }]);
});

test('control: a platform package without the binary runs nothing', () => {
  const { calls, run } = recorder(0);
  assert.equal(setUpLanguage(platformDir({ binary: false }), run), 'no-binary');
  assert.deepEqual(calls, []);
});

test('a failed update --global is reported, not thrown', () => {
  const { run } = recorder(1);
  assert.equal(setUpLanguage(platformDir({ binary: true }), run), 'failed');
});

test('a spawn error is reported, not thrown', () => {
  const run = () => {
    throw new Error('spawn EACCES');
  };
  assert.equal(setUpLanguage(platformDir({ binary: true }), run), 'failed');
});

test('the wrapper declares no bun dependency', () => {
  assert.equal((wrapper.dependencies ?? {}).bun, undefined);
});

test('control: the wrapper still declares every platform binary', () => {
  assert.deepEqual(Object.keys(wrapper.optionalDependencies).sort(), [
    '@almadar/orb-darwin-arm64',
    '@almadar/orb-darwin-x64',
    '@almadar/orb-linux-arm64',
    '@almadar/orb-linux-x64',
    '@almadar/orb-windows-x64',
  ]);
});
