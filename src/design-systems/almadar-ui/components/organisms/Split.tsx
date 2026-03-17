/**
 * Split Component
 * 
 * A two-column layout with configurable ratios.
 * Perfect for sidebar/content layouts or side-by-side comparisons.
 */
import React from 'react';
import { cn } from '../../lib/cn';
import { Box } from '../atoms/Box';

export type SplitRatio = '1:1' | '1:2' | '2:1' | '1:3' | '3:1' | '1:4' | '4:1' | '2:3' | '3:2';
export type SplitGap = 'none' | 'sm' | 'md' | 'lg' | 'xl';

export interface SplitProps {
  /** Size ratio between left and right panels */
  ratio?: SplitRatio;
  /** Gap between panels */
  gap?: SplitGap;
  /** Reverse the order (right first) */
  reverse?: boolean;
  /** Stack vertically on mobile */
  stackOnMobile?: boolean;
  /** Breakpoint to switch from stacked to side-by-side */
  stackBreakpoint?: 'sm' | 'md' | 'lg' | 'xl';
  /** Align items vertically */
  align?: 'start' | 'center' | 'end' | 'stretch';
  /** Custom class name */
  className?: string;
  /** Left/first panel class name */
  leftClassName?: string;
  /** Right/second panel class name */
  rightClassName?: string;
  /** Exactly two children: [left, right] */
  children: [React.ReactNode, React.ReactNode];
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
}

const gapStyles: Record<SplitGap, string> = {
  none: 'gap-0',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
};

const alignStyles = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

// Tailwind classes for each ratio
const ratioStyles: Record<SplitRatio, [string, string]> = {
  '1:1': ['w-1/2', 'w-1/2'],
  '1:2': ['w-1/3', 'w-2/3'],
  '2:1': ['w-2/3', 'w-1/3'],
  '1:3': ['w-1/4', 'w-3/4'],
  '3:1': ['w-3/4', 'w-1/4'],
  '1:4': ['w-1/5', 'w-4/5'],
  '4:1': ['w-4/5', 'w-1/5'],
  '2:3': ['w-2/5', 'w-3/5'],
  '3:2': ['w-3/5', 'w-2/5'],
};

// Responsive variants for stacking
const breakpointPrefixes = {
  sm: 'sm:',
  md: 'md:',
  lg: 'lg:',
  xl: 'xl:',
};

/**
 * Split - Two-column layout with flexible ratios
 */
export const Split: React.FC<SplitProps> = ({
  ratio = '1:1',
  gap = 'md',
  reverse = false,
  stackOnMobile = true,
  stackBreakpoint = 'md',
  align = 'stretch',
  className,
  leftClassName,
  rightClassName,
  children,
}) => {
  const [left, right] = children;
  const [leftRatio, rightRatio] = ratioStyles[ratio];
  const bp = breakpointPrefixes[stackBreakpoint];

  // Build responsive width classes
  const leftWidth = stackOnMobile 
    ? `w-full ${bp}${leftRatio}` 
    : leftRatio;
  const rightWidth = stackOnMobile 
    ? `w-full ${bp}${rightRatio}` 
    : rightRatio;

  return (
    <Box
      className={cn(
        'flex',
        stackOnMobile ? `flex-col ${bp}flex-row` : 'flex-row',
        reverse && `${bp}flex-row-reverse`,
        gapStyles[gap],
        alignStyles[align],
        className
      )}
    >
      <Box className={cn(leftWidth, leftClassName)}>
        {left}
      </Box>
      <Box className={cn(rightWidth, rightClassName)}>
        {right}
      </Box>
    </Box>
  );
};

Split.displayName = 'Split';

export default Split;

