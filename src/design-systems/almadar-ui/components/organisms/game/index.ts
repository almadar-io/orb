/**
 * Game Organism Components
 *
 * Complex UI patterns for game interfaces.
 * Composable isometric canvas system with hooks, utils, and types.
 *
 * @packageDocumentation
 */

// ---------------------------------------------------------------------------
// Core Canvas Components
// ---------------------------------------------------------------------------
export { IsometricCanvas, type IsometricCanvasProps } from './IsometricCanvas';
// GameCanvas3D and Three.js components are NOT barrel-exported because they depend on
// @react-three/fiber + three which are optional peer dependencies.
// Import directly from './GameCanvas3D' or './three' if needed.
//
// Example:
//   import { GameCanvas3D } from '@almadar/ui/components/organisms/game/GameCanvas3D';
//   import { TileRenderer, useAssetLoader } from '@almadar/ui/components/organisms/game/three';
export { CanvasEffect, type CanvasEffectProps, type CombatActionType } from './CanvasEffect';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type {
    IsometricTile,
    IsometricUnit,
    IsometricFeature,
    CameraState,
} from './types/isometric';
export type {
    AnimationName,
    FacingDirection,
    SpriteDirection,
    ResolvedFrame,
    UnitAnimationState,
    SpriteFrameDims,
    SpriteSheetUrls,
    AnimationDef,
} from './types/spriteAnimation';

// ---------------------------------------------------------------------------
// Audio System
// ---------------------------------------------------------------------------
export {
    GameAudioProvider,
    GameAudioContext,
    useGameAudioContext,
    type GameAudioProviderProps,
    type GameAudioContextValue,
} from './GameAudioProvider';
export {
    GameAudioToggle,
    type GameAudioToggleProps,
} from './GameAudioToggle';
export {
    useGameAudio,
    type AudioManifest,
    type SoundEntry,
    type GameAudioControls,
    type UseGameAudioOptions,
} from './hooks/useGameAudio';

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------
export { useImageCache } from './hooks/useImageCache';
export { useCamera } from './hooks/useCamera';
export {
    useSpriteAnimations,
    type UseSpriteAnimationsResult,
    type UseSpriteAnimationsOptions,
    type SheetUrlResolver,
    type FrameDimsResolver,
} from './hooks/useSpriteAnimations';
export {
    usePhysics2D,
    type UsePhysics2DOptions,
    type UsePhysics2DReturn,
} from './hooks/usePhysics2D';

// ---------------------------------------------------------------------------
// Physics Managers
// ---------------------------------------------------------------------------
export {
    PhysicsManager,
    type Physics2DState,
    type PhysicsBounds,
    type PhysicsConfig,
} from './managers/PhysicsManager';

// ---------------------------------------------------------------------------
// Utils (pure functions)
// ---------------------------------------------------------------------------
export {
    isoToScreen,
    screenToIso,
    TILE_WIDTH,
    TILE_HEIGHT,
    FLOOR_HEIGHT,
    DIAMOND_TOP_Y,
    FEATURE_COLORS,
} from './utils/isometric';
export {
    inferDirection,
    resolveSheetDirection,
    getCurrentFrame,
    resolveFrame,
    createUnitAnimationState,
    transitionAnimation,
    tickAnimationState,
} from './utils/spriteAnimation';
export { SPRITE_SHEET_LAYOUT, SHEET_COLUMNS } from './utils/spriteSheetConstants';

// ---------------------------------------------------------------------------
// Retained Pattern-Compliant Components
// ---------------------------------------------------------------------------
export { GameHud, type GameHudProps, type GameHudStat, type GameHudElement } from './GameHud';
export { GameMenu, type GameMenuProps, type MenuOption } from './GameMenu';
export { GameOverScreen, type GameOverScreenProps, type GameOverStat, type GameOverAction } from './GameOverScreen';
export { InventoryPanel, type InventoryPanelProps, type InventoryItem } from './InventoryPanel';
export { DialogueBox, type DialogueBoxProps, type DialogueNode, type DialogueChoice } from './DialogueBox';

