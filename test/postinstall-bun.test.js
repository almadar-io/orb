// The npm wrapper's postinstall runs `orb update --global` with the `bun` it finds. The `bun`
// package ships an empty `bin/bun.exe` placeholder that ITS postinstall replaces; when ours runs
// first, the empty file "runs" and installs nothing (a fresh `npx -y @almadar/orb` got no std).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { bunPath, ensureBun } = require('../cli/npm/scripts/bun-path.js');

function bunPackage(binary) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'orb-bun-pkg-'));
  fs.mkdirSync(path.join(dir, 'bin'));
  fs.writeFileSync(path.join(dir, 'bin', 'bun.exe'), binary);
  return dir;
}
const platformDir = () => fs.mkdtempSync(path.join(os.tmpdir(), 'orb-platform-'));

test('an empty bun placeholder is not a usable bun', () => {
  assert.equal(bunPath(platformDir(), bunPackage('')), null);
});

test('a real bun binary is used (control)', () => {
  const pkg = bunPackage('\x7fELF real binary');
  assert.equal(bunPath(platformDir(), pkg), path.join(pkg, 'bin', 'bun.exe'));
});

test('a placeholder runs bun\'s own install, then the real binary is used', () => {
  const pkg = bunPackage('');
  let installs = 0;
  const found = ensureBun(platformDir(), pkg, (dir) => {
    installs += 1;
    fs.writeFileSync(path.join(dir, 'bin', 'bun.exe'), '\x7fELF real binary');
  });
  assert.equal(installs, 1);
  assert.equal(found, path.join(pkg, 'bin', 'bun.exe'));
});

test('a placeholder that bun\'s install leaves empty is still no bun', () => {
  assert.equal(ensureBun(platformDir(), bunPackage(''), () => {}), null);
});
