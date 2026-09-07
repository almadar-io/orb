/**
 * CodeBlock swizzle — `.lolo` / `.orb` fences get Arabic and Slovenian tabs;
 * every other fence renders exactly as Docusaurus renders it.
 *
 * This file only decides WHICH fences get tabs. The vocabulary and the
 * position rules live in `@almadar/core/i18n`; the tab UI is
 * `../../components/LoloLanguageTabs`.
 *
 * Ref forwarding matters: wrapping the original in a plain function component
 * breaks docusaurus's ref to the underlying `<pre>`, and `useCodeWordWrap`
 * then destructures `scrollWidth` from a null ref on every page with a fence.
 * So the passthrough is a `forwardRef` that hands the ref straight through.
 */
import React from 'react';
import OriginalCodeBlock from '@theme-original/CodeBlock';
import type CodeBlockType from '@theme/CodeBlock';
import type { WrapperProps } from '@docusaurus/types';
import LoloLanguageTabs from '../../components/LoloLanguageTabs';

type Props = WrapperProps<typeof CodeBlockType>;

const TRANSLATABLE = new Set(['lolo', 'orb']);

/** `language-lolo` from the fence's className, or the explicit `language` prop. */
function fenceLanguage(props: Props): string | undefined {
  if (typeof props.language === 'string') return props.language;
  const className = typeof props.className === 'string' ? props.className : '';
  return /(?:^|\s)language-([\w-]+)(?:\s|$)/.exec(className)?.[1];
}

const CodeBlock = React.forwardRef<HTMLElement, Props>((props, ref) => {
  const language = fenceLanguage(props);
  const code = typeof props.children === 'string' ? props.children : undefined;

  if (language === undefined || !TRANSLATABLE.has(language) || code === undefined) {
    return <OriginalCodeBlock ref={ref} {...props} />;
  }

  const { children: _children, ...blockProps } = props;
  return (
    <LoloLanguageTabs
      code={code.replace(/\n$/, '')}
      language={language}
      blockProps={blockProps}
    />
  );
});

CodeBlock.displayName = 'CodeBlock';

export default CodeBlock;
