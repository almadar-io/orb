/**
 * OrbPreviewBlock — MDX component that shows an .orb schema as code
 * alongside its live rendered preview.
 *
 * Usage in MDX:
 *   <OrbPreviewBlock schema={`{ "name": "MyApp", ... }`} />
 */

import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import CodeBlock from '@theme/CodeBlock';

export interface OrbPreviewBlockProps {
  /** JSON string of the .orb schema */
  schema: string;
  /** Optional title shown above the block */
  title?: string;
  /** Show the code panel (default: true) */
  showCode?: boolean;
  /** Height of the preview pane (default: '400px') */
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
        <BrowserOnly fallback={<div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--ifm-color-emphasis-300)', borderRadius: '8px' }}>Loading preview...</div>}>
          {() => {
            // Dynamic import so @almadar/ui/runtime is never pulled into SSG
            const { OrbPreview } = require('@almadar/ui/runtime');
            return <OrbPreview schema={schema} height={height} />;
          }}
        </BrowserOnly>
      </div>
    </div>
  );
}
