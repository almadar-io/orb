/**
 * OrbCosmicZoom — MDX-compatible wrapper for AvlCosmicZoom.
 *
 * Usage in MDX:
 *   <OrbCosmicZoom schema={`{ "name": "MyApp", ... }`} />
 */

import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

export interface OrbCosmicZoomProps {
  /** JSON string of the .orb schema */
  schema: string;
  /** Height of the visualization (default: '450px') */
  height?: string;
  /** Primary color */
  color?: string;
}

export default function OrbCosmicZoom({
  schema,
  height = '450px',
  color,
}: OrbCosmicZoomProps): React.ReactElement {
  return (
    <div style={{ marginBlock: '1.5rem' }}>
      <BrowserOnly fallback={<div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--ifm-color-emphasis-300)', borderRadius: '8px' }}>Loading visualization...</div>}>
        {() => {
          const { AvlCosmicZoom } = require('@almadar/ui/avl');
          return <AvlCosmicZoom schema={schema} height={height} color={color} animated />;
        }}
      </BrowserOnly>
    </div>
  );
}
