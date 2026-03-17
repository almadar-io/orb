import React, { useState, useCallback, useMemo } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { WorldMapBoard } from './WorldMapBoard';
import type { WorldMapEntity, MapHero, MapHex, WorldMapSlotContext } from './WorldMapBoard';
import { Box } from '../../atoms/Box';
import { VStack, HStack } from '../../atoms/Stack';
import { Typography } from '../../atoms/Typography';
import { Button } from '../../atoms/Button';
import { Badge } from '../../atoms/Badge';
import {
    CollapsibleSection,
    EditorSlider,
    EditorSelect,
    EditorTextInput,
    EditorToolbar,
    TerrainPalette,
    StatusBar,
    TERRAIN_COLORS,
    FEATURE_TYPES,
    type EditorMode,
} from './editor/editorUtils';
import { useEventListener } from '../../../hooks/useEventBus';
import type { IsometricFeature } from './types/isometric';

// =============================================================================
// Constants
// =============================================================================

const TERRAINS = ['grass', 'forest', 'mountain', 'sand', 'water'] as const;

const HERO_TYPES = ['warrior', 'ranger', 'sorcerer', 'paladin', 'rogue'] as const;

// =============================================================================
// Mock Data Generators
// =============================================================================

/** Generates a hex grid with mixed terrains */
function generateWorldHexes(w: number, h: number): MapHex[] {
    const hexes: MapHex[] = [];
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            let terrain: string;

            // Water borders
            if (x === 0 || y === 0 || x === w - 1 || y === h - 1) {
                terrain = 'water';
            }
            // Mountain ranges
            else if ((x === 3 && y >= 2 && y <= 4) || (x === 8 && y >= 6 && y <= 8)) {
                terrain = 'mountain';
            }
            // Forest patches
            else if ((x >= 5 && x <= 7 && y >= 2 && y <= 3) || (x >= 2 && x <= 3 && y >= 7 && y <= 8)) {
                terrain = 'forest';
            }
            // Sandy desert area
            else if (x >= 9 && x <= 10 && y >= 3 && y <= 5) {
                terrain = 'sand';
            }
            // Default grassland
            else {
                terrain = 'grass';
            }

            hexes.push({
                x,
                y,
                terrain,
                passable: terrain !== 'water' && terrain !== 'mountain',
            });
        }
    }
    return hexes;
}

// =============================================================================
// Mock Data
// =============================================================================

const MOCK_HEROES: MapHero[] = [
    {
        id: 'hero-1',
        name: 'Aldric the Bold',
        owner: 'player',
        position: { x: 2, y: 3 },
        movement: 4,
        level: 5,
    },
    {
        id: 'hero-2',
        name: 'Selene Windwalker',
        owner: 'player',
        position: { x: 5, y: 6 },
        movement: 5,
        level: 3,
    },
    {
        id: 'hero-3',
        name: 'Zarek Ironfang',
        owner: 'enemy',
        position: { x: 9, y: 2 },
        movement: 3,
        level: 6,
    },
    {
        id: 'hero-4',
        name: 'Morvaine the Wicked',
        owner: 'enemy',
        position: { x: 7, y: 8 },
        movement: 4,
        level: 4,
    },
];

const MOCK_FEATURES: IsometricFeature[] = [
    { x: 4, y: 4, type: 'goldMine' },
    { x: 6, y: 7, type: 'portal' },
    { x: 10, y: 4, type: 'castle' },
    { x: 2, y: 8, type: 'traitCache' },
];

const MOCK_ENTITY: WorldMapEntity = {
    id: 'world-map-1',
    hexes: generateWorldHexes(12, 10),
    heroes: MOCK_HEROES,
    features: MOCK_FEATURES,
    selectedHeroId: null,
};

// =============================================================================
// Meta
// =============================================================================

