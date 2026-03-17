/**
 * Typography Atom Component
 *
 * Text elements following the KFlow design system with theme-aware styling.
 */

import React from "react";
import { cn } from "../../lib/cn";

export type TypographyVariant =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "body1"
  | "body2"
  | "body"
  | "caption"
  | "overline"
  | "small"
  | "large"
  | "label";

export type TypographySize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

export interface TypographyProps {
  /** Typography variant */
  variant?: TypographyVariant;
  /** Heading level (1-6) - alternative to variant for headings */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Text color */
  color?:
  | "primary"
  | "secondary"
  | "muted"
  | "error"
  | "success"
  | "warning"
  | "inherit";
  /** Text alignment */
  align?: "left" | "center" | "right";
  /** Font weight override */
  weight?: "light" | "normal" | "medium" | "semibold" | "bold";
  /** Font size override */
  size?: TypographySize;
  /** Truncate with ellipsis (single line) */
  truncate?: boolean;
  /** Overflow handling mode */
  overflow?: "visible" | "hidden" | "wrap" | "clamp-2" | "clamp-3";
  /** Custom HTML element */
  as?: keyof React.JSX.IntrinsicElements;
  /** HTML id attribute */
  id?: string;
  /** Additional class names */
  className?: string;
  /** Inline style */
  style?: React.CSSProperties;
  /** Text content (alternative to children) */
  content?: React.ReactNode;
  /** Children elements */
  children?: React.ReactNode;
}

// Using CSS variables for theme-aware styling
const variantStyles: Record<TypographyVariant, string> = {
  h1: "text-4xl font-bold tracking-tight text-[var(--color-foreground)]",
  h2: "text-3xl font-bold tracking-tight text-[var(--color-foreground)]",
  h3: "text-2xl font-bold text-[var(--color-foreground)]",
  h4: "text-xl font-bold text-[var(--color-foreground)]",
  h5: "text-lg font-bold text-[var(--color-foreground)]",
  h6: "text-base font-bold text-[var(--color-foreground)]",
  body1: "text-base font-normal text-[var(--color-foreground)]",
  body2: "text-sm font-normal text-[var(--color-foreground)]",
  body: "text-base font-normal text-[var(--color-foreground)]",
  caption: "text-xs font-normal text-[var(--color-muted-foreground)]",
  overline:
    "text-xs uppercase tracking-wide font-bold text-[var(--color-muted-foreground)]",
  small: "text-sm font-normal text-[var(--color-foreground)]",
  large: "text-lg font-medium text-[var(--color-foreground)]",
  label: "text-sm font-medium text-[var(--color-foreground)]",
};

const colorStyles = {
  primary: "text-[var(--color-foreground)]",
  secondary: "text-[var(--color-muted-foreground)]",
  muted: "text-[var(--color-muted-foreground)]",
  error: "text-[var(--color-error)]",
  success: "text-[var(--color-success)]",
  warning: "text-[var(--color-warning)]",
  inherit: "text-inherit",
};

const weightStyles = {
  light: "font-light",
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

const defaultElements: Record<TypographyVariant, keyof React.JSX.IntrinsicElements> =
{
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  body1: "p",
  body2: "p",
  body: "p",
  caption: "span",
  overline: "span",
  small: "span",
  large: "p",
  label: "span",
};

const typographySizeStyles: Record<TypographySize, string> = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
};

const overflowStyles: Record<string, string> = {
  visible: "overflow-visible",
  hidden: "overflow-hidden",
  wrap: "break-words overflow-hidden",
  "clamp-2": "overflow-hidden line-clamp-2",
  "clamp-3": "overflow-hidden line-clamp-3",
};

export const Typography: React.FC<TypographyProps> = ({
  variant: variantProp,
  level,
  color = "primary",
  align,
  weight,
  size,
  truncate = false,
  overflow,
  as,
  id,
  className,
  style,
  content,
  children,
}) => {
  // Determine variant: explicit variant takes precedence, then level, then default
  const variant: TypographyVariant =
    variantProp ?? (level ? (`h${level}` as TypographyVariant) : "body1");
  const Component = (as || defaultElements[variant]) as React.ElementType;

  return (
    <Component
      id={id}
      className={cn(
        variantStyles[variant],
        colorStyles[color],
        weight && weightStyles[weight],
        size && typographySizeStyles[size],
        align && `text-${align}`,
        truncate && "truncate overflow-hidden text-ellipsis",
        overflow && overflowStyles[overflow],
        className,
      )}
      style={style}
    >
      {children ?? content}
    </Component>
  );
};

Typography.displayName = "Typography";

/**
 * Heading component - convenience wrapper for Typography heading variants
 */
export interface HeadingProps extends Omit<TypographyProps, "variant"> {
  /** Heading level (1-6) */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Override font size */
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
}

const sizeStyles: Record<string, string> = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
};

export const Heading: React.FC<HeadingProps> = ({
  level = 2,
  size,
  className,
  ...props
}) => {
  const variant = `h${level}` as TypographyVariant;
  const sizeClass = size ? sizeStyles[size] : undefined;
  return (
    <Typography
      variant={variant}
      className={cn(sizeClass, className)}
      {...props}
    />
  );
};

Heading.displayName = "Heading";

/**
 * Text component - convenience wrapper for Typography body/caption variants
 */
export interface TextProps extends Omit<TypographyProps, "level"> {
  /** Text variant */
  variant?: "body" | "body1" | "body2" | "caption" | "small" | "large" | "label" | "overline";
}

export const Text: React.FC<TextProps> = ({
  variant = "body",
  ...props
}) => {
  return (
    <Typography
      variant={variant}
      {...props}
    />
  );
};

Text.displayName = "Text";
