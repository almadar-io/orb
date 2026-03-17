'use client';
/**
 * DrawerSlot Component
 *
 * Wraps drawer slot content in a proper Drawer component.
 * Used by trait-driven pages to display drawer UI from render_ui effects.
 *
 * Handles:
 * - Auto-open when content is present
 * - Dispatches CLOSE/CANCEL events when closed
 * - Extracts title from Form or DetailPanel components
 * - Configurable position and size
 */

import React from 'react';
import { Drawer, DrawerPosition, DrawerSize } from '../molecules/Drawer';
import { useEventBus } from '../../hooks/useEventBus';

export interface DrawerSlotProps {
  /** Content to display in the drawer */
  children?: React.ReactNode;
  /** Override drawer title (extracted from children if not provided) */
  title?: string;
  /** Drawer position */
  position?: DrawerPosition;
  /** Drawer size */
  size?: DrawerSize;
  /** Custom class name */
  className?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
}

/**
 * Extract title from Form, DetailPanel, or other components if they have a title prop
 */
function extractTitle(children: React.ReactNode): string | undefined {
  if (!React.isValidElement(children)) return undefined;

  const props = children.props as Record<string, unknown>;
  if (typeof props.title === 'string') {
    return props.title;
  }

  return undefined;
}

/**
 * DrawerSlot - Wrapper for drawer slot content
 *
 * Automatically shows drawer when children are present,
 * and dispatches close events when drawer is dismissed.
 */
export const DrawerSlot: React.FC<DrawerSlotProps> = ({
  children,
  title: overrideTitle,
  position = 'right',
  size = 'md',
  className,
}) => {
  const eventBus = useEventBus();
  const isOpen = Boolean(children);

  // Extract title from children if not explicitly provided
  const title = overrideTitle || extractTitle(children);

  const handleClose = () => {
    // Dispatch close events - trait hooks listen for these
    eventBus.emit('UI:CLOSE');
    eventBus.emit('UI:CANCEL');
  };

  if (!isOpen) return null;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      position={position}
      width={size}
      className={className}
    >
      {children}
    </Drawer>
  );
};

DrawerSlot.displayName = 'DrawerSlot';
