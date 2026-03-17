/**
 * Container Component
 * 
 * A max-width wrapper that centers content horizontally.
 * Essential for controlling page width and maintaining consistent margins.
 */
import React from 'react';
import { cn } from '../../lib/cn';

export type ContainerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
export type ContainerPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';

export interface ContainerProps {
  /** Maximum width */
  size?: ContainerSize;
  /** Alias for size (pattern compatibility) */
  maxWidth?: ContainerSize;
  /** Horizontal padding */
  padding?: ContainerPadding;
  /** Center horizontally */
  center?: boolean;
  /** Custom class name */
  className?: string;
  /** Children elements */
  children?: React.ReactNode;
  /** HTML element to render as */
  as?: React.ElementType;
}

const sizeStyles: Record<ContainerSize, string> = {
  xs: 'max-w-xs',        // 320px
  sm: 'max-w-screen-sm', // 640px
  md: 'max-w-screen-md', // 768px
  lg: 'max-w-screen-lg', // 1024px
  xl: 'max-w-screen-xl', // 1280px
  '2xl': 'max-w-screen-2xl', // 1536px
  full: 'max-w-full',
};

const paddingStyles: Record<ContainerPadding, string> = {
  none: 'px-0',
  sm: 'px-4',
  md: 'px-6',
  lg: 'px-8',
  xl: 'px-12',
};

/**
 * Container - Centers and constrains content width
 */
export const Container: React.FC<ContainerProps> = ({
  size,
  maxWidth,
  padding = 'md',
  center = true,
  className,
  children,
  as: Component = 'div',
}) => {
  // Use maxWidth if provided, otherwise fall back to size, then default to 'lg'
  const resolvedSize = maxWidth ?? size ?? 'lg';
  return (
    <Component
      className={cn(
        'w-full',
        sizeStyles[resolvedSize],
        paddingStyles[padding],
        center && 'mx-auto',
        className
      )}
    >
      {children}
    </Component>
  );
};

Container.displayName = 'Container';

export default Container;

