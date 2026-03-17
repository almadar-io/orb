'use client';
/**
 * Stack Component
 *
 * A layout primitive for arranging children in a vertical or horizontal stack with consistent spacing.
 * Includes convenience exports VStack and HStack for common use cases.
 */
import React from "react";
import { cn } from "../../lib/cn";
import { useEventBus } from "../../hooks/useEventBus";

export type StackDirection = "horizontal" | "vertical";
export type StackGap = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
export type StackAlign = "start" | "center" | "end" | "stretch" | "baseline";
export type StackJustify =
  | "start"
  | "center"
  | "end"
  | "between"
  | "around"
  | "evenly";

export interface StackProps {
  /** Stack direction */
  direction?: StackDirection;
  /** Gap between children */
  gap?: StackGap;
  /** Align items on the cross axis */
  align?: StackAlign;
  /** Justify items on the main axis */
  justify?: StackJustify;
  /** Allow items to wrap */
  wrap?: boolean;
  /** Reverse the order of children */
  reverse?: boolean;
  /** Fill available space (flex: 1) */
  flex?: boolean;
  /** Custom class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Children elements */
  children?: React.ReactNode;
  /** HTML element to render as */
  as?: React.ElementType;
  /** Click handler */
  onClick?: (e: React.MouseEvent) => void;
  /** Keyboard handler */
  onKeyDown?: (e: React.KeyboardEvent) => void;
  /** Role for accessibility */
  role?: string;
  /** Tab index for focus management */
  tabIndex?: number;
  /** Declarative event name — emits UI:{action} via eventBus on click */
  action?: string;
  /** Payload to include with the action event */
  actionPayload?: Record<string, unknown>;
}

const gapStyles: Record<StackGap, string> = {
  none: "gap-0",
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
  "2xl": "gap-12",
};

const alignStyles: Record<StackAlign, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
  baseline: "items-baseline",
};

const justifyStyles: Record<StackJustify, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
  evenly: "justify-evenly",
};

/**
 * Stack - Flexible layout component for arranging children
 */
export const Stack: React.FC<StackProps> = ({
  direction = "vertical",
  gap = "md",
  align = "stretch",
  justify = "start",
  wrap = false,
  reverse = false,
  flex = false,
  className,
  style,
  children,
  as: Component = "div",
  onClick,
  onKeyDown,
  role,
  tabIndex,
  action,
  actionPayload,
}) => {
  const eventBus = useEventBus();

  const handleClick = (e: React.MouseEvent) => {
    if (action) {
      eventBus.emit(`UI:${action}`, actionPayload ?? {});
    }
    onClick?.(e);
  };

  const directionClass =
    direction === "horizontal"
      ? reverse
        ? "flex-row-reverse"
        : "flex-row"
      : reverse
        ? "flex-col-reverse"
        : "flex-col";

  return (
    <Component
      className={cn(
        "flex",
        directionClass,
        gapStyles[gap],
        alignStyles[align],
        justifyStyles[justify],
        wrap && "flex-wrap",
        flex && "flex-1",
        className,
      )}
      style={style}
      onClick={(action || onClick) ? handleClick : undefined}
      onKeyDown={onKeyDown}
      role={role}
      tabIndex={tabIndex}
    >
      {children}
    </Component>
  );
};

/**
 * VStack - Vertical stack shorthand
 */
export interface VStackProps extends Omit<StackProps, "direction"> {}

export const VStack: React.FC<VStackProps> = (props) => (
  <Stack direction="vertical" {...props} />
);

/**
 * HStack - Horizontal stack shorthand
 */
export interface HStackProps extends Omit<StackProps, "direction"> {}

export const HStack: React.FC<HStackProps> = (props) => (
  <Stack direction="horizontal" {...props} />
);

export default Stack;
