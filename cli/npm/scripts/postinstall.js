#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const platformMap = {
  'darwin-x64': '@almadar/orb-darwin-x64',
  'darwin-arm64': '@almadar/orb-darwin-arm64',
  'linux-x64': '@almadar/orb-linux-x64',
  'linux-arm64': '@almadar/orb-linux-arm64',
  'win32-x64': '@almadar/orb-windows-x64',
};

const binaryName = process.platform === 'win32' ? 'orb.exe' : 'orb';

// stderr only: under `npx … orb mcp` stdout is the JSON-RPC stream.
function runUpdate(binaryPath, args) {
  return spawnSync(binaryPath, args, { stdio: ['ignore', 2, 2], timeout: 3600000 });
}

// Set orb up in the user store (~/.orb): the @almadar/core this orb pins, @almadar/std, the
// first-party language packs and the TypeScript shell. Runs on every install and upgrade, so a new
// orb's pins land with it. Non-fatal: `orb update --global` can be run by hand later.
function setUpLanguage(platformDir, run = runUpdate) {
  const binaryPath = path.join(platformDir, binaryName);
  if (!fs.existsSync(binaryPath)) return 'no-binary';
  let result;
  try {
    result = run(binaryPath, ['update', '--global']);
  } catch {
    return 'failed';
  }
  return result && result.status === 0 ? 'set-up' : 'failed';
}

function main() {
  const key = `${process.platform}-${process.arch}`;
  const packageName = platformMap[key];
  if (!packageName) {
    console.warn(`\n  Orb CLI: No pre-built binary for ${key}`);
    console.warn('  Build from source: https://github.com/almadar-io/orb#building-from-source\n');
    return;
  }
  const platformDir = [
    path.join(__dirname, '..', 'node_modules', packageName),
    path.join(__dirname, '..', '..', packageName),
    path.join(__dirname, '..', '..', '..', packageName),
  ].find((p) => fs.existsSync(p));
  if (!platformDir) {
    console.warn(`\n  Orb CLI: Platform package ${packageName} not found`);
    console.warn('  Try: npm install -g @almadar/orb --include=optional\n');
    return;
  }
  const outcome = setUpLanguage(platformDir);
  if (outcome === 'no-binary') {
    console.warn(`\n  Orb CLI: ${packageName} carries no ${binaryName}; reinstall @almadar/orb.\n`);
  } else if (outcome === 'failed') {
    console.warn('\n  Orb CLI: language setup did not complete; run `orb update --global`.\n');
  }
}

if (require.main === module) main();

module.exports = { setUpLanguage };
