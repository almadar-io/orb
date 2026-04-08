/**
 * remark-lolo-compile
 *
 * Remark plugin for Docusaurus MDX. Walks the AST looking for code fences
 * with lang="lolo" and "preview" in the meta string. For each one it:
 *
 *  1. Pipes the .lolo source to `orbital emit-orb` via stdin
 *  2. Captures the .orb JSON from stdout
 *  3. Replaces the single fence node with two JSX nodes:
 *       <CodeBlock language="lolo" code={rawLoloSource} />
 *       <OrbPreview schema={preCompiledOrbJson} autoMock />
 *
 * Fences without "preview" meta render as a plain CodeBlock only.
 * Fences with "preview" that fail to compile throw a build error.
 *
 * Usage in docusaurus.config.ts:
 *   import remarkLoloCompile from './path/to/remark-lolo-compile/src/index';
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

type MdxJsxAttribute = {
  type: 'mdxJsxAttribute';
  name: string;
  value: string | null;
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

      const codeBlockNode = makeCodeBlock(loloSource);

      if (!hasPreview) {
        (parent.children as Node[]).splice(index, 1, codeBlockNode);
        continue;
      }

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

      (parent.children as Node[]).splice(
        index,
        1,
        codeBlockNode,
        makeOrbPreview(orbJson.trim()),
      );
    }
  };
}

function makeCodeBlock(loloSource: string): MdxJsxFlowElement {
  return {
    type: 'mdxJsxFlowElement',
    name: 'CodeBlock',
    attributes: [
      { type: 'mdxJsxAttribute', name: 'language', value: 'lolo' },
      { type: 'mdxJsxAttribute', name: 'code', value: loloSource },
    ],
    children: [],
  };
}

function makeOrbPreview(orbJson: string): MdxJsxFlowElement {
  return {
    type: 'mdxJsxFlowElement',
    name: 'OrbPreview',
    attributes: [
      { type: 'mdxJsxAttribute', name: 'schema', value: orbJson },
      { type: 'mdxJsxAttribute', name: 'autoMock', value: null },
    ],
    children: [],
  };
}
