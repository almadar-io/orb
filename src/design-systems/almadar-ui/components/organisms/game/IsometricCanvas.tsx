'use client';
/**
 * IsometricCanvas
 *
 * Core isometric game renderer. Maps to the `game-canvas` pattern.
 * Adapted from projects/trait-wars/design-system/organisms/IsometricGameCanvas.tsx
 * with full closed-circuit pattern compliance (className, isLoading, error, entity).
 *
 * Architecture:
 * - 2:1 diamond isometric projection
 * - Painter's algorithm (tile → feature → unit depth sort)
 * - Camera pan/zoom with lerp
 * - Off-screen culling
 * - Minimap on separate canvas
 * - Sprite sheet animation via resolveUnitFrame
 * - Event bus–friendly handlers (onTileClick, onUnitClick, etc.)
 *
 * **State categories (closed-circuit compliant):**
 * - All game data (tiles, units, features, selection, validMoves) → received via props
 * - Rendering state (viewportSize, RAF, camera lerp, sprite cache) → local only
 * - Events → emitted via `useEventBus()` for trait integration
 *
 * This component is a **pure renderer** — it holds no game logic state.
 *
 * @packageDocumentation
 */

import * as React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '../../../lib/cn';
import { useEventBus } from '../../../hooks/useEventBus';
import { Box } from '../../atoms/Box';
import { LoadingState } from '../../molecules/LoadingState';
import { ErrorState } from '../../molecules/ErrorState';
import type { IsometricTile, IsometricUnit, IsometricFeature } from './types/isometric';
import type { ResolvedFrame } from './types/spriteAnimation';
import { useImageCache } from './hooks/useImageCache';
import { useCamera } from './hooks/useCamera';
import {
    isoToScreen,
    screenToIso,
    TILE_WIDTH,
    TILE_HEIGHT,
    FLOOR_HEIGHT,
    DIAMOND_TOP_Y,
    FEATURE_COLORS,
} from './utils/isometric';

// =============================================================================
// Props
// =============================================================================

export interface IsometricCanvasProps {
    // --- Closed-circuit props (MANDATORY) ---
    /** Additional CSS classes */
    className?: string;
    /** Loading state indicator */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Entity name for schema-driven auto-fetch */
    entity?: string;

    // --- Grid data ---
    /** Array of tiles to render */
    tiles?: IsometricTile[];
    /** Array of units on the board */
    units?: IsometricUnit[];
    /** Array of features (resources, portals, buildings, etc.) */
    features?: IsometricFeature[];

    // --- Interaction state ---
    /** Currently selected unit ID */
    selectedUnitId?: string | null;
    /** Valid move positions (shown as pulsing green highlights) */
    validMoves?: Array<{ x: number; y: number }>;
    /** Attack target positions (shown as pulsing red highlights) */
    attackTargets?: Array<{ x: number; y: number }>;
    /** Hovered tile position */
    hoveredTile?: { x: number; y: number } | null;

    // --- Event handlers ---
    /** Tile click handler */
    onTileClick?: (x: number, y: number) => void;
    /** Unit click handler */
    onUnitClick?: (unitId: string) => void;
    /** Tile hover handler */
    onTileHover?: (x: number, y: number) => void;
    /** Tile leave handler */
    onTileLeave?: () => void;

    // --- Declarative event props ---
    /** Declarative event: emits UI:{tileClickEvent} with { x, y } on tile click */
    tileClickEvent?: string;
    /** Declarative event: emits UI:{unitClickEvent} with { unitId } on unit click */
    unitClickEvent?: string;
    /** Declarative event: emits UI:{tileHoverEvent} with { x, y } on tile hover */
    tileHoverEvent?: string;
    /** Declarative event: emits UI:{tileLeaveEvent} with {} on tile leave */
    tileLeaveEvent?: string;

    // --- Rendering options ---
    /** Render scale (0.4 = 40% zoom) */
    scale?: number;
    /** Show debug grid lines and coordinates */
    debug?: boolean;
    /** Background image URL tiled behind the isometric grid */
    backgroundImage?: string;
    /** Toggle minimap overlay */
    showMinimap?: boolean;
    /** Enable camera pan/zoom controls */
    enableCamera?: boolean;
    /** Extra scale multiplier for unit draw size. 1 = default. */
    unitScale?: number;
    /** Override for the diamond-top Y offset within the tile sprite (default: 374).
     *  This controls where the flat diamond face sits vertically inside the tile image. */
    diamondTopY?: number;

