/**
 * 3D Renderers
 *
 * Specialized renderers for tiles, units, and features in the 3D scene.
 *
 * @packageDocumentation
 */

export {
    TileRenderer,
    type TileRendererProps,
} from './TileRenderer';

export {
    UnitRenderer,
    type UnitRendererProps,
    type UnitAnimationState,
} from './UnitRenderer';

export {
    FeatureRenderer,
    type FeatureRendererProps,
} from './FeatureRenderer';

export {
    FeatureRenderer3D,
    preloadFeatures,
    type FeatureRenderer3DProps,
} from './FeatureRenderer3D';
