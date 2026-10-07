/**
 * Pure helpers for build-site.mjs: find the organism in the installed
 * behavior registry and fill the Downloads orbitals' studio-release knobs.
 */
import path from 'node:path';

/** The registry-relative path of `<organism>.orb` under an `organisms/` folder, or undefined. */
export function findOrganism(registryFiles, organism) {
  return registryFiles.find((p) => path.basename(p) === `${organism}.orb` && p.split(/[\\/]/).includes('organisms'));
}

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
