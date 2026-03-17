/**
 * Grid Component
 * 
 * A CSS Grid wrapper with responsive column support.
 * Useful for creating multi-column layouts.
 */
import React from 'react';
import { cn } from '../../lib/cn';

export type GridCols = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'none';
export type GridGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type GridAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type GridJustify = 'start' | 'center' | 'end' | 'stretch';

export interface ResponsiveGridCols {
  /** Base/mobile columns */
  base?: GridCols;
  /** Small screens (640px+) */
  sm?: GridCols;
  /** Medium screens (768px+) */
  md?: GridCols;
  /** Large screens (1024px+) */
  lg?: GridCols;
  /** Extra large screens (1280px+) */
  xl?: GridCols;
}

export interface GridProps {
  /** Number of columns (can be responsive object) */
  cols?: GridCols | ResponsiveGridCols;
  /** Number of rows */
  rows?: number;
  /** Gap between items */
  gap?: GridGap;
  /** Row gap (overrides gap for rows) */
  rowGap?: GridGap;
  /** Column gap (overrides gap for columns) */
  colGap?: GridGap;
  /** Align items on block axis */
  alignItems?: GridAlign;
  /** Justify items on inline axis */
  justifyItems?: GridJustify;
  /** Auto-flow direction */
  flow?: 'row' | 'col' | 'row-dense' | 'col-dense';
  /** Custom class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Children elements */
  children: React.ReactNode;
  /** HTML element to render as */
  as?: React.ElementType;
}

const colStyles: Record<GridCols, string> = {
  none: 'grid-cols-none',
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  7: 'grid-cols-7',
  8: 'grid-cols-8',
  9: 'grid-cols-9',
  10: 'grid-cols-10',
  11: 'grid-cols-11',
  12: 'grid-cols-12',
};

const gapStyles: Record<GridGap, string> = {
  none: 'gap-0',
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
  '2xl': 'gap-12',
};

const rowGapStyles: Record<GridGap, string> = {
  none: 'gap-y-0',
  xs: 'gap-y-1',
  sm: 'gap-y-2',
  md: 'gap-y-4',
  lg: 'gap-y-6',
  xl: 'gap-y-8',
  '2xl': 'gap-y-12',
};

const colGapStyles: Record<GridGap, string> = {
  none: 'gap-x-0',
  xs: 'gap-x-1',
  sm: 'gap-x-2',
  md: 'gap-x-4',
  lg: 'gap-x-6',
  xl: 'gap-x-8',
  '2xl': 'gap-x-12',
};

const alignStyles: Record<GridAlign, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
};

const justifyStyles: Record<GridJustify, string> = {
  start: 'justify-items-start',
  center: 'justify-items-center',
  end: 'justify-items-end',
  stretch: 'justify-items-stretch',
};

const flowStyles = {
  row: 'grid-flow-row',
  col: 'grid-flow-col',
  'row-dense': 'grid-flow-row-dense',
  'col-dense': 'grid-flow-col-dense',
};

function getColsClass(cols: GridCols | ResponsiveGridCols): string {
  if (typeof cols === 'number' || cols === 'none') {
    return colStyles[cols];
  }

  const classes: string[] = [];
  
  if (cols.base !== undefined) {
    classes.push(colStyles[cols.base]);
  }
  if (cols.sm !== undefined) {
    classes.push(`sm:${colStyles[cols.sm]}`);
  }
  if (cols.md !== undefined) {
    classes.push(`md:${colStyles[cols.md]}`);
  }
  if (cols.lg !== undefined) {
    classes.push(`lg:${colStyles[cols.lg]}`);
  }
  if (cols.xl !== undefined) {
    classes.push(`xl:${colStyles[cols.xl]}`);
  }

  return classes.join(' ');
}

/**
 * Grid - CSS Grid layout wrapper
 */
export const Grid: React.FC<GridProps> = ({
  cols = 1,
  rows,
  gap = 'md',
  rowGap,
  colGap,
  alignItems,
  justifyItems,
  flow,
  className,
  style,
  children,
  as: Component = 'div',
}) => {
  const mergedStyle = rows
    ? { gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`, ...style }
    : style;

  return (
    <Component
      className={cn(
        'grid',
        getColsClass(cols),
        // Gap (rowGap/colGap override gap)
        rowGap ? rowGapStyles[rowGap] : colGap ? undefined : gapStyles[gap],
        colGap ? colGapStyles[colGap] : rowGap ? undefined : undefined,
        rowGap && colGap ? `${rowGapStyles[rowGap]} ${colGapStyles[colGap]}` : undefined,
        // Alignment
        alignItems && alignStyles[alignItems],
        justifyItems && justifyStyles[justifyItems],
        // Flow
        flow && flowStyles[flow],
        className
      )}
      style={mergedStyle}
    >
      {children}
    </Component>
  );
};

Grid.displayName = 'Grid';

export default Grid;

