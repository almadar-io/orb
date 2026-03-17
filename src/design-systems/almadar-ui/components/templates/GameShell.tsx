/**
 * GameShell
 *
 * A full-screen layout wrapper for game applications.
 * Replaces DashboardLayout for game clients — no sidebar nav, just full-viewport
 * rendering with an optional HUD overlay bar.
 *
 * Used as a React Router layout route element:
 *   <Route element={<GameShell appName="TraitWars" />}>
 *     <Route index element={<WorldMapPage />} />
 *     ...
 *   </Route>
 *
 * @generated pattern — can be customised per-game via props
 */

import React from "react";
import { Outlet } from "react-router-dom";
import { cn } from "../../lib/cn";
import { Box } from "../atoms/Box";
import { HStack } from "../atoms/Stack";
import { Typography } from "../atoms/Typography";

export interface GameShellProps {
    /** Application / game title shown in the HUD bar */
    appName?: string;
    /** Optional HUD content rendered above the main area */
    hud?: React.ReactNode;
    /** Extra class name on the root container */
    className?: string;
    /** Whether to show the minimal top bar (default: true) */
    showTopBar?: boolean;
}

/**
 * Full-viewport game shell layout.
 *
 * Renders child routes via `<Outlet />` inside a full-height flex container.
 * An optional top bar shows the game title and can host HUD widgets.
 */
export const GameShell: React.FC<GameShellProps> = ({
    appName = "Game",
    hud,
    className,
    showTopBar = true,
}) => {
    return (
        <Box
            display="flex"
            className={cn(
                "game-shell",
                "flex-col w-full h-screen overflow-hidden",
                className
            )}
            style={{
                width: "100vw",
                height: "100vh",
                overflow: "hidden",
                background: "var(--color-background, #0a0a0f)",
                color: "var(--color-text, #e0e0e0)",
            }}
        >
            {/* Minimal top bar */}
            {showTopBar && (
                <HStack
                    align="center"
                    justify="between"
                    className="game-shell__header"
                    style={{
                        padding: "0.5rem 1rem",
                        borderBottom: "1px solid var(--color-border, #2a2a3a)",
                        background: "var(--color-surface, #12121f)",
                        flexShrink: 0,
                    }}
                >
                    <Typography
                        variant="h6"
                        style={{
                            fontWeight: 700,
                            letterSpacing: "0.02em",
                        }}
                    >
                        {appName}
                    </Typography>
                    {hud && <Box className="game-shell__hud">{hud}</Box>}
                </HStack>
            )}

            {/* Main game area — child routes render here */}
            <Box
                className="game-shell__content"
                style={{
                    flex: 1,
                    overflow: "hidden",
                    position: "relative",
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
};

GameShell.displayName = "GameShell";
