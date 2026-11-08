#!/usr/bin/env node
// Stages one orb release from a local build tree: the @almadar/orb-<platform> packages, the @almadar/orb wrapper,
// the GitHub release archives and the symbol files. `orb release` runs it as a declared step after the build.
// Usage: node scripts/stage-release.mjs --version <x.y.z> --from <cargo target dir> --profile <dist|release> --out <dir>
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '..');
const splitSymbols = path.resolve(repo, '../../orbital-rust/crates/orbital-core/scripts/split-symbols.sh');

export const PLATFORMS = [
  { name: 'darwin-arm64', os: 'darwin', cpu: 'arm64', target: 'aarch64-apple-darwin', addonTarget: 'aarch64-apple-darwin', exe: '', node: 'liborbital_node.dylib', python: 'liborbital_kernel.dylib', pythonOut: 'orbital_kernel.abi3.so' },
  { name: 'darwin-x64', os: 'darwin', cpu: 'x64', target: 'x86_64-apple-darwin', addonTarget: 'x86_64-apple-darwin', exe: '', node: 'liborbital_node.dylib', python: 'liborbital_kernel.dylib', pythonOut: 'orbital_kernel.abi3.so' },
  { name: 'linux-x64', os: 'linux', cpu: 'x64', target: 'x86_64-unknown-linux-musl', addonTarget: 'x86_64-unknown-linux-gnu', exe: '', node: 'liborbital_node.so', python: 'liborbital_kernel.so', pythonOut: 'orbital_kernel.abi3.so' },
  { name: 'linux-arm64', os: 'linux', cpu: 'arm64', target: 'aarch64-unknown-linux-musl', addonTarget: 'aarch64-unknown-linux-gnu', exe: '', node: 'liborbital_node.so', python: 'liborbital_kernel.so', pythonOut: 'orbital_kernel.abi3.so' },
  { name: 'windows-x64', os: 'win32', cpu: 'x64', target: 'x86_64-pc-windows-msvc', addonTarget: 'x86_64-pc-windows-msvc', exe: '.exe', node: 'orbital_node.dll', python: 'orbital_kernel.dll', pythonOut: 'orbital_kernel.pyd' },
];

export function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 2) {
    const flag = argv[i];
    if (!flag.startsWith('--') || argv[i + 1] === undefined) throw new Error(`expected --flag value pairs, got ${flag}`);
    args[flag.slice(2)] = argv[i + 1];
  }
  for (const required of ['version', 'from', 'profile', 'out']) {
    if (!args[required]) throw new Error(`--${required} is required`);
  }
  return args;
}

/** The language range `orb --version` names: `orb 19.1.0 (language ^1)` reads `^1`. */
export function languageRange(versionLine) {
  const match = /^orb \S+ \(language (.+)\)$/.exec(versionLine.trim());
  if (!match) throw new Error(`'${versionLine.trim()}' names no language range`);
  return match[1];
}

export function platformManifest(platform, version, reads) {
  return {
    name: `@almadar/orb-${platform.name}`,
    version,
    description: `Orb CLI binary for ${platform.name}`,
    license: 'BSL-1.1',
    repository: { type: 'git', url: 'https://github.com/almadar-io/orb.git' },
    os: [platform.os],
    cpu: [platform.cpu],
    orbReads: reads,
  };
}

export function wrapperManifest(source, version) {
  const optional = Object.fromEntries(Object.keys(source.optionalDependencies ?? {}).map((name) => [name, version]));
  return { ...source, version, optionalDependencies: optional };
}

function built(from, target, profile, file) {
  const at = path.join(from, target, profile, file);
  if (!fs.existsSync(at)) throw new Error(`missing build output ${at}`);
  return at;
}

function copyExecutable(source, dest) {
  fs.copyFileSync(source, dest);
  fs.chmodSync(dest, 0o755);
}

function stage({ version, from, profile, out }) {
  fs.rmSync(out, { recursive: true, force: true });
  const packages = path.join(out, 'npm');
  const archives = path.join(out, 'release');
  const symbols = path.join(out, 'symbols');
  for (const dir of [packages, archives, symbols]) fs.mkdirSync(dir, { recursive: true });

  const host = PLATFORMS.find((p) => p.target === `${process.arch === 'arm64' ? 'aarch64' : 'x86_64'}-apple-darwin`);
  if (!host) throw new Error('stage-release runs on a macOS host');
  const reads = languageRange(
    execFileSync(built(from, host.target, profile, 'orb'), ['--version'], { env: { ...process.env, ORB_HANDED_OFF: '1' } }).toString(),
  );

  for (const platform of PLATFORMS) {
    const dir = path.join(packages, `orb-${platform.name}`);
    fs.mkdirSync(dir, { recursive: true });
    const orb = path.join(dir, `orb${platform.exe}`);
    copyExecutable(built(from, platform.target, profile, `orb${platform.exe}`), orb);
    if (platform.exe) fs.copyFileSync(built(from, platform.target, profile, 'orb.pdb'), path.join(dir, 'orb.pdb'));
    execFileSync('bash', [splitSymbols, orb, path.join(symbols, `orb-${platform.name}.symbols`)], { stdio: 'inherit' });
    fs.rmSync(path.join(dir, 'orb.pdb'), { force: true });

    const addons = [
      [platform.node, 'kernel.node', 'kernel-node', 'orbital_node.pdb'],
      [platform.python, platform.pythonOut, 'python-kernel', 'orbital_kernel.pdb'],
    ];
    for (const [file, outName, label, pdb] of addons) {
      const dest = path.join(dir, outName);
      fs.copyFileSync(built(from, platform.addonTarget, profile, file), dest);
      if (platform.exe) fs.copyFileSync(built(from, platform.addonTarget, profile, pdb), path.join(dir, `${path.parse(outName).name}.pdb`));
      execFileSync('bash', [splitSymbols, dest, path.join(symbols, `orb-${platform.name}.symbols.${label}`)], { stdio: 'inherit' });
      fs.rmSync(path.join(dir, `${path.parse(outName).name}.pdb`), { force: true });
    }
    fs.writeFileSync(path.join(dir, 'package.json'), `${JSON.stringify(platformManifest(platform, version, reads), null, 2)}\n`);

    if (platform.exe) {
      execFileSync('zip', ['-j', '-q', path.join(archives, `orb-${platform.name}.zip`), orb]);
    } else {
      execFileSync('tar', ['-czf', path.join(archives, `orb-${platform.name}.tar.gz`), '-C', dir, 'orb']);
    }
  }

  const wrapperSource = path.join(repo, 'cli', 'npm');
  const wrapper = path.join(packages, 'orb');
  fs.cpSync(wrapperSource, wrapper, { recursive: true });
  const manifest = JSON.parse(fs.readFileSync(path.join(wrapperSource, 'package.json'), 'utf8'));
  fs.writeFileSync(path.join(wrapper, 'package.json'), `${JSON.stringify(wrapperManifest(manifest, version), null, 2)}\n`);
  console.log(`staged orb ${version} (language ${reads}) into ${out}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  stage(parseArgs(process.argv.slice(2)));
}
