'use client';
/**
 * ThemeSelector - Design theme selector component
 *
 * A dropdown/toggle component for switching between design themes.
 *
 * @packageDocumentation
 */

import React from "react";
import { useTheme } from "../../context/ThemeContext";

interface ThemeSelectorProps {
  /** Optional className */
  className?: string;
  /** Show as dropdown or buttons */
  variant?: "dropdown" | "buttons";
  /** Show labels */
  showLabels?: boolean;
}

const THEME_LABELS: Record<
  string,
  { label: string; description: string }
> = {
  wireframe: {
    label: "Wireframe",
    description: "Sharp corners, thick borders, brutalist",
  },
  minimalist: {
    label: "Minimalist",
    description: "Clean, subtle, refined",
  },
  almadar: {
    label: "Almadar",
    description: "Teal gradients, glowing accents",
  },
  "trait-wars": {
    label: "Trait Wars",
    description: "Gold parchment, game manuscript",
  },
  ocean: {
    label: "Ocean",
    description: "Deep sea calm, ocean blues",
  },
  forest: {
    label: "Forest",
    description: "Woodland serenity, earthy greens",
  },
  sunset: {
    label: "Sunset",
    description: "Golden hour, warm coral and amber",
  },
  lavender: {
    label: "Lavender",
    description: "Creative studio, soft violet",
  },
  rose: {
    label: "Rose",
    description: "Elegant bloom, warm pink",
  },
  slate: {
    label: "Slate",
    description: "Corporate edge, cool gray",
  },
  ember: {
    label: "Ember",
    description: "Fire and energy, bold red",
  },
  midnight: {
    label: "Midnight",
    description: "Noir elegance, deep indigo",
  },
  sand: {
    label: "Sand",
    description: "Desert minimal, warm earth",
  },
  neon: {
    label: "Neon",
    description: "Cyberpunk, glowing cyan and pink",
  },
  arctic: {
    label: "Arctic",
    description: "Ice crystal, cool blue",
  },
  copper: {
    label: "Copper",
    description: "Warm industrial, metallic bronze",
  },
};

function getThemeLabel(name: string) {
  return THEME_LABELS[name] || { label: name, description: name };
}

/**
 * ThemeSelector component for switching design themes
 */
export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  className = "",
  variant = "dropdown",
  showLabels = true,
}) => {
  const { theme, setTheme, availableThemes } = useTheme();

  if (variant === "buttons") {
    return (
      <div className={`flex gap-2 flex-wrap ${className}`}>
        {availableThemes.map((t) => {
          const { label } = getThemeLabel(t.name);
          const isActive = theme === t.name;

          return (
            <button
              key={t.name}
              onClick={() => setTheme(t.name)}
              className={`
                px-3 py-2 text-sm font-medium transition-all
                border-[length:var(--border-width)] rounded-[var(--radius-sm)]
                ${
                  isActive
                    ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] border-[var(--color-primary)]"
                    : "bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)] border-[var(--color-border)] hover:bg-[var(--color-secondary-hover)]"
                }
              `}
              title={getThemeLabel(t.name).description}
            >
              {showLabels && label}
            </button>
          );
        })}
      </div>
    );
  }

  // Dropdown variant
  return (
    <div className={`relative ${className}`}>
      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        className={`
          px-3 py-2 pr-8 text-sm font-medium
          bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)]
          border-[length:var(--border-width)] border-[var(--color-border)]
          rounded-[var(--radius-sm)]
          cursor-pointer appearance-none
          focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]
        `}
      >
        {availableThemes.map((t) => {
          const { label } = getThemeLabel(t.name);
          return (
            <option key={t.name} value={t.name}>
              {label}
            </option>
          );
        })}
      </select>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
};

export default ThemeSelector;