    // --- Asset resolution (project-agnostic) ---
    /** Resolve terrain sprite URL from terrain key */
    getTerrainSprite?: (terrain: string) => string | undefined;
    /** Resolve feature sprite URL from feature type key */
    getFeatureSprite?: (featureType: string) => string | undefined;
    /** Resolve unit static sprite URL */
    getUnitSprite?: (unit: IsometricUnit) => string | undefined;
    /** Resolve animated sprite sheet frame for a unit */
    resolveUnitFrame?: (unitId: string) => ResolvedFrame | null;
    /** Additional sprite URLs to preload (e.g., effect sprites) */
    effectSpriteUrls?: string[];
    /** Callback to draw canvas effects after units */
    onDrawEffects?: (
        ctx: CanvasRenderingContext2D,
        animTime: number,
        getImage: (url: string) => HTMLImageElement | undefined,
    ) => void;
    /** Whether there are active effects — keeps RAF loop alive */
    hasActiveEffects?: boolean;

    // --- Remote asset loading ---
    /** Base URL for remote asset resolution. When set, manifest paths
     *  are prefixed with this URL. Example: "https://trait-wars-assets.web.app" */
    assetBaseUrl?: string;
    /** Manifest mapping entity keys to relative sprite paths.
     *  Combined with assetBaseUrl to produce full URLs.
     *  Used as a fallback when inline URLs and callbacks don't resolve. */
    assetManifest?: {
        terrains?: Record<string, string>;
        units?: Record<string, string>;
        features?: Record<string, string>;
        effects?: Record<string, string>;
    };
}

// =============================================================================
// Component
// =============================================================================

