import React from "react";
import { cn } from "../../lib/cn";

export type CardShadow = "none" | "sm" | "md" | "lg";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "bordered" | "elevated" | "interactive";
  padding?: "none" | "sm" | "md" | "lg";
  /** Card title - renders in header if provided */
  title?: string;
  /** Card subtitle - renders below title */
  subtitle?: string;
  /** Shadow size override */
  shadow?: CardShadow;
}

// Using CSS variables for theme-aware styling
const variantStyles = {
  default: "bg-[var(--color-card)] border-none",
  bordered: [
    "bg-[var(--color-card)]",
    "border-[length:var(--border-width)] border-[var(--color-border)]",
    "shadow-none",
  ].join(" "),
  elevated: [
    "bg-[var(--color-card)]",
    "border-[length:var(--border-width)] border-[var(--color-border)]",
    "shadow-[var(--shadow-main)]",
  ].join(" "),
  // Interactive variant with theme-specific hover effects
  interactive: [
    "bg-[var(--color-card)]",
    "border-[length:var(--border-width)] border-[var(--color-border)]",
    "shadow-[var(--shadow-main)]",
    "cursor-pointer",
    "transition-all duration-[var(--transition-normal)]",
    "hover:shadow-[var(--shadow-hover)]",
  ].join(" "),
};

const paddingStyles = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

const shadowStyles: Record<CardShadow, string> = {
  none: "shadow-none",
  sm: "shadow-[var(--shadow-sm)]",
  md: "shadow-[var(--shadow-main)]",
  lg: "shadow-[var(--shadow-lg)]",
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = "bordered",
      padding = "md",
      title,
      subtitle,
      shadow,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-[var(--radius-md)]",
          "transition-all duration-[var(--transition-normal)]",
          variantStyles[variant],
          paddingStyles[padding],
          shadow && shadowStyles[shadow],
          className,
        )}
        {...props}
      >
        {(title || subtitle) && (
          <div className="mb-4">
            {title && (
              <h3 className="text-lg text-[var(--color-card-foreground)] font-[var(--font-weight-bold)]">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    );
  },
);

Card.displayName = "Card";

// Card subcomponents
export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("mb-4", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg text-[var(--color-card-foreground)]",
      "font-[var(--font-weight-bold)]",
      className,
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));
CardContent.displayName = "CardContent";

// Alias for CardBody (used by shared component-types)
export const CardBody = CardContent;
CardBody.displayName = "CardBody";

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mt-4 flex items-center", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";
