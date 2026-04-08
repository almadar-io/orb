/**
 * remark-lolo-compile
 *
 * Remark plugin for Docusaurus MDX. Walks the AST looking for code fences
 * with lang="lolo" and "preview" in the meta string. For each one it:
 *
 *  1. Pipes the .lolo source to `orbital emit-orb` via stdin
 *  2. Captures the .orb JSON from stdout
 *  3. Replaces the fence node with:
 *       - The original `code` AST node (lang=lolo) stays in place — Docusaurus renders it via Prism
 *       - <OrbPreviewBlock schema={preCompiledOrbJson} showCode={false} /> inserted after it (preview fences only)
 *
 * Fences without "preview" meta are left as standard `code` nodes unchanged.
 * Fences with "preview" that fail to compile throw a build error.
 *
 * Usage in docusaurus.config.ts:
 *   import remarkLoloCompile from './shared/plugins/remark-lolo-compile';
 *   // under docs preset config:
 *   remarkPlugins: [remarkLoloCompile],
 */

import { execSync } from 'node:child_process';

type Node = {
  type: string;
  lang?: string;
  meta?: string;
  value?: string;
  children?: Node[];
  [key: string]: unknown;
};

type MdxJsxAttributeValue =
  | string
  | null
  | { type: 'mdxJsxAttributeValueExpression'; value: string };

type MdxJsxAttribute = {
  type: 'mdxJsxAttribute';
  name: string;
  value: MdxJsxAttributeValue;
};

type MdxJsxFlowElement = {
  type: 'mdxJsxFlowElement';
  name: string;
  attributes: MdxJsxAttribute[];
  children: [];
};

/** Walk tree collecting code nodes with lang=lolo, recording parent + index */
function collectLoloNodes(
  node: Node,
  parent: Node | null,
  index: number,
  results: Array<{ node: Node; parent: Node; index: number }>,
): void {
  if (node.type === 'code' && node.lang === 'lolo') {
    if (parent != null) {
      results.push({ node, parent, index });
    }
  }
  if (Array.isArray(node.children)) {
    for (let i = 0; i < node.children.length; i++) {
      collectLoloNodes(node.children[i], node, i, results);
    }
  }
}

export default function remarkLoloCompile() {
  return (tree: Node): void => {
    const hits: Array<{ node: Node; parent: Node; index: number }> = [];
    collectLoloNodes(tree, null, 0, hits);

    // Apply in reverse order so earlier indices stay valid after splicing
    for (const { node, parent, index } of hits.reverse()) {
      const loloSource = node.value ?? '';
      const meta = (node.meta as string | undefined) ?? '';
      const hasPreview = meta.includes('preview');

      // Non-preview fences: leave as-is — Docusaurus renders them natively via Prism
      if (!hasPreview) continue;

      let orbJson: string;
      try {
        orbJson = execSync('orbital emit-orb', {
          input: loloSource,
          encoding: 'utf8',
          timeout: 15_000,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        throw new Error(
          `[remark-lolo-compile] Failed to compile lolo fence:\n${msg}\n\nSource:\n${loloSource}`,
        );
      }

      // Preview fences: keep the code node in-place, insert OrbPreviewBlock after it
      (parent.children as Node[]).splice(
        index + 1,
        0,
        makeOrbPreview(orbJson.trim()),
      );
    }
  };
}

function makeOrbPreview(orbJson: string): MdxJsxFlowElement {
  return {
    type: 'mdxJsxFlowElement',
    name: 'OrbPreviewBlock',
    attributes: [
      { type: 'mdxJsxAttribute', name: 'schema', value: orbJson },
      // lolo fence above already shows the code — only show the live preview
      { type: 'mdxJsxAttribute', name: 'showCode', value: { type: 'mdxJsxAttributeValueExpression', value: 'false' } },
    ],
    children: [],
  };
}
