/**
 * Divider Atom Component
 *
 * A divider component for separating content sections.
 */

import React from "react";
import { cn } from "../../lib/cn";

export type DividerOrientation = "horizontal" | "vertical";
export type DividerVariant = "solid" | "dashed" | "dotted";

export interface DividerProps {
  /**
   * Orientation of the divider
   * @default 'horizontal'
   */
  orientation?: DividerOrientation;

  /**
   * Text label to display in the divider
   */
  label?: string;

  /**
   * Line style variant
   * @default 'solid'
   */
  variant?: DividerVariant;

  /**
   * Additional CSS classes
   */
  className?: string;
}

const variantStyles: Record<DividerVariant, string> = {
  solid: "border-solid",
  dashed: "border-dashed",
  dotted: "border-dotted",
};

export const Divider: React.FC<DividerProps> = ({
  orientation = "horizontal",
  label,
  variant = "solid",
  className,
}) => {
  if (orientation === "vertical") {
    return (
      <div
        className={cn(
          "w-0 h-full border-l border-[var(--color-border)]",
          variantStyles[variant],
          className,
        )}
        role="separator"
        aria-orientation="vertical"
      />
    );
  }

  if (label) {
    return (
      <div
        className={cn("flex items-center gap-3 my-4", className)}
        role="separator"
        aria-label={label}
      >
        <div
          className={cn(
            "flex-1 h-0 border-t border-[var(--color-border)]",
            variantStyles[variant],
          )}
        />
        <span className="text-sm text-[var(--color-foreground)] font-bold uppercase tracking-wide">
          {label}
        </span>
        <div
          className={cn(
            "flex-1 h-0 border-t border-[var(--color-border)]",
            variantStyles[variant],
          )}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-full h-0 border-t border-[var(--color-border)] my-4",
        variantStyles[variant],
        className,
      )}
      role="separator"
      aria-orientation="horizontal"
    />
  );
};

Divider.displayName = "Divider";
