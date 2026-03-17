'use client';
/**
 * Tabs Molecule Component
 * 
 * A tabbed interface component with keyboard navigation and badge support.
 * Uses theme-aware CSS variables for styling.
 */

import React, { useState, useRef } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Icon } from '../atoms/Icon';
import { Badge } from '../atoms/Badge';
import { Typography } from '../atoms/Typography';
import { Box } from '../atoms/Box';
import { cn } from '../../lib/cn';
import { useEventBus } from '../../hooks/useEventBus';
import { useTranslate } from '../../hooks/useTranslate';

export interface TabItem {
  /** Tab ID */
  id: string;
  /** Tab label */
  label: string;
  /** Tab content - optional for event-driven tabs */
  content?: React.ReactNode;
  /** Tab icon */
  icon?: LucideIcon;
  /** Tab badge */
  badge?: string | number;
  /** Disable tab */
  disabled?: boolean;
  /** Event to emit when tab is clicked (for trait state machine integration) */
  event?: string;
  /** Whether this tab is currently active (for controlled tabs) */
  active?: boolean;
}

export interface TabsProps {
  /** Tab items */
  items?: TabItem[];
  /** Tab items (alias for items - used by generated code) */
  tabs?: TabItem[];
  /** Default active tab ID */
  defaultActiveTab?: string;
  /** Controlled active tab ID */
  activeTab?: string;
  /** Callback when tab changes */
  onTabChange?: (tabId: string) => void;
  /** Tab variant */
  variant?: 'default' | 'pills' | 'underline';
  /** Tab orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Additional CSS classes */
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  tabs,
  defaultActiveTab,
  activeTab: controlledActiveTab,
  onTabChange,
  variant = 'default',
  orientation = 'horizontal',
  className,
}) => {
  // Guard against undefined or empty items - support both 'items' and 'tabs' props
  const safeItems = items ?? tabs ?? [];
  const eventBus = useEventBus();
  const { t } = useTranslate();

  // Find initially active tab (check for active: true in items)
  const initialActive = safeItems.find(item => item.active)?.id;

  const [internalActiveTab, setInternalActiveTab] = useState(
    defaultActiveTab || initialActive || safeItems[0]?.id || ''
  );
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;
  const tabRefs = useRef<Record<string, HTMLElement | null>>({});

  const handleTabChange = (tabId: string, tabEvent?: string) => {
    if (controlledActiveTab === undefined) {
      setInternalActiveTab(tabId);
    }
    onTabChange?.(tabId);

    // Emit event if tab has event configured (for trait state machine integration)
    if (tabEvent) {
      eventBus.emit(`UI:${tabEvent}`, { tabId });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const direction = e.key === 'ArrowLeft' ? -1 : 1;
      const nextIndex = (index + direction + safeItems.length) % safeItems.length;
      const nextTab = safeItems[nextIndex];
      if (nextTab && !nextTab.disabled) {
        handleTabChange(nextTab.id);
        tabRefs.current[nextTab.id]?.focus();
      }
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      const targetIndex = e.key === 'Home' ? 0 : safeItems.length - 1;
      const targetTab = safeItems[targetIndex];
      if (targetTab && !targetTab.disabled) {
        handleTabChange(targetTab.id);
        tabRefs.current[targetTab.id]?.focus();
      }
    }
  };

  const activeTabContent = safeItems.find(item => item.id === activeTab)?.content;

  // Graceful handling for empty tabs
  if (safeItems.length === 0) {
    return (
      <Box className={cn('w-full', className)}>
        <Typography variant="small" color="muted" className="py-4">
          {t('empty.noItems')}
        </Typography>
      </Box>
    );
  }

  // Theme-aware variant styles
  const variantClasses = {
    default: [
      'border-b-[length:var(--border-width)] border-transparent',
      'hover:border-[var(--color-muted-foreground)]',
      'data-[active=true]:border-[var(--color-primary)]',
    ].join(' '),
    pills: [
      'rounded-[var(--radius-sm)]',
      'data-[active=true]:bg-[var(--color-primary)]',
      'data-[active=true]:text-[var(--color-primary-foreground)]',
    ].join(' '),
    underline: [
      'border-b-[length:var(--border-width)] border-transparent',
      'data-[active=true]:border-[var(--color-primary)]',
    ].join(' '),
  };

  return (
    <Box className={cn('w-full', className)}>
      <Box
        role="tablist"
        className={cn(
          'flex',
          orientation === 'horizontal'
            ? 'flex-row border-b-[length:var(--border-width)] border-[var(--color-border)]'
            : 'flex-col border-r-[length:var(--border-width)] border-[var(--color-border)]',
          variant === 'pills' && 'gap-1 p-1 bg-[var(--color-muted)] border-0 rounded-[var(--radius-md)]',
          variant === 'underline' && orientation === 'vertical' && 'border-b-0'
        )}
      >
        {safeItems.map((item, index) => {
          const isActive = item.id === activeTab;
          const isDisabled = item.disabled;

          return (
            <Box
              key={item.id}
              as="button"
              ref={(el: HTMLDivElement | null) => {
                tabRefs.current[item.id] = el;
              }}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${item.id}`}
              aria-disabled={isDisabled}
              onClick={() => !isDisabled && handleTabChange(item.id, item.event)}
              onKeyDown={(e: React.KeyboardEvent) => handleKeyDown(e, index)}
              data-active={isActive}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all',
                'focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:ring-offset-2',
                isDisabled && 'opacity-50 cursor-not-allowed',
                variantClasses[variant],
                isActive
                  ? 'text-[var(--color-foreground)] font-bold'
                  : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
              )}
            >
              {item.icon && <Icon icon={item.icon} size="sm" />}
              <Typography variant="small" weight={isActive ? 'semibold' : 'normal'}>
                {item.label}
              </Typography>
              {item.badge !== undefined && (
                <Badge variant="default" size="sm">
                  {item.badge}
                </Badge>
              )}
            </Box>
          );
        })}
      </Box>

      <Box
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className="mt-4"
      >
        {activeTabContent}
      </Box>
    </Box>
  );
};

Tabs.displayName = 'Tabs';
