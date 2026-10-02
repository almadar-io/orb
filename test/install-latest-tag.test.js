// The orb CLI installers pick the newest `v<semver>` release of almadar-io/orb.
// The same repo also carries Almadar Studio's `studio-v*` releases, so "the
// latest release" is not the CLI's — a studio tag must never be installed.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const path = require('node:path');

const SCRIPTS = ['static/install.sh', 'cli/install.sh'].map((p) => path.join(__dirname, '..', p));

function pick(script, releasesJson) {
  return execFileSync('sh', ['-c', `. "${script}" --source-only; pick_cli_tag`], { input: releasesJson }).toString().trim();
}

const releases = (...tags) => JSON.stringify(tags.map((tag_name) => ({ tag_name, draft: false })), null, 2);

for (const script of SCRIPTS) {
  const name = path.relative(path.join(__dirname, '..'), script);

  test(`${name}: a newer studio release does not win`, () => {
    assert.equal(pick(script, releases('studio-v0.2.0', 'v17.8.0', 'v17.7.0')), 'v17.8.0');
  });

  test(`${name}: the newest CLI tag wins (control)`, () => {
    assert.equal(pick(script, releases('v17.9.0', 'studio-v0.2.0', 'v17.8.0')), 'v17.9.0');
  });

  test(`${name}: no CLI release prints nothing`, () => {
    assert.equal(pick(script, releases('studio-v0.2.0')), '');
  });
}
