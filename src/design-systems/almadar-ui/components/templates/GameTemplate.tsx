/**
 * GameTemplate
 *
 * A presentational template for game applications.
 * Includes a main game canvas/area, HUD overlay, and an optional debug sidebar.
 * **Atomic Design**: Composed using Box, Typography, and Layout molecules/atoms.
 */

import React from "react";
import { cn } from "../../lib/cn";
import { Box } from "../atoms/Box";
import { HStack } from "../atoms/Stack";
import { Typography } from "../atoms/Typography";
import { Button } from "../atoms/Button";
import { LucideIcon, Play, Pause, RotateCcw } from "lucide-react";
import type { TemplateProps } from "./types";

interface GameEntity {
  id: string;
  title?: string;
}

export interface GameTemplateProps extends TemplateProps<GameEntity> {
  /** Title of the game */
  title?: string;
  /** The main game canvas or content */
  children: React.ReactNode;
  /** HUD overlay content (scores, health, etc.) */
  hud?: React.ReactNode;
  /** Debug panel content */
  debugPanel?: React.ReactNode;
  /** Whether the debug panel is visible */
  showDebugPanel?: boolean;
  /** Game controls */
  controls?: {
    onPlay?: () => void;
    onPause?: () => void;
    onReset?: () => void;
    isPlaying?: boolean;
  };
  /** Additional class name */
  className?: string;
}

export const GameTemplate: React.FC<GameTemplateProps> = ({
  entity,
  title = "Game",
  children,
  hud,
  debugPanel,
  showDebugPanel = false,
  controls,
  className,
}) => {
  return (
    <Box
      display="flex"
      fullHeight
      className={cn("flex-col lg:flex-row", className)}
    >
      {/* Main Game Area */}
      <Box display="flex" className="flex-1 flex-col">
        {/* Header with title and controls */}
        <Box
          padding="md"
          border
          className="border-b-2 border-x-0 border-t-0 border-[var(--color-border)] flex items-center justify-between"
        >
          <Typography variant="h4">{title}</Typography>

          {controls && (
            <HStack gap="sm" align="center">
              {controls.isPlaying ? (
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Pause}
                  onClick={controls.onPause}
                >
                  Pause
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  icon={Play}
                  onClick={controls.onPlay}
                >
                  Play
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                icon={RotateCcw}
                onClick={controls.onReset}
              >
                Reset
              </Button>
            </HStack>
          )}
        </Box>

        {/* Game Canvas Area */}
        <Box
          position="relative"
          fullWidth
          className="flex-1 bg-[var(--color-muted)]"
        >
          {/* Main game content */}
          {children}

          {/* HUD Overlay */}
          {hud && (
            <Box
              position="absolute"
              className="top-0 left-0 right-0 pointer-events-none"
            >
              <Box padding="md" className="pointer-events-auto w-fit">
                {hud}
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* Debug Sidebar */}
      {showDebugPanel && debugPanel && (
        <Box
          bg="surface"
          border
          shadow="sm"
          overflow="auto"
          className="w-full lg:w-80 lg:border-l-2 lg:border-t-0 border-t-2 border-[var(--color-border)]"
        >
          <Box
            padding="md"
            border
            className="border-b-2 border-x-0 border-t-0 border-[var(--color-border)]"
          >
            <Typography variant="h6">Debug Panel</Typography>
          </Box>
          <Box padding="md">{debugPanel}</Box>
        </Box>
      )}
    </Box>
  );
};

GameTemplate.displayName = "GameTemplate";
