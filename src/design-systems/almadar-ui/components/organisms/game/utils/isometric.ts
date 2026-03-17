/**
 * Isometric Coordinate Utilities
 *
 * Pure functions for 2:1 diamond isometric coordinate conversion.
 * No React dependencies — usable in any context.
 *
 * @packageDocumentation
 */

// =============================================================================
// Constants
// =============================================================================

/** Base tile width in pixels (before scale) */
export const TILE_WIDTH = 256;

/** Base tile height in pixels (before scale) — full sprite image height (Kenney 256×512) */
export const TILE_HEIGHT = 512;

/** Floor diamond height — the "walkable surface" portion of the tile (TILE_WIDTH / 2 for 2:1 ratio) */
export const FLOOR_HEIGHT = 128;

/**
 * Measured Y offset from sprite top to the diamond top vertex within a Kenney
 * 256×512 tile sprite.  The code previously assumed `TILE_HEIGHT - FLOOR_HEIGHT = 384`,
 * but the actual diamond (dirt_E.png) begins at y = 374 because the 3D side walls
 * occupy 10 extra pixels above the pure 128 px diamond.
 *
 * Use `DIAMOND_TOP_Y * scale` for highlight positioning, unit groundY, feature
 * placement, and hit-testing — NOT `(TILE_HEIGHT - FLOOR_HEIGHT) * scale`.
 * `FLOOR_HEIGHT` remains 128 for the isoToScreen spacing formula (2:1 ratio).
 */
export const DIAMOND_TOP_Y = 374;

/**
 * Feature type → fallback color mapping (when sprites not loaded).
 */
export const FEATURE_COLORS: Record<string, string> = {
    goldMine: '#fbbf24',
    resonanceCrystal: '#a78bfa',
    traitCache: '#60a5fa',
    salvageYard: '#6b7280',
    portal: '#c084fc',
    castle: '#f59e0b',
    mountain: '#78716c',
    default: '#9ca3af',
};

// =============================================================================
// Coordinate Conversion
// =============================================================================

/**
 * Convert tile grid coordinates to screen pixel coordinates.
 *
 * Uses 2:1 diamond isometric projection:
 * - X increases to the lower-right
 * - Y increases to the lower-left
 *
 * @param tileX - Grid X coordinate
 * @param tileY - Grid Y coordinate
 * @param scale - Render scale factor
 * @param baseOffsetX - Horizontal offset to center the grid
 * @returns Screen position { x, y } of the tile's top-left corner
 */
export function isoToScreen(
    tileX: number,
    tileY: number,
    scale: number,
    baseOffsetX: number,
): { x: number; y: number } {
    const scaledTileWidth = TILE_WIDTH * scale;
    const scaledFloorHeight = FLOOR_HEIGHT * scale;

    const screenX = (tileX - tileY) * (scaledTileWidth / 2) + baseOffsetX;
    const screenY = (tileX + tileY) * (scaledFloorHeight / 2);

    return { x: screenX, y: screenY };
}

/**
 * Convert screen pixel coordinates back to tile grid coordinates.
 *
 * Inverse of isoToScreen. Snaps to nearest integer tile position.
 *
 * @param screenX - Screen X in pixels
 * @param screenY - Screen Y in pixels
 * @param scale - Render scale factor
 * @param baseOffsetX - Horizontal offset used in isoToScreen
 * @returns Snapped grid position { x, y }
 */
export function screenToIso(
    screenX: number,
    screenY: number,
    scale: number,
    baseOffsetX: number,
): { x: number; y: number } {
    const scaledTileWidth = TILE_WIDTH * scale;
    const scaledFloorHeight = FLOOR_HEIGHT * scale;

    const adjustedX = screenX - baseOffsetX;

    const tileX = (adjustedX / (scaledTileWidth / 2) + screenY / (scaledFloorHeight / 2)) / 2;
    const tileY = (screenY / (scaledFloorHeight / 2) - adjustedX / (scaledTileWidth / 2)) / 2;

    return { x: Math.round(tileX), y: Math.round(tileY) };
}
