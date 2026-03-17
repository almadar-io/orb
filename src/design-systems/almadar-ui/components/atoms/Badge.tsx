import React from "react";
import { cn } from "../../lib/cn";

export type BadgeVariant =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "error"
  | "info"
  | "neutral";
export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
}

// Using CSS variables for theme-aware styling
const variantStyles: Record<BadgeVariant, string> = {
  default: [
    "bg-[var(--color-muted)] text-[var(--color-foreground)]",
    "border-[length:var(--border-width-thin)] border-[var(--color-border)]",
  ].join(" "),
  primary: "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]",
  secondary:
    "bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)]",
  success: [
    "bg-[var(--color-surface)] text-[var(--color-success)]",
    "border-[length:var(--border-width)] border-[var(--color-success)]",
  ].join(" "),
  warning: [
    "bg-[var(--color-surface)] text-[var(--color-warning)]",
    "border-[length:var(--border-width)] border-[var(--color-warning)]",
  ].join(" "),
  danger: [
    "bg-[var(--color-surface)] text-[var(--color-error)]",
    "border-[length:var(--border-width)] border-[var(--color-error)]",
  ].join(" "),
  error: [
    "bg-[var(--color-surface)] text-[var(--color-error)]",
    "border-[length:var(--border-width)] border-[var(--color-error)]",
  ].join(" "),
  info: [
    "bg-[var(--color-surface)] text-[var(--color-info)]",
    "border-[length:var(--border-width)] border-[var(--color-info)]",
  ].join(" "),
  neutral: [
    "bg-[var(--color-muted)] text-[var(--color-muted-foreground)]",
    "border-[length:var(--border-width-thin)] border-[var(--color-border)]",
  ].join(" "),
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
  lg: "px-3 py-1.5 text-base",
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", size = "sm", ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center font-bold rounded-[var(--radius-sm)]",
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      />
    );
  },
);

Badge.displayName = "Badge";
