'use client';
/**
 * TextHighlight Atom Component
 *
 * A styled span component for highlighting text with annotations (questions or notes).
 * Uses different colors for different annotation types:
 * - Questions: Blue highlight
 * - Notes: Yellow highlight
 */

import React from "react";
import { cn } from "../../lib/cn";
import { useEventBus } from "../../hooks/useEventBus";

export type HighlightType = "question" | "note";

export interface TextHighlightProps {
  /**
   * Type of highlight (determines color)
   */
  highlightType: HighlightType;

  /**
   * Whether the highlight is currently active/focused
   * @default false
   */
  isActive?: boolean;

  /**
   * Callback when highlight is clicked
   */
  onClick?: () => void;

  /**
   * Callback when highlight is hovered
   */
  onMouseEnter?: () => void;

  /**
   * Callback when hover ends
   */
  onMouseLeave?: () => void;

  /**
   * Unique ID for the annotation
   */
  annotationId?: string;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Highlighted text content
   */
  children: React.ReactNode;

  /** Declarative event name — emits UI:{action} via eventBus on click */
  action?: string;

  /** Declarative hover event — emits UI:{hoverEvent} with { hovered: true/false } */
  hoverEvent?: string;
}

/**
 * TextHighlight component for rendering highlighted text annotations
 */
export const TextHighlight: React.FC<TextHighlightProps> = ({
  highlightType,
  isActive = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
  annotationId,
  className,
  children,
  action,
  hoverEvent,
}) => {
  const eventBus = useEventBus();
  const baseStyles = "cursor-pointer transition-all duration-150";

  const typeStyles = {
    question: cn(
      // Blue border for questions
      "bg-[var(--color-card)] border-b-2 border-primary-600",
      "hover:bg-[var(--color-muted)]",
      isActive && "bg-primary-100 ring-2 ring-primary-600",
    ),
    note: cn(
      // Yellow border for notes
      "bg-[var(--color-card)] border-b-2 border-amber-500",
      "hover:bg-[var(--color-muted)]",
      isActive && "bg-amber-100 ring-2 ring-amber-500",
    ),
  };

  return (
    <span
      data-highlight="true"
      data-highlight-type={highlightType}
      data-annotation-id={annotationId}
      className={cn(baseStyles, typeStyles[highlightType], className)}
      onClick={() => {
        if (action) eventBus.emit(`UI:${action}`, { annotationId });
        onClick?.();
      }}
      onMouseEnter={() => {
        if (hoverEvent) eventBus.emit(`UI:${hoverEvent}`, { hovered: true, annotationId });
        onMouseEnter?.();
      }}
      onMouseLeave={() => {
        if (hoverEvent) eventBus.emit(`UI:${hoverEvent}`, { hovered: false, annotationId });
        onMouseLeave?.();
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (action) eventBus.emit(`UI:${action}`, { annotationId });
          onClick?.();
        }
      }}
    >
      {children}
    </span>
  );
};

TextHighlight.displayName = "TextHighlight";
