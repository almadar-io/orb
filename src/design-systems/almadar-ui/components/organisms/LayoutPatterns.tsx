/**
 * Layout Pattern Components
 *
 * Pattern wrappers for layout components that support recursive rendering
 * of nested patterns via the `children` prop.
 *
 * These components bridge the shell's layout primitives (Stack, Box, Grid, etc.)
 * with the pattern system's recursive rendering capability.
 *
 * @packageDocumentation
 */

import React from 'react';
import { VStack, HStack, type StackGap, type StackAlign, type StackJustify } from '../atoms/Stack';
import { Box, type BoxPadding, type BoxBg, type BoxRounded, type BoxShadow } from '../atoms/Box';
import { Grid, type GridCols, type GridGap, type ResponsiveGridCols } from '../molecules/Grid';
import { Center } from '../atoms/Center';
import { Spacer } from '../atoms/Spacer';
import { Divider, type DividerVariant, type DividerOrientation } from '../atoms/Divider';

// ============================================================================
// Pattern Props Interface
// ============================================================================

/**
 * Base props for all layout patterns with children support.
 */
export interface LayoutPatternProps {
  /** Nested pattern configurations - rendered recursively */
  children?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name */
  entity?: string;
}

// ============================================================================
// VStack Pattern
// ============================================================================

export interface VStackPatternProps extends LayoutPatternProps {
  /** Gap between children */
  gap?: StackGap;
  /** Cross-axis alignment */
  align?: StackAlign;
  /** Main-axis alignment */
  justify?: StackJustify;
}

/**
 * VStack pattern component.
 *
 * Renders children in a vertical stack with configurable spacing.
 */
export function VStackPattern({
  gap = 'md',
  align = 'stretch',
  justify = 'start',
  className,
  style,
  children,
}: VStackPatternProps): React.ReactElement {
  return (
    <VStack gap={gap} align={align} justify={justify} className={className} style={style}>
      {children}
    </VStack>
  );
}

VStackPattern.displayName = 'VStackPattern';

// ============================================================================
// HStack Pattern
// ============================================================================

export interface HStackPatternProps extends LayoutPatternProps {
  /** Gap between children */
  gap?: StackGap;
  /** Cross-axis alignment */
  align?: StackAlign;
  /** Main-axis alignment */
  justify?: StackJustify;
  /** Enable wrapping */
  wrap?: boolean;
}

/**
 * HStack pattern component.
 *
 * Renders children in a horizontal stack with configurable spacing.
 */
export function HStackPattern({
  gap = 'md',
  align = 'center',
  justify = 'start',
  wrap = false,
  className,
  style,
  children,
}: HStackPatternProps): React.ReactElement {
  return (
    <HStack gap={gap} align={align} justify={justify} wrap={wrap} className={className} style={style}>
      {children}
    </HStack>
  );
}

HStackPattern.displayName = 'HStackPattern';

// ============================================================================
// Box Pattern
// ============================================================================

export interface BoxPatternProps extends LayoutPatternProps {
  /** Padding shorthand */
  p?: BoxPadding;
  /** Margin shorthand */
  m?: BoxPadding;
  /** Background color token */
  bg?: BoxBg;
  /** Show border */
  border?: boolean;
  /** Border radius */
  radius?: BoxRounded;
  /** Shadow level */
  shadow?: BoxShadow;
}

/**
 * Box pattern component.
 *
 * Generic styled container with theming support.
 */
export function BoxPattern({
  p,
  m,
  bg = 'transparent',
  border = false,
  radius = 'none',
  shadow = 'none',
  className,
  style,
  children,
}: BoxPatternProps): React.ReactElement {
  return (
    <Box
      padding={p}
      margin={m as BoxPadding | undefined}
      bg={bg}
      border={border}
      rounded={radius}
      shadow={shadow}
      className={className}
      style={style}
    >
      {children}
    </Box>
  );
}

BoxPattern.displayName = 'BoxPattern';

// ============================================================================
// Grid Pattern
// ============================================================================

export interface GridPatternProps extends LayoutPatternProps {
  /** Number of columns */
  cols?: GridCols | ResponsiveGridCols;
  /** Gap between cells */
  gap?: GridGap;
  /** Row gap override */
  rowGap?: GridGap;
  /** Column gap override */
  colGap?: GridGap;
}

/**
 * Grid pattern component.
 *
 * CSS Grid layout for multi-column content.
 */
export function GridPattern({
  cols = 1,
  gap = 'md',
  rowGap,
  colGap,
  className,
  style,
  children,
}: GridPatternProps): React.ReactElement {
  return (
    <Grid cols={cols} gap={gap} rowGap={rowGap} colGap={colGap} className={className} style={style}>
      {children}
    </Grid>
  );
}

GridPattern.displayName = 'GridPattern';

// ============================================================================
// Center Pattern
// ============================================================================

export interface CenterPatternProps extends LayoutPatternProps {
  /** Minimum height */
  minHeight?: string;
}

/**
 * Center pattern component.
 *
 * Centers content horizontally and vertically.
 */
export function CenterPattern({
  minHeight,
  className,
  style,
  children,
}: CenterPatternProps): React.ReactElement {
  const mergedStyle = minHeight ? { minHeight, ...style } : style;
  return (
    <Center className={className} style={mergedStyle}>
      {children}
    </Center>
  );
}

CenterPattern.displayName = 'CenterPattern';

// ============================================================================
// Spacer Pattern
// ============================================================================

export interface SpacerPatternProps {
  /** Size or 'flex' for flexible */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'flex';
  /** Additional CSS classes */
  className?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name */
  entity?: string;
}

/**
 * Spacer pattern component.
 *
 * Flexible space that expands or has fixed size.
 */
export function SpacerPattern({ size = 'flex' }: SpacerPatternProps): React.ReactElement {
  if (size === 'flex') {
    return <Spacer />;
  }

  const sizeMap: Record<string, string> = {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  };

  return <Box style={{ width: sizeMap[size], height: sizeMap[size], flexShrink: 0 }} />;
}

SpacerPattern.displayName = 'SpacerPattern';

// ============================================================================
// Divider Pattern
// ============================================================================

export interface DividerPatternProps {
  /** Orientation */
  orientation?: DividerOrientation;
  /** Line style */
  variant?: DividerVariant;
  /** Color token */
  color?: string;
  /** Spacing around divider */
  spacing?: 'xs' | 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name */
  entity?: string;
}

/**
 * Divider pattern component.
 *
 * Visual separator between sections.
 */
export function DividerPattern({
  orientation = 'horizontal',
  variant = 'solid',
  spacing = 'md',
}: DividerPatternProps): React.ReactElement {
  const spacingMap: Record<string, string> = {
    xs: 'my-1',
    sm: 'my-2',
    md: 'my-4',
    lg: 'my-6',
  };

  const verticalSpacingMap: Record<string, string> = {
    xs: 'mx-1',
    sm: 'mx-2',
    md: 'mx-4',
    lg: 'mx-6',
  };

  return (
    <Divider
      orientation={orientation}
      variant={variant}
      className={orientation === 'horizontal' ? spacingMap[spacing] : verticalSpacingMap[spacing]}
    />
  );
}

DividerPattern.displayName = 'DividerPattern';

// ============================================================================
// Exports
// ============================================================================

// eslint-disable-next-line almadar/require-display-name -- registry object, not a component
export const LAYOUT_PATTERNS = {
  'vstack': VStackPattern,
  'hstack': HStackPattern,
  'box': BoxPattern,
  'grid': GridPattern,
  'center': CenterPattern,
  'spacer': SpacerPattern,
  'divider': DividerPattern,
} as const;
