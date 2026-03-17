#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const platform = process.platform;
const arch = process.arch;

const platformMap = {
  'darwin-x64': '@almadar/cli-darwin-x64',
  'darwin-arm64': '@almadar/cli-darwin-arm64',
  'linux-x64': '@almadar/cli-linux-x64',
  'linux-arm64': '@almadar/cli-linux-arm64',
  'win32-x64': '@almadar/cli-windows-x64',
};

const key = `${platform}-${arch}`;
const packageName = platformMap[key];

if (!packageName) {
  console.warn(`\n⚠️  Almadar CLI: No pre-built binary for ${platform}-${arch}`);
  console.warn('   You can build from source: https://github.com/almadar-io/almadar#building-from-source\n');
  process.exit(0);
}

// Check if the platform-specific package was installed
const possiblePaths = [
  path.join(__dirname, '..', 'node_modules', packageName),
  path.join(__dirname, '..', '..', packageName),
  path.join(__dirname, '..', '..', '..', packageName),
];

const found = possiblePaths.some(p => fs.existsSync(p));

if (found) {
  console.log(`✅ Almadar CLI installed for ${platform}-${arch}`);
} else {
  console.warn(`\n⚠️  Almadar CLI: Platform package ${packageName} not found`);
  console.warn('   This may happen if optional dependencies were skipped.');
  console.warn('   Try: npm install -g @almadar/cli --include=optional\n');
}
