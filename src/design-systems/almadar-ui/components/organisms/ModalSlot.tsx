'use client';
/**
 * ModalSlot Component
 *
 * Wraps modal slot content in a proper Modal component.
 * Used by trait-driven pages to display modal UI from render_ui effects.
 *
 * Handles:
 * - Auto-open when content is present
 * - Dispatches CLOSE/CANCEL events when closed
 * - Extracts title from Form components
 */

import React from 'react';
import { Modal } from '../molecules/Modal';
import { useEventBus } from '../../hooks/useEventBus';

export interface ModalSlotProps {
  /** Content to display in the modal */
  children?: React.ReactNode;
  /** Override modal title (extracted from children if not provided) */
  title?: string;
  /** Modal size */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Custom class name */
  className?: string;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
}

/**
 * Extract title from Form or other components if they have a title prop
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
 * ModalSlot - Wrapper for modal slot content
 *
 * Automatically shows modal when children are present,
 * and dispatches close events when modal is dismissed.
 */
export const ModalSlot: React.FC<ModalSlotProps> = ({
  children,
  title: overrideTitle,
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
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size={size}
      className={className}
    >
      {children}
    </Modal>
  );
};

ModalSlot.displayName = 'ModalSlot';
