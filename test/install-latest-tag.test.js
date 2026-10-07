// The orb CLI installers pick the newest `v<semver>` release of almadar-io/orb.
// The same repo also carries Almadar Studio's `studio-v*` releases, so "the
// latest release" is not the CLI's — a studio tag must never be installed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const ROOT = path.join(import.meta.dirname, '..');
const SCRIPTS = ['static/install.sh', 'cli/install.sh'].map((p) => path.join(ROOT, p));

function pick(script, releasesJson) {
  return execFileSync('sh', ['-c', `. "${script}"; pick_cli_tag`], {
    input: releasesJson,
    env: { ...process.env, ORB_INSTALL_SOURCE_ONLY: '1' },
  }).toString().trim();
}

const releases = (...tags) => JSON.stringify(tags.map((tag_name) => ({ tag_name, draft: false })), null, 2);

for (const script of SCRIPTS) {
  const name = path.relative(ROOT, script);

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
