/**
 * Three.js Subdirectory
 *
 * Core Three.js components, hooks, loaders, and utilities for GameCanvas3D.
 *
 * @packageDocumentation
 */

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------
export { Scene3D, type Scene3DProps } from './Scene3D';
export { Camera3D, type Camera3DProps, type Camera3DHandle, type CameraMode } from './Camera3D';
export { Lighting3D, type Lighting3DProps } from './Lighting3D';

// ---------------------------------------------------------------------------
// UI Components
// ---------------------------------------------------------------------------
export {
    Canvas3DLoadingState,
    type Canvas3DLoadingStateProps,
} from './components/Canvas3DLoadingState';
export {
    Canvas3DErrorBoundary,
    type Canvas3DErrorBoundaryProps,
    type Canvas3DErrorBoundaryState,
} from './components/Canvas3DErrorBoundary';
export {
    ModelLoader,
    type ModelLoaderProps,
} from './components/ModelLoader';
export {
    PhysicsObject3D,
    usePhysics3DController,
    type PhysicsObject3DProps,
    type Physics3DState,
} from './components/PhysicsObject3D';

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------
export {
    useThree,
    type UseThreeOptions,
    type UseThreeReturn,
} from './hooks/useThree';

export {
    useAssetLoader,
    type UseAssetLoaderOptions,
    type UseAssetLoaderReturn,
    type AssetLoadingState,
} from './hooks/useAssetLoader';

export {
    useSceneGraph,
    type UseSceneGraphReturn,
    type SceneGraphNode,
    type NodeType,
} from './hooks/useSceneGraph';

export {
    useRaycaster,
    type UseRaycasterOptions,
    type UseRaycasterReturn,
    type RaycastHit,
    type GridHit,
} from './hooks/useRaycaster';

export {
    useGameCanvas3DEvents,
    type UseGameCanvas3DEventsOptions,
    type UseGameCanvas3DEventsReturn,
    type GameCanvas3DEventConfig,
} from './hooks/useGameCanvas3DEvents';

// ---------------------------------------------------------------------------
// Loaders
// ---------------------------------------------------------------------------
export {
    AssetLoader,
    assetLoader,
    type LoadedModel,
} from './loaders/AssetLoader';

// ---------------------------------------------------------------------------
// Renderers
// ---------------------------------------------------------------------------
export {
    TileRenderer,
    UnitRenderer,
    FeatureRenderer,
    FeatureRenderer3D,
    preloadFeatures,
    type TileRendererProps,
    type UnitRendererProps,
    type FeatureRendererProps,
    type FeatureRenderer3DProps,
    type UnitAnimationState,
} from './renderers';

// ---------------------------------------------------------------------------
// Utils
// ---------------------------------------------------------------------------
export {
    gridToWorld,
    worldToGrid,
    raycastToPlane,
    raycastToObjects,
    gridDistance,
    gridManhattanDistance,
    getNeighbors,
    isInBounds,
    getCellsInRadius,
    createGridHighlight,
    normalizeMouseCoordinates,
    type Grid3DConfig,
    type GridCoordinate,
} from './utils/grid3D';

export {
    isInFrustum,
    filterByFrustum,
    getVisibleIndices,
    calculateLODLevel,
    updateInstanceLOD,
    cullInstancedMesh,
    SpatialHashGrid,
    type CullingOptions,
    type LODLevel,
    type LODConfig,
} from './utils/culling';
