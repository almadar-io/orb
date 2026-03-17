'use client';
import * as React from 'react';
import { cn } from '../../../lib/cn';
import { useEventBus } from '../../../hooks/useEventBus';

export interface ControlButtonProps {
  /** Button label text */
  label?: string;
  /** Icon component or emoji */
  icon?: React.ReactNode;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl' | string;
  /** Shape variant */
  shape?: 'circle' | 'rounded' | 'square' | string;
  /** Visual variant */
  variant?: 'primary' | 'secondary' | 'ghost' | string;
  /** Called when button is pressed */
  onPress?: () => void;
  /** Called when button is released */
  onRelease?: () => void;
  /** Declarative event name emitted on press via useEventBus */
  pressEvent?: string;
  /** Declarative event name emitted on release via useEventBus */
  releaseEvent?: string;
  /** Whether the button is currently pressed */
  pressed?: boolean;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

const sizeMap = {
  sm: 'w-10 h-10 text-sm',
  md: 'w-14 h-14 text-base',
  lg: 'w-18 h-18 text-lg',
  xl: 'w-24 h-24 text-xl',
};

const shapeMap = {
  circle: 'rounded-full',
  rounded: 'rounded-xl',
  square: 'rounded-md',
};

const variantMap = {
  primary: 'bg-blue-600 text-white border-blue-400 hover:bg-blue-500',
  secondary: 'bg-gray-700 text-white border-gray-500 hover:bg-gray-600',
  ghost: 'bg-transparent text-white border-white/30 hover:bg-white/10',
};

export function ControlButton({
  label,
  icon,
  size = 'md',
  shape = 'circle',
  variant = 'secondary',
  onPress,
  onRelease,
  pressEvent,
  releaseEvent,
  pressed,
  disabled,
  className,
}: ControlButtonProps) {
  const eventBus = useEventBus();
  const [isPressed, setIsPressed] = React.useState(false);
  const actualPressed = pressed ?? isPressed;

  const handlePointerDown = React.useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      if (disabled) return;
      setIsPressed(true);
      if (pressEvent) eventBus.emit(`UI:${pressEvent}`, {});
      onPress?.();
    },
    [disabled, pressEvent, eventBus, onPress]
  );

  const handlePointerUp = React.useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      if (disabled) return;
      setIsPressed(false);
      if (releaseEvent) eventBus.emit(`UI:${releaseEvent}`, {});
      onRelease?.();
    },
    [disabled, releaseEvent, eventBus, onRelease]
  );

  const handlePointerLeave = React.useCallback(
    (e: React.PointerEvent) => {
      if (isPressed) {
        setIsPressed(false);
        if (releaseEvent) eventBus.emit(`UI:${releaseEvent}`, {});
        onRelease?.();
      }
    },
    [isPressed, releaseEvent, eventBus, onRelease]
  );

  return (
    <button
      type="button"
      disabled={disabled}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onContextMenu={(e) => e.preventDefault()}
      className={cn(
        'flex items-center justify-center border-2 font-bold',
        'select-none touch-none',
        'transition-all duration-100',
        'active:scale-95',
        sizeMap[size as keyof typeof sizeMap] ?? sizeMap.md,
        shapeMap[shape as keyof typeof shapeMap] ?? shapeMap.circle,
        variantMap[variant as keyof typeof variantMap] ?? variantMap.secondary,
        actualPressed && 'scale-95 brightness-110 border-white',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {icon && <span className="text-2xl">{icon}</span>}
      {label && !icon && <span>{label}</span>}
    </button>
  );
}

ControlButton.displayName = 'ControlButton';
