'use client';
/**
 * SplitPane Component
 *
 * Two-pane resizable split layout for master-detail views,
 * dual-pane editors, and code + preview layouts.
 *
 * Uses wireframe theme styling (high contrast, sharp edges).
 */
import React, { useState, useRef, useCallback } from "react";
import { cn } from "../../../lib/cn";

export interface SplitPaneProps {
  /** Direction of the split */
  direction?: "horizontal" | "vertical";
  /** Initial ratio (0-100, percentage of first pane) */
  ratio?: number;
  /** Minimum size of either pane in pixels */
  minSize?: number;
  /** Allow user resizing */
  resizable?: boolean;
  /** Content for the left/top pane */
  left: React.ReactNode;
  /** Content for the right/bottom pane */
  right: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Class for left/top pane */
  leftClassName?: string;
  /** Class for right/bottom pane */
  rightClassName?: string;
}

/**
 * SplitPane - Two-pane resizable layout
 */
export const SplitPane: React.FC<SplitPaneProps> = ({
  direction = "horizontal",
  ratio: initialRatio = 50,
  minSize = 100,
  resizable = true,
  left,
  right,
  className,
  leftClassName,
  rightClassName,
}) => {
  const [ratio, setRatio] = useState(initialRatio);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!resizable) return;
      e.preventDefault();
      isDragging.current = true;

      const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging.current || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        let newRatio: number;

        if (direction === "horizontal") {
          const x = e.clientX - rect.left;
          newRatio = (x / rect.width) * 100;
        } else {
          const y = e.clientY - rect.top;
          newRatio = (y / rect.height) * 100;
        }

        // Clamp to min/max based on minSize
        const minRatio =
          (minSize / (direction === "horizontal" ? rect.width : rect.height)) *
          100;
        const maxRatio = 100 - minRatio;
        newRatio = Math.max(minRatio, Math.min(maxRatio, newRatio));

        setRatio(newRatio);
      };

      const handleMouseUp = () => {
        isDragging.current = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [direction, minSize, resizable],
  );

  const isHorizontal = direction === "horizontal";

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex w-full h-full",
        isHorizontal ? "flex-row" : "flex-col",
        className,
      )}
    >
      {/* Left/Top pane */}
      <div
        className={cn("overflow-auto", leftClassName)}
        style={{
          [isHorizontal ? "width" : "height"]: `${ratio}%`,
          flexShrink: 0,
        }}
      >
        {left}
      </div>

      {/* Resize handle */}
      {resizable && (
        <div
          onMouseDown={handleMouseDown}
          className={cn(
            "flex-shrink-0 bg-[var(--color-border)] transition-colors",
            isHorizontal
              ? "w-1 cursor-col-resize hover:w-1.5 hover:bg-[var(--color-muted-foreground)]"
              : "h-1 cursor-row-resize hover:h-1.5 hover:bg-[var(--color-muted-foreground)]",
          )}
        />
      )}

      {/* Right/Bottom pane */}
      <div className={cn("flex-1 overflow-auto", rightClassName)}>{right}</div>
    </div>
  );
};

SplitPane.displayName = "SplitPane";

export default SplitPane;
