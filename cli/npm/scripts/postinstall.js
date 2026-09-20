#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const platform = process.platform;
const arch = process.arch;

const platformMap = {
  'darwin-x64': '@almadar/orb-darwin-x64',
  'darwin-arm64': '@almadar/orb-darwin-arm64',
  'linux-x64': '@almadar/orb-linux-x64',
  'linux-arm64': '@almadar/orb-linux-arm64',
  'win32-x64': '@almadar/orb-windows-x64',
};

const key = `${platform}-${arch}`;
const packageName = platformMap[key];

if (!packageName) {
  console.warn(`\n  Orb CLI: No pre-built binary for ${platform}-${arch}`);
  console.warn('  Build from source: https://github.com/almadar-io/orb#building-from-source\n');
  process.exit(0);
}

const possiblePaths = [
  path.join(__dirname, '..', 'node_modules', packageName),
  path.join(__dirname, '..', '..', packageName),
  path.join(__dirname, '..', '..', '..', packageName),
];

const platformDir = possiblePaths.find(p => fs.existsSync(p));

if (!platformDir) {
  console.warn(`\n  Orb CLI: Platform package ${packageName} not found`);
  console.warn('  Try: npm install -g @almadar/orb --include=optional\n');
  process.exit(0);
}

// Verify components
const binaryName = platform === 'win32' ? 'orb.exe' : 'orb';
const bunName = platform === 'win32' ? 'bun.exe' : 'bun';

const hasBinary = fs.existsSync(path.join(platformDir, binaryName));
const hasBun = fs.existsSync(path.join(platformDir, bunName));
const hasAgent = fs.existsSync(path.join(platformDir, 'agent', 'cli.js'));

console.log(`Orb CLI installed for ${platform}-${arch}:`);
console.log(`  Binary:  ${hasBinary ? 'ok' : 'missing'}`);
console.log(`  Bun:     ${hasBun ? 'ok' : 'not bundled (agent features require bun on PATH)'}`);
console.log(`  Agent:   ${hasAgent ? 'ok' : 'not bundled (agent features unavailable)'}`);

// Behaviors are installed packages, not baked into the binary (Phase 2): populate
// the user store (~/.orb) with @almadar/std so `orb validate`/`orb verify` resolve
// std behaviors out of the box. `stdRange` is `^<major>` of the std this release
// was built against (almadar.stdRange in package.json, written by build-orb-cli.yml
// from the orbital-rust pin) so a later std major never silently swaps underneath
// an already-installed CLI.
const stdRange = (require('../package.json').almadar || {}).stdRange;

if (hasBinary && hasBun && stdRange) {
  const binaryPath = path.join(platformDir, binaryName);
  const bunPath = path.join(platformDir, bunName);
  const manualCommand = 'orb behaviors install --global @almadar/std';

  let result;
  try {
    result = spawnSync(binaryPath, ['behaviors', 'install', '--global', `@almadar/std@${stdRange}`], {
      env: { ...process.env, ORB_BUN_PATH: bunPath },
      stdio: 'inherit',
      timeout: 600000,
    });
  } catch (err) {
    console.warn(`\n  Orb CLI: failed to install @almadar/std (${err.message})`);
    console.warn(`  Run manually: ${manualCommand}\n`);
    process.exit(0);
  }

  if (!result || result.status !== 0) {
    console.warn('\n  Orb CLI: @almadar/std install did not complete');
    console.warn(`  Run manually: ${manualCommand}\n`);
  }
} else if (hasBinary && !hasBun) {
  console.warn('\n  Orb CLI: bun not bundled, skipping @almadar/std install');
  console.warn('  Run manually once bun is available: orb behaviors install --global @almadar/std\n');
}

process.exit(0);
