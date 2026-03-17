'use client';
/**
 * Breadcrumb Molecule Component
 *
 * A breadcrumb navigation component with separators and icons.
 * Uses Button, Icon, and Typography atoms.
 */

import React from "react";
import { ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Icon } from "../atoms/Icon";
import { Typography } from "../atoms/Typography";
import { cn } from "../../lib/cn";
import { useEventBus } from "../../hooks/useEventBus";

export interface BreadcrumbItem {
  /**
   * Item label
   */
  label: string;

  /**
   * Item href (if provided, renders as link)
   */
  href?: string;

  /**
   * Item path (alias for href, for schema compatibility)
   */
  path?: string;

  /**
   * Item icon
   */
  icon?: LucideIcon;

  /**
   * Click handler (if href not provided)
   */
  onClick?: () => void;

  /**
   * Is current page
   */
  isCurrent?: boolean;

  /** Event name to emit when clicked (for trait state machine integration) */
  event?: string;
}

export interface BreadcrumbProps {
  /**
   * Breadcrumb items
   */
  items: BreadcrumbItem[];

  /**
   * Separator icon
   */
  separator?: LucideIcon;

  /**
   * Maximum items to show (truncates with ellipsis)
   */
  maxItems?: number;

  /**
   * Additional CSS classes
   */
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator = ChevronRight,
  maxItems,
  className,
}) => {
  const eventBus = useEventBus();
  const displayItems =
    maxItems && items.length > maxItems
      ? [
          ...items.slice(0, 1),
          { label: "...", isCurrent: false } as BreadcrumbItem,
          ...items.slice(-maxItems + 1),
        ]
      : items;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-2", className)}
    >
      <ol className="flex items-center gap-2">
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          const isEllipsis = item.label === "...";

          return (
            <li key={index} className="flex items-center gap-2">
              {isEllipsis ? (
                <Typography variant="small" color="muted">
                  {item.label}
                </Typography>
              ) : item.href || item.path ? (
                <a
                  href={item.href || item.path}
                  className={cn(
                    "flex items-center gap-1.5 transition-colors",
                    isLast
                      ? "text-[var(--color-foreground)] font-bold"
                      : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]",
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.icon && <Icon icon={item.icon} size="sm" />}
                  <Typography
                    variant="small"
                    weight={isLast ? "medium" : "normal"}
                  >
                    {item.label}
                  </Typography>
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (item.event) eventBus.emit(`UI:${item.event}`, { label: item.label });
                    item.onClick?.();
                  }}
                  className={cn(
                    "flex items-center gap-1.5 transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:ring-offset-2",
                    isLast
                      ? "text-[var(--color-foreground)] font-bold cursor-default"
                      : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]",
                  )}
                  aria-current={isLast ? "page" : undefined}
                  disabled={isLast}
                >
                  {item.icon && <Icon icon={item.icon} size="sm" />}
                  <Typography
                    variant="small"
                    weight={isLast ? "medium" : "normal"}
                  >
                    {item.label}
                  </Typography>
                </button>
              )}

              {!isLast && (
                <Icon
                  icon={separator}
                  size="sm"
                  className="text-[var(--color-muted-foreground)]"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

Breadcrumb.displayName = "Breadcrumb";
