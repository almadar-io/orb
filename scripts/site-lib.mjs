/**
 * Pure helpers for build-site.mjs: find the organism in the installed
 * behavior registry and fill the Downloads orbitals' studio-release knobs.
 */
import fs from 'node:fs';
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

const SEO_TITLE = 'Orb — Build full-stack apps from state machines';
const SEO_DESCRIPTION =
  'Orb is an open-source language and compiler for building verified full-stack applications from entities, traits, pages and state machines.';

export function applySeo(html, canonicalUrl) {
  const metadata = [
    `    <meta name="description" content="${SEO_DESCRIPTION}">`,
    '    <meta name="robots" content="index, follow">',
    `    <link rel="canonical" href="${canonicalUrl}">`,
    '    <meta property="og:type" content="website">',
    '    <meta property="og:site_name" content="Orb">',
    `    <meta property="og:title" content="${SEO_TITLE}">`,
    `    <meta property="og:description" content="${SEO_DESCRIPTION}">`,
    `    <meta property="og:url" content="${canonicalUrl}">`,
    '    <meta name="twitter:card" content="summary">',
    `    <meta name="twitter:title" content="${SEO_TITLE}">`,
    `    <meta name="twitter:description" content="${SEO_DESCRIPTION}">`,
  ].join('\n');
  const titled = html.replace(/<title>[^<]*<\/title>/, `<title>${SEO_TITLE}</title>`);
  return titled.replace('</head>', `${metadata}\n  </head>`);
}

export function writeSeoMetadata(root, origin) {
  let count = 0;
  for (const entry of fs.readdirSync(root, { recursive: true })) {
    if (path.basename(entry) !== 'index.html') continue;
    const file = path.join(root, entry);
    const directory = path.dirname(entry);
    const route = directory === '.' ? '/' : `/${directory}/`;
    fs.writeFileSync(file, applySeo(fs.readFileSync(file, 'utf8'), new URL(route, origin).href));
    count += 1;
  }
  return count;
}
