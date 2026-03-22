/**
 * CodeBlock swizzle — delegates to the default Docusaurus CodeBlock.
 *
 * The original custom CodeBlock bypassed Prism tokenization entirely.
 * This wrapper uses @theme-original/CodeBlock which includes
 * prism-react-renderer for proper syntax highlighting.
 */
import React from 'react';
import CodeBlock from '@theme-original/CodeBlock';

export default function CodeBlockWrapper(props: Record<string, unknown>): React.ReactElement {
  return <CodeBlock {...props} />;
}
