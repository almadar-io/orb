/**
 * ScaledDiagram Molecule
 *
 * Wraps a fixed-size diagram (like JazariStateMachine / StateMachineView)
 * and CSS-scales it to fit the parent container width.
 *
 * The diagram renders at its natural (large) size. We observe the content
 * element and once the diagram is measured we apply transform:scale() with
 * a corrected container height so surrounding layout flows correctly.
 *
 * Event Contract:
 * - No events emitted (layout-only wrapper)
 * - entityAware: false
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Box } from '../atoms/Box';
import { useTranslate } from '../../hooks/useTranslate';
import { cn } from '../../lib/cn';

export interface ScaledDiagramProps {
  children: React.ReactNode;
  className?: string;
}

/** Minimum diagram width (px) to consider it a real diagram worth scaling. */
const MIN_DIAGRAM_WIDTH = 200;

export const ScaledDiagram: React.FC<ScaledDiagramProps> = ({
  children,
  className,
}) => {
  const { t: _t } = useTranslate();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<{
    scale: number;
    height: number;
  } | null>(null);

  const measure = useCallback(() => {
    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    if (!wrapper || !content) return;

    const containerW = wrapper.clientWidth;
    if (containerW <= 0) return;

    // Walk children to find a diagram element with an explicit pixel
    // width set via inline style (StateMachineView does this).
    let diagramW = 0;
    let diagramH = 0;

    const children = content.children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i] as HTMLElement;
      const w = child.style?.width;
      const h = child.style?.height;
      if (w && /^\d+/.test(w) && h && /^\d+/.test(h)) {
        diagramW = parseFloat(w);
        diagramH = parseFloat(h);
        break;
      }
      // Also check offsetWidth for elements that might have explicit size
      if (child.offsetWidth > MIN_DIAGRAM_WIDTH) {
        diagramW = child.offsetWidth;
        diagramH = child.offsetHeight;
        break;
      }
    }

    // If no sizable child found, don't apply scaling
    if (diagramW < MIN_DIAGRAM_WIDTH || diagramH <= 0) {
      setLayout(null);
      return;
    }

    const s = Math.min(1, containerW / diagramW);
    setLayout({ scale: s, height: diagramH * s });
  }, []);

  // Measure after children mount/change
  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    // Double-rAF for initial paint
    let raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => measure());
    });

    // Re-measure when DOM mutates (diagram mounts lazily)
    const mo = new MutationObserver(() => {
      requestAnimationFrame(() => measure());
    });
    mo.observe(content, { childList: true, subtree: true, attributes: true });

    return () => {
      cancelAnimationFrame(raf1);
      mo.disconnect();
    };
  }, [measure, children]);

  // Re-measure on container resize
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(wrapper);
    return () => ro.disconnect();
  }, [measure]);

  const hasLayout = layout !== null;

  return (
    <Box
      ref={wrapperRef}
      className={cn('w-full', className)}
      style={{
        // Only clip overflow once we have a valid measurement
        overflow: hasLayout ? 'hidden' : undefined,
        height: hasLayout ? layout.height : undefined,
      }}
    >
      <Box
        ref={contentRef}
        style={{
          width: 'max-content',
          transformOrigin: 'top left',
          transform: hasLayout && layout.scale < 1
            ? `scale(${layout.scale})`
            : undefined,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

ScaledDiagram.displayName = 'ScaledDiagram';
