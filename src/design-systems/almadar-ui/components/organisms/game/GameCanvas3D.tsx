'use client';
/**
 * GameCanvas3D
 *
 * 3D game canvas component using Three.js.
 * Mirrors the IsometricCanvas API for easy migration.
 *
 * **State categories (closed-circuit compliant):**
 * - All game data (tiles, units, features, selection, validMoves) → received via props
 * - Rendering state (hoveredTile, internalError, asset loading, camera) → local only
 * - Events → emitted via `useGameCanvas3DEvents()` hook for trait integration
 *
 * This component is a **pure 3D renderer** — it holds no game logic state.
 *
 * @packageDocumentation
 */

import React, {
    useEffect,
    useRef,
    useCallback,
    useState,
    useMemo,
    forwardRef,
    useImperativeHandle,
} from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls, Grid } from '@react-three/drei';
import { AssetLoader, assetLoader } from './three/loaders/AssetLoader';
import { useAssetLoader } from './three/hooks/useAssetLoader';
import { useGameCanvas3DEvents } from './three/hooks/useGameCanvas3DEvents';
import { Canvas3DLoadingState } from './three/components/Canvas3DLoadingState';
import { Canvas3DErrorBoundary } from './three/components/Canvas3DErrorBoundary';
import { ModelLoader } from './three/components/ModelLoader';
import type { IsometricTile, IsometricUnit, IsometricFeature } from './types/isometric';
import './GameCanvas3D.css';

// Re-export types for convenience
export type { IsometricTile, IsometricUnit, IsometricFeature };

/** Game event for canvas display */
export interface GameEvent {
    id: string;
    type: string;
    x: number;
    z?: number;
    y?: number;
    message?: string;
}

/** Camera mode for 3D view */
export type CameraMode = 'isometric' | 'perspective' | 'top-down';

/** Map orientation */
export type MapOrientation = 'standard' | 'rotated';

/** Overlay control */
export type OverlayControl = 'default' | 'hidden' | 'minimap';

/** Unit animation state */
export type UnitAnimationState = 'idle' | 'walk' | 'attack' | 'hurt' | 'die';

/** Props for GameCanvas3D component */
export interface GameCanvas3DProps {
    // --- Closed-circuit props (MANDATORY) ---
    /** Additional CSS classes */
    className?: string;
    /** Children to render inside the 3D canvas (e.g., physics objects, custom meshes) */
    children?: React.ReactNode;
    /** Loading state indicator */
    isLoading?: boolean;
    /** Error state */
    error?: string | null;
    /** Entity name for schema-driven auto-fetch */
    entity?: string;
    /** Array of tiles to render */
    tiles?: IsometricTile[];
    /** Array of units to render */
    units?: IsometricUnit[];
    /** Array of features to render */
    features?: IsometricFeature[];
    /** Array of events to display */
    events?: Array<GameEvent>;
    /** Fog of war data */
    fogOfWar?: boolean[][];
    /** Map orientation */
    orientation?: MapOrientation;
    /** Camera mode */
    cameraMode?: CameraMode;
    /** Show grid */
    showGrid?: boolean;
    /** Show coordinates overlay */
    showCoordinates?: boolean;
    /** Show tile information */
    showTileInfo?: boolean;
    /** Overlay control mode */
    overlay?: OverlayControl;
    /** Enable shadows */
    shadows?: boolean;
    /** Background color */
    backgroundColor?: string;
    /** Callback when a tile is clicked */
    onTileClick?: (tile: IsometricTile, event: React.MouseEvent) => void;
    /** Callback when a unit is clicked */
    onUnitClick?: (unit: IsometricUnit, event: React.MouseEvent) => void;
    /** Callback when a feature is clicked */
    onFeatureClick?: (feature: IsometricFeature, event: React.MouseEvent) => void;
    /** Callback when canvas is clicked (background) */
    onCanvasClick?: (event: React.MouseEvent) => void;
    /** Callback when mouse moves over a tile */
    onTileHover?: (tile: IsometricTile | null, event: React.MouseEvent) => void;
    /** Callback for unit animation state change */
    onUnitAnimation?: (unitId: string, state: string) => void;
    /** Asset loader instance (uses global singleton if not provided) */
    assetLoader?: AssetLoader;
    /** Custom tile renderer component */
    tileRenderer?: React.FC<{ tile: IsometricTile; position: [number, number, number] }>;
    /** Custom unit renderer component */
    unitRenderer?: React.FC<{ unit: IsometricUnit; position: [number, number, number] }>;
    /** Custom feature renderer component */
    featureRenderer?: React.FC<{ feature: IsometricFeature; position: [number, number, number] }>;
    /** URLs to preload */
    preloadAssets?: string[];
    /** Declarative event: tile click */
    tileClickEvent?: string;
    /** Declarative event: unit click */
    unitClickEvent?: string;
    /** Declarative event: feature click */
    featureClickEvent?: string;
    /** Declarative event: canvas click */
    canvasClickEvent?: string;
    /** Declarative event: tile hover */
    tileHoverEvent?: string;
    /** Declarative event: tile leave */
    tileLeaveEvent?: string;
    /** Declarative event: unit animation */
    unitAnimationEvent?: string;
    /** Declarative event: camera change */
    cameraChangeEvent?: string;
    /** Loading message */
    loadingMessage?: string;
    /** Whether to use instancing for tiles */
    useInstancing?: boolean;
    /** Valid move positions */
    validMoves?: Array<{ x: number; z: number }>;
    /** Attack target positions */
    attackTargets?: Array<{ x: number; z: number }>;
    /** Selected tile IDs */
    selectedTileIds?: string[];
    /** Selected unit ID */
    selectedUnitId?: string | null;
}

