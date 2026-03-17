'use client';
/**
 * Sidebar Organism Component
 *
 * A sidebar component with logo, navigation items, user section, and collapse/expand.
 * Styled to match the main Layout component with theme-aware CSS variables.
 *
 * Events:
 * - collapseChangeEvent — emitted when sidebar collapse state changes, payload: { collapsed: boolean }
 * - closeEvent — emitted when close button clicked (mobile)
 * - logoClickEvent — emitted when logo/brand area clicked
 */

import React, { useState, useCallback } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';
import { Box } from '../atoms/Box';
import { Typography } from '../atoms/Typography';
import { cn } from '../../lib/cn';
import { useEventBus } from '../../hooks/useEventBus';
import { useTranslate } from '../../hooks/useTranslate';
import type { EntityDisplayProps } from './types';

export interface SidebarItem {
  /** Item ID */
  id: string;
  /** Item label */
  label: string;
  /** Item icon */
  icon?: LucideIcon;
  /** Item badge */
  badge?: string | number;
  /** Item href */
  href?: string;
  /** Item click handler */
  onClick?: () => void;
  /** Is active */
  active?: boolean;
  /** @deprecated Use `active` instead */
  isActive?: boolean;
  /** Sub-items (for nested navigation) */
  subItems?: SidebarItem[];
}

export interface SidebarProps extends EntityDisplayProps<SidebarItem> {
  /** Logo/Brand content - can be a ReactNode or logo config */
  logo?: React.ReactNode;
  /** Logo image source */
  logoSrc?: string;
  /** Brand/App name */
  brandName?: string;
  /** Navigation items */
  items: SidebarItem[];
  /** User section content */
  userSection?: React.ReactNode;
  /** Footer content (e.g., theme toggle) */
  footerContent?: React.ReactNode;
  /** Collapsed state (controlled) */
  collapsed?: boolean;
  /** Default collapsed state */
  defaultCollapsed?: boolean;
  /** Event emitted when collapse state changes, payload: { collapsed: boolean } */
  collapseChangeEvent?: string;
  /** Hide the collapse/expand button */
  hideCollapseButton?: boolean;
  /** Show a close button (for mobile) */
  showCloseButton?: boolean;
  /** Event emitted when close button is clicked */
  closeEvent?: string;
  /** Event emitted when logo/brand is clicked */
  logoClickEvent?: string;
}

/**
 * Single navigation item component
 */
