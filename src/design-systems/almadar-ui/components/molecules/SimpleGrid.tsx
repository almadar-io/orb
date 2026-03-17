/**
 * SimpleGrid Component
 * 
 * A simplified grid that automatically adjusts columns based on available space.
 * Perfect for card layouts and item collections.
 */
import React from 'react';
import { cn } from '../../lib/cn';

export type SimpleGridGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface SimpleGridProps {
  /** Minimum width of each child (e.g., 200, "200px", "15rem") */
  minChildWidth?: number | string;
  /** Maximum number of columns */
  maxCols?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Exact number of columns (disables auto-fit) */
  cols?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Gap between items */
  gap?: SimpleGridGap;
  /** Custom class name */
  className?: string;
  /** Children elements */
  children: React.ReactNode;
}

const gapStyles: Record<SimpleGridGap, string> = {
  none: 'gap-0',
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
};

const colStyles = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
};

/**
 * SimpleGrid - Auto-responsive grid layout
 */
export const SimpleGrid: React.FC<SimpleGridProps> = ({
  minChildWidth = 250,
  maxCols,
  cols,
  gap = 'md',
  className,
  children,
}) => {
  // If exact cols specified, use fixed grid
  if (cols) {
    return (
      <div className={cn('grid', colStyles[cols], gapStyles[gap], className)}>
        {children}
      </div>
    );
  }

  // Otherwise use auto-fit with minChildWidth
  const minWidth = typeof minChildWidth === 'number' 
    ? `${minChildWidth}px` 
    : minChildWidth;

  // Calculate max column constraint if provided
  const templateColumns = maxCols
    ? `repeat(auto-fit, minmax(min(${minWidth}, 100%), 1fr))`
    : `repeat(auto-fit, minmax(${minWidth}, 1fr))`;

  return (
    <div
      className={cn('grid', gapStyles[gap], className)}
      style={{ 
        gridTemplateColumns: templateColumns,
        // Limit max columns if specified
        ...(maxCols && { maxWidth: `calc(${maxCols} * (${minWidth} + var(--gap, 1rem)))` }),
      }}
    >
      {children}
    </div>
  );
};

SimpleGrid.displayName = 'SimpleGrid';

export default SimpleGrid;