/** Grid configuration */
interface GridConfig {
    cellSize: number;
    offsetX: number;
    offsetZ: number;
}

/** Default grid config */
const DEFAULT_GRID_CONFIG: GridConfig = {
    cellSize: 1,
    offsetX: 0,
    offsetZ: 0,
};

/** Imperative handle for GameCanvas3D */
export interface GameCanvas3DHandle {
    /** Get current camera position */
    getCameraPosition: () => THREE.Vector3 | null;
    /** Set camera position */
    setCameraPosition: (x: number, y: number, z: number) => void;
    /** Look at a specific point */
    lookAt: (x: number, y: number, z: number) => void;
    /** Reset camera to default position */
    resetCamera: () => void;
    /** Take a screenshot */
    screenshot: () => string | null;
    /** Export current view as data */
    export: () => { tiles: IsometricTile[]; units: IsometricUnit[]; features: IsometricFeature[] };
}

/**
 * Camera controller component for imperative handle integration
 */
function CameraController({
    onCameraChange,
}: {
    onCameraChange?: (pos: { x: number; y: number; z: number }) => void;
}): null {
    const { camera } = useThree();

    useEffect(() => {
        if (onCameraChange) {
            onCameraChange({
                x: camera.position.x,
                y: camera.position.y,
                z: camera.position.z,
            });
        }
    }, [camera.position, onCameraChange]);

    return null;
}

/**
 * GameCanvas3D Component
 *
 * 3D game canvas that mirrors the IsometricCanvas API.
 * Uses Three.js and React Three Fiber for rendering.
 *
 * @example
 * ```tsx
 * <GameCanvas3D
 *   tiles={tiles}
 *   units={units}
 *   features={features}
 *   cameraMode="isometric"
 *   tileClickEvent="TILE_SELECTED"
 *   onTileClick={(tile) => console.log('Clicked:', tile)}
 * />
 * ```
 */
