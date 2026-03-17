/**
 * Sprite Sheet Constants
 *
 * Standard layout for 8-column × 5-row character sprite sheets.
 * All characters share identical sheet geometry.
 *
 * @packageDocumentation
 */

import type { AnimationDef, AnimationName } from '../types/spriteAnimation';

/** Number of columns in a sprite sheet (frames per row) */
export const SHEET_COLUMNS = 8;

/**
 * Standard sprite sheet row layout.
 * Row 0 = idle, Row 1 = walk, Row 2 = attack, Row 3 = hit, Row 4 = death.
 */
export const SPRITE_SHEET_LAYOUT: Record<AnimationName, AnimationDef> = {
    idle: { row: 0, frames: 4, frameRate: 6, loop: true },
    walk: { row: 1, frames: 8, frameRate: 10, loop: true },
    attack: { row: 2, frames: 6, frameRate: 12, loop: false },
    hit: { row: 3, frames: 3, frameRate: 8, loop: false },
    death: { row: 4, frames: 6, frameRate: 8, loop: false },
};
