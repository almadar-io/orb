/**
 * Section Component
 * 
 * A semantic section wrapper with optional title, description, and action.
 * Perfect for grouping related content with consistent spacing.
 */
import React from 'react';
import { cn } from '../../lib/cn';
import { Typography } from '../atoms/Typography';
import { Box } from '../atoms/Box';

export type SectionPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';
export type SectionVariant = 'default' | 'card' | 'bordered' | 'filled';

export interface SectionProps {
  /** Section title */
  title?: string;
  /** Section subtitle/description */
  description?: string;
  /** Action element (e.g., button, link) */
  action?: React.ReactNode;
  /** Padding amount */
  padding?: SectionPadding;
  /** Visual variant */
  variant?: SectionVariant;
  /** Show divider below header */
  divider?: boolean;
  /** Custom class name */
  className?: string;
  /** Children elements */
  children: React.ReactNode;
  /** Header custom class name */
  headerClassName?: string;
  /** Content custom class name */
  contentClassName?: string;
  /** HTML element to render as */
  as?: React.ElementType;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
}

const paddingStyles: Record<SectionPadding, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
};

// Using CSS variables for theme-aware styling
const variantStyles: Record<SectionVariant, string> = {
  default: '',
  card: [
    'bg-[var(--color-card)]',
    'border-[length:var(--border-width)] border-[var(--color-border)]',
    'shadow-[var(--shadow-main)]',
    'rounded-[var(--radius-md)]',
  ].join(' '),
  bordered: [
    'border-[length:var(--border-width)] border-[var(--color-border)]',
    'rounded-[var(--radius-md)]',
  ].join(' '),
  filled: 'bg-[var(--color-muted)] rounded-[var(--radius-md)]',
};

/**
 * Section - Semantic content grouping with header
 */
export const Section: React.FC<SectionProps> = ({
  title,
  description,
  action,
  padding = 'md',
  variant = 'default',
  divider = false,
  className,
  children,
  headerClassName,
  contentClassName,
  as: Component = 'section',
}) => {
  const hasHeader = title || description || action;

  return (
    <Component
      className={cn(
        paddingStyles[padding],
        variantStyles[variant],
        className
      )}
    >
      {hasHeader && (
        <Box
          className={cn(
            'flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4',
            divider && 'pb-4 mb-4 border-b-[length:var(--border-width)] border-[var(--color-border)]',
            !divider && 'mb-4',
            headerClassName
          )}
        >
          <Box className="flex-1 min-w-0">
            {title && (
              <Typography
                variant="h4"
                className="text-[var(--color-foreground)] font-semibold"
              >
                {title}
              </Typography>
            )}
            {description && (
              <Typography
                variant="body"
                color="muted"
                className="mt-1"
              >
                {description}
              </Typography>
            )}
          </Box>
          {action && (
            <Box className="flex-shrink-0 flex items-center gap-2">
              {action}
            </Box>
          )}
        </Box>
      )}
      <Box className={contentClassName}>
        {children}
      </Box>
    </Component>
  );
};

Section.displayName = 'Section';

export default Section;