const SidebarNavItem: React.FC<{
  item: SidebarItem;
  collapsed: boolean;
}> = ({ item, collapsed }) => {
  const Icon = item.icon;
  const isActive = item.active ?? item.isActive;

  return (
    <Button
      variant="ghost"
      onClick={item.onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5 transition-all duration-[var(--transition-fast)] group relative',
        'rounded-[var(--radius-sm)] border-[length:var(--border-width-thin)] border-transparent',
        isActive
          ? [
            'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]',
            'font-medium shadow-[var(--shadow-sm)]',
            'border-[var(--color-primary)] translate-x-1 -translate-y-0.5',
          ].join(' ')
          : [
            'text-[var(--color-foreground)]',
            'hover:bg-[var(--color-muted)] hover:border-[var(--color-border)]',
            'active:bg-[var(--color-primary)] active:text-[var(--color-primary-foreground)]',
          ].join(' ')
      )}
      title={collapsed ? item.label : undefined}
    >
      {Icon && (
        <Icon
          size={20}
          className={cn(
            'min-w-[20px] flex-shrink-0',
            isActive && 'text-[var(--color-primary-foreground)]'
          )}
        />
      )}

      {!collapsed && (
        <Typography variant="body" className="font-medium truncate flex-1 text-left">{item.label}</Typography>
      )}

      {!collapsed && item.badge !== undefined && (
        <Badge variant="danger" size="sm">{item.badge}</Badge>
      )}

      {/* Tooltip for collapsed state */}
      {collapsed && (
        <Box className={cn(
          'absolute left-full ml-2 px-2 py-1 text-xs opacity-0 group-hover:opacity-100',
          'pointer-events-none whitespace-nowrap z-50 transition-opacity',
          'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]',
          'border-[length:var(--border-width-thin)] border-[var(--color-border)]',
          'rounded-[var(--radius-sm)]'
        )}>
          {item.label}
        </Box>
      )}
    </Button>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({
  logo,
  logoSrc,
  brandName = 'KFlow',
  items,
  userSection,
  footerContent,
  collapsed: controlledCollapsed,
  defaultCollapsed = false,
  collapseChangeEvent,
  hideCollapseButton = false,
  showCloseButton = false,
  closeEvent,
  logoClickEvent,
  className,
}) => {
  const { emit } = useEventBus();
  const { t } = useTranslate();
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const collapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

  const handleToggle = useCallback(() => {
    const newCollapsed = !collapsed;
    if (controlledCollapsed === undefined) {
      setInternalCollapsed(newCollapsed);
    }
    if (collapseChangeEvent) {
      emit(collapseChangeEvent, { collapsed: newCollapsed });
    }
  }, [collapsed, controlledCollapsed, collapseChangeEvent, emit]);

  const handleClose = useCallback(() => {
    if (closeEvent) {
      emit(closeEvent, {});
    }
  }, [closeEvent, emit]);

  const handleLogoClick = useCallback(() => {
    if (logoClickEvent) {
      emit(logoClickEvent, {});
    }
  }, [logoClickEvent, emit]);

  return (
    <Box
      as="aside"
      className={cn(
        'flex flex-col h-full',
        'bg-[var(--color-card)] border-r border-[var(--color-border)]',
        'transition-all duration-300 ease-in-out',
        collapsed ? 'w-20' : 'w-64',
        className
      )}
    >
      {/* Header with Logo */}
      <Box className="h-16 flex items-center justify-between px-4 border-b border-[var(--color-border)] flex-shrink-0">
        <Box
          className={cn(
            'flex items-center gap-3 cursor-pointer',
            collapsed && 'justify-center w-full'
          )}
          onClick={handleLogoClick}
        >
          {/* Logo image or custom logo */}
          {logo ? (
            typeof logo === 'string' ? (
              // eslint-disable-next-line almadar/no-raw-dom-elements -- semantic img with src/alt
              <img src={logo} alt={brandName} className="h-8 w-8" />
            ) : (
              logo
            )
          ) : logoSrc ? (
            // eslint-disable-next-line almadar/no-raw-dom-elements -- semantic img with src/alt
            <img src={logoSrc} alt={brandName} className="h-8 w-8" />
          ) : (
            <Box className="h-8 w-8 bg-[var(--color-primary)] flex items-center justify-center rounded-[var(--radius-sm)]">
              <Typography variant="small" className="text-[var(--color-primary-foreground)] font-bold text-sm">K</Typography>
            </Box>
          )}

          {/* Brand name */}
          {!collapsed && (
            <Typography variant="body" className="text-xl font-bold text-[var(--color-foreground)]">
              {brandName}
            </Typography>
          )}
        </Box>

        {/* Collapse button */}
        {!hideCollapseButton && (
          <Button
            variant="ghost"
            onClick={handleToggle}
            className={cn(
              'p-1.5 hover:bg-[var(--color-muted)] text-[var(--color-foreground)] hidden lg:block',
              'rounded-[var(--radius-sm)]',
              collapsed && 'mx-auto'
            )}
            title={collapsed ? t('sidebar.expand') : t('sidebar.collapse')}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </Button>
        )}

        {/* Close button for mobile */}
        {showCloseButton && (
          <Button
            variant="ghost"
            onClick={handleClose}
            className="p-1.5 hover:bg-[var(--color-muted)] text-[var(--color-foreground)] lg:hidden rounded-[var(--radius-sm)]"
            aria-label={t('sidebar.close')}
          >
            <X size={18} />
          </Button>
        )}
      </Box>

      {/* Navigation */}
      <Box as="nav" className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {items.map((item) => (
          <SidebarNavItem
            key={item.id}
            item={item}
            collapsed={collapsed}
          />
        ))}
      </Box>

      {/* Footer with User Section and additional content */}
      {(footerContent || userSection) && (
        <Box className="p-3 border-t border-[var(--color-border)] space-y-1 flex-shrink-0">
          <Box className={cn(
            'flex items-center',
            collapsed ? 'justify-center flex-col gap-4' : 'justify-between px-2'
          )}>
            {footerContent && (
              <Box className="flex items-center">
                {footerContent}
              </Box>
            )}
            {userSection && (
              <Box className="flex items-center">
                {userSection}
              </Box>
            )}
          </Box>

          {collapsed && !hideCollapseButton && (
            <Button
              variant="ghost"
              onClick={handleToggle}
              className="w-full flex justify-center p-2 mt-2 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] lg:hidden"
            >
              <ChevronRight size={20} />
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};

Sidebar.displayName = 'Sidebar';
