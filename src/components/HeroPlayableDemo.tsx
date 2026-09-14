/**
 * HeroPlayableDemo — the riya open-world platformer, playable in the hero.
 * Fetches the resolved schema synced by `almadar-sync orb-demo` from
 * /playground/demo/ and runs it through @almadar/ui/runtime's
 * BrowserPlayground (mode="mock"), lazy-loaded via BrowserOnly exactly like
 * CodePreviewTabs' Preview tab (the runtime touches window at module scope,
 * so it must stay out of the SSR bundle).
 *
 * Hovering the demo reveals a "See code" button (top-right, pointer-events
 * gated so hidden = no input captured) that opens a Modal with the
 * organism's .lolo source in @almadar/ui's CodeBlock. The modal portals to
 * <body>, so the game stays mounted and running underneath.
 */
import React, { useEffect, useState } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useColorMode } from '@docusaurus/theme-common';
import { Box, Button } from '@almadar/ui/marketing';
import { Modal, CodeBlock } from '@almadar/ui';
import '@almadar/ui/themes/index.css';

interface DemoAsset {
  schema: unknown;
  source?: string;
  lolo?: string;
}

export default function HeroPlayableDemo({
  name = 'riya-game-platformer-open-world',
  height = '480px',
}: {
  name?: string;
  height?: string;
}): React.ReactElement {
  const [schema, setSchema] = useState<unknown>(null);
  const [lolo, setLolo] = useState<string | null>(null);
  const [codeOpen, setCodeOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const url = useBaseUrl(`/playground/demo/${name}.json`);
  const { colorMode } = useColorMode();
  const appliedTheme = `wireframe-${colorMode}`;

  useEffect(() => {
    let cancelled = false;
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<DemoAsset>;
      })
      .then((asset) => {
        if (cancelled) return;
        setSchema(asset.schema);
        setLolo(asset.lolo ?? asset.source ?? null);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (failed) return <></>;

  const loadingFallback = (
    <Box
      className="h-full flex items-center justify-center"
      style={{ color: 'var(--color-muted-foreground)' }}
    >
      Loading demo…
    </Box>
  );

  return (
    <Box
      className="group rounded-lg overflow-hidden relative border border-[var(--color-border)] w-full"
      style={{
        height,
        transform: 'translateZ(0)',
        backgroundColor: 'var(--color-background, #ffffff)',
        color: 'var(--color-foreground, #18181b)',
        fontFamily:
          'var(--font-family, "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif)',
        lineHeight: 'var(--line-height, 1.6)',
      }}
      data-theme={appliedTheme}
    >
      <Box
        id="ui-slot-portal-root"
        style={{ position: 'relative', zIndex: 9999, pointerEvents: 'none' }}
        data-theme={appliedTheme}
      />
      {/* Hover affordance: invisible + pointer-events-none until group-hover,
          so the game keeps all input except over the button itself. */}
      {lolo && (
        <Box className="absolute top-2 right-2 z-[60] opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none group-hover:pointer-events-auto">
          <Box className="rounded-md bg-black/60 backdrop-blur-sm p-1">
            <Button
              variant="primary"
              size="sm"
              icon="code"
              onClick={() => setCodeOpen(true)}
            >
              See code
            </Button>
          </Box>
        </Box>
      )}
      <BrowserOnly fallback={loadingFallback}>
        {() => {
          if (!schema) return loadingFallback;
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
      {codeOpen && lolo && (
        <Modal
          isOpen
          onClose={() => setCodeOpen(false)}
          title={`${name}.lolo`}
          size="xl"
        >
          {/* Same `[&_code]`/`[&_span]` reset CodePreviewTabs applies: the
              site's global inline-`code` styling (--ifm-code-background +
              padding/border) paints a light box behind every token inside
              @almadar/ui's dark code card. */}
          <Box
            data-theme={appliedTheme}
            className="[&_code]:!bg-transparent [&_code]:!p-0 [&_code]:!border-0 [&_code]:!shadow-none [&_span]:!bg-transparent"
          >
            <CodeBlock
              code={lolo}
              language="lolo"
              foldable
              showCopyButton
              showLanguageBadge
              maxHeight="65vh"
            />
          </Box>
        </Modal>
      )}
    </Box>
  );
}
