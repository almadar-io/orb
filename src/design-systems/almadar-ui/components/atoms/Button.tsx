'use client';
import React from "react";
import { cn } from "../../lib/cn";
import { Loader2, type LucideIcon } from "lucide-react";
import { useEventBus } from "../../hooks/useEventBus";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "success"
  | "warning"
  | "default";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  /** Left icon as ReactNode (preferred) */
  leftIcon?: React.ReactNode;
  /** Right icon as ReactNode (preferred) */
  rightIcon?: React.ReactNode;
  /** Left icon as Lucide icon component (convenience prop, renders with default size) */
  icon?: LucideIcon;
  /** Right icon as Lucide icon component (convenience prop) */
  iconRight?: LucideIcon;
  /** Declarative event name — emits UI:{action} via eventBus on click */
  action?: string;
  /** Payload to include with the action event */
  actionPayload?: Record<string, unknown>;
  /** Button label text (alternative to children for schema-driven rendering) */
  label?: string;
}

// Using CSS variables for theme-aware styling with hover/active effects
const variantStyles = {
  primary: [
    "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]",
    "border-[length:var(--border-width)] border-[var(--color-border)]",
    "shadow-[var(--shadow-sm)]",
    "hover:bg-[var(--color-primary-hover)] hover:shadow-[var(--shadow-hover)]",
    "active:scale-[var(--active-scale)] active:shadow-[var(--shadow-active)]",
  ].join(" "),
  secondary: [
    "bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)]",
    "border-[length:var(--border-width-thin)] border-[var(--color-border)]",
    "hover:bg-[var(--color-secondary-hover)]",
    "active:scale-[var(--active-scale)]",
  ].join(" "),
  ghost: [
    "bg-transparent text-[var(--color-muted-foreground)]",
    "hover:text-[var(--color-foreground)] hover:bg-[var(--color-muted)]",
    "active:scale-[var(--active-scale)]",
  ].join(" "),
  danger: [
    "bg-[var(--color-surface)] text-[var(--color-error)]",
    "border-[length:var(--border-width)] border-[var(--color-error)]",
    "shadow-[var(--shadow-sm)]",
    "hover:bg-[var(--color-error)] hover:text-[var(--color-error-foreground)] hover:shadow-[var(--shadow-hover)]",
    "active:scale-[var(--active-scale)] active:shadow-[var(--shadow-active)]",
  ].join(" "),
  success: [
    "bg-[var(--color-surface)] text-[var(--color-success)]",
    "border-[length:var(--border-width)] border-[var(--color-success)]",
    "shadow-[var(--shadow-sm)]",
    "hover:bg-[var(--color-success)] hover:text-[var(--color-success-foreground)] hover:shadow-[var(--shadow-hover)]",
    "active:scale-[var(--active-scale)] active:shadow-[var(--shadow-active)]",
  ].join(" "),
  warning: [
    "bg-[var(--color-surface)] text-[var(--color-warning)]",
    "border-[length:var(--border-width)] border-[var(--color-warning)]",
    "shadow-[var(--shadow-sm)]",
    "hover:bg-[var(--color-warning)] hover:text-[var(--color-warning-foreground)] hover:shadow-[var(--shadow-hover)]",
    "active:scale-[var(--active-scale)] active:shadow-[var(--shadow-active)]",
  ].join(" "),
  // "default" is an alias for secondary
  default: [
    "bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)]",
    "border-[length:var(--border-width-thin)] border-[var(--color-border)]",
    "hover:bg-[var(--color-secondary-hover)]",
    "active:scale-[var(--active-scale)]",
  ].join(" "),
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

const iconSizeStyles = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      leftIcon,
      rightIcon,
      icon: IconComponent,
      iconRight: IconRightComponent,
      action,
      actionPayload,
      label,
      children,
      onClick,
      ...props
    },
    ref,
  ) => {
    const eventBus = useEventBus();

    const resolvedLeftIcon =
      leftIcon ||
      (IconComponent && <IconComponent className={iconSizeStyles[size]} />);
    const resolvedRightIcon =
      rightIcon ||
      (IconRightComponent && (
        <IconRightComponent className={iconSizeStyles[size]} />
      ));

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (action) {
        eventBus.emit(`UI:${action}`, actionPayload ?? {});
      }
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center gap-2",
          "font-[var(--font-weight-medium)]",
          "rounded-[var(--radius-sm)]",
          "transition-all duration-[var(--transition-normal)]",
          "focus:outline-none focus:ring-[length:var(--focus-ring-width)] focus:ring-[var(--color-ring)] focus:ring-offset-[length:var(--focus-ring-offset)]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        onClick={handleClick}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          resolvedLeftIcon && (
            <span className="flex-shrink-0">{resolvedLeftIcon}</span>
          )
        )}
        {children || label}
        {resolvedRightIcon && !isLoading && (
          <span className="flex-shrink-0">{resolvedRightIcon}</span>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
