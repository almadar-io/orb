/**
 * CodePreviewTabs — a code snippet with a live Preview tab. The "Code" tab
 * renders the (orbital-formatted) source; the "Preview" tab runs the resolved
 * schema through @almadar/ui/runtime's BrowserPlayground (mode="mock").
 *
 * The preview wrapper is a faithful copy of the playground's
 * (src/components/PlaygroundContent.tsx): themes CSS imported so `data-theme`
 * resolves to real variables, a themed container (with translateZ scoping +
 * CSS-var defaults), and the `#ui-slot-portal-root` host that modal/overlay UI
 * slots portal into. Without the themes CSS + data-theme the modals render with
 * no chrome (invisible); without the portal host they have nowhere to mount.
 */
import React, { useState } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { useColorMode } from '@docusaurus/theme-common';
import { Box, HStack, Button } from '@almadar/ui/marketing';
// @almadar/ui's CodeBlock supports JSON/orb-style folding (collapse/expand)
// via the `foldable` prop — unlike the stock Docusaurus CodeBlock.
import { CodeBlock } from '@almadar/ui';

// Load all theme CSS so data-theme="<theme>-<mode>" resolves to actual
// variables — same import the playground relies on. Both the Code tab
// (CodeBlock) and the Preview tab must sit inside a `data-theme` element or
// @almadar/ui's CSS variables don't resolve (broken syntax/line backgrounds).
import '@almadar/ui/themes/index.css';

export interface CodePreviewTabsProps {
  /** Source code shown in the Code tab. */
  code: string;
  /** Code language for highlighting. Default: 'lolo'. */
  language?: string;
  /** Filename label on the code block. */
  title?: string;
  /** Resolved `.orb` schema object rendered by the Preview tab. */
  schema: unknown;
  /** Preview height. Default: '520px'. */
  height?: string;
}

type Tab = 'code' | 'preview';

export default function CodePreviewTabs({
  code,
  language = 'lolo',
  title,
  schema,
  height = '520px',
}: CodePreviewTabsProps): React.ReactElement {
  const [tab, setTab] = useState<Tab>('code');
  const [copied, setCopied] = useState(false);
  // Follow the site's light/dark toggle so the code + preview match the page.
  const { colorMode } = useColorMode();
  const appliedTheme = `wireframe-${colorMode}`;

  const handleCopy = (): void => {
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <Box className="w-full">
      <HStack
        gap="xs"
        className="mb-2 p-1 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] w-fit"
        role="tablist"
        aria-label="Example code and preview"
      >
        <Button
          variant={tab === 'code' ? 'primary' : 'ghost'}
          size="sm"
          role="tab"
          aria-selected={tab === 'code'}
          onClick={() => setTab('code')}
          icon="code"
        >
          Code
        </Button>
        <Button
          variant={tab === 'preview' ? 'primary' : 'ghost'}
          size="sm"
          role="tab"
          aria-selected={tab === 'preview'}
          onClick={() => setTab('preview')}
          icon="play"
        >
          Preview
        </Button>
      </HStack>

      {/* Code tab stays mounted so highlighting isn't recomputed on every toggle.
          The `[&_code]`/`[&_span]` resets strip Docusaurus's global inline-`code`
          styling (--ifm-code-background + padding/border) that otherwise paints a
          light box behind every token inside @almadar/ui's syntax highlighter. */}
      {/* One cohesive dark card. The CodeBlock body is always dark (its syntax
          theme), so we build our own dark header (filename + copy) and disable
          the CodeBlock's own header (badge + copy) which renders a mismatched
          white bar. */}
      <Box
        className="rounded-lg border border-[var(--color-border)] overflow-hidden [&_code]:!bg-transparent [&_code]:!p-0 [&_code]:!border-0 [&_code]:!shadow-none [&_span]:!bg-transparent"
        style={{ display: tab === 'code' ? 'block' : 'none', backgroundColor: '#1e1e1e' }}
        data-theme={appliedTheme}
      >
        <div className="flex items-center justify-between px-3 py-2 text-xs font-mono border-b border-white/10">
          <span className="text-gray-400">{title}</span>
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy code"
            className="text-gray-400 hover:text-white transition-colors"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <CodeBlock
          code={code}
          language={language}
          foldable
          showCopyButton={false}
          showLanguageBadge={false}
          maxHeight={height}
        />
      </Box>

      {tab === 'preview' && (
        <Box
          className="rounded-lg overflow-hidden relative border border-[var(--color-border)]"
          style={{
            height,
            transform: 'translateZ(0)',
            backgroundColor: 'var(--color-background, #ffffff)',
            color: 'var(--color-foreground, #18181b)',
            fontFamily:
              'var(--font-family, "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif)',
            lineHeight: 'var(--line-height, 1.6)',
            letterSpacing: 'var(--letter-spacing, -0.01em)',
            fontWeight: 'var(--font-weight-normal, 400)',
          }}
          data-theme={appliedTheme}
        >
          <Box
            id="ui-slot-portal-root"
            style={{ position: 'relative', zIndex: 9999, pointerEvents: 'none' }}
            data-theme={appliedTheme}
          />
          <BrowserOnly
            fallback={
              <div
                style={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-muted-foreground)',
                }}
              >
                Loading preview…
              </div>
            }
          >
            {() => {
              // Dynamic require keeps the runtime out of the SSR bundle.
              const { BrowserPlayground } =
                require('@almadar/ui/runtime') as typeof import('@almadar/ui/runtime');
              return (
                <BrowserPlayground
                  schema={schema as Parameters<typeof BrowserPlayground>[0]['schema']}
                  mode="mock"
                  height="100%"
                  className="border-0 rounded-none"
                />
              );
            }}
          </BrowserOnly>
        </Box>
      )}
    </Box>
  );
}
