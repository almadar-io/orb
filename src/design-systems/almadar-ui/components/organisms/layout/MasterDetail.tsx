/**
 * MasterDetail Component
 *
 * Classic master-detail pattern with a list on the left
 * and selected item detail on the right.
 *
 * Uses wireframe theme styling (high contrast, sharp edges).
 */
import React from "react";
import { cn } from "../../../lib/cn";
import { Typography } from "../../atoms/Typography";
import { SplitPane } from "./SplitPane";

export interface MasterDetailProps {
  /** Master panel content (usually a list) */
  master: React.ReactNode;
  /** Detail panel content */
  detail: React.ReactNode;
  /** Content shown when nothing is selected */
  emptyDetail?: React.ReactNode;
  /** Whether an item is currently selected */
  hasSelection?: boolean;
  /** Width of master panel (e.g., '350px', '30%') */
  masterWidth?: string;
  /** Additional CSS classes */
  className?: string;
  /** Class for master pane */
  masterClassName?: string;
  /** Class for detail pane */
  detailClassName?: string;
}

/**
 * Default empty state for detail panel
 */
const DefaultEmptyDetail: React.FC = () => (
  <div className="flex items-center justify-center h-full border-2 border-dashed border-[var(--color-border)]">
    <Typography
      variant="body2"
      className="text-[var(--color-muted-foreground)]"
    >
      Select an item to view details
    </Typography>
  </div>
);

/**
 * MasterDetail - List + detail split layout
 */
export const MasterDetail: React.FC<MasterDetailProps> = ({
  master,
  detail,
  emptyDetail,
  hasSelection = false,
  masterWidth = "350px",
  className,
  masterClassName,
  detailClassName,
}) => {
  // Calculate ratio from masterWidth if it's a percentage
  const ratio = masterWidth.endsWith("%") ? parseInt(masterWidth, 10) : 30; // Default to 30% if pixel value

  return (
    <div
      className={cn("flex h-full w-full", className)}
      style={{
        display: "grid",
        gridTemplateColumns: masterWidth.endsWith("%")
          ? `${masterWidth} 1fr`
          : `${masterWidth} 1fr`,
      }}
    >
      {/* Master panel */}
      <div
        className={cn(
          "border-r-2 border-[var(--color-border)] overflow-auto",
          masterClassName,
        )}
      >
        {master}
      </div>

      {/* Detail panel */}
      <div className={cn("overflow-auto", detailClassName)}>
        {hasSelection ? detail : emptyDetail || <DefaultEmptyDetail />}
      </div>
    </div>
  );
};

MasterDetail.displayName = "MasterDetail";

export default MasterDetail;
