/**
 * InputGroup Molecule Component
 *
 * A component for grouping input with addons (icons, buttons, text).
 * Uses Input, Button, Icon, and Typography atoms.
 */

import React from "react";
import type { LucideIcon } from "lucide-react";
import { Input, InputProps } from "../atoms/Input";
import { Icon } from "../atoms/Icon";
import { Typography } from "../atoms/Typography";
import { cn } from "../../lib/cn";

export interface InputGroupProps extends Omit<
  InputProps,
  "icon" | "iconRight"
> {
  /**
   * Left addon (icon, button, or text)
   */
  leftAddon?: React.ReactNode | LucideIcon;

  /**
   * Right addon (icon, button, or text)
   */
  rightAddon?: React.ReactNode | LucideIcon;

  /**
   * Additional CSS classes
   */
  className?: string;
}

export const InputGroup: React.FC<InputGroupProps> = ({
  leftAddon,
  rightAddon,
  className: groupClassName,
  ...inputProps
}) => {
  const { className: inputClassName, ...restInputProps } =
    inputProps as InputProps & { className?: string };
  const renderAddon = (
    addon: React.ReactNode | LucideIcon,
    position: "left" | "right",
  ) => {
    if (!addon) return null;

    // Check if it's a LucideIcon
    if (typeof addon === "function" || (typeof addon === "object" && addon !== null && "render" in (addon as object))) {
      return (
        <div
          className={cn(
            "flex items-center justify-center px-3",
            "bg-[var(--color-muted)] dark:bg-[var(--color-muted)]",
            "border border-[var(--color-border)] dark:border-[var(--color-border)]",
            position === "left"
              ? "rounded-l-lg border-r-0"
              : "rounded-r-lg border-l-0",
          )}
        >
          <Icon icon={addon as LucideIcon} size="sm" />
        </div>
      );
    }

    // Text or other content (buttons removed)
    return (
      <div
        className={cn(
          "flex items-center justify-center px-3",
          "bg-[var(--color-muted)] dark:bg-[var(--color-muted)]",
          "border border-[var(--color-border)] dark:border-[var(--color-border)]",
          "text-[var(--color-foreground)] dark:text-[var(--color-foreground)]",
          position === "left"
            ? "rounded-l-lg border-r-0"
            : "rounded-r-lg border-l-0",
        )}
      >
        {typeof addon === "string" ? (
          <Typography variant="small">{addon}</Typography>
        ) : (
          addon
        )}
      </div>
    );
  };

  return (
    <div className={cn("flex items-stretch", groupClassName)}>
      {leftAddon && renderAddon(leftAddon, "left")}

      <div className="flex-1">
        <Input
          {...restInputProps}
          className={cn(
            leftAddon ? "rounded-l-none" : "",
            rightAddon ? "rounded-r-none" : "",
            inputClassName,
          )}
        />
      </div>

      {rightAddon && renderAddon(rightAddon, "right")}
    </div>
  );
};

InputGroup.displayName = "InputGroup";
