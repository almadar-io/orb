'use client';
/**
 * TabbedContainer Component
 *
 * Tabbed content areas with shared header/context.
 * Wraps the Tabs molecule with layout-specific styling.
 *
 * Uses wireframe theme styling (high contrast, sharp edges).
 */
import React, { useState, useCallback } from "react";
import { cn } from "../../../lib/cn";
import { Typography } from "../../atoms/Typography";

export interface TabDefinition {
  /** Tab identifier */
  id: string;
  /** Tab label */
  label: string;
  /** Tab content (optional if using sectionId) */
  content?: React.ReactNode;
  /** Section ID to render (alternative to content) */
  sectionId?: string;
  /** Optional badge/count */
  badge?: string | number;
  /** Disable this tab */
  disabled?: boolean;
}

export interface TabbedContainerProps {
  /** Tab definitions */
  tabs: TabDefinition[];
  /** Default active tab ID */
  defaultTab?: string;
  /** Controlled active tab */
  activeTab?: string;
  /** Callback when tab changes */
  onTabChange?: (tabId: string) => void;
  /** Tab position */
  position?: "top" | "left";
  /** Additional CSS classes */
  className?: string;
}

/**
 * TabbedContainer - Tabbed content areas
 */
export const TabbedContainer: React.FC<TabbedContainerProps> = ({
  tabs,
  defaultTab,
  activeTab: controlledActiveTab,
  onTabChange,
  position = "top",
  className,
}) => {
  const safeTabs = tabs || [];
  const [internalActiveTab, setInternalActiveTab] = useState(
    defaultTab || safeTabs[0]?.id || "",
  );

  const activeTab =
    controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;

  const handleTabChange = useCallback(
    (tabId: string) => {
      if (controlledActiveTab === undefined) {
        setInternalActiveTab(tabId);
      }
      onTabChange?.(tabId);
    },
    [controlledActiveTab, onTabChange],
  );

  const activeTabDef = safeTabs.find((tab) => tab.id === activeTab);
  const activeContent =
    activeTabDef?.content ||
    (activeTabDef?.sectionId ? (
      <div className="p-4 text-[var(--color-muted-foreground)]">
        Section: {activeTabDef.sectionId}
      </div>
    ) : null);

  const isVertical = position === "left";

  return (
    <div
      className={cn(
        "flex w-full h-full",
        isVertical ? "flex-row" : "flex-col",
        className,
      )}
    >
      {/* Tab list */}
      <div
        role="tablist"
        className={cn(
          "flex flex-shrink-0",
          isVertical
            ? "flex-col border-r-2 border-[var(--color-border)]"
            : "flex-row border-b-2 border-[var(--color-border)]",
        )}
      >
        {safeTabs.map((tab) => {
          const isActive = tab.id === activeTab;
          const isDisabled = tab.disabled;

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              aria-disabled={isDisabled}
              disabled={isDisabled}
              onClick={() => !isDisabled && handleTabChange(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:ring-offset-2",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                isActive
                  ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                  : "bg-[var(--color-card)] text-[var(--color-foreground)] hover:bg-[var(--color-muted)]",
                isVertical ? "justify-start" : "justify-center",
              )}
            >
              <Typography
                variant="small"
                weight={isActive ? "bold" : "normal"}
                color="inherit"
              >
                {tab.label}
              </Typography>
              {tab.badge !== undefined && (
                <span
                  className={cn(
                    "px-1.5 py-0.5 text-xs font-medium rounded",
                    isActive
                      ? "bg-[var(--color-primary-foreground)] text-[var(--color-primary)]"
                      : "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]",
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab panel */}
      <div
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className="flex-1 overflow-auto"
      >
        {activeContent}
      </div>
    </div>
  );
};

TabbedContainer.displayName = "TabbedContainer";

export default TabbedContainer;