export function IsometricCanvas({
    // Closed-circuit
    className,
    isLoading = false,
    error = null,
    entity,
    // Grid data
    tiles: tilesProp = [],
    units = [],
    features = [],
    // Interaction state
    selectedUnitId = null,
    validMoves = [],
    attackTargets = [],
    hoveredTile = null,
    // Event handlers
    onTileClick,
    onUnitClick,
    onTileHover,
    onTileLeave,
    // Declarative event props
    tileClickEvent,
    unitClickEvent,
    tileHoverEvent,
    tileLeaveEvent,
    // Rendering options
    scale = 0.4,
    debug = false,
    backgroundImage,
    showMinimap = true,
    enableCamera = true,
    unitScale = 1,
    // Asset resolution
    getTerrainSprite,
    getFeatureSprite,
    getUnitSprite,
    resolveUnitFrame,
    effectSpriteUrls = [],
    onDrawEffects,
    hasActiveEffects = false,
    // Tuning
    diamondTopY: diamondTopYProp,
    // Remote asset loading
    assetBaseUrl,
    assetManifest,
}: IsometricCanvasProps): React.JSX.Element {
    const eventBus = useEventBus();

    // -- Refs --
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const minimapRef = useRef<HTMLCanvasElement>(null);
    const animTimeRef = useRef(0);
    const rafIdRef = useRef(0);

    // -- Viewport size --
    const [viewportSize, setViewportSize] = useState({ width: 800, height: 600 });

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        if (typeof ResizeObserver === 'undefined') return;
        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (entry) {
                setViewportSize({
                    width: entry.contentRect.width || 800,
                    height: entry.contentRect.height || 600,
                });
            }
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    // -- Tiles default sort (stable for painter's algorithm) --
    const sortedTiles = useMemo(() => {
        const tiles = [...tilesProp];
        tiles.sort((a, b) => {
            const depthA = a.x + a.y;
            const depthB = b.x + b.y;
            return depthA !== depthB ? depthA - depthB : a.y - b.y;
        });
        return tiles;
    }, [tilesProp]);

    // -- Grid dimensions --
    const gridWidth = useMemo(() => {
        if (sortedTiles.length === 0) return 0;
        return Math.max(...sortedTiles.map(t => t.x)) + 1;
    }, [sortedTiles]);

    const gridHeight = useMemo(() => {
        if (sortedTiles.length === 0) return 0;
        return Math.max(...sortedTiles.map(t => t.y)) + 1;
    }, [sortedTiles]);

    // -- Pre-computed scaled values --
    const scaledTileWidth = TILE_WIDTH * scale;
    const scaledTileHeight = TILE_HEIGHT * scale;
    const scaledFloorHeight = FLOOR_HEIGHT * scale;
    const effectiveDiamondTopY = diamondTopYProp ?? DIAMOND_TOP_Y;
    const scaledDiamondTopY = effectiveDiamondTopY * scale;

    const baseOffsetX = useMemo(() => {
        return (gridHeight - 1) * (scaledTileWidth / 2);
    }, [gridHeight, scaledTileWidth]);

    // -- Lookup sets for highlights --
    const validMoveSet = useMemo(() => {
        return new Set(validMoves.map(p => `${p.x},${p.y}`));
    }, [validMoves]);

    const attackTargetSet = useMemo(() => {
        return new Set(attackTargets.map(p => `${p.x},${p.y}`));
    }, [attackTargets]);

    // -- Helper: resolve a manifest path with optional base URL --
    const resolveManifestUrl = useCallback((relativePath: string | undefined): string | undefined => {
        if (!relativePath) return undefined;
        if (assetBaseUrl) return `${assetBaseUrl.replace(/\/$/, '')}${relativePath.startsWith('/') ? '' : '/'}${relativePath}`;
        return relativePath;
    }, [assetBaseUrl]);

    // -- Collect all sprite URLs for preloading --
    const spriteUrls = useMemo(() => {
        const urls: string[] = [];

        // Tile sprites
        for (const tile of sortedTiles) {
            if (tile.terrainSprite) urls.push(tile.terrainSprite);
            else if (getTerrainSprite) {
                const url = getTerrainSprite(tile.terrain ?? '');
                if (url) urls.push(url);
            } else {
                const url = resolveManifestUrl(assetManifest?.terrains?.[tile.terrain ?? '']);
                if (url) urls.push(url);
            }
        }

        // Feature sprites
        for (const feature of features) {
            if (feature.sprite) urls.push(feature.sprite);
            else if (getFeatureSprite) {
                const url = getFeatureSprite(feature.type);
                if (url) urls.push(url);
            } else {
                const url = resolveManifestUrl(assetManifest?.features?.[feature.type]);
                if (url) urls.push(url);
            }
        }

        // Unit sprites
        for (const unit of units) {
            if (unit.sprite) urls.push(unit.sprite);
            else if (getUnitSprite) {
                const url = getUnitSprite(unit);
                if (url) urls.push(url);
            } else if (unit.unitType) {
                const url = resolveManifestUrl(assetManifest?.units?.[unit.unitType]);
                if (url) urls.push(url);
            }
        }

        // Effect sprites from manifest
        if (assetManifest?.effects) {
            for (const path of Object.values(assetManifest.effects)) {
                const url = resolveManifestUrl(path);
                if (url) urls.push(url);
            }
        }

        // Effect sprites from explicit list
        urls.push(...effectSpriteUrls);

        // Background
        if (backgroundImage) urls.push(backgroundImage);

        // Deduplicate
        return [...new Set(urls.filter(Boolean))];
    }, [sortedTiles, features, units, getTerrainSprite, getFeatureSprite, getUnitSprite, effectSpriteUrls, backgroundImage, assetManifest, resolveManifestUrl]);

    const { getImage } = useImageCache(spriteUrls);

    // -- Camera --
    const {
        cameraRef,
        targetCameraRef,
        isDragging,
        dragDistance,
        handleMouseDown,
        handleMouseUp,
        handleMouseMove,
        handleMouseLeave,
        handleWheel,
        screenToWorld,
        lerpToTarget,
    } = useCamera();

    // -- Sprite resolvers --
    const resolveTerrainSpriteUrl = useCallback((tile: IsometricTile): string | undefined => {
        return tile.terrainSprite || getTerrainSprite?.(tile.terrain ?? '') || resolveManifestUrl(assetManifest?.terrains?.[tile.terrain ?? '']);
    }, [getTerrainSprite, assetManifest, resolveManifestUrl]);

    const resolveFeatureSpriteUrl = useCallback((featureType: string): string | undefined => {
        return getFeatureSprite?.(featureType) || resolveManifestUrl(assetManifest?.features?.[featureType]);
    }, [getFeatureSprite, assetManifest, resolveManifestUrl]);

    const resolveUnitSpriteUrl = useCallback((unit: IsometricUnit): string | undefined => {
        return unit.sprite || getUnitSprite?.(unit) || (unit.unitType ? resolveManifestUrl(assetManifest?.units?.[unit.unitType]) : undefined);
    }, [getUnitSprite, assetManifest, resolveManifestUrl]);

    // =========================================================================
    // Minimap
    // =========================================================================
    const drawMinimap = useCallback(() => {
        if (!showMinimap) return;
        const miniCanvas = minimapRef.current;
        if (!miniCanvas || sortedTiles.length === 0) return;

        const mCtx = miniCanvas.getContext('2d');
        if (!mCtx) return;

        const mW = 150;
        const mH = 100;
        miniCanvas.width = mW;
        miniCanvas.height = mH;

        mCtx.clearRect(0, 0, mW, mH);

        // Compute bounding box of all tiles in screen space
        const allScreenPos = sortedTiles.map(t => isoToScreen(t.x, t.y, scale, baseOffsetX));
        const minX = Math.min(...allScreenPos.map(p => p.x));
        const maxX = Math.max(...allScreenPos.map(p => p.x + scaledTileWidth));
        const minY = Math.min(...allScreenPos.map(p => p.y));
        const maxY = Math.max(...allScreenPos.map(p => p.y + scaledTileHeight));

        const worldW = maxX - minX;
        const worldH = maxY - minY;
        const scaleM = Math.min(mW / worldW, mH / worldH) * 0.9;
        const offsetMx = (mW - worldW * scaleM) / 2;
        const offsetMy = (mH - worldH * scaleM) / 2;

        // Draw tiles
        for (const tile of sortedTiles) {
            const pos = isoToScreen(tile.x, tile.y, scale, baseOffsetX);
            const mx = (pos.x - minX) * scaleM + offsetMx;
            const my = (pos.y - minY) * scaleM + offsetMy;
            const mTileW = scaledTileWidth * scaleM;
            const mFloorH = scaledFloorHeight * scaleM;

            mCtx.fillStyle = tile.terrain === 'water' ? '#3b82f6' :
                tile.terrain === 'mountain' ? '#78716c' : '#4ade80';
            mCtx.beginPath();
            mCtx.moveTo(mx + mTileW / 2, my);
            mCtx.lineTo(mx + mTileW, my + mFloorH / 2);
            mCtx.lineTo(mx + mTileW / 2, my + mFloorH);
            mCtx.lineTo(mx, my + mFloorH / 2);
            mCtx.closePath();
            mCtx.fill();
        }

        // Draw units as dots
        for (const unit of units) {
            if (!unit.position) continue;
            const pos = isoToScreen(unit.position.x, unit.position.y, scale, baseOffsetX);
            const mx = (pos.x + scaledTileWidth / 2 - minX) * scaleM + offsetMx;
            const my = (pos.y + scaledTileHeight / 2 - minY) * scaleM + offsetMy;
            mCtx.fillStyle = unit.team === 'player' ? '#60a5fa' :
                unit.team === 'enemy' ? '#f87171' : '#9ca3af';
            mCtx.beginPath();
            mCtx.arc(mx, my, 3, 0, Math.PI * 2);
            mCtx.fill();
        }

        // Draw viewport rectangle
        const cam = cameraRef.current;
        const vLeft = (cam.x - minX) * scaleM + offsetMx;
        const vTop = (cam.y - minY) * scaleM + offsetMy;
        const vW = viewportSize.width / cam.zoom * scaleM;
        const vH = viewportSize.height / cam.zoom * scaleM;
        mCtx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        mCtx.lineWidth = 1;
        mCtx.strokeRect(vLeft, vTop, vW, vH);
    }, [showMinimap, sortedTiles, units, scale, baseOffsetX, scaledTileWidth, scaledTileHeight, scaledFloorHeight, viewportSize, cameraRef]);

    // =========================================================================
    // Main draw function
    // =========================================================================
    const draw = useCallback((animTime: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = viewportSize.width * dpr;
        canvas.height = viewportSize.height * dpr;
        ctx.scale(dpr, dpr);

        // Clear
        ctx.clearRect(0, 0, viewportSize.width, viewportSize.height);

        // Background
        if (backgroundImage) {
            const bgImg = getImage(backgroundImage);
            if (bgImg) {
                const cam = cameraRef.current;
                const patW = bgImg.naturalWidth;
                const patH = bgImg.naturalHeight;
                const startX = -(cam.x % patW + patW) % patW;
                const startY = -(cam.y % patH + patH) % patH;
                for (let y = startY - patH; y < viewportSize.height; y += patH) {
                    for (let x = startX - patW; x < viewportSize.width; x += patW) {
                        ctx.drawImage(bgImg, x, y);
                    }
                }
            }
        } else {
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, viewportSize.width, viewportSize.height);
        }

        if (sortedTiles.length === 0) return;

        // Camera transform
        ctx.save();
        const cam = cameraRef.current;
        ctx.translate(viewportSize.width / 2, viewportSize.height / 2);
        ctx.scale(cam.zoom, cam.zoom);
        ctx.translate(-viewportSize.width / 2 - cam.x, -viewportSize.height / 2 - cam.y);

        // Visible region for culling
        const visLeft = cam.x - viewportSize.width / cam.zoom;
        const visRight = cam.x + viewportSize.width * 2 / cam.zoom;
        const visTop = cam.y - viewportSize.height / cam.zoom;
        const visBottom = cam.y + viewportSize.height * 2 / cam.zoom;

        // =========== TILES ===========
        for (const tile of sortedTiles) {
            const pos = isoToScreen(tile.x, tile.y, scale, baseOffsetX);

            // Off-screen culling
            if (pos.x + scaledTileWidth < visLeft || pos.x > visRight ||
                pos.y + scaledTileHeight < visTop || pos.y > visBottom) {
                continue;
            }

            const spriteUrl = resolveTerrainSpriteUrl(tile);
            const img = spriteUrl ? getImage(spriteUrl) : null;

            if (img) {
                ctx.drawImage(img, pos.x, pos.y, scaledTileWidth, scaledTileHeight);
            } else {
                // Fallback: draw colored diamond
                const centerX = pos.x + scaledTileWidth / 2;
                const topY = pos.y + scaledDiamondTopY;
                ctx.fillStyle = tile.terrain === 'water' ? '#3b82f6' :
                    tile.terrain === 'mountain' ? '#78716c' :
                        tile.terrain === 'stone' ? '#9ca3af' : '#4ade80';
                ctx.beginPath();
                ctx.moveTo(centerX, topY);
                ctx.lineTo(pos.x + scaledTileWidth, topY + scaledFloorHeight / 2);
                ctx.lineTo(centerX, topY + scaledFloorHeight);
                ctx.lineTo(pos.x, topY + scaledFloorHeight / 2);
                ctx.closePath();
                ctx.fill();

                ctx.strokeStyle = 'rgba(0,0,0,0.2)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            // Hover highlight
            if (hoveredTile && hoveredTile.x === tile.x && hoveredTile.y === tile.y) {
                const centerX = pos.x + scaledTileWidth / 2;
                const topY = pos.y + scaledDiamondTopY;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
                ctx.beginPath();
                ctx.moveTo(centerX, topY);
                ctx.lineTo(pos.x + scaledTileWidth, topY + scaledFloorHeight / 2);
                ctx.lineTo(centerX, topY + scaledFloorHeight);
                ctx.lineTo(pos.x, topY + scaledFloorHeight / 2);
                ctx.closePath();
                ctx.fill();
            }

            // Valid move highlight
            const tileKey = `${tile.x},${tile.y}`;
            if (validMoveSet.has(tileKey)) {
                const centerX = pos.x + scaledTileWidth / 2;
                const topY = pos.y + scaledDiamondTopY;
                const pulse = 0.15 + 0.1 * Math.sin(animTime * 0.004);
                ctx.fillStyle = `rgba(74, 222, 128, ${pulse})`;
                ctx.beginPath();
                ctx.moveTo(centerX, topY);
                ctx.lineTo(pos.x + scaledTileWidth, topY + scaledFloorHeight / 2);
                ctx.lineTo(centerX, topY + scaledFloorHeight);
                ctx.lineTo(pos.x, topY + scaledFloorHeight / 2);
                ctx.closePath();
                ctx.fill();
            }

            // Attack target highlight
            if (attackTargetSet.has(tileKey)) {
                const centerX = pos.x + scaledTileWidth / 2;
                const topY = pos.y + scaledDiamondTopY;
                const pulse = 0.2 + 0.15 * Math.sin(animTime * 0.005);
                ctx.fillStyle = `rgba(239, 68, 68, ${pulse})`;
                ctx.beginPath();
                ctx.moveTo(centerX, topY);
                ctx.lineTo(pos.x + scaledTileWidth, topY + scaledFloorHeight / 2);
                ctx.lineTo(centerX, topY + scaledFloorHeight);
                ctx.lineTo(pos.x, topY + scaledFloorHeight / 2);
                ctx.closePath();
                ctx.fill();
            }

            // Debug coordinates
            if (debug) {
                const centerX = pos.x + scaledTileWidth / 2;
                const centerY = pos.y + scaledFloorHeight / 2 + scaledDiamondTopY;
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.font = `${12 * scale * 2}px monospace`;
                ctx.textAlign = 'center';
                ctx.fillText(`${tile.x},${tile.y}`, centerX, centerY + 4);
            }
        }

        // =========== FEATURES ===========
        const sortedFeatures = [...features].sort((a, b) => {
            const depthA = a.x + a.y;
            const depthB = b.x + b.y;
            return depthA !== depthB ? depthA - depthB : a.y - b.y;
        });

        for (const feature of sortedFeatures) {
            const pos = isoToScreen(feature.x, feature.y, scale, baseOffsetX);

            if (pos.x + scaledTileWidth < visLeft || pos.x > visRight ||
                pos.y + scaledTileHeight < visTop || pos.y > visBottom) {
                continue;
            }

            const spriteUrl = feature.sprite || resolveFeatureSpriteUrl(feature.type);
            const img = spriteUrl ? getImage(spriteUrl) : null;

            const centerX = pos.x + scaledTileWidth / 2;
            const featureGroundY = pos.y + scaledDiamondTopY + scaledFloorHeight * 0.50;
            const isCastle = feature.type === 'castle';
            const featureDrawH = isCastle ? scaledFloorHeight * 3.5 : scaledFloorHeight * 1.6;
            const maxFeatureW = isCastle ? scaledTileWidth * 1.8 : scaledTileWidth * 0.7;

            if (img) {
                const ar = img.naturalWidth / img.naturalHeight;
                let drawH = featureDrawH;
                let drawW = featureDrawH * ar;
                if (drawW > maxFeatureW) {
                    drawW = maxFeatureW;
                    drawH = maxFeatureW / ar;
                }
                const drawX = centerX - drawW / 2;
                const drawY = featureGroundY - drawH;
                ctx.drawImage(img, drawX, drawY, drawW, drawH);
            } else {
                const color = FEATURE_COLORS[feature.type] || FEATURE_COLORS.default;
                ctx.beginPath();
                ctx.arc(centerX, featureGroundY - 8 * scale, 16 * scale, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();
                ctx.strokeStyle = 'rgba(0,0,0,0.5)';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        }

        // =========== UNITS ===========
        const unitsWithPosition = units.filter((u): u is typeof u & { position: { x: number; y: number } } => !!u.position);
        const sortedUnits = [...unitsWithPosition].sort((a, b) => {
            const depthA = a.position.x + a.position.y;
            const depthB = b.position.x + b.position.y;
            return depthA !== depthB ? depthA - depthB : a.position.y - b.position.y;
        });

        for (const unit of sortedUnits) {
            const pos = isoToScreen(unit.position.x, unit.position.y, scale, baseOffsetX);

            if (pos.x + scaledTileWidth < visLeft || pos.x > visRight ||
                pos.y + scaledTileHeight < visTop || pos.y > visBottom) {
                continue;
            }

            const isSelected = unit.id === selectedUnitId;
            const centerX = pos.x + scaledTileWidth / 2;
            const groundY = pos.y + scaledDiamondTopY + scaledFloorHeight * 0.50;

            // Idle breathing animation
            const breatheOffset = 0.8 * scale * (1 + Math.sin(animTime * 0.002 + (unit.position.x * 3.7 + unit.position.y * 5.3)));

            // Resolve sprite
            const unitSpriteUrl = resolveUnitSpriteUrl(unit);
            const img = unitSpriteUrl ? getImage(unitSpriteUrl) : null;
            const unitDrawH = scaledFloorHeight * 1.5 * unitScale;
            const maxUnitW = scaledTileWidth * 0.6 * unitScale;
            const ar = img ? img.naturalWidth / img.naturalHeight : 0.5;
            let drawH = unitDrawH;
            let drawW = unitDrawH * ar;
            if (drawW > maxUnitW) {
                drawW = maxUnitW;
                drawH = maxUnitW / ar;
            }

            // Movement trail / ghost
            if (unit.previousPosition && (unit.previousPosition.x !== unit.position.x || unit.previousPosition.y !== unit.position.y)) {
                const ghostPos = isoToScreen(unit.previousPosition.x, unit.previousPosition.y, scale, baseOffsetX);
                const ghostCenterX = ghostPos.x + scaledTileWidth / 2;
                const ghostGroundY = ghostPos.y + scaledDiamondTopY + scaledFloorHeight * 0.50;

                ctx.save();
                ctx.globalAlpha = 0.25;
                if (img) {
                    ctx.drawImage(img, ghostCenterX - drawW / 2, ghostGroundY - drawH, drawW, drawH);
                } else {
                    const color = unit.team === 'player' ? '#3b82f6' :
                        unit.team === 'enemy' ? '#ef4444' : '#6b7280';
                    ctx.beginPath();
                    ctx.arc(ghostCenterX, ghostGroundY - 16 * scale, 20 * scale, 0, Math.PI * 2);
                    ctx.fillStyle = color;
                    ctx.fill();
                }
                ctx.restore();
            }

            // Selection ring
            if (isSelected) {
                const ringAlpha = 0.6 + 0.3 * Math.sin(animTime * 0.004);
                ctx.beginPath();
                ctx.ellipse(centerX, groundY, drawW / 2 + 4 * scale, 12 * scale, 0, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(0, 200, 255, ${ringAlpha})`;
                ctx.lineWidth = 3;
                ctx.stroke();
            }

            // Draw unit: sprite sheet frame, static sprite, or fallback
            const frame = resolveUnitFrame?.(unit.id) ?? null;
            const frameImg = frame ? getImage(frame.sheetUrl) : null;

            if (frame && frameImg) {
                const frameAr = frame.sw / frame.sh;
                let fDrawH = unitDrawH;
                let fDrawW = unitDrawH * frameAr;
                if (fDrawW > maxUnitW) {
                    fDrawW = maxUnitW;
                    fDrawH = maxUnitW / frameAr;
                }
                const spriteY = groundY - fDrawH - (frame.applyBreathing ? breatheOffset : 0);

                ctx.save();
                if (unit.team) {
                    ctx.shadowColor = unit.team === 'player' ? 'rgba(0, 150, 255, 0.6)' : 'rgba(255, 50, 50, 0.6)';
                    ctx.shadowBlur = 12 * scale;
                }
                if (frame.flipX) {
                    ctx.translate(centerX, 0);
                    ctx.scale(-1, 1);
                    ctx.drawImage(frameImg, frame.sx, frame.sy, frame.sw, frame.sh, -fDrawW / 2, spriteY, fDrawW, fDrawH);
                } else {
                    ctx.drawImage(frameImg, frame.sx, frame.sy, frame.sw, frame.sh, centerX - fDrawW / 2, spriteY, fDrawW, fDrawH);
                }
                ctx.restore();
            } else if (img) {
                const spriteY = groundY - drawH - breatheOffset;
                if (unit.team) {
                    ctx.save();
                    ctx.shadowColor = unit.team === 'player' ? 'rgba(0, 150, 255, 0.6)' : 'rgba(255, 50, 50, 0.6)';
                    ctx.shadowBlur = 12 * scale;
                    ctx.drawImage(img, centerX - drawW / 2, spriteY, drawW, drawH);
                    ctx.restore();
                } else {
                    ctx.drawImage(img, centerX - drawW / 2, spriteY, drawW, drawH);
                }
            } else {
                // Fallback circle
                const color = unit.team === 'player' ? '#3b82f6' :
                    unit.team === 'enemy' ? '#ef4444' : '#6b7280';
                ctx.beginPath();
                ctx.arc(centerX, groundY - 20 * scale - breatheOffset, 20 * scale, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();
                ctx.strokeStyle = 'rgba(255,255,255,0.8)';
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            // Unit name label
            if (unit.name) {
                const labelBg = unit.team === 'player' ? 'rgba(59, 130, 246, 0.9)' :
                    unit.team === 'enemy' ? 'rgba(239, 68, 68, 0.9)' : 'rgba(107, 114, 128, 0.9)';
                ctx.font = `bold ${10 * scale * 2.5}px system-ui`;
                ctx.textAlign = 'center';
                const textWidth = ctx.measureText(unit.name).width;
                const labelY = groundY + 14 * scale - breatheOffset;
                ctx.fillStyle = labelBg;
                ctx.beginPath();
                ctx.roundRect(centerX - textWidth / 2 - 6 * scale, labelY - 8 * scale, textWidth + 12 * scale, 16 * scale, 4 * scale);
                ctx.fill();
                ctx.fillStyle = 'white';
                ctx.fillText(unit.name, centerX, labelY + 4 * scale);
            }

            // Health bar
            if (unit.health !== undefined && unit.maxHealth !== undefined) {
                const barWidth = 40 * scale;
                const barHeight = 6 * scale;
                const barX = centerX - barWidth / 2;
                const barY = groundY - drawH - 2 * scale - breatheOffset;
                const healthRatio = unit.health / unit.maxHealth;
                const barRadius = barHeight / 2;

                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.beginPath();
                ctx.roundRect(barX, barY, barWidth, barHeight, barRadius);
                ctx.fill();

                if (healthRatio > 0) {
                    const fillWidth = barWidth * healthRatio;
                    const gradient = ctx.createLinearGradient(barX, barY, barX, barY + barHeight);
                    if (healthRatio > 0.6) {
                        gradient.addColorStop(0, '#4ade80');
                        gradient.addColorStop(1, '#22c55e');
                    } else if (healthRatio > 0.3) {
                        gradient.addColorStop(0, '#fde047');
                        gradient.addColorStop(1, '#eab308');
                    } else {
                        gradient.addColorStop(0, '#f87171');
                        gradient.addColorStop(1, '#ef4444');
                    }
                    ctx.fillStyle = gradient;
                    ctx.save();
                    ctx.beginPath();
                    ctx.roundRect(barX, barY, fillWidth, barHeight, barRadius);
                    ctx.clip();
                    ctx.fillRect(barX, barY, fillWidth, barHeight);
                    ctx.restore();
                }

                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.roundRect(barX, barY, barWidth, barHeight, barRadius);
                ctx.stroke();
            }
        }

        // Draw canvas effects
        onDrawEffects?.(ctx, animTime, getImage);

        // Restore camera transform
        ctx.restore();

        // Draw minimap
        drawMinimap();
    }, [
        sortedTiles, units, features, selectedUnitId,
        scale, debug, resolveTerrainSpriteUrl, resolveFeatureSpriteUrl, resolveUnitSpriteUrl, resolveUnitFrame, getImage,
        gridWidth, gridHeight, baseOffsetX, scaledTileWidth, scaledTileHeight, scaledFloorHeight, scaledDiamondTopY,
        validMoveSet, attackTargetSet, hoveredTile, viewportSize, drawMinimap, onDrawEffects,
        backgroundImage, cameraRef, unitScale,
    ]);

    // =========================================================================
    // Camera centering on selected unit
    // =========================================================================
    useEffect(() => {
        if (!selectedUnitId) return;
        const unit = units.find(u => u.id === selectedUnitId);
        if (!unit?.position) return;
        const pos = isoToScreen(unit.position.x, unit.position.y, scale, baseOffsetX);
        const centerX = pos.x + scaledTileWidth / 2;
        const centerY = pos.y + scaledDiamondTopY + scaledFloorHeight / 2;
        targetCameraRef.current = {
            x: centerX - viewportSize.width / 2,
            y: centerY - viewportSize.height / 2,
        };
    }, [selectedUnitId, units, scale, baseOffsetX, scaledTileWidth, scaledDiamondTopY, scaledFloorHeight, viewportSize, targetCameraRef]);

    // =========================================================================
    // Animation loop
    // =========================================================================
    useEffect(() => {
        const hasAnimations = units.length > 0 || validMoves.length > 0 || attackTargets.length > 0 || selectedUnitId != null || targetCameraRef.current != null || hasActiveEffects;

        // Always draw at least once
        draw(animTimeRef.current);

        if (!hasAnimations) return;

        let running = true;
        const animate = (timestamp: number) => {
            if (!running) return;
            animTimeRef.current = timestamp;
            lerpToTarget();
            draw(timestamp);
            rafIdRef.current = requestAnimationFrame(animate);
        };
        rafIdRef.current = requestAnimationFrame(animate);

        return () => {
            running = false;
            cancelAnimationFrame(rafIdRef.current);
        };
    }, [draw, units.length, validMoves.length, attackTargets.length, selectedUnitId, hasActiveEffects, lerpToTarget, targetCameraRef]);

    // =========================================================================
    // Mouse handlers
    // =========================================================================
    const handleMouseMoveWithCamera = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        if (enableCamera) {
            const wasPanning = handleMouseMove(e, () => draw(animTimeRef.current));
            if (wasPanning) return;
        }

        if ((!onTileHover && !tileHoverEvent) || !canvasRef.current) return;

        const world = screenToWorld(e.clientX, e.clientY, canvasRef.current, viewportSize);
        const adjustedX = world.x - scaledTileWidth / 2;
        const adjustedY = world.y - scaledDiamondTopY - scaledFloorHeight / 2;
        const isoPos = screenToIso(adjustedX, adjustedY, scale, baseOffsetX);

        const tileExists = tilesProp.some(t => t.x === isoPos.x && t.y === isoPos.y);
        if (tileExists) {
            if (tileHoverEvent) eventBus.emit(`UI:${tileHoverEvent}`, { x: isoPos.x, y: isoPos.y });
            onTileHover?.(isoPos.x, isoPos.y);
        }
    }, [enableCamera, handleMouseMove, draw, onTileHover, screenToWorld, viewportSize, scaledTileWidth, scaledDiamondTopY, scaledFloorHeight, scale, baseOffsetX, tilesProp, tileHoverEvent, eventBus]);

    const handleMouseLeaveWithCamera = useCallback(() => {
        handleMouseLeave();
        if (tileLeaveEvent) eventBus.emit(`UI:${tileLeaveEvent}`, {});
        onTileLeave?.();
    }, [handleMouseLeave, onTileLeave, tileLeaveEvent, eventBus]);

    const handleWheelWithCamera = useCallback((e: React.WheelEvent) => {
        if (enableCamera) {
            handleWheel(e, () => draw(animTimeRef.current));
        }
    }, [enableCamera, handleWheel, draw]);

    const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        if (dragDistance() > 5) return;
        if (!canvasRef.current) return;

        const world = screenToWorld(e.clientX, e.clientY, canvasRef.current, viewportSize);
        const adjustedX = world.x - scaledTileWidth / 2;
        const adjustedY = world.y - scaledDiamondTopY - scaledFloorHeight / 2;
        const isoPos = screenToIso(adjustedX, adjustedY, scale, baseOffsetX);

        // Check for unit click
        const clickedUnit = units.find(u => u.position?.x === isoPos.x && u.position?.y === isoPos.y);
        if (clickedUnit && (onUnitClick || unitClickEvent)) {
            if (unitClickEvent) eventBus.emit(`UI:${unitClickEvent}`, { unitId: clickedUnit.id });
            onUnitClick?.(clickedUnit.id);
        } else if (onTileClick || tileClickEvent) {
            const tileExists = tilesProp.some(t => t.x === isoPos.x && t.y === isoPos.y);
            if (tileExists) {
                if (tileClickEvent) eventBus.emit(`UI:${tileClickEvent}`, { x: isoPos.x, y: isoPos.y });
                onTileClick?.(isoPos.x, isoPos.y);
            }
        }
    }, [dragDistance, screenToWorld, viewportSize, scaledTileWidth, scaledDiamondTopY, scaledFloorHeight, scale, baseOffsetX, units, tilesProp, onUnitClick, onTileClick, unitClickEvent, tileClickEvent, eventBus]);

    // =========================================================================
    // Render
    // =========================================================================

    // Closed-circuit: error state
    if (error) {
        return <ErrorState title="Canvas Error" message={error.message} className={className} />;
    }

    // Closed-circuit: loading state
    if (isLoading) {
        return <LoadingState className={className} />;
    }

    return (
        <Box
            ref={containerRef}
            className={cn('relative overflow-hidden w-full h-full', className)}
        >
            <canvas
                ref={canvasRef}
                onClick={handleClick}
                onMouseDown={enableCamera ? handleMouseDown : undefined}
                onMouseMove={handleMouseMoveWithCamera}
                onMouseUp={enableCamera ? handleMouseUp : undefined}
                onMouseLeave={handleMouseLeaveWithCamera}
                onWheel={handleWheelWithCamera}
                onContextMenu={(e) => e.preventDefault()}
                className="cursor-pointer"
                style={{
                    width: viewportSize.width,
                    height: viewportSize.height,
                }}
            />
            {showMinimap && (
                <canvas
                    ref={minimapRef}
                    className="absolute bottom-2 right-2 border border-border rounded bg-background/80 pointer-events-none"
                    style={{ width: 150, height: 100, zIndex: 10 }}
                />
            )}
        </Box>
    );
}

IsometricCanvas.displayName = 'IsometricCanvas';

export default IsometricCanvas;
