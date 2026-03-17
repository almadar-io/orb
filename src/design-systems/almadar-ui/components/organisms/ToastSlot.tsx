'use client';
/**
 * ToastSlot Component
 *
 * Wraps toast slot content in a proper Toast component with positioning.
 * Used by trait-driven pages to display toast UI from render_ui effects.
 *
 * Handles:
 * - Auto-show when content is present
 * - Dispatches DISMISS event when dismissed
 * - Fixed positioning in corner of screen
 */

import React from 'react';
import { Toast, ToastVariant } from '../molecules/Toast';
import { Box } from '../atoms/Box';
import { useEventBus } from '../../hooks/useEventBus';

export interface ToastSlotProps {
  /** Content to display in the toast (message or ReactNode) */
  children?: React.ReactNode;
  /** Toast variant */
  variant?: ToastVariant;
  /** Toast title */
  title?: string;
  /** Auto-dismiss duration in ms (0 = no auto-dismiss) */
  duration?: number;
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
 * Extract toast props from children if they have relevant props
 */
function extractToastProps(children: React.ReactNode): {
  message?: string;
  variant?: ToastVariant;
  title?: string;
} {
  if (!React.isValidElement(children)) {
    // If children is a string, use it as message
    if (typeof children === 'string') {
      return { message: children };
    }
    return {};
  }

  const props = children.props as Record<string, unknown>;
  return {
    message: typeof props.message === 'string' ? props.message : undefined,
    variant: props.variant as ToastVariant | undefined,
    title: typeof props.title === 'string' ? props.title : undefined,
  };
}

/**
 * ToastSlot - Wrapper for toast slot content
 *
 * Automatically shows toast when children are present,
 * and dispatches dismiss events when toast is dismissed.
 */
export const ToastSlot: React.FC<ToastSlotProps> = ({
  children,
  variant: overrideVariant,
  title: overrideTitle,
  duration = 5000,
  className,
}) => {
  const eventBus = useEventBus();
  const isVisible = Boolean(children);

  // Extract props from children if not explicitly provided
  const extracted = extractToastProps(children);
  const variant = overrideVariant || extracted.variant || 'info';
  const title = overrideTitle || extracted.title;
  const message = extracted.message || (typeof children === 'string' ? children : '');

  const handleDismiss = () => {
    // Dispatch dismiss event - trait hooks listen for this
    eventBus.emit('UI:DISMISS');
    eventBus.emit('UI:CLOSE');
  };

  if (!isVisible) return null;

  // If children is a React element (custom toast content), render it directly
  // Otherwise render a standard Toast with the message
  const isCustomContent = React.isValidElement(children) && !message;

  return (
    <Box className="fixed bottom-4 right-4 z-50">
      {isCustomContent ? (
        children
      ) : (
        <Toast
          variant={variant}
          title={title}
          message={message || 'Notification'}
          duration={duration}
          onDismiss={handleDismiss}
          className={className}
        />
      )}
    </Box>
  );
};

ToastSlot.displayName = 'ToastSlot';
