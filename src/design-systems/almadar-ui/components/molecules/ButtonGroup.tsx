'use client';
/**
 * ButtonGroup Molecule Component
 *
 * A component for grouping buttons together with connected styling.
 * Supports both children-based and form-actions pattern (primary/secondary) usage.
 * Uses Button atoms.
 */

import React from 'react';
import { cn } from '../../lib/cn';
import { Button } from '../atoms';
import { useEventBus } from '../../hooks/useEventBus';

export type ButtonGroupVariant = 'default' | 'segmented' | 'toggle';

/** Action button config for form-actions pattern */
export interface ActionButton {
  label: string;
  /** Action type - 'submit' renders as submit button, others render as button */
  actionType?: string;
  event?: string;
  navigatesTo?: string;
  /** Button variant - matches Button component variants. Accepts string for schema compatibility. */
  variant?: string;
}

/** Filter definition for filter-group pattern */
export interface FilterDefinition {
  field: string;
  label: string;
  /** Filter type (checkbox, select, etc.) */
  type?: 'checkbox' | 'select' | 'toggle';
  /** Options for select filters */
  options?: readonly string[];
}

export interface ButtonGroupProps {
  /**
   * Button group content (Button components) - use this OR primary/secondary
   */
  children?: React.ReactNode;

  /**
   * Primary action button config (for form-actions pattern)
   * Accepts Readonly for compatibility with generated const objects
   */
  primary?: Readonly<ActionButton>;

  /**
   * Secondary action buttons config (for form-actions pattern)
   * Accepts readonly array for compatibility with generated const arrays
   */
  secondary?: readonly Readonly<ActionButton>[];

  /**
   * Visual variant
   * @default 'default'
   */
  variant?: ButtonGroupVariant;

  /**
   * Orientation
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical';

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Entity type for filter-group pattern (schema metadata)
   */
  entity?: string;

  /**
   * Filter definitions for filter-group pattern
   */
  filters?: readonly FilterDefinition[];
}

/**
 * Safe event bus hook that works outside EventBusProvider context.
 * Returns a no-op emit function if not in EventBusProvider context.
 */
function useSafeEventBus() {
  try {
    return useEventBus();
  } catch {
    // Outside EventBusProvider context - return no-op
    return { emit: () => {}, on: () => () => {}, once: () => {} };
  }
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  primary,
  secondary,
  variant = 'default',
  orientation = 'horizontal',
  className,
  // Filter-group pattern props (entity and filters are used for schema-driven filtering)
  entity: _entity,
  filters,
}) => {
  const eventBus = useSafeEventBus();
  const variantClasses = {
    default: 'gap-0',
    segmented: 'gap-0 [&>button]:rounded-none [&>button:first-child]:rounded-l-lg [&>button:last-child]:rounded-r-lg [&>button:not(:first-child)]:border-l-0',
    toggle: 'gap-0 [&>button]:rounded-none [&>button:first-child]:rounded-l-lg [&>button:last-child]:rounded-r-lg [&>button:not(:first-child)]:border-l-0',
  };

  const orientationClasses = {
    horizontal: 'flex-row',
    vertical: 'flex-col [&>button:first-child]:rounded-t-lg [&>button:last-child]:rounded-b-lg [&>button:not(:first-child)]:border-t-0 [&>button:not(:first-child)]:border-l',
  };

  // Handle action button click
  const handleActionClick = (action: ActionButton) => {
    // Emit event via event bus if specified
    if (action.event) {
      eventBus.emit('UI:DISPATCH', { event: action.event });
    }
    // Navigate if specified
    if (action.navigatesTo) {
      eventBus.emit('UI:NAVIGATE', { url: action.navigatesTo });
    }
  };

  // Button variant type for type assertions
  type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning';

  // Render buttons from primary/secondary config when no children
  const renderFormActions = () => {
    const buttons: React.ReactNode[] = [];

    // Render secondary buttons first (typically on the left)
    if (secondary) {
      secondary.forEach((action, index) => {
        buttons.push(
          <Button
            key={`secondary-${index}`}
            type={action.actionType === 'submit' ? 'submit' : 'button'}
            variant={(action.variant || 'ghost') as ButtonVariant}
            onClick={() => handleActionClick(action)}
          >
            {action.label}
          </Button>
        );
      });
    }

    // Render primary button (typically on the right)
    if (primary) {
      const isSubmit = primary.actionType === 'submit';
      buttons.push(
        <Button
          key="primary"
          type={isSubmit ? 'submit' : 'button'}
          variant={(primary.variant || 'primary') as ButtonVariant}
          onClick={() => handleActionClick(primary)}
          data-testid={isSubmit ? 'form-submit' : undefined}
        >
          {primary.label}
        </Button>
      );
    }

    return buttons;
  };

  // Render filter buttons from filters config (filter-group pattern)
  const renderFilters = () => {
    if (!filters || filters.length === 0) return null;

    return filters.map((filter, index) => (
      <Button
        key={`filter-${filter.field}-${index}`}
        variant="ghost"
        onClick={() => {
          // Filter click handling would be connected to state management
          console.log(`Filter clicked: ${filter.field}`);
        }}
      >
        {filter.label}
      </Button>
    ));
  };

  return (
    <div
      className={cn(
        'inline-flex gap-2',
        variantClasses[variant],
        orientationClasses[orientation],
        className
      )}
      role="group"
    >
      {children || renderFilters() || renderFormActions()}
    </div>
  );
};

ButtonGroup.displayName = 'ButtonGroup';

