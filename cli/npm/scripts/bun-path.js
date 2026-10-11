const fs = require('fs');
const path = require('path');

// The bun orb installs packages with: one bundled beside the binary (release
// archives), else this package's declared `bun` dependency.
function bunPath(platformDir) {
  const bundled = path.join(platformDir, process.platform === 'win32' ? 'bun.exe' : 'bun');
  if (fs.existsSync(bundled)) return bundled;
  let pkg;
  try {
    pkg = require.resolve('bun/package.json', { paths: [path.join(__dirname, '..')] });
  } catch {
    return null;
  }
  const declared = path.join(path.dirname(pkg), 'bin', 'bun.exe');
  return fs.existsSync(declared) ? declared : null;
}

module.exports = { bunPath };
