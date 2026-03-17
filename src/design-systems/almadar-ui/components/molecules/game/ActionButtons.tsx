'use client';
import * as React from 'react';
import { cn } from '../../../lib/cn';
import { useEventBus } from '../../../hooks/useEventBus';
import { ControlButton } from '../../atoms/game/ControlButton';

export interface ActionButtonConfig {
  /** Unique identifier */
  id: string;
  /** Display label */
  label?: string;
  /** Icon component or emoji */
  icon?: React.ReactNode;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'ghost' | string;
}

export interface ActionButtonsProps {
  /** Button configurations */
  buttons: ActionButtonConfig[];
  /** Called when a button is pressed/released */
  onAction?: (id: string, pressed: boolean) => void;
  /** Declarative event name emitted on action via useEventBus */
  actionEvent?: string;
  /** Layout variant */
  layout?: 'horizontal' | 'vertical' | 'diamond';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
}

const sizeMap = {
  sm: 'sm' as const,
  md: 'md' as const,
  lg: 'lg' as const,
};

const layoutMap = {
  horizontal: 'flex flex-row gap-2',
  vertical: 'flex flex-col gap-2',
  diamond: 'grid grid-cols-3 gap-1',
};

export function ActionButtons({
  buttons,
  onAction,
  actionEvent,
  layout = 'horizontal',
  size = 'md',
  className,
  disabled,
}: ActionButtonsProps) {
  const eventBus = useEventBus();
  const [activeButtons, setActiveButtons] = React.useState<Set<string>>(new Set());

  const handlePress = React.useCallback(
    (id: string) => {
      setActiveButtons((prev) => new Set(prev).add(id));
      if (actionEvent) eventBus.emit(`UI:${actionEvent}`, { id, pressed: true });
      onAction?.(id, true);
    },
    [actionEvent, eventBus, onAction]
  );

  const handleRelease = React.useCallback(
    (id: string) => {
      setActiveButtons((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      if (actionEvent) eventBus.emit(`UI:${actionEvent}`, { id, pressed: false });
      onAction?.(id, false);
    },
    [actionEvent, eventBus, onAction]
  );

  // Diamond layout: special positioning for 4 buttons (A, B, X, Y style)
  if (layout === 'diamond' && buttons.length === 4) {
    const [top, right, bottom, left] = buttons;
    return (
      <div className={cn(layoutMap[layout], className)}>
        <div />
        <ControlButton
          icon={top.icon}
          label={top.label}
          size={sizeMap[size]}
          variant={top.variant}
          pressed={activeButtons.has(top.id)}
          onPress={() => handlePress(top.id)}
          onRelease={() => handleRelease(top.id)}
          disabled={disabled}
        />
        <div />

        <ControlButton
          icon={left.icon}
          label={left.label}
          size={sizeMap[size]}
          variant={left.variant}
          pressed={activeButtons.has(left.id)}
          onPress={() => handlePress(left.id)}
          onRelease={() => handleRelease(left.id)}
          disabled={disabled}
        />
        <div />
        <ControlButton
          icon={right.icon}
          label={right.label}
          size={sizeMap[size]}
          variant={right.variant}
          pressed={activeButtons.has(right.id)}
          onPress={() => handlePress(right.id)}
          onRelease={() => handleRelease(right.id)}
          disabled={disabled}
        />

        <div />
        <ControlButton
          icon={bottom.icon}
          label={bottom.label}
          size={sizeMap[size]}
          variant={bottom.variant}
          pressed={activeButtons.has(bottom.id)}
          onPress={() => handlePress(bottom.id)}
          onRelease={() => handleRelease(bottom.id)}
          disabled={disabled}
        />
        <div />
      </div>
    );
  }

  return (
    <div className={cn(layoutMap[layout], className)}>
      {buttons.map((button) => (
        <ControlButton
          key={button.id}
          icon={button.icon}
          label={button.label}
          size={sizeMap[size]}
          variant={button.variant}
          pressed={activeButtons.has(button.id)}
          onPress={() => handlePress(button.id)}
          onRelease={() => handleRelease(button.id)}
          disabled={disabled}
        />
      ))}
    </div>
  );
}

ActionButtons.displayName = 'ActionButtons';
