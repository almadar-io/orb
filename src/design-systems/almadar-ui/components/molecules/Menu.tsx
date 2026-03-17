'use client';
/**
 * Menu Molecule Component
 *
 * A dropdown menu component with items, icons, dividers, and sub-menus.
 * Uses theme-aware CSS variables for styling.
 */

import React, { useState, useRef, useEffect } from "react";
import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { Icon } from "../atoms/Icon";
import { Divider } from "../atoms/Divider";
import { Typography } from "../atoms/Typography";
import { Badge } from "../atoms/Badge";
import { cn } from "../../lib/cn";
import { useEventBus } from "../../hooks/useEventBus";

export interface MenuItem {
  /** Item ID (auto-generated from label if not provided) */
  id?: string;
  /** Item label */
  label: string;
  /** Item icon (LucideIcon or string name) */
  icon?: LucideIcon | string;
  /** Item badge */
  badge?: string | number;
  /** Disable item */
  disabled?: boolean;
  /** Item click handler */
  onClick?: () => void;
  /** Event name for pattern compatibility */
  event?: string;
  /** Variant for styling (pattern compatibility) */
  variant?: "default" | "danger";
  /** Sub-menu items */
  subMenu?: MenuItem[];
}

export type MenuPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "top-start"
  | "top-end"
  | "bottom-start"
  | "bottom-end"; // Aliases for pattern compatibility

export interface MenuProps {
  /** Menu trigger element */
  trigger: React.ReactNode;
  /** Menu items */
  items: MenuItem[];
  /** Menu position */
  position?: MenuPosition;
  /** Additional CSS classes */
  className?: string;
}

export const Menu: React.FC<MenuProps> = ({
  trigger,
  items,
  position = "bottom-left",
  className,
}) => {
  const eventBus = useEventBus();
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (triggerRef.current) {
      setTriggerRect(triggerRef.current.getBoundingClientRect());
    }
  };

  const handleToggle = () => {
    if (!isOpen) {
      updatePosition();
    }
    setIsOpen(!isOpen);
    setActiveSubMenu(null);
  };

  const handleItemClick = (item: MenuItem) => {
    if (item.disabled) return;

    if (item.subMenu && item.subMenu.length > 0) {
      setActiveSubMenu(item.id ?? null);
    } else {
      if (item.event) eventBus.emit(`UI:${item.event}`, { itemId: item.id, label: item.label });
      item.onClick?.();
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setActiveSubMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const positionClasses: Record<string, string> = {
    "top-left": "bottom-full left-0 mb-2",
    "top-right": "bottom-full right-0 mb-2",
    "bottom-left": "top-full left-0 mt-2",
    "bottom-right": "top-full right-0 mt-2",
    // Aliases for pattern compatibility
    "top-start": "bottom-full left-0 mb-2",
    "top-end": "bottom-full right-0 mb-2",
    "bottom-start": "top-full left-0 mt-2",
    "bottom-end": "top-full right-0 mt-2",
  };

  // Wrap non-element trigger in a span
  const triggerChild = React.isValidElement(trigger) ? (
    trigger
  ) : (
    <span>{trigger}</span>
  );

  const triggerElement = React.cloneElement(
    triggerChild as React.ReactElement<any>,
    {
      ref: triggerRef,
      onClick: handleToggle,
    },
  );

  // Theme-aware menu container styles
  const menuContainerStyles = cn(
    "bg-[var(--color-card)]",
    "border-[length:var(--border-width)] border-[var(--color-border)]",
    "shadow-[var(--shadow-main)]",
    "rounded-[var(--radius-sm)]",
    "min-w-[200px] py-1",
  );

  const renderMenuItem = (
    item: MenuItem,
    hasSubMenu: boolean,
    index: number,
  ) => {
    // Auto-generate id from label if not provided
    const itemId =
      item.id ??
      `item-${item.label.toLowerCase().replace(/\s+/g, "-")}-${index}`;
    const isDanger = item.variant === "danger";

    return (
      <button
        key={itemId}
        type="button"
        onClick={() => handleItemClick({ ...item, id: itemId })}
        disabled={item.disabled}
        onMouseEnter={() => hasSubMenu && setActiveSubMenu(itemId)}
        className={cn(
          "w-full flex items-center justify-between gap-3 px-4 py-2 text-left",
          "text-sm transition-colors",
          "hover:bg-[var(--color-muted)]",
          "focus:outline-none focus:bg-[var(--color-muted)]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          item.disabled && "cursor-not-allowed",
          isDanger &&
            "text-[var(--color-error)] hover:bg-[var(--color-error)]/10",
        )}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {item.icon &&
            (typeof item.icon === "string" ? (
              <Icon name={item.icon} size="sm" className="flex-shrink-0" />
            ) : (
              <Icon icon={item.icon} size="sm" className="flex-shrink-0" />
            ))}
          <Typography
            variant="small"
            className={cn("flex-1", isDanger && "text-red-600")}
          >
            {item.label}
          </Typography>
          {item.badge !== undefined && (
            <Badge variant="default" size="sm">
              {item.badge}
            </Badge>
          )}
          {hasSubMenu && (
            <Icon icon={ChevronRight} size="sm" className="flex-shrink-0" />
          )}
        </div>
      </button>
    );
  };

  const renderMenuItems = (menuItems: MenuItem[]) => {
    return menuItems.map((item, index) => {
      const hasSubMenu = item.subMenu && item.subMenu.length > 0;
      const isDivider = item.id === "divider" || item.label === "divider";
      const itemId =
        item.id ??
        `item-${item.label.toLowerCase().replace(/\s+/g, "-")}-${index}`;

      if (isDivider) {
        return <Divider key={`divider-${index}`} className="my-1" />;
      }

      return (
        <div key={itemId}>
          {renderMenuItem(item, !!hasSubMenu, index)}
          {hasSubMenu && activeSubMenu === itemId && item.subMenu && (
            <div
              className={cn(
                "absolute left-full top-0 ml-2 z-50",
                menuContainerStyles,
              )}
            >
              {renderMenuItems(item.subMenu)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="relative">
      {triggerElement}
      {isOpen && triggerRect && (
        <div
          ref={menuRef}
          className={cn(
            "absolute z-50",
            menuContainerStyles,
            positionClasses[position],
            className,
          )}
          style={{
            left: position.includes("left") ? 0 : "auto",
            right: position.includes("right") ? 0 : "auto",
          }}
          role="menu"
        >
          {renderMenuItems(items)}
        </div>
      )}
    </div>
  );
};

Menu.displayName = "Menu";
