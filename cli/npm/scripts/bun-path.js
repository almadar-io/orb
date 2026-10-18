const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// The `bun` package ships an empty `bin/bun.exe` placeholder that its own postinstall replaces;
// an empty file "runs" and does nothing, so only a non-empty file is a bun.
function isBinary(file) {
  try {
    return fs.statSync(file).size > 0;
  } catch {
    return false;
  }
}

function declaredBunPackage() {
  try {
    return path.dirname(require.resolve('bun/package.json', { paths: [path.join(__dirname, '..')] }));
  } catch {
    return null;
  }
}

// The bun orb installs packages with: one bundled beside the binary (release
// archives), else this package's declared `bun` dependency.
function bunPath(platformDir, bunPackageDir = declaredBunPackage()) {
  const bundled = path.join(platformDir, process.platform === 'win32' ? 'bun.exe' : 'bun');
  if (isBinary(bundled)) return bundled;
  if (!bunPackageDir) return null;
  const declared = path.join(bunPackageDir, 'bin', 'bun.exe');
  return isBinary(declared) ? declared : null;
}

// bun's own postinstall, run here when it has not replaced the placeholder yet. Its output goes to
// stderr: under `orb mcp` stdout is the JSON-RPC stream.
function runBunInstall(bunPackageDir) {
  spawnSync(process.execPath, [path.join(bunPackageDir, 'install.js')], {
    cwd: bunPackageDir,
    stdio: ['ignore', 2, 2],
    timeout: 300000,
  });
}

// A usable bun, finishing bun's install first when only its placeholder is there.
function ensureBun(platformDir, bunPackageDir = declaredBunPackage(), install = runBunInstall) {
  const found = bunPath(platformDir, bunPackageDir);
  if (found || !bunPackageDir || !fs.existsSync(path.join(bunPackageDir, 'bin', 'bun.exe'))) return found;
  install(bunPackageDir);
  return bunPath(platformDir, bunPackageDir);
}

module.exports = { bunPath, ensureBun };
