'use client';
import * as React from "react";
import { cn } from "../../../lib/cn";
import {
  useEventBus,
  type EventBusContextType,
} from "../../../hooks/useEventBus";

export interface MenuOption {
  /** Optional ID (generated from index if not provided) */
  id?: string;
  /** Display label */
  label: string;
  /** Event to emit on click */
  event?: string;
  /** Page to navigate to */
  navigatesTo?: string;
  /** Button variant */
  variant?: "primary" | "secondary" | "ghost" | string;
  /** Whether the option is disabled */
  disabled?: boolean;
  /** Sub-label or description */
  subLabel?: string;
  /** Action identifier (alternative to event) */
  action?: string;
}

export interface GameMenuProps {
  /** Menu title */
  title: string;
  /** Optional subtitle or version */
  subtitle?: string;
  /** Menu options - accepts readonly for compatibility with generated const arrays */
  options?: readonly MenuOption[];
  /** Alias for options (schema compatibility) */
  menuItems?: readonly MenuOption[];
  /** Called when an option is selected (legacy callback, prefer event bus) */
  onSelect?: (option: MenuOption) => void;
  /** Event bus for emitting UI events (optional, uses hook if not provided) */
  eventBus?: EventBusContextType;
  /** Background image or gradient */
  background?: string;
  /** Logo image URL */
  logo?: string;
  /** Additional CSS classes */
  className?: string;
}

const variantMap = {
  primary:
    "bg-blue-600 hover:bg-blue-500 text-white border-blue-400 shadow-lg shadow-blue-500/25",
  secondary: "bg-gray-700 hover:bg-gray-600 text-white border-gray-500",
  ghost: "bg-transparent hover:bg-white/10 text-white border-white/20",
};

export function GameMenu({
  title,
  subtitle,
  options,
  menuItems,
  onSelect,
  eventBus: eventBusProp,
  background,
  logo,
  className,
}: GameMenuProps) {
  // Resolve alias: menuItems → options
  const resolvedOptions = options ?? menuItems ?? [];

  // Use provided eventBus or get from context (with fallback for outside provider)
  let eventBusFromHook: EventBusContextType | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    eventBusFromHook = useEventBus();
  } catch {
    // Outside EventBusProvider context - will use prop or skip emission
  }
  const eventBus = eventBusProp || eventBusFromHook;

  const handleOptionClick = React.useCallback(
    (option: MenuOption) => {
      // Emit event to event bus for closed circuit pattern
      if (option.event && eventBus) {
        eventBus.emit(`UI:${option.event}`, { option });
      }

      // Call legacy callback if provided
      if (onSelect) {
        onSelect(option);
      }

      // Handle navigation if navigatesTo is specified
      if (option.navigatesTo && eventBus) {
        eventBus.emit('UI:NAVIGATE', { url: option.navigatesTo, option });
      }
    },
    [eventBus, onSelect],
  );

  return (
    <div
      className={cn(
        "min-h-screen w-full flex flex-col items-center justify-center p-8",
        className,
      )}
      style={{
        background:
          background ??
          "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0e17 100%)",
      }}
    >
      {/* Logo/Title Section */}
      <div className="text-center mb-12 animate-fade-in">
        {logo && (
          <img
            src={logo}
            alt={title}
            className="h-24 w-auto mx-auto mb-6 drop-shadow-2xl"
          />
        )}
        <h1
          className="text-5xl md:text-7xl font-bold text-white tracking-tight"
          style={{
            textShadow: "0 4px 12px rgba(0,0,0,0.5)",
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-lg text-gray-400 tracking-widest uppercase">
            {subtitle}
          </p>
        )}
      </div>

      {/* Menu Options */}
      <div className="flex flex-col gap-4 w-full max-w-md">
        {resolvedOptions.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionClick(option)}
            disabled={option.disabled}
            className={cn(
              "w-full py-4 px-8 rounded-xl border-2 font-bold text-lg",
              "transition-all duration-200 transform",
              "hover:scale-105 active:scale-95",
              "focus:outline-none focus:ring-4 focus:ring-white/25",
              variantMap[
                (option.variant ?? "secondary") as keyof typeof variantMap
              ] ?? variantMap.secondary,
              option.disabled &&
                "opacity-50 cursor-not-allowed hover:scale-100",
            )}
            style={{
              animationDelay: `${index * 100}ms`,
            }}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>
    </div>
  );
}

GameMenu.displayName = "GameMenu";
