/**
 * Pure helpers for build-site.mjs: fill the Downloads orbitals' studio-release knobs, and find the
 * demo behaviors whose posters still need capturing.
 */

export function installerLabel(installer) {
  const arch =
    installer.os === 'mac' ? (installer.arch === 'arm64' ? 'Apple Silicon' : 'Intel') : installer.arch === 'arm64' ? 'ARM64' : 'x64';
  if (installer.os !== 'linux') return arch;
  return `${installer.ext === 'deb' ? '.deb' : 'AppImage'} · ${arch}`;
}

/**
 * Sets `studioVersion`/`studioInstallers` on every orbital referencing `Downloads.orbitals.OrbDownloads`
 * from the desktop release manifest (`src/data/studio-release.json`). A manifest with no version leaves
 * the schema untouched, so the page shows its not-yet-released state.
 */
export function applyStudioRelease(schema, release) {
  if (!release.version) return 0;
  const installers = release.installers.map((i) => ({
    os: i.os,
    label: `${installerLabel(i)} · ${Math.round(i.size / (1024 * 1024))} MB`,
    url: i.url,
  }));
  const targets = schema.orbitals.filter((o) => o.reference?.ref === 'Downloads.orbitals.OrbDownloads');
  if (targets.length === 0) throw new Error('no Downloads.orbitals.OrbDownloads orbital to carry the studio release');
  for (const o of targets) {
    o.reference.config = {
      ...o.reference.config,
      studioVersion: { default: release.version, type: 'string' },
      studioInstallers: { default: installers, type: 'unknown' },
    };
  }
  return targets.length;
}

const knob = (trait, key) => trait.config?.[key]?.default;

/**
 * The behaviors whose posters the site still needs: every trait of the resolved site program shown
 * as `presentation: "image"` names its demo atom in `sourceBehavior`, and that atom is captured when
 * one of its poster files (`poster`, `posterDark`) is not on disk yet (`exists(path)`).
 */
export function posterSources(schema, exists) {
  const sources = new Set();
  for (const orbital of schema.orbitals) {
    for (const trait of orbital.traits ?? []) {
      if (knob(trait, 'presentation') !== 'image') continue;
      const poster = knob(trait, 'poster');
      if (typeof poster !== 'string' || poster === '') {
        throw new Error(`${trait.name} is presented as an image but declares no poster`);
      }
      if (trait.sourceBehavior === undefined) {
        throw new Error(`${trait.name} is presented as an image but is not composed from a demo behavior to capture`);
      }
      const dark = knob(trait, 'posterDark');
      const files = typeof dark === 'string' && dark !== '' ? [poster, dark] : [poster];
      if (files.some((p) => !exists(p))) sources.add(trait.sourceBehavior.behavior);
    }
  }
  return [...sources];
}
