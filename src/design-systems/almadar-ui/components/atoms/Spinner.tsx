import React from "react";
import { cn } from "../../lib/cn";
import { Loader2 } from "lucide-react";

export type SpinnerSize = "xs" | "sm" | "md" | "lg";

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: SpinnerSize;
}

const sizeStyles: Record<SpinnerSize, string> = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = "md", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("text-[var(--color-foreground)]", className)}
        {...props}
      >
        <Loader2 className={cn("animate-spin", sizeStyles[size])} />
      </div>
    );
  },
);

Spinner.displayName = "Spinner";
