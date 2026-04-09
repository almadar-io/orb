/**
 * OrbOrbitalsCosmicZoom — MDX-compatible wrapper for AvlOrbitalsCosmicZoom.
 *
 * Usage in MDX:
 *   <OrbOrbitalsCosmicZoom schema={`{ "name": "MyApp", ... }`} />
 */

import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

export interface OrbOrbitalsCosmicZoomProps {
  /** JSON string of the .orb schema */
  schema: string;
  /** Height of the visualization (default: '500px') */
  height?: string;
  /** Primary color */
  color?: string;
}

export default function OrbOrbitalsCosmicZoom({
  schema,
  height = '500px',
  color,
}: OrbOrbitalsCosmicZoomProps): React.ReactElement {
  return (
    <div style={{ marginBlock: '1.5rem' }}>
      <BrowserOnly fallback={<div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--ifm-color-emphasis-300)', borderRadius: '8px' }}>Loading visualization...</div>}>
        {() => {
          const { AvlOrbitalsCosmicZoom } = require('@almadar/ui/avl');
          return <AvlOrbitalsCosmicZoom schema={schema} height={parseInt(height) || 500} color={color} animated />;
        }}
      </BrowserOnly>
    </div>
  );
}
