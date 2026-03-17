/**
 * DashboardGrid Component
 *
 * Multi-column grid for widgets and stats cards.
 * Supports cell spanning for flexible dashboard layouts.
 *
 * Uses wireframe theme styling (high contrast, sharp edges).
 */
import React from "react";
import { cn } from "../../../lib/cn";

export interface DashboardGridCell {
  /** Unique cell ID */
  id: string;
  /** Content to render in the cell */
  content: React.ReactNode;
  /** Number of columns this cell spans (1-4) */
  colSpan?: 1 | 2 | 3 | 4;
  /** Number of rows this cell spans (1-2) */
  rowSpan?: 1 | 2;
}

export interface DashboardGridProps {
  /** Number of columns */
  columns?: 2 | 3 | 4;
  /** Gap between cells */
  gap?: "sm" | "md" | "lg";
  /** Cell definitions */
  cells: DashboardGridCell[];
  /** Additional CSS classes */
  className?: string;
}

const gapStyles = {
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
};

const columnStyles = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
};

const colSpanStyles = {
  1: "col-span-1",
  2: "col-span-2",
  3: "col-span-3",
  4: "col-span-4",
};

const rowSpanStyles = {
  1: "row-span-1",
  2: "row-span-2",
};

/**
 * DashboardGrid - Multi-column widget grid
 */
export const DashboardGrid: React.FC<DashboardGridProps> = ({
  columns = 3,
  gap = "md",
  cells,
  className,
}) => {
  return (
    <div
      className={cn(
        "grid w-full",
        columnStyles[columns],
        gapStyles[gap],
        className,
      )}
    >
      {cells.map((cell) => (
        <div
          key={cell.id}
          className={cn(
            "border-2 border-[var(--color-border)] bg-[var(--color-card)]",
            colSpanStyles[cell.colSpan || 1],
            rowSpanStyles[cell.rowSpan || 1],
          )}
        >
          {cell.content}
        </div>
      ))}
    </div>
  );
};

DashboardGrid.displayName = "DashboardGrid";

export default DashboardGrid;
