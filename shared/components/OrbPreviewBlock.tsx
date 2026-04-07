/**
 * OrbPreviewBlock — MDX layout wrapper around `@almadar/ui`'s `OrbPreview`.
 *
 * This is a thin presentational shell that renders a CodeBlock and an
 * OrbPreview side-by-side. All schema preparation (mock data generation +
 * state machine adjustment) lives in `@almadar/ui/runtime`'s
 * `prepareSchemaForPreview` and is enabled here via `<OrbPreview autoMock />`.
 *
 * The same `autoMock` path is used by the playground (`PlaygroundContent.tsx`),
 * so docs and playground render schemas through one shared pipeline.
 */

import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import CodeBlock from '@theme/CodeBlock';

export interface OrbPreviewBlockProps {
  /** Raw `.orb` JSON string. Parsed and prepared by OrbPreview. */
  schema: string;
  /** Optional title rendered above the block. */
  title?: string;
  /** Show the source code panel alongside the preview. Default: true. */
  showCode?: boolean;
  /** Preview height (e.g. '400px'). Default: '400px'. */
  height?: string;
}

export default function OrbPreviewBlock({
  schema,
  title,
  showCode = true,
  height = '400px',
}: OrbPreviewBlockProps): React.ReactElement {
  return (
    <div style={{ marginBlock: '1.5rem' }}>
      {title && (
        <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{title}</p>
      )}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: showCode ? '1fr 1fr' : '1fr',
          gap: '1rem',
          alignItems: 'stretch',
        }}
      >
        {showCode && (
          <div style={{ overflow: 'auto', maxHeight: height }}>
            <CodeBlock language="json" title="schema.orb">
              {schema.trim()}
            </CodeBlock>
          </div>
        )}
        <BrowserOnly
          fallback={
            <div
              style={{
                height,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px dashed var(--ifm-color-emphasis-300)',
                borderRadius: '8px',
              }}
            >
              Loading preview...
            </div>
          }
        >
          {() => {
            // Dynamic require keeps @almadar/ui/runtime out of the SSR bundle.
            const { OrbPreview } = require('@almadar/ui/runtime') as typeof import('@almadar/ui/runtime');
            return <OrbPreview schema={schema} autoMock height={height} />;
          }}
        </BrowserOnly>
      </div>
    </div>
  );
}