export const GameCanvas3D = forwardRef<GameCanvas3DHandle, GameCanvas3DProps>(
    (
        {
            tiles = [],
            units = [],
            features = [],
            events = [],
            orientation = 'standard',
            cameraMode = 'isometric',
            showGrid = true,
            showCoordinates = false,
            showTileInfo = false,
            overlay = 'default',
            shadows = true,
            backgroundColor = '#1a1a2e',
            onTileClick,
            onUnitClick,
            onFeatureClick,
            onCanvasClick,
            onTileHover,
            onUnitAnimation,
            assetLoader: customAssetLoader,
            tileRenderer: CustomTileRenderer,
            unitRenderer: CustomUnitRenderer,
            featureRenderer: CustomFeatureRenderer,
            className,
            isLoading: externalLoading,
            error: externalError,
            entity,
            preloadAssets = [],
            tileClickEvent,
            unitClickEvent,
            featureClickEvent,
            canvasClickEvent,
            tileHoverEvent,
            tileLeaveEvent,
            unitAnimationEvent,
            cameraChangeEvent,
            loadingMessage = 'Loading 3D Scene...',
            useInstancing = true,
            validMoves = [],
            attackTargets = [],
            selectedTileIds = [],
            selectedUnitId = null,
            children,
        },
        ref
    ) => {
        const containerRef = useRef<HTMLDivElement>(null);
        const controlsRef = useRef<any>(null);
        const [hoveredTile, setHoveredTile] = useState<IsometricTile | null>(null);
        const [internalError, setInternalError] = useState<string | null>(null);

        // Asset loading
        const { isLoading: assetsLoading, progress, loaded, total } = useAssetLoader({
            preloadUrls: preloadAssets,
            loader: customAssetLoader,
        });

        // Event handlers with event bus integration
        const eventHandlers = useGameCanvas3DEvents({
            tileClickEvent,
            unitClickEvent,
            featureClickEvent,
            canvasClickEvent,
            tileHoverEvent,
            tileLeaveEvent,
            unitAnimationEvent,
            cameraChangeEvent,
            onTileClick,
            onUnitClick,
            onFeatureClick,
            onCanvasClick,
            onTileHover,
            onUnitAnimation,
        });

        // Use custom or global asset loader
        const loader = customAssetLoader || assetLoader;

        // Calculate grid bounds
        const gridBounds = useMemo(() => {
            if (tiles.length === 0) {
                return { minX: 0, maxX: 10, minZ: 0, maxZ: 10 };
            }
            const xs = tiles.map((t) => t.x);
            const zs = tiles.map((t) => t.z || t.y || 0);
            return {
                minX: Math.min(...xs),
                maxX: Math.max(...xs),
                minZ: Math.min(...zs),
                maxZ: Math.max(...zs),
            };
        }, [tiles]);

        // Calculate camera target (center of grid)
        const cameraTarget = useMemo(() => {
            return [
                (gridBounds.minX + gridBounds.maxX) / 2,
                0,
                (gridBounds.minZ + gridBounds.maxZ) / 2,
            ] as [number, number, number];
        }, [gridBounds]);

        // Grid config
        const gridConfig = useMemo(
            () => ({
                ...DEFAULT_GRID_CONFIG,
                offsetX: -(gridBounds.maxX - gridBounds.minX) / 2,
                offsetZ: -(gridBounds.maxZ - gridBounds.minZ) / 2,
            }),
            [gridBounds]
        );

        // Convert grid coordinates to world position
        const gridToWorld = useCallback(
            (x: number, z: number, y: number = 0): [number, number, number] => {
                const worldX = (x - gridBounds.minX) * gridConfig.cellSize;
                const worldZ = (z - gridBounds.minZ) * gridConfig.cellSize;
                return [worldX, y * gridConfig.cellSize, worldZ];
            },
            [gridBounds, gridConfig]
        );

        // Imperative handle
        useImperativeHandle(ref, () => ({
            getCameraPosition: () => {
                if (controlsRef.current) {
                    const pos = controlsRef.current.object.position;
                    return new THREE.Vector3(pos.x, pos.y, pos.z);
                }
                return null;
            },
            setCameraPosition: (x: number, y: number, z: number) => {
                if (controlsRef.current) {
                    controlsRef.current.object.position.set(x, y, z);
                    controlsRef.current.update();
                }
            },
            lookAt: (x: number, y: number, z: number) => {
                if (controlsRef.current) {
                    controlsRef.current.target.set(x, y, z);
                    controlsRef.current.update();
                }
            },
            resetCamera: () => {
                if (controlsRef.current) {
                    controlsRef.current.reset();
                }
            },
            screenshot: () => {
                const canvas = containerRef.current?.querySelector('canvas');
                if (canvas) {
                    return canvas.toDataURL('image/png');
                }
                return null;
            },
            export: () => ({
                tiles,
                units,
                features,
            }),
        }));

        // Handle tile click with event bus
        const handleTileClick = useCallback(
            (tile: IsometricTile, event: any) => {
                eventHandlers.handleTileClick(tile, event);
            },
            [eventHandlers]
        );

        // Handle unit click with event bus
        const handleUnitClick = useCallback(
            (unit: IsometricUnit, event: any) => {
                eventHandlers.handleUnitClick(unit, event);
            },
            [eventHandlers]
        );

        // Handle feature click with event bus
        const handleFeatureClick = useCallback(
            (feature: IsometricFeature, event: any) => {
                eventHandlers.handleFeatureClick(feature, event);
            },
            [eventHandlers]
        );

        // Handle tile hover with event bus
        const handleTileHover = useCallback(
            (tile: IsometricTile | null, event: any) => {
                setHoveredTile(tile);
                eventHandlers.handleTileHover(tile, event);
            },
            [eventHandlers]
        );

        // Camera configuration based on mode
        const cameraConfig = useMemo(() => {
            const size = Math.max(
                gridBounds.maxX - gridBounds.minX,
                gridBounds.maxZ - gridBounds.minZ
            );
            const distance = size * 1.5;

            switch (cameraMode) {
                case 'isometric':
                    return {
                        position: [distance, distance * 0.8, distance] as [number, number, number],
                        fov: 45,
                    };
                case 'top-down':
                    return {
                        position: [0, distance * 2, 0] as [number, number, number],
                        fov: 45,
                    };
                case 'perspective':
                default:
                    return {
                        position: [distance, distance, distance] as [number, number, number],
                        fov: 45,
                    };
            }
        }, [cameraMode, gridBounds]);

        // Default tile renderer
        const DefaultTileRenderer = useCallback(
            ({ tile, position }: { tile: IsometricTile; position: [number, number, number] }) => {
                const isSelected = tile.id ? selectedTileIds.includes(tile.id) : false;
                const isHovered = hoveredTile?.id === tile.id;
                const isValidMove = validMoves.some(
                    (m) => m.x === tile.x && m.z === (tile.z ?? tile.y ?? 0)
                );
                const isAttackTarget = attackTargets.some(
                    (m) => m.x === tile.x && m.z === (tile.z ?? tile.y ?? 0)
                );

                // Determine color based on tile type
                let color = 0x808080;
                if (tile.type === 'water') color = 0x4488cc;
                else if (tile.type === 'grass') color = 0x44aa44;
                else if (tile.type === 'sand') color = 0xddcc88;
                else if (tile.type === 'rock') color = 0x888888;
                else if (tile.type === 'snow') color = 0xeeeeee;

                // Apply highlights
                let emissive = 0x000000;
                if (isSelected) emissive = 0x444444;
                else if (isAttackTarget) emissive = 0x440000;
                else if (isValidMove) emissive = 0x004400;
                else if (isHovered) emissive = 0x222222;

                return (
                    <mesh
                        position={position}
                        onClick={(e) => handleTileClick(tile, e)}
                        onPointerEnter={(e) => handleTileHover(tile, e)}
                        onPointerLeave={(e) => handleTileHover(null, e)}
                        userData={{ type: 'tile', tileId: tile.id, gridX: tile.x, gridZ: tile.z ?? tile.y }}
                    >
                        <boxGeometry args={[0.95, 0.2, 0.95]} />
                        <meshStandardMaterial color={color} emissive={emissive} />
                    </mesh>
                );
            },
            [selectedTileIds, hoveredTile, validMoves, attackTargets, handleTileClick, handleTileHover]
        );

        // Default unit renderer
        const DefaultUnitRenderer = useCallback(
            ({ unit, position }: { unit: IsometricUnit; position: [number, number, number] }) => {
                const isSelected = selectedUnitId === unit.id;
                const color = unit.faction === 'player' ? 0x4488ff : unit.faction === 'enemy' ? 0xff4444 : 0xffff44;

                return (
                    <group
                        position={position}
                        onClick={(e) => handleUnitClick(unit, e)}
                        userData={{ type: 'unit', unitId: unit.id }}
                    >
                        {/* Selection ring */}
                        {isSelected && (
                            <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                                <ringGeometry args={[0.4, 0.5, 32]} />
                                <meshBasicMaterial color="#ffff00" transparent opacity={0.8} />
                            </mesh>
                        )}

                        {/* Base */}
                        <mesh position={[0, 0.3, 0]}>
                            <cylinderGeometry args={[0.3, 0.3, 0.1, 8]} />
                            <meshStandardMaterial color={color} />
                        </mesh>

                        {/* Body */}
                        <mesh position={[0, 0.6, 0]}>
                            <capsuleGeometry args={[0.2, 0.4, 4, 8]} />
                            <meshStandardMaterial color={color} />
                        </mesh>

                        {/* Head */}
                        <mesh position={[0, 0.9, 0]}>
                            <sphereGeometry args={[0.12, 8, 8]} />
                            <meshStandardMaterial color={color} />
                        </mesh>

                        {/* Health bar */}
                        {unit.health !== undefined && unit.maxHealth !== undefined && (
                            <group position={[0, 1.2, 0]}>
                                <mesh position={[-0.25, 0, 0]}>
                                    <planeGeometry args={[0.5, 0.05]} />
                                    <meshBasicMaterial color={0x333333} />
                                </mesh>
                                <mesh
                                    position={[
                                        -0.25 + (0.5 * (unit.health / unit.maxHealth)) / 2,
                                        0,
                                        0.01,
                                    ]}
                                >
                                    <planeGeometry args={[0.5 * (unit.health / unit.maxHealth), 0.05]} />
                                    <meshBasicMaterial
                                        color={
                                            unit.health / unit.maxHealth > 0.5
                                                ? 0x44aa44
                                                : unit.health / unit.maxHealth > 0.25
                                                  ? 0xaaaa44
                                                  : 0xff4444
                                        }
                                    />
                                </mesh>
                            </group>
                        )}
                    </group>
                );
            },
            [selectedUnitId, handleUnitClick]
        );

        // Default feature renderer
        const DefaultFeatureRenderer = useCallback(
            ({
                feature,
                position,
            }: {
                feature: IsometricFeature;
                position: [number, number, number];
            }) => {
                // If feature has assetUrl, use ModelLoader to render GLB model
                if (feature.assetUrl) {
                    return (
                        <ModelLoader
                            key={feature.id}
                            url={feature.assetUrl}
                            position={position}
                            scale={0.5}
                            rotation={[0, (feature as { rotation?: number }).rotation ?? 0, 0]}
                            onClick={() => handleFeatureClick(feature, null as any)}
                            fallbackGeometry="box"
                        />
                    );
                }

                // Simple tree representation
                if (feature.type === 'tree') {
                    return (
                        <group
                            position={position}
                            onClick={(e) => handleFeatureClick(feature, e)}
                            userData={{ type: 'feature', featureId: feature.id }}
                        >
                            <mesh position={[0, 0.4, 0]}>
                                <cylinderGeometry args={[0.1, 0.15, 0.8, 6]} />
                                <meshStandardMaterial color={0x8b4513} />
                            </mesh>
                            <mesh position={[0, 0.9, 0]}>
                                <coneGeometry args={[0.5, 0.8, 8]} />
                                <meshStandardMaterial color={0x228b22} />
                            </mesh>
                        </group>
                    );
                }

                // Simple rock representation
                if (feature.type === 'rock') {
                    return (
                        <mesh
                            position={[position[0], position[1] + 0.3, position[2]]}
                            onClick={(e) => handleFeatureClick(feature, e)}
                            userData={{ type: 'feature', featureId: feature.id }}
                        >
                            <dodecahedronGeometry args={[0.3, 0]} />
                            <meshStandardMaterial color={0x808080} />
                        </mesh>
                    );
                }

                return null;
            },
            [handleFeatureClick]
        );

        // Loading state
        if (externalLoading || (assetsLoading && preloadAssets.length > 0)) {
            return (
                <Canvas3DLoadingState
                    progress={progress}
                    loaded={loaded}
                    total={total}
                    message={loadingMessage}
                    className={className}
                />
            );
        }

        // Error state
        const displayError = externalError || internalError;
        if (displayError) {
            return (
                <Canvas3DErrorBoundary>
                    <div className="game-canvas-3d game-canvas-3d--error">
                        <div className="game-canvas-3d__error">Error: {displayError}</div>
                    </div>
                </Canvas3DErrorBoundary>
            );
        }

        return (
            <Canvas3DErrorBoundary
                onError={(err) => setInternalError(err.message)}
                onReset={() => setInternalError(null)}
            >
                <div
                    ref={containerRef}
                    className={`game-canvas-3d ${className || ''}`}
                    data-orientation={orientation}
                    data-camera-mode={cameraMode}
                    data-overlay={overlay}
                >
                    <Canvas
                        shadows={shadows}
                        camera={{
                            position: cameraConfig.position,
                            fov: cameraConfig.fov,
                            near: 0.1,
                            far: 1000,
                        }}
                        style={{ background: backgroundColor }}
                        onClick={(e) => {
                            if (e.target === e.currentTarget) {
                                eventHandlers.handleCanvasClick(e as any);
                            }
                        }}
                    >
                        <CameraController onCameraChange={eventHandlers.handleCameraChange} />

                        {/* Lighting */}
                        <ambientLight intensity={0.6} />
                        <directionalLight
                            position={[10, 20, 10]}
                            intensity={0.8}
                            castShadow={shadows}
                            shadow-mapSize={[2048, 2048]}
                        />
                        <hemisphereLight intensity={0.3} color="#87ceeb" groundColor="#362d1d" />

                        {/* Grid */}
                        {showGrid && (
                            <Grid
                                args={[
                                    Math.max(gridBounds.maxX - gridBounds.minX + 2, 10),
                                    Math.max(gridBounds.maxZ - gridBounds.minZ + 2, 10),
                                ]}
                                position={[
                                    (gridBounds.maxX - gridBounds.minX) / 2 - 0.5,
                                    0,
                                    (gridBounds.maxZ - gridBounds.minZ) / 2 - 0.5,
                                ]}
                                cellSize={1}
                                cellThickness={1}
                                cellColor="#444444"
                                sectionSize={5}
                                sectionThickness={1.5}
                                sectionColor="#666666"
                                fadeDistance={50}
                                fadeStrength={1}
                            />
                        )}

                        {/* Tiles */}
                        {tiles.map((tile, index) => {
                            const position = gridToWorld(
                                tile.x,
                                tile.z ?? tile.y ?? 0,
                                tile.elevation ?? 0
                            );
                            const Renderer = CustomTileRenderer || DefaultTileRenderer;
                            return <Renderer key={tile.id ?? `tile-${index}`} tile={tile} position={position} />;
                        })}

                        {/* Features */}
                        {features.map((feature, index) => {
                            const position = gridToWorld(
                                feature.x,
                                feature.z ?? feature.y ?? 0,
                                (feature.elevation ?? 0) + 0.5
                            );
                            const Renderer = CustomFeatureRenderer || DefaultFeatureRenderer;
                            return <Renderer key={feature.id ?? `feature-${index}`} feature={feature} position={position} />;
                        })}

                        {/* Units */}
                        {units.map((unit) => {
                            const position = gridToWorld(
                                unit.x ?? 0,
                                unit.z ?? unit.y ?? 0,
                                (unit.elevation ?? 0) + 0.5
                            );
                            const Renderer = CustomUnitRenderer || DefaultUnitRenderer;
                            return <Renderer key={unit.id} unit={unit} position={position} />;
                        })}

                        {/* Custom children */}
                        {children}

                        {/* Camera controls */}
                        <OrbitControls
                            ref={controlsRef}
                            target={cameraTarget}
                            enableDamping
                            dampingFactor={0.05}
                            minDistance={2}
                            maxDistance={100}
                            maxPolarAngle={Math.PI / 2 - 0.1}
                        />
                    </Canvas>

                    {/* Coordinate overlay */}
                    {showCoordinates && hoveredTile && (
                        <div className="game-canvas-3d__coordinates">
                            X: {hoveredTile.x}, Z: {hoveredTile.z ?? hoveredTile.y ?? 0}
                        </div>
                    )}

                    {/* Tile info overlay */}
                    {showTileInfo && hoveredTile && (
                        <div className="game-canvas-3d__tile-info">
                            <div className="tile-info__type">{hoveredTile.type}</div>
                            {hoveredTile.terrain && (
                                <div className="tile-info__terrain">{hoveredTile.terrain}</div>
                            )}
                        </div>
                    )}
                </div>
            </Canvas3DErrorBoundary>
        );
    }
);

GameCanvas3D.displayName = 'GameCanvas3D';

export default GameCanvas3D;
