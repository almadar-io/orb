'use client';
/**
 * Popover Molecule Component
 *
 * A popover component with position variants and click/hover triggers.
 * Uses Button, Typography, and Icon atoms.
 */

import React, { useState, useRef, useEffect } from "react";
import { Typography } from "../atoms/Typography";
import { cn } from "../../lib/cn";

export type PopoverPosition = "top" | "bottom" | "left" | "right";
export type PopoverTrigger = "click" | "hover";

export interface PopoverProps {
  /**
   * Popover content
   */
  content: React.ReactNode;

  /**
   * Popover trigger element (ReactElement or ReactNode that will be wrapped in span)
   */
  children: React.ReactNode;

  /**
   * Popover position
   * @default 'bottom'
   */
  position?: PopoverPosition;

  /**
   * Trigger type
   * @default 'click'
   */
  trigger?: PopoverTrigger;

  /**
   * Show arrow
   * @default true
   */
  showArrow?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

const positionClasses: Record<PopoverPosition, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

const arrowClasses: Record<PopoverPosition, string> = {
  top: "top-full left-1/2 -translate-x-1/2 border-t-white border-l-transparent border-r-transparent border-b-transparent",
  bottom:
    "bottom-full left-1/2 -translate-x-1/2 border-b-white border-l-transparent border-r-transparent border-t-transparent",
  left: "left-full top-1/2 -translate-y-1/2 border-l-white border-t-transparent border-b-transparent border-r-transparent",
  right:
    "right-full top-1/2 -translate-y-1/2 border-r-white border-t-transparent border-b-transparent border-l-transparent",
};

export const Popover: React.FC<PopoverProps> = ({
  content,
  children,
  position = "bottom",
  trigger = "click",
  showArrow = true,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (triggerRef.current) {
      setTriggerRect(triggerRef.current.getBoundingClientRect());
    }
  };

  const handleOpen = () => {
    updatePosition();
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleToggle = () => {
    if (isOpen) {
      handleClose();
    } else {
      handleOpen();
    }
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen]);

  useEffect(() => {
    if (trigger !== "click") {
      return;
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        handleClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, trigger]);

  const triggerProps =
    trigger === "click"
      ? {
          onClick: handleToggle,
        }
      : {
          onMouseEnter: handleOpen,
          onMouseLeave: handleClose,
        };

  // Wrap non-element children in a span
  const childElement = React.isValidElement(children) ? (
    children
  ) : (
    <span>{children}</span>
  );

  const triggerElement = React.cloneElement(
    childElement as React.ReactElement<any>,
    {
      ref: triggerRef,
      ...triggerProps,
    },
  );

  return (
    <>
      {triggerElement}
      {isOpen && triggerRect && (
        <div
          ref={popoverRef}
          className={cn(
            "fixed z-50 p-4",
            "bg-[var(--color-card)] border-2 border-[var(--color-border)] shadow-[var(--shadow-lg)]",
            positionClasses[position],
            className,
          )}
          style={{
            left:
              position === "left" || position === "right"
                ? triggerRect.left +
                  (position === "left" ? 0 : triggerRect.width)
                : triggerRect.left + triggerRect.width / 2,
            top:
              position === "top" || position === "bottom"
                ? triggerRect.top +
                  (position === "top" ? 0 : triggerRect.height)
                : triggerRect.top + triggerRect.height / 2,
          }}
          role="dialog"
          onMouseEnter={trigger === "hover" ? handleOpen : undefined}
          onMouseLeave={trigger === "hover" ? handleClose : undefined}
        >
          {typeof content === "string" ? (
            <Typography variant="body">{content}</Typography>
          ) : (
            content
          )}
          {showArrow && (
            <div
              className={cn(
                "absolute w-0 h-0 border-4",
                arrowClasses[position],
              )}
            />
          )}
        </div>
      )}
    </>
  );
};

Popover.displayName = "Popover";
