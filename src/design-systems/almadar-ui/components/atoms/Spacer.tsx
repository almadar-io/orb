/**
 * Spacer Component
 * 
 * A flexible spacer that expands to fill available space in a flex container.
 * Useful for pushing elements apart or creating consistent spacing.
 */
import React from 'react';
import { cn } from '../../lib/cn';

export type SpacerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'auto';

export interface SpacerProps {
  /** Fixed size (auto = flex grow) */
  size?: SpacerSize;
  /** Orientation (for fixed sizes) */
  axis?: 'horizontal' | 'vertical';
  /** Custom class name */
  className?: string;
}

const horizontalSizes: Record<Exclude<SpacerSize, 'auto'>, string> = {
  xs: 'w-1',
  sm: 'w-2',
  md: 'w-4',
  lg: 'w-6',
  xl: 'w-8',
  '2xl': 'w-12',
};

const verticalSizes: Record<Exclude<SpacerSize, 'auto'>, string> = {
  xs: 'h-1',
  sm: 'h-2',
  md: 'h-4',
  lg: 'h-6',
  xl: 'h-8',
  '2xl': 'h-12',
};

/**
 * Spacer - Flexible spacing element for flex layouts
 * 
 * Usage:
 * - size="auto" (default): Expands to fill available space (flex: 1)
 * - size="md": Fixed size spacing
 */
export const Spacer: React.FC<SpacerProps> = ({
  size = 'auto',
  axis = 'horizontal',
  className,
}) => {
  if (size === 'auto') {
    return <div className={cn('flex-1', className)} aria-hidden="true" />;
  }

  const sizeClass = axis === 'horizontal' 
    ? horizontalSizes[size] 
    : verticalSizes[size];

  return (
    <div 
      className={cn('flex-shrink-0', sizeClass, className)} 
      aria-hidden="true" 
    />
  );
};

export default Spacer;

