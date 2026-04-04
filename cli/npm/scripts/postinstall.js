#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

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
