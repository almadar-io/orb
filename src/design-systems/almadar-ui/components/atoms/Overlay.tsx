'use client';
/**
 * Overlay Atom Component
 *
 * A fixed backdrop for modals and drawers.
 */
import React from "react";
import { cn } from "../../lib/cn";
import { useEventBus } from "../../hooks/useEventBus";

export interface OverlayProps {
  isVisible?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  blur?: boolean;
  /** Declarative event name — emits UI:{action} via eventBus on click */
  action?: string;
}

export const Overlay: React.FC<OverlayProps> = ({
  isVisible = true,
  onClick,
  className,
  blur = true,
  action,
}) => {
  const eventBus = useEventBus();

  if (!isVisible) return null;

  const handleClick = (e: React.MouseEvent) => {
    if (action) {
      eventBus.emit(`UI:${action}`, {});
    }
    onClick?.(e);
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-40 bg-[var(--color-background)]/80",
        blur && "backdrop-blur-sm",
        className,
      )}
      onClick={(action || onClick) ? handleClick : undefined}
      aria-hidden="true"
    />
  );
};

export default Overlay;
