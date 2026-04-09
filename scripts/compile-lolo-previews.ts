#!/usr/bin/env tsx
/**
 * compile-lolo-previews.ts
 *
 * One-time migration (also safe to re-run) that replaces `lolo preview`
 * fences in docs with:
 *   1. A plain `lolo` code fence (for Prism syntax highlighting)
 *   2. A pre-compiled .orb.json sidecar file next to the MDX file
 *   3. An import of that JSON + an <OrbPreviewBlock> call in the MDX
 *
 * After running, the remark-lolo-compile plugin is no longer needed.
 *
 * Usage (from almadar/orb/):
 *   npx tsx scripts/compile-lolo-previews.ts
 */

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname, basename, extname, relative, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DOCS_DIR = join(ROOT, 'docs');

// ── helpers ────────────────────────────────────────────────────────────────

function toCamelCase(str: string): string {
  return str
    .split(/[-_]/)
    .map((part, i) => (i === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
    .join('');
}

/** Find all md/mdx files under docs/ that contain at least one lolo preview fence */
function findFiles(): string[] {
  const output = execSync('grep -rl "lolo preview" docs/', {
    cwd: ROOT,
    encoding: 'utf8',
  });
  return output
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((f) => join(ROOT, f));
}

/** Compile lolo source to orb JSON string via `orbital emit-orb` */
function compileLolo(loloSource: string, filePath: string): string {
  try {
    return execSync('orbital emit-orb', {
      input: loloSource,
      encoding: 'utf8',
      timeout: 30_000,
      cwd: ROOT,
    }).trim();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`[compile-lolo-previews] Failed to compile fence in ${filePath}:\n${msg}`);
  }
}

/** Insert import lines after the last existing import statement (or after frontmatter) */
function insertImports(content: string, newImports: string[]): string {
  if (newImports.length === 0) return content;

  // Find the last import line
  const lines = content.split('\n');
  let lastImportIdx = -1;
  let frontmatterEnd = -1;
  let inFrontmatter = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (i === 0 && line === '---') { inFrontmatter = true; continue; }
    if (inFrontmatter && line === '---') { frontmatterEnd = i; inFrontmatter = false; continue; }
    if (line.startsWith('import ')) lastImportIdx = i;
  }

  const insertAfter = lastImportIdx >= 0 ? lastImportIdx : frontmatterEnd;

  if (insertAfter < 0) {
    // No imports, no frontmatter — prepend
    return newImports.join('\n') + '\n\n' + content;
  }

  lines.splice(insertAfter + 1, 0, ...newImports);
  return lines.join('\n');
}

// ── main ───────────────────────────────────────────────────────────────────

const files = findFiles();
console.log(`Found ${files.length} file(s) with lolo preview fences.\n`);

for (const filePath of files) {
  const rel = relative(ROOT, filePath);
  const dir = dirname(filePath);
  const base = basename(filePath, extname(filePath));
  let content = readFileSync(filePath, 'utf8');

  // Collect all fence matches with their positions
  const fenceRegex = /```lolo preview\n([\s\S]*?)```/g;
  const fences: Array<{ full: string; source: string; fenceIdx: number }> = [];
  let m: RegExpExecArray | null;
  while ((m = fenceRegex.exec(content)) !== null) {
    fences.push({ full: m[0], source: m[1], fenceIdx: fences.length + 1 });
  }

  if (fences.length === 0) continue;

  const newImports: string[] = [];
  // Check which imports already exist
  const alreadyImportsOrbPreviewBlock = content.includes("import OrbPreviewBlock");

  // Process fences (use unique sentinel replacement to avoid double-replace on identical sources)
  const sentinels: Map<string, { varName: string; source: string }> = new Map();

  for (const fence of fences) {
    const suffix = fences.length === 1 ? '' : `-${fence.fenceIdx}`;
    const jsonFilename = `${base}${suffix}.orb.json`;
    const jsonPath = join(dir, jsonFilename);
    const varName = fences.length === 1
      ? `${toCamelCase(base)}Schema`
      : `schema${fence.fenceIdx}`;
    const importPath = `./${jsonFilename}`;

    // Compile
    console.log(`  Compiling fence ${fence.fenceIdx}/${fences.length} in ${rel}...`);
    const orbJson = compileLolo(fence.source, filePath);

    // Write sidecar JSON
    writeFileSync(jsonPath, orbJson + '\n');
    console.log(`  → wrote ${relative(ROOT, jsonPath)}`);

    newImports.push(`import ${varName} from './${jsonFilename}';`);

    // Build the replacement using a unique sentinel first, then swap
    const sentinel = `__LOLO_SENTINEL_${fence.fenceIdx}__`;
    sentinels.set(sentinel, { varName, source: fence.source });

    // Replace only the first occurrence of this exact fence text
    content = content.replace(fence.full, sentinel);
  }

  // Now replace sentinels with final content
  for (const [sentinel, { varName, source }] of sentinels) {
    const replacement =
      `\`\`\`lolo\n${source}\`\`\`\n\n` +
      `<OrbPreviewBlock schema={JSON.stringify(${varName})} showCode={false} />`;
    content = content.replace(sentinel, replacement);
  }

  // Add OrbPreviewBlock import if not already present
  if (!alreadyImportsOrbPreviewBlock) {
    newImports.unshift(`import OrbPreviewBlock from '@shared/OrbPreviewBlock';`);
  }

  // Insert new imports
  content = insertImports(content, newImports);

  writeFileSync(filePath, content);
  console.log(`  ✓ updated ${rel}\n`);
}

console.log('Done. Remove the remark-lolo-compile plugin from docusaurus.config.ts.');
