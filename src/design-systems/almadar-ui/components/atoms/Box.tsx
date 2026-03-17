'use client';
/**
 * Box Component
 *
 * A versatile layout primitive that provides spacing, background, border, and shadow controls.
 * Think of it as a styled div with consistent design tokens.
 */
import React, { useCallback } from "react";
import { cn } from "../../lib/cn";
import { useEventBus } from "../../hooks/useEventBus";

export type BoxPadding = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
export type BoxMargin =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "auto";
export type BoxBg =
  | "transparent"
  | "primary"
  | "secondary"
  | "muted"
  | "accent"
  | "surface"
  | "overlay";
export type BoxRounded = "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";
export type BoxShadow = "none" | "sm" | "md" | "lg" | "xl";

export interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Padding on all sides */
  padding?: BoxPadding;
  /** Horizontal padding (overrides padding for x-axis) */
  paddingX?: BoxPadding;
  /** Vertical padding (overrides padding for y-axis) */
  paddingY?: BoxPadding;
  /** Margin on all sides */
  margin?: BoxMargin;
  /** Horizontal margin */
  marginX?: BoxMargin;
  /** Vertical margin */
  marginY?: BoxMargin;
  /** Background color */
  bg?: BoxBg;
  /** Show border */
  border?: boolean;
  /** Border radius */
  rounded?: BoxRounded;
  /** Box shadow */
  shadow?: BoxShadow;
  /** Display type */
  display?:
    | "block"
    | "inline"
    | "inline-block"
    | "flex"
    | "inline-flex"
    | "grid";
  /** Fill available width */
  fullWidth?: boolean;
  /** Fill available height */
  fullHeight?: boolean;
  /** Overflow behavior */
  overflow?: "auto" | "hidden" | "visible" | "scroll";
  /** Position */
  position?: "relative" | "absolute" | "fixed" | "sticky";
  /** HTML element to render as */
  as?: React.ElementType;
  /** Declarative event name — emits UI:{action} via eventBus on click */
  action?: string;
  /** Payload to include with the action event */
  actionPayload?: Record<string, unknown>;
  /** Declarative hover event — emits UI:{hoverEvent} with { hovered: true/false } on mouseEnter/mouseLeave */
  hoverEvent?: string;
}

const paddingStyles: Record<BoxPadding, string> = {
  none: "p-0",
  xs: "p-1",
  sm: "p-2",
  md: "p-4",
  lg: "p-6",
  xl: "p-8",
  "2xl": "p-12",
};

const paddingXStyles: Record<BoxPadding, string> = {
  none: "px-0",
  xs: "px-1",
  sm: "px-2",
  md: "px-4",
  lg: "px-6",
  xl: "px-8",
  "2xl": "px-12",
};

const paddingYStyles: Record<BoxPadding, string> = {
  none: "py-0",
  xs: "py-1",
  sm: "py-2",
  md: "py-4",
  lg: "py-6",
  xl: "py-8",
  "2xl": "py-12",
};

const marginStyles: Record<BoxMargin, string> = {
  none: "m-0",
  xs: "m-1",
  sm: "m-2",
  md: "m-4",
  lg: "m-6",
  xl: "m-8",
  "2xl": "m-12",
  auto: "m-auto",
};

const marginXStyles: Record<BoxMargin, string> = {
  none: "mx-0",
  xs: "mx-1",
  sm: "mx-2",
  md: "mx-4",
  lg: "mx-6",
  xl: "mx-8",
  "2xl": "mx-12",
  auto: "mx-auto",
};

const marginYStyles: Record<BoxMargin, string> = {
  none: "my-0",
  xs: "my-1",
  sm: "my-2",
  md: "my-4",
  lg: "my-6",
  xl: "my-8",
  "2xl": "my-12",
  auto: "my-auto",
};

// Using CSS variables for theme-aware styling
const bgStyles: Record<BoxBg, string> = {
  transparent: "bg-transparent",
  primary: "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]",
  secondary:
    "bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)]",
  muted: "bg-[var(--color-muted)] text-[var(--color-foreground)]",
  accent: "bg-[var(--color-accent)] text-[var(--color-accent-foreground)]",
  surface: "bg-[var(--color-card)]",
  overlay: "bg-[var(--color-card)]/80 backdrop-blur-sm",
};