// ---------------------------------------------------------------------------
// Board Organisms (game-logic containers — templates are thin wrappers)
// ---------------------------------------------------------------------------
export {
    BattleBoard,
    type BattleBoardProps,
    type BattleEntity,
    type BattlePhase,
    type BattleUnit,
    type BattleTile,
    type BattleSlotContext,
} from './BattleBoard';
export {
    UncontrolledBattleBoard,
    type UncontrolledBattleBoardProps,
} from './UncontrolledBattleBoard';
export {
    useBattleState,
    type BattleStateEventConfig,
    type BattleStateCallbacks,
    type BattleStateResult,
} from './hooks/useBattleState';
export {
    WorldMapBoard,
    type WorldMapBoardProps,
    type WorldMapEntity,
    type MapHero,
    type MapHex,
    type WorldMapSlotContext,
} from './WorldMapBoard';
export {
    CastleBoard,
    type CastleBoardProps,
    type CastleEntity,
    type CastleSlotContext,
} from './CastleBoard';

// ---------------------------------------------------------------------------
// Trait / State Machine Visualization
// ---------------------------------------------------------------------------
export {
    TraitStateViewer,
    type TraitStateViewerProps,
    type TraitStateMachineDefinition,
    type TraitTransition,
} from './TraitStateViewer';
export {
    TraitSlot,
    type TraitSlotProps,
    type SlotItemData,
} from './TraitSlot';

// ---------------------------------------------------------------------------
// Editor Utilities (Storybook map editor components)
// ---------------------------------------------------------------------------
export {
    CollapsibleSection,
    EditorSlider,
    EditorSelect,
    EditorCheckbox,
    EditorTextInput,
    StatusBar,
    TerrainPalette,
    EditorToolbar,
    TERRAIN_COLORS,
    FEATURE_TYPES,
    type EditorMode,
    type CollapsibleSectionProps,
    type EditorSliderProps,
    type EditorSelectProps,
    type EditorCheckboxProps,
    type EditorTextInputProps,
    type StatusBarProps,
    type TerrainPaletteProps,
    type EditorToolbarProps,
} from './editor';

// ---------------------------------------------------------------------------
// Puzzle Board Organisms (educational game boards, merged from @almadar/game-engine)
// ---------------------------------------------------------------------------

// Sequencer (ages 5-8)
export * from './puzzles/sequencer';

// Event Handler (ages 9-12)
export * from './puzzles/event-handler';

// State Architect (ages 13+)
export * from './puzzles/state-architect';

// Simulator (parameter slider puzzles)
export * from './puzzles/simulator';

// Classifier (categorization puzzles)
export * from './puzzles/classifier';

// Builder (component assembly puzzles)
export * from './puzzles/builder';

// Debugger (code debugging puzzles)
export * from './puzzles/debugger';

// Negotiator (game theory / payoff puzzles)
export * from './puzzles/negotiator';

// ---------------------------------------------------------------------------
// Physics Simulation (educational presets)
// ---------------------------------------------------------------------------
export * from './physics-sim';

// ---------------------------------------------------------------------------
// Combat Log
// ---------------------------------------------------------------------------
export { CombatLog } from './CombatLog';
export type { CombatLogProps, CombatEvent, CombatLogEventType } from './CombatLog';

// ---------------------------------------------------------------------------
// Game Types (tactical game state)
// ---------------------------------------------------------------------------
export {
    createInitialGameState,
    calculateValidMoves,
    calculateAttackTargets,
} from './types/game';
export type {
    Position,
    GameUnit,
    UnitTrait,
    BoardTile,
    GamePhase,
    GameState,
    GameAction,
} from './types/game';

// ---------------------------------------------------------------------------
// Combat Effects (CSS animations)
// ---------------------------------------------------------------------------
export {
    combatAnimations,
    combatClasses,
    combatEffects,
    applyTemporaryEffect,
    calculateDamage,
    generateCombatMessage,
} from './utils/combatEffects';
export type {
    CombatEffect,
    DamageResult,
    CombatEventType,
    CombatEventData,
} from './utils/combatEffects';
