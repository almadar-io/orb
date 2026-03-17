/**
 * Center Component
 * 
 * A layout utility that centers its children horizontally and/or vertically.
 */
import React from 'react';
import { cn } from '../../lib/cn';

export interface CenterProps {
  /** Center inline (width fits content) vs block (full width) */
  inline?: boolean;
  /** Center only horizontally */
  horizontal?: boolean;
  /** Center only vertically */
  vertical?: boolean;
  /** Minimum height (useful for vertical centering) */
  minHeight?: string | number;
  /** Fill available height */
  fullHeight?: boolean;
  /** Fill available width */
  fullWidth?: boolean;
  /** Custom class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Children elements */
  children: React.ReactNode;
  /** HTML element to render as */
  as?: React.ElementType;
}

/**
 * Center - Centers content horizontally and/or vertically
 */
export const Center: React.FC<CenterProps> = ({
  inline = false,
  horizontal = true,
  vertical = true,
  minHeight,
  fullHeight = false,
  fullWidth = false,
  className,
  style,
  children,
  as: Component = 'div',
}) => {
  const mergedStyle = minHeight ? { minHeight, ...style } : style;

  return (
    <Component
      className={cn(
        inline ? 'inline-flex' : 'flex',
        horizontal && 'justify-center',
        vertical && 'items-center',
        fullHeight && 'h-full',
        fullWidth && 'w-full',
        className
      )}
      style={mergedStyle}
    >
      {children}
    </Component>
  );
};

export default Center;

