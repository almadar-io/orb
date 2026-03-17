'use client';
/**
 * Tooltip Molecule Component
 * 
 * A tooltip component with position variants and delay options.
 * Uses theme-aware CSS variables for styling.
 */

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Typography } from '../atoms/Typography';
import { cn } from '../../lib/cn';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  /** Tooltip content */
  content: React.ReactNode;
  /** Tooltip trigger element (ReactElement or ReactNode that will be wrapped in span) */
  children: React.ReactNode;
  /** Tooltip position */
  position?: TooltipPosition;
  /** Show delay in milliseconds */
  delay?: number;
  /** Hide delay in milliseconds */
  hideDelay?: number;
  /** Show arrow */
  showArrow?: boolean;
  /** Additional CSS classes */
  className?: string;
}

const positionClasses: Record<TooltipPosition, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

// Arrow colors use CSS variables
const arrowClasses: Record<TooltipPosition, string> = {
  top: 'top-full left-1/2 -translate-x-1/2 border-t-[var(--color-primary)] border-l-transparent border-r-transparent border-b-transparent',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-[var(--color-primary)] border-l-transparent border-r-transparent border-t-transparent',
  left: 'left-full top-1/2 -translate-y-1/2 border-l-[var(--color-primary)] border-t-transparent border-b-transparent border-r-transparent',
  right: 'right-full top-1/2 -translate-y-1/2 border-r-[var(--color-primary)] border-t-transparent border-b-transparent border-l-transparent',
};

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 200,
  hideDelay = 0,
  showArrow = true,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updatePosition = () => {
    if (triggerRef.current) {
      setTriggerRect(triggerRef.current.getBoundingClientRect());
    }
  };

  const handleMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    updatePosition();
    showTimeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
    }
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, hideDelay);
  };

  useEffect(() => {
    if (isVisible) {
      updatePosition();
    }
  }, [isVisible]);

  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  // Wrap non-element children in a span
  const triggerElement = React.isValidElement(children) ? children : <span>{children}</span>;

  const trigger = React.cloneElement(triggerElement as React.ReactElement<any>, {
    ref: triggerRef,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onFocus: handleMouseEnter,
    onBlur: handleMouseLeave,
  });

  const tooltipContent = isVisible && triggerRect ? (
    <div
      ref={tooltipRef}
      className={cn(
        'fixed z-50 px-3 py-2 max-w-xs',
        'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]',
        'shadow-[var(--shadow-sm)] rounded-[var(--radius-sm)]',
        'text-sm pointer-events-none',
        'break-words whitespace-normal',
        'h-auto min-h-fit',
        positionClasses[position],
        className
      )}
      style={{
        left: position === 'left' || position === 'right'
          ? triggerRect.left + (position === 'left' ? 0 : triggerRect.width)
          : triggerRect.left + triggerRect.width / 2,
        top: position === 'top' || position === 'bottom'
          ? triggerRect.top + (position === 'top' ? 0 : triggerRect.height)
          : triggerRect.top + triggerRect.height / 2,
        transform: position === 'top' || position === 'bottom'
          ? 'translateX(-50%)'
          : position === 'left' || position === 'right'
            ? 'translateY(-50%)'
            : 'none',
      }}
      role="tooltip"
    >
      <div className="w-full break-words whitespace-normal h-auto">
        {typeof content === 'string' ? (
          <Typography variant="small" className="text-[var(--color-primary-foreground)] break-words whitespace-normal">
            {content}
          </Typography>
        ) : (
          <div className="break-words whitespace-normal">
            {content}
          </div>
        )}
      </div>
      {showArrow && (
        <div
          className={cn(
            'absolute w-0 h-0 border-4',
            arrowClasses[position]
          )}
        />
      )}
    </div>
  ) : null;

  return (
    <>
      {trigger}
      {typeof window !== 'undefined' && tooltipContent
        ? createPortal(tooltipContent, document.body)
        : tooltipContent}
    </>
  );
};

Tooltip.displayName = 'Tooltip';
