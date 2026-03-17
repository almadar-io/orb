import * as React from "react";
import { cn } from "../../../lib/cn";
import { StatBadge, type StatBadgeProps } from "../../molecules/game/StatBadge";

export interface GameHudStat extends Omit<StatBadgeProps, "size"> {
  /** Data source entity name */
  source?: string;
  /** Field name in the source */
  field?: string;
}

/**
 * Schema-style HUD element definition.
 * Used when elements are passed from schema render_ui effects.
 */
export interface GameHudElement {
  type: string;
  bind?: string;
  position?: string;
  label?: string;
}

export interface GameHudProps {
  /** Position of the HUD */
  position?: "top" | "bottom" | "corners" | string;
  /** Stats to display - accepts readonly for compatibility with generated const arrays */
  stats?: readonly GameHudStat[];
  /** Alias for stats (schema compatibility) */
  items?: readonly GameHudStat[];
  /**
   * Schema-style elements array (alternative to stats).
   * Converted to stats internally for backwards compatibility.
   */
  elements?: readonly GameHudElement[];
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Additional CSS classes */
  className?: string;
  /** Whether to use a semi-transparent background */
  transparent?: boolean;
}

const positionMap: Record<string, string> = {
  top: "top-0 left-0 right-0 flex justify-between items-start p-4",
  bottom: "bottom-0 left-0 right-0 flex justify-between items-end p-4",
  corners: "inset-0 pointer-events-none",
};

/**
 * Convert schema-style elements to GameHudStat format.
 */
function convertElementsToStats(
  elements: readonly GameHudElement[],
): GameHudStat[] {
  return elements.map((el) => {
    // Parse bind format: "entity.field" -> source + field
    const [source, field] = el.bind?.split(".") ?? [];

    // Map element type to stat label
    const labelMap: Record<string, string> = {
      "health-bar": "Health",
      "score-display": "Score",
      lives: "Lives",
      timer: "Time",
    };

    return {
      label: el.label || labelMap[el.type] || el.type,
      source,
      field,
    };
  });
}

export function GameHud({
  position: propPosition,
  stats: propStats,
  items,
  elements,
  size = "md",
  className,
  transparent = true,
}: GameHudProps) {
  // Convert elements to stats if provided, with items as alias for stats
  const stats =
    propStats ?? items ?? (elements ? convertElementsToStats(elements) : []);

  // Determine position from props or derive from elements
  const position = propPosition ?? "corners";

  if (position === "corners") {
    // Split stats between corners
    const leftStats = stats.slice(0, Math.ceil(stats.length / 2));
    const rightStats = stats.slice(Math.ceil(stats.length / 2));

    return (
      <div className={cn("absolute", positionMap[position], className)}>
        {/* Top-left */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-auto">
          {leftStats.map((stat, i) => (
            <StatBadge key={i} {...stat} size={size} />
          ))}
        </div>

        {/* Top-right */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 items-end pointer-events-auto">
          {rightStats.map((stat, i) => (
            <StatBadge key={i} {...stat} size={size} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "absolute z-10",
        positionMap[position],
        transparent && "bg-gradient-to-b from-black/50 to-transparent",
        position === "bottom" &&
          "bg-gradient-to-t from-black/50 to-transparent",
        className,
      )}
    >
      <div className="flex gap-4">
        {stats.map((stat, i) => (
          <StatBadge key={i} {...stat} size={size} />
        ))}
      </div>
    </div>
  );
}

GameHud.displayName = "GameHud";