const roundedStyles: Record<BoxRounded, string> = {
  none: "rounded-none",
  sm: "rounded-[var(--radius-sm)]",
  md: "rounded-[var(--radius-md)]",
  lg: "rounded-[var(--radius-lg)]",
  xl: "rounded-[var(--radius-xl)]",
  "2xl": "rounded-[var(--radius-xl)]",
  full: "rounded-[var(--radius-full)]",
};

const shadowStyles: Record<BoxShadow, string> = {
  none: "shadow-none",
  sm: "shadow-[var(--shadow-sm)]",
  md: "shadow-[var(--shadow-main)]",
  lg: "shadow-[var(--shadow-lg)]",
  xl: "shadow-[var(--shadow-lg)]",
};

const displayStyles = {
  block: "block",
  inline: "inline",
  "inline-block": "inline-block",
  flex: "flex",
  "inline-flex": "inline-flex",
  grid: "grid",
};

const overflowStyles = {
  auto: "overflow-auto",
  hidden: "overflow-hidden",
  visible: "overflow-visible",
  scroll: "overflow-scroll",
};

const positionStyles = {
  relative: "relative",
  absolute: "absolute",
  fixed: "fixed",
  sticky: "sticky",
};

/**
 * Box - Versatile container component with design tokens
 */
export const Box = React.forwardRef<HTMLDivElement, BoxProps>(
  (
    {
      padding,
      paddingX,
      paddingY,
      margin,
      marginX,
      marginY,
      bg = "transparent",
      border = false,
      rounded = "none",
      shadow = "none",
      display,
      fullWidth = false,
      fullHeight = false,
      overflow,
      position,
      className,
      children,
      as: Component = "div",
      action,
      actionPayload,
      hoverEvent,
      onClick,
      onMouseEnter,
      onMouseLeave,
      ...rest
    },
    ref,
  ) => {
    const eventBus = useEventBus();

    const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
      if (action) {
        eventBus.emit(`UI:${action}`, actionPayload ?? {});
      }
      onClick?.(e);
    }, [action, actionPayload, eventBus, onClick]);

    const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
      if (hoverEvent) {
        eventBus.emit(`UI:${hoverEvent}`, { hovered: true });
      }
      onMouseEnter?.(e);
    }, [hoverEvent, eventBus, onMouseEnter]);

    const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
      if (hoverEvent) {
        eventBus.emit(`UI:${hoverEvent}`, { hovered: false });
      }
      onMouseLeave?.(e);
    }, [hoverEvent, eventBus, onMouseLeave]);

    const isClickable = action || onClick;

    return (
      <Component
        ref={ref}
        className={cn(
          // Padding
          padding && paddingStyles[padding],
          paddingX && paddingXStyles[paddingX],
          paddingY && paddingYStyles[paddingY],
          // Margin
          margin && marginStyles[margin],
          marginX && marginXStyles[marginX],
          marginY && marginYStyles[marginY],
          // Background
          bgStyles[bg],
          // Border - uses theme variables
          border &&
            "border-[length:var(--border-width)] border-[var(--color-border)]",
          // Rounded
          roundedStyles[rounded],
          // Shadow
          shadowStyles[shadow],
          // Display
          display && displayStyles[display],
          // Dimensions
          fullWidth && "w-full",
          fullHeight && "h-full",
          // Overflow
          overflow && overflowStyles[overflow],
          // Position
          position && positionStyles[position],
          // Cursor for clickable
          isClickable && "cursor-pointer",
          className,
        )}
        onClick={isClickable ? handleClick : undefined}
        onMouseEnter={(hoverEvent || onMouseEnter) ? handleMouseEnter : undefined}
        onMouseLeave={(hoverEvent || onMouseLeave) ? handleMouseLeave : undefined}
        {...rest}
      >
        {children}
      </Component>
    );
  },
);

Box.displayName = "Box";

export default Box;
