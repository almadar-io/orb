// Every react-router name @almadar/ui imports must exist on the stub the webpack config swaps in for it, or the site crashes at runtime.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const STUB = path.resolve(__dirname, '../shared/stubs/react-router-dom-stub.js');
const UI_DIST = path.join(packageRoot(require.resolve('@almadar/ui'), '@almadar/ui'), 'dist');

function packageRoot(from, name) {
  for (let dir = path.dirname(from); dir !== path.dirname(dir); dir = path.dirname(dir)) {
    const manifest = path.join(dir, 'package.json');
    if (fs.existsSync(manifest) && JSON.parse(fs.readFileSync(manifest, 'utf-8')).name === name) return dir;
  }
  throw new Error(`no package.json named ${name} above ${from}`);
}
const ROUTER_IMPORT = /import\s*\{([^}]*)\}\s*from\s*['"]react-router(?:-dom)?['"]/g;

function jsFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return jsFiles(p);
    return e.name.endsWith('.js') ? [p] : [];
  });
}

function importedRouterNames(files) {
  const names = new Map();
  for (const file of files) {
    for (const m of fs.readFileSync(file, 'utf-8').matchAll(ROUTER_IMPORT)) {
      for (const spec of m[1].split(',')) {
        const name = spec.trim().split(/\s+as\s+/)[0].trim();
        if (name !== '' && !name.startsWith('type ')) names.set(name, path.relative(UI_DIST, file));
      }
    }
  }
  return names;
}

test('the stub exports every react-router name @almadar/ui imports', () => {
  const stub = require(STUB);
  const names = importedRouterNames(jsFiles(UI_DIST));
  assert.ok(names.size > 0, `no react-router imports found under ${UI_DIST}`);
  const missing = [...names].filter(([name]) => typeof stub[name] === 'undefined').map(([name, file]) => `${name} (${file})`);
  assert.deepEqual(missing, []);
});

test('useInRouterContext reports no v6 host router, so OrbPreview keeps its own navigation', () => {
  const stub = require(STUB);
  assert.equal(stub.useInRouterContext(), false);
});

test('control: the real v5 exports still pass through', () => {
  const stub = require(STUB);
  const real = require('react-router-dom');
  for (const name of ['Link', 'useLocation', 'Route', 'Switch']) assert.equal(stub[name], real[name], name);
});

test('control: the scan finds an import the stub genuinely lacks', () => {
  const tmp = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'rr-stub-'));
  const file = path.join(tmp, 'entry.js');
  fs.writeFileSync(file, "import { useNotARealRouterHook, Link as L } from 'react-router-dom';\n");
  const names = importedRouterNames([file]);
  assert.deepEqual([...names.keys()], ['useNotARealRouterHook', 'Link']);
  assert.equal(typeof require(STUB).useNotARealRouterHook, 'undefined');
});
