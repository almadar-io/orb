import React from "react";
import { cn } from "../../lib/cn";
import { Check } from "lucide-react";

export interface CheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const inputId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="flex items-center">
        <div className="relative flex items-center">
          <input
            ref={ref}
            type="checkbox"
            id={inputId}
            className={cn(
              "peer h-4 w-4 border-[length:var(--border-width)] border-[var(--color-border)]",
              "accent-[var(--color-primary)] focus:ring-[var(--color-ring)] focus:ring-offset-0",
              "bg-[var(--color-card)] checked:bg-[var(--color-primary)]",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              className,
            )}
            {...props}
          />
        </div>
        {label && (
          <label
            htmlFor={inputId}
            className="ml-2 text-sm text-[var(--color-foreground)] font-medium cursor-pointer select-none"
          >
            {label}
          </label>
        )}
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";
