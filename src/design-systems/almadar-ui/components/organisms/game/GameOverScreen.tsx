'use client';
import * as React from "react";
import { cn } from "../../../lib/cn";
import { StatBadge } from "../../molecules/game/StatBadge";
import {
  useEventBus,
  type EventBusContextType,
} from "../../../hooks/useEventBus";

export interface GameOverStat {
  /** Stat label */
  label: string;
  /** Stat value (required if bind is not provided) */
  value?: number | string;
  /**
   * Schema-style data binding (e.g., "player.score").
   * Alternative to value - used when stats come from schema render_ui effects.
   * Component will display 0 as placeholder since runtime binding is not implemented.
   */
  bind?: string;
  /** Display format */
  format?: "number" | "time" | "text";
  /** Icon */
  icon?: React.ReactNode;
}

export interface GameOverAction {
  /** Display label */
  label: string;
  /** Event to emit on click */
  event?: string;
  /** Page to navigate to */
  navigatesTo?: string;
  /** Button variant */
  variant?: "primary" | "secondary" | "ghost";
}

export interface GameOverScreenProps {
  /** Screen title (e.g., "Game Over", "Victory!") */
  title: string;
  /** Optional message */
  message?: string;
  /** Stats to display */
  stats?: GameOverStat[];
  /** Action buttons */
  actions?: GameOverAction[];
  /** Alias for actions (schema compatibility) */
  menuItems?: GameOverAction[];
  /** Called when an action is selected (legacy callback, prefer event bus) */
  onAction?: (action: GameOverAction) => void;
  /** Event bus for emitting UI events (optional, uses hook if not provided) */
  eventBus?: EventBusContextType;
  /** Victory or defeat variant */
  variant?: "victory" | "defeat" | "neutral";
  /** High score (optional, shows "NEW HIGH SCORE!" if exceeded) */
  highScore?: number | string;
  /** Current score for high score comparison (accepts string for schema bindings) */
  currentScore?: number | string;
  /** Additional CSS classes */
  className?: string;
}

const variantColors = {
  victory: {
    bg: "from-green-900/90 to-emerald-950/90",
    title: "text-green-400",
    accent: "border-green-500",
  },
  defeat: {
    bg: "from-red-900/90 to-gray-950/90",
    title: "text-red-400",
    accent: "border-red-500",
  },
  neutral: {
    bg: "from-gray-900/90 to-gray-950/90",
    title: "text-white",
    accent: "border-gray-500",
  },
};

const buttonVariants = {
  primary: "bg-blue-600 hover:bg-blue-500 text-white border-blue-400",
  secondary: "bg-gray-700 hover:bg-gray-600 text-white border-gray-500",
  ghost: "bg-transparent hover:bg-white/10 text-white border-white/20",
};

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function GameOverScreen({
  title,
  message,
  stats = [],
  actions,
  menuItems,
  onAction,
  eventBus: eventBusProp,
  variant = "neutral",
  highScore,
  currentScore,
  className,
}: GameOverScreenProps) {
  // Resolve alias: menuItems → actions
  const resolvedActions = actions ?? menuItems ?? [];
  // Use provided eventBus or get from context (with fallback for outside provider)
  let eventBusFromHook: EventBusContextType | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    eventBusFromHook = useEventBus();
  } catch {
    // Outside EventBusProvider context - will use prop or skip emission
  }
  const eventBus = eventBusProp || eventBusFromHook;

  const handleActionClick = React.useCallback(
    (action: GameOverAction) => {
      // Emit event to event bus for closed circuit pattern
      if (action.event && eventBus) {
        eventBus.emit(`UI:${action.event}`, { action });
      }

      // Call legacy callback if provided
      if (onAction) {
        onAction(action);
      }
    },
    [eventBus, onAction],
  );

  const colors = variantColors[variant];
  // Convert string scores to numbers for comparison
  const numericCurrentScore =
    typeof currentScore === "string" ? parseFloat(currentScore) : currentScore;
  const numericHighScore =
    typeof highScore === "string" ? parseFloat(highScore) : highScore;
  const isNewHighScore =
    numericHighScore !== undefined &&
    numericCurrentScore !== undefined &&
    !isNaN(numericCurrentScore) &&
    !isNaN(numericHighScore) &&
    numericCurrentScore > numericHighScore;

  return (
    <div
      className={cn(
        "min-h-screen w-full flex flex-col items-center justify-center p-8",
        "bg-gradient-to-b",
        colors.bg,
        className,
      )}
    >
      {/* Victory/Defeat Animation */}
      {variant === "victory" && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.2),transparent_70%)]" />
        </div>
      )}

      {/* Title */}
      <h1
        className={cn(
          "text-6xl md:text-8xl font-bold mb-4 tracking-tight animate-bounce-once",
          colors.title,
        )}
        style={{ textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}
      >
        {title}
      </h1>

      {/* Message */}
      {message && (
        <p className="text-xl text-gray-300 mb-8 text-center max-w-md">
          {message}
        </p>
      )}

      {/* New High Score Banner */}
      {isNewHighScore && (
        <div className="mb-6 px-6 py-2 bg-yellow-500/20 border-2 border-yellow-500 rounded-full animate-pulse">
          <span className="text-yellow-400 font-bold text-lg tracking-wide">
            🏆 NEW HIGH SCORE! 🏆
          </span>
        </div>
      )}

      {/* Stats */}
      {stats.length > 0 && (
        <div
          className={cn(
            "mb-8 p-6 rounded-xl border-2 bg-black/30",
            colors.accent,
          )}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {stats.map((stat, index) => {
              // Use value if provided, or show placeholder for bind (runtime binding not implemented)
              let displayValue: string | number = stat.value ?? 0;
              if (stat.format === "time" && typeof displayValue === "number") {
                displayValue = formatTime(displayValue);
              }

              return (
                <div key={index} className="text-center">
                  <div className="text-gray-400 text-sm mb-1">{stat.label}</div>
                  <div className="text-white text-2xl font-bold flex items-center justify-center gap-2">
                    {stat.icon && <span>{stat.icon}</span>}
                    <span className="tabular-nums">{displayValue}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        {resolvedActions.map((action, index) => (
          <button
            key={index}
            onClick={() => handleActionClick(action)}
            className={cn(
              "px-8 py-4 rounded-xl border-2 font-bold text-lg",
              "transition-all duration-200",
              "hover:scale-105 active:scale-95",
              "focus:outline-none focus:ring-4 focus:ring-white/25",
              buttonVariants[action.variant ?? "secondary"],
            )}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}

GameOverScreen.displayName = "GameOverScreen";