const meta: Meta<typeof WorldMapBoard> = {
    title: 'Game/WorldMapBoard',
    component: WorldMapBoard,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
        backgrounds: { default: 'dark' },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

// =============================================================================
// Story: Default
// =============================================================================

/** Simple WorldMapBoard with default scale and mock entity data. */
export const Default: Story = {
    args: {
        entity: MOCK_ENTITY,
        allowMoveAllHeroes: true,
    },
};

// =============================================================================
// Story: WithSlots
// =============================================================================

function WithSlotsRender() {
    const [selectedHeroId, setSelectedHeroId] = useState<string | null>(null);

    const entity: WorldMapEntity = useMemo(() => ({
        ...MOCK_ENTITY,
        selectedHeroId,
    }), [selectedHeroId]);

    return (
        <WorldMapBoard
            entity={entity}
            scale={0.4}
            allowMoveAllHeroes
            onHeroSelect={(id) => setSelectedHeroId(id)}
            onHeroMove={(heroId, toX, toY) => {
                console.log(`Hero ${heroId} moved to (${toX}, ${toY})`);
            }}
            header={(ctx: WorldMapSlotContext) => (
                <HStack
                    gap="md"
                    align="center"
                    className="px-4 py-3 bg-[var(--color-surface)] border-b border-[var(--color-border)]"
                >
                    <Typography variant="h3" weight="bold">World Map</Typography>
                    {ctx.selectedHero && (
                        <Badge variant="info" size="md">{ctx.selectedHero.name}</Badge>
                    )}
                    {!ctx.selectedHero && (
                        <Typography variant="caption" className="text-gray-400">
                            Click a hero to select
                        </Typography>
                    )}
                </HStack>
            )}
            sidePanel={(ctx: WorldMapSlotContext) => (
                <VStack gap="md">
                    <Typography variant="h4" weight="semibold">Hero Detail</Typography>
                    {ctx.selectedHero ? (
                        <VStack gap="sm" className="p-3 rounded bg-[var(--color-background)]">
                            <HStack gap="sm" align="center">
                                <Typography variant="label" weight="bold">
                                    {ctx.selectedHero.name}
                                </Typography>
                                <Badge
                                    variant={ctx.selectedHero.owner === 'player' ? 'success' : 'error'}
                                    size="sm"
                                >
                                    {ctx.selectedHero.owner}
                                </Badge>
                            </HStack>
                            <Typography variant="caption" className="text-gray-400">
                                Level: {ctx.selectedHero.level ?? 1}
                            </Typography>
                            <Typography variant="caption" className="text-gray-400">
                                Movement: {ctx.selectedHero.movement}
                            </Typography>
                            <Typography variant="caption" className="text-gray-400">
                                Position: ({ctx.selectedHero.position.x}, {ctx.selectedHero.position.y})
                            </Typography>
                        </VStack>
                    ) : (
                        <Typography variant="body2" className="text-gray-500">
                            No hero selected. Click a hero on the map.
                        </Typography>
                    )}
                </VStack>
            )}
            overlay={(ctx: WorldMapSlotContext) => {
                if (!ctx.hoveredHex) return null;
                const pos = ctx.tileToScreen(ctx.hoveredHex.x, ctx.hoveredHex.y);
                return (
                    <Box
                        className="absolute pointer-events-none z-10 px-2 py-1 rounded bg-black/80 text-white text-xs"
                        style={{ left: pos.x + 20, top: pos.y - 10 }}
                    >
                        <Typography variant="caption">
                            {ctx.hoveredHex.terrain} ({ctx.hoveredHex.x}, {ctx.hoveredHex.y})
                        </Typography>
                    </Box>
                );
            }}
            footer={(ctx: WorldMapSlotContext) => (
                <HStack
                    gap="md"
                    align="center"
                    className="px-4 py-2 bg-[var(--color-surface)] border-t border-[var(--color-border)]"
                >
                    <Badge variant="info" size="sm">
                        Valid Moves: {ctx.validMoves.length}
                    </Badge>
                    <Badge variant="neutral" size="sm">
                        Heroes: {MOCK_HEROES.length}
                    </Badge>
                    {ctx.hoveredHex && (
                        <Typography variant="caption" className="text-gray-400">
                            Hovered: {ctx.hoveredHex.terrain} ({ctx.hoveredHex.x}, {ctx.hoveredHex.y})
                        </Typography>
                    )}
                </HStack>
            )}
        />
    );
}

/** WorldMapBoard with render-prop slots for header, sidePanel, overlay, and footer. */
export const WithSlots: StoryObj = {
    render: () => <WithSlotsRender />,
};

// =============================================================================
// Story: Editor
// =============================================================================

interface EditorHero {
    id: string;
    name: string;
    owner: 'player' | 'enemy';
    position: { x: number; y: number };
    movement: number;
    level: number;
}

interface EditorFeaturePlacement {
    x: number;
    y: number;
    type: string;
}

function EditorRender() {
    // -- Canvas settings --
    const [scale, setScale] = useState(0.4);
    const [unitScale, setUnitScale] = useState(2.5);

    // -- Grid settings --
    const [gridWidth, setGridWidth] = useState(12);
    const [gridHeight, setGridHeight] = useState(10);
    const [hexes, setHexes] = useState<MapHex[]>(() => generateWorldHexes(12, 10));

    // -- Editor mode --
    const [mode, setMode] = useState<EditorMode>('select');
    const [selectedTerrain, setSelectedTerrain] = useState('grass');

    // -- Hero editor --
    const [heroes, setHeroes] = useState<EditorHero[]>([
        { id: 'h-1', name: 'Knight', owner: 'player', position: { x: 2, y: 3 }, movement: 4, level: 3 },
    ]);
    const [heroName, setHeroName] = useState('Hero');
    const [heroOwner, setHeroOwner] = useState<'player' | 'enemy'>('player');
    const [heroMovement, setHeroMovement] = useState(4);
    const [heroNextId, setHeroNextId] = useState(2);

    // -- Feature editor --
    const [featurePlacements, setFeaturePlacements] = useState<EditorFeaturePlacement[]>([]);
    const [selectedFeatureType, setSelectedFeatureType] = useState<string>(FEATURE_TYPES[0]);

    // -- Selected hero (for movement) --
    const [selectedHeroId, setSelectedHeroId] = useState<string | null>(null);

    // -- Hovered tile for status bar --
    const [hoveredTile, setHoveredTile] = useState<{ x: number; y: number } | null>(null);

    // -- Collapsible sections --
    const [canvasExpanded, setCanvasExpanded] = useState(true);
    const [gridExpanded, setGridExpanded] = useState(true);
    const [heroesExpanded, setHeroesExpanded] = useState(true);
    const [featuresExpanded, setFeaturesExpanded] = useState(true);
    const [exportExpanded, setExportExpanded] = useState(false);

    // -- Regenerate grid --
    const regenerateGrid = useCallback(() => {
        setHexes(generateWorldHexes(gridWidth, gridHeight));
        setHeroes([]);
        setFeaturePlacements([]);
        setSelectedHeroId(null);
        setHeroNextId(1);
    }, [gridWidth, gridHeight]);

    // -- Build entity from editor state --
    const features: IsometricFeature[] = useMemo(
        () => featurePlacements.map((f) => ({ x: f.x, y: f.y, type: f.type })),
        [featurePlacements],
    );

    const mapHeroes: MapHero[] = useMemo(
        () => heroes.map((h) => ({
            id: h.id,
            name: h.name,
            owner: h.owner,
            position: h.position,
            movement: h.movement,
            level: h.level,
        })),
        [heroes],
    );

    const entity: WorldMapEntity = useMemo(() => ({
        id: 'editor-map',
        hexes,
        heroes: mapHeroes,
        features,
        selectedHeroId,
    }), [hexes, mapHeroes, features, selectedHeroId]);

    // -- Handle tile click based on mode --
    const handleHeroSelect = useCallback((id: string) => {
        if (mode === 'select') {
            setSelectedHeroId(id);
        }
    }, [mode]);

    const handleHeroMove = useCallback((heroId: string, toX: number, toY: number) => {
        setHeroes((prev) =>
            prev.map((h) => h.id === heroId ? { ...h, position: { x: toX, y: toY } } : h),
        );
    }, []);

    const handleTileClickForEditor = useCallback((x: number, y: number) => {
        if (mode === 'paint') {
            setHexes((prev) =>
                prev.map((h) =>
                    h.x === x && h.y === y
                        ? { ...h, terrain: selectedTerrain, passable: selectedTerrain !== 'water' && selectedTerrain !== 'mountain' }
                        : h,
                ),
            );
        } else if (mode === 'unit') {
            // Place a hero at this tile
            const occupied = heroes.some((h) => h.position.x === x && h.position.y === y);
            if (!occupied) {
                const newId = `h-${heroNextId}`;
                setHeroes((prev) => [
                    ...prev,
                    {
                        id: newId,
                        name: heroName || `Hero ${heroNextId}`,
                        owner: heroOwner,
                        position: { x, y },
                        movement: heroMovement,
                        level: 1,
                    },
                ]);
                setHeroNextId((n) => n + 1);
            }
        } else if (mode === 'feature') {
            // Place or replace feature at this tile
            setFeaturePlacements((prev) => {
                const filtered = prev.filter((f) => !(f.x === x && f.y === y));
                return [...filtered, { x, y, type: selectedFeatureType }];
            });
        } else if (mode === 'erase') {
            // Remove hero or feature at this tile
            setHeroes((prev) => prev.filter((h) => !(h.position.x === x && h.position.y === y)));
            setFeaturePlacements((prev) => prev.filter((f) => !(f.x === x && f.y === y)));
        }
    }, [mode, selectedTerrain, heroes, heroName, heroOwner, heroMovement, heroNextId, selectedFeatureType]);

    // -- Listen for tile click events from WorldMapBoard --
    useEventListener('UI:EDITOR_TILE_CLICK', (event) => {
        const { x, y } = (event.payload ?? {}) as { x: number; y: number };
        if (typeof x === 'number' && typeof y === 'number') {
            handleTileClickForEditor(x, y);
        }
    });

    // -- Export JSON --
    const exportJson = useCallback(() => {
        const data = {
            hexes,
            heroes,
            features: featurePlacements,
            gridWidth,
            gridHeight,
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'world-map.json';
        a.click();
        URL.revokeObjectURL(url);
    }, [hexes, heroes, featurePlacements, gridWidth, gridHeight]);

    // -- Import JSON --
    const importJson = useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const data = JSON.parse(reader.result as string);
                    if (data.hexes) setHexes(data.hexes);
                    if (data.heroes) {
                        setHeroes(data.heroes);
                        setHeroNextId(data.heroes.length + 1);
                    }
                    if (data.features) setFeaturePlacements(data.features);
                    if (data.gridWidth) setGridWidth(data.gridWidth);
                    if (data.gridHeight) setGridHeight(data.gridHeight);
                    setSelectedHeroId(null);
                } catch (err) {
                    console.error('Invalid JSON file', err);
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }, []);

    const TERRAIN_LIST = Object.keys(TERRAIN_COLORS);
    const FEATURE_OPTIONS = FEATURE_TYPES.map((f) => ({
        value: f,
        label: f.replace(/([A-Z])/g, ' $1').trim(),
    }));

    return (
        <HStack gap="none" className="h-screen bg-[var(--color-background)]">
            {/* Editor panel */}
            <Box
                className="shrink-0 bg-gray-900 border-r border-gray-700 flex flex-col overflow-hidden"
                style={{ width: 320 }}
            >
                {/* Toolbar */}
                <Box padding="sm" className="border-b border-gray-700">
                    <EditorToolbar mode={mode} onModeChange={setMode} />
                </Box>

                {/* Scrollable sections */}
                <Box className="flex-1 overflow-y-auto" padding="sm">
                    <VStack gap="sm">
                        {/* Canvas Settings */}
                        <CollapsibleSection
                            title="Canvas Settings"
                            expanded={canvasExpanded}
                            onToggle={() => setCanvasExpanded((v) => !v)}
                        >
                            <VStack gap="xs">
                                <EditorSlider
                                    label="Scale"
                                    value={scale}
                                    min={0.2}
                                    max={1.0}
                                    step={0.05}
                                    onChange={setScale}
                                />
                                <EditorSlider
                                    label="Unit Scale"
                                    value={unitScale}
                                    min={0.5}
                                    max={5}
                                    step={0.1}
                                    onChange={setUnitScale}
                                />
                            </VStack>
                        </CollapsibleSection>

                        {/* Grid & Terrain */}
                        <CollapsibleSection
                            title="Grid & Terrain"
                            expanded={gridExpanded}
                            onToggle={() => setGridExpanded((v) => !v)}
                        >
                            <VStack gap="sm">
                                <EditorSlider
                                    label="Width"
                                    value={gridWidth}
                                    min={4}
                                    max={20}
                                    step={1}
                                    onChange={(v) => setGridWidth(Math.round(v))}
                                />
                                <EditorSlider
                                    label="Height"
                                    value={gridHeight}
                                    min={4}
                                    max={20}
                                    step={1}
                                    onChange={(v) => setGridHeight(Math.round(v))}
                                />
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={regenerateGrid}
                                    className="w-full"
                                >
                                    Regenerate Grid
                                </Button>
                                <Typography variant="caption" className="text-gray-400">
                                    Terrain Palette (select Paint mode)
                                </Typography>
                                <TerrainPalette
                                    terrains={TERRAIN_LIST}
                                    selectedTerrain={selectedTerrain}
                                    onSelect={setSelectedTerrain}
                                />
                            </VStack>
                        </CollapsibleSection>

                        {/* Heroes */}
                        <CollapsibleSection
                            title="Heroes"
                            expanded={heroesExpanded}
                            onToggle={() => setHeroesExpanded((v) => !v)}
                        >
                            <VStack gap="sm">
                                <EditorSelect
                                    label="Owner"
                                    value={heroOwner}
                                    options={[
                                        { value: 'player', label: 'Player' },
                                        { value: 'enemy', label: 'Enemy' },
                                    ]}
                                    onChange={(v) => setHeroOwner(v as 'player' | 'enemy')}
                                />
                                <EditorTextInput
                                    label="Name"
                                    value={heroName}
                                    onChange={setHeroName}
                                    placeholder="Hero name"
                                />
                                <EditorSlider
                                    label="Movement"
                                    value={heroMovement}
                                    min={1}
                                    max={10}
                                    step={1}
                                    onChange={(v) => setHeroMovement(Math.round(v))}
                                />
                                <Typography variant="caption" className="text-gray-400">
                                    Switch to Unit mode and click a tile to place.
                                </Typography>

                                {/* Placed heroes list */}
                                {heroes.length > 0 && (
                                    <VStack gap="xs">
                                        <Typography variant="caption" weight="semibold" className="text-gray-300">
                                            Placed Heroes ({heroes.length})
                                        </Typography>
                                        {heroes.map((h) => (
                                            <HStack
                                                key={h.id}
                                                gap="sm"
                                                align="center"
                                                className="px-2 py-1 rounded bg-gray-800 text-xs"
                                            >
                                                <Badge
                                                    variant={h.owner === 'player' ? 'success' : 'error'}
                                                    size="sm"
                                                >
                                                    {h.owner[0].toUpperCase()}
                                                </Badge>
                                                <Typography variant="caption" className="flex-1 text-gray-200 truncate">
                                                    {h.name}
                                                </Typography>
                                                <Typography variant="caption" className="text-gray-500">
                                                    ({h.position.x},{h.position.y})
                                                </Typography>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setHeroes((prev) => prev.filter((hero) => hero.id !== h.id));
                                                        if (selectedHeroId === h.id) setSelectedHeroId(null);
                                                    }}
                                                    className="text-red-400 hover:text-red-300 px-1"
                                                >
                                                    x
                                                </Button>
                                            </HStack>
                                        ))}
                                    </VStack>
                                )}
                            </VStack>
                        </CollapsibleSection>

                        {/* Features */}
                        <CollapsibleSection
                            title="Features"
                            expanded={featuresExpanded}
                            onToggle={() => setFeaturesExpanded((v) => !v)}
                        >
                            <VStack gap="sm">
                                <EditorSelect
                                    label="Feature"
                                    value={selectedFeatureType}
                                    options={FEATURE_OPTIONS}
                                    onChange={setSelectedFeatureType}
                                />
                                <Typography variant="caption" className="text-gray-400">
                                    Switch to Feature mode and click a tile to place.
                                </Typography>

                                {/* Placed features list */}
                                {featurePlacements.length > 0 && (
                                    <VStack gap="xs">
                                        <Typography variant="caption" weight="semibold" className="text-gray-300">
                                            Placed Features ({featurePlacements.length})
                                        </Typography>
                                        {featurePlacements.map((f, i) => (
                                            <HStack
                                                key={`${f.x}-${f.y}-${f.type}`}
                                                gap="sm"
                                                align="center"
                                                className="px-2 py-1 rounded bg-gray-800 text-xs"
                                            >
                                                <Badge variant="warning" size="sm">F</Badge>
                                                <Typography variant="caption" className="flex-1 text-gray-200 truncate">
                                                    {f.type.replace(/([A-Z])/g, ' $1').trim()}
                                                </Typography>
                                                <Typography variant="caption" className="text-gray-500">
                                                    ({f.x},{f.y})
                                                </Typography>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setFeaturePlacements((prev) =>
                                                            prev.filter((_, idx) => idx !== i),
                                                        );
                                                    }}
                                                    className="text-red-400 hover:text-red-300 px-1"
                                                >
                                                    x
                                                </Button>
                                            </HStack>
                                        ))}
                                    </VStack>
                                )}
                            </VStack>
                        </CollapsibleSection>

                        {/* Export / Import */}
                        <CollapsibleSection
                            title="Export / Import"
                            expanded={exportExpanded}
                            onToggle={() => setExportExpanded((v) => !v)}
                        >
                            <VStack gap="xs">
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={exportJson}
                                    className="w-full"
                                >
                                    Export JSON
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={importJson}
                                    className="w-full"
                                >
                                    Import JSON
                                </Button>
                            </VStack>
                        </CollapsibleSection>
                    </VStack>
                </Box>

                {/* Status bar */}
                <StatusBar
                    hoveredTile={hoveredTile}
                    mode={mode}
                    gridSize={{ width: gridWidth, height: gridHeight }}
                    unitCount={heroes.length}
                    featureCount={featurePlacements.length}
                />
            </Box>

            {/* Map board */}
            <Box className="flex-1 overflow-hidden">
                <WorldMapBoard
                    entity={entity}
                    scale={scale}
                    unitScale={unitScale}
                    allowMoveAllHeroes
                    onHeroSelect={handleHeroSelect}
                    onHeroMove={handleHeroMove}
                    tileClickEvent="EDITOR_TILE_CLICK"
                    header={(ctx: WorldMapSlotContext) => (
                        <HStack
                            gap="md"
                            align="center"
                            className="px-4 py-2 bg-gray-900/80 border-b border-gray-700"
                        >
                            <Typography variant="label" weight="semibold" className="text-gray-200">
                                Editor Preview
                            </Typography>
                            <Badge variant="info" size="sm">
                                {gridWidth}x{gridHeight}
                            </Badge>
                            {ctx.selectedHero && (
                                <Badge variant="success" size="sm">
                                    {ctx.selectedHero.name}
                                </Badge>
                            )}
                        </HStack>
                    )}
                    overlay={(ctx: WorldMapSlotContext) => {
                        if (!ctx.hoveredHex) return null;
                        setHoveredTile({ x: ctx.hoveredHex.x, y: ctx.hoveredHex.y });
                        const pos = ctx.tileToScreen(ctx.hoveredHex.x, ctx.hoveredHex.y);
                        return (
                            <Box
                                className="absolute pointer-events-none z-10 px-2 py-1 rounded bg-black/80 text-white text-xs"
                                style={{ left: pos.x + 20, top: pos.y - 10 }}
                            >
                                <Typography variant="caption">
                                    {ctx.hoveredHex.terrain} ({ctx.hoveredHex.x}, {ctx.hoveredHex.y})
                                    {ctx.hoveredHex.passable === false ? ' [blocked]' : ''}
                                </Typography>
                            </Box>
                        );
                    }}
                    footer={(ctx: WorldMapSlotContext) => (
                        <HStack
                            gap="md"
                            align="center"
                            className="px-4 py-1.5 bg-gray-900/80 border-t border-gray-700"
                        >
                            <Badge variant="neutral" size="sm">
                                Mode: {mode}
                            </Badge>
                            {mode === 'paint' && (
                                <Badge size="sm" variant="info">
                                    Brush: {selectedTerrain}
                                </Badge>
                            )}
                            {mode === 'feature' && (
                                <Badge size="sm" variant="warning">
                                    Feature: {selectedFeatureType.replace(/([A-Z])/g, ' $1').trim()}
                                </Badge>
                            )}
                            <Badge variant="neutral" size="sm">
                                Moves: {ctx.validMoves.length}
                            </Badge>
                        </HStack>
                    )}
                />
            </Box>
        </HStack>
    );
}

/** Full editor variant with a 320px side panel for editing grid, terrain, heroes, features, and export/import. */
export const Editor: StoryObj = {
    parameters: {
        layout: 'fullscreen',
        backgrounds: { default: 'dark' },
    },
    render: () => <EditorRender />,
};
