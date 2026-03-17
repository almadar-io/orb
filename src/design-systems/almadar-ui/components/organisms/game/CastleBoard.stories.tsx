import React, { useState, useCallback, useMemo } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CastleBoard } from './CastleBoard';
import type { CastleEntity, CastleSlotContext } from './CastleBoard';
import type { IsometricTile, IsometricUnit, IsometricFeature } from './types/isometric';
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
    type EditorMode,
} from './editor/editorUtils';

// =============================================================================
// Constants
// =============================================================================

const BUILDING_TYPES = ['barracks', 'smithy', 'stable', 'tower', 'marketplace', 'temple'] as const;
const UNIT_TYPES = ['infantry', 'cavalry', 'archer', 'mage'] as const;

// =============================================================================
// Helpers: Mock Data Generators
// =============================================================================

/**
 * Generate a castle tile grid with stone/fortress/castle terrains.
 * Central area is castle, middle ring is fortress, outer ring is stone.
 */
function generateCastleTiles(w: number, h: number): IsometricTile[] {
    const tiles: IsometricTile[] = [];
    const cx = Math.floor(w / 2);
    const cy = Math.floor(h / 2);

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const dx = Math.abs(x - cx);
            const dy = Math.abs(y - cy);
            const dist = Math.max(dx, dy);

            let terrain: string;
            if (dist <= 1) {
                terrain = 'castle';
            } else if (dist <= 2) {
                terrain = 'fortress';
            } else {
                terrain = 'stone';
            }

            tiles.push({ x, y, terrain, passable: true });
        }
    }
    return tiles;
}

const MOCK_FEATURES: IsometricFeature[] = [
    { id: 'barracks-1', x: 1, y: 2, type: 'barracks' },
    { id: 'smithy-1', x: 5, y: 1, type: 'smithy' },
    { id: 'stable-1', x: 6, y: 5, type: 'stable' },
    { id: 'tower-1', x: 1, y: 6, type: 'tower' },
];

const MOCK_UNITS: IsometricUnit[] = [
    { id: 'unit-1', position: { x: 3, y: 4 }, name: 'Ser Aldric', unitType: 'infantry', team: 'player', health: 90, maxHealth: 100 },
    { id: 'unit-2', position: { x: 4, y: 3 }, name: 'Elara', unitType: 'archer', team: 'player', health: 65, maxHealth: 70 },
    { id: 'unit-3', position: { x: 2, y: 3 }, name: 'Theron', unitType: 'cavalry', team: 'player', health: 110, maxHealth: 120 },
];

const MOCK_ENTITY: CastleEntity = {
    id: 'castle-001',
    tiles: generateCastleTiles(8, 8),
    features: MOCK_FEATURES,
    units: MOCK_UNITS,
};

// =============================================================================
// Meta
// =============================================================================

const meta: Meta<typeof CastleBoard> = {
    title: 'Game/CastleBoard',
    component: CastleBoard,
    parameters: {
        layout: 'fullscreen',
        backgrounds: { default: 'dark' },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// =============================================================================
// Story: Default
// =============================================================================

/** Simple CastleBoard with mock entity at default scale. */
export const Default: Story = {
    args: {
        entity: MOCK_ENTITY,
    },
};

// =============================================================================
// Story: WithSlots
// =============================================================================

function WithSlotsRender() {
    return (
        <CastleBoard
            entity={MOCK_ENTITY}
            scale={0.45}
            header={(ctx: CastleSlotContext) => (
                <HStack
                    gap="md"
                    align="center"
                    className="px-4 py-3 bg-[var(--color-surface)] border-b border-[var(--color-border)]"
                >
                    <Typography variant="h3" weight="bold">
                        Ironhold Castle
                    </Typography>
                    <HStack gap="sm" align="center">
                        <Badge variant="warning" size="sm">Gold: 1,240</Badge>
                        <Badge variant="info" size="sm">Wood: 580</Badge>
                        <Badge variant="success" size="sm">Stone: 320</Badge>
                    </HStack>
                </HStack>
            )}
            sidePanel={(ctx: CastleSlotContext) => (
                <VStack gap="md" className="p-4">
                    {/* Selected building detail */}
                    <VStack gap="sm">
                        <Typography variant="label" weight="semibold" className="text-gray-300">
                            Building Detail
                        </Typography>
                        {ctx.selectedFeature ? (
                            <Box className="p-3 rounded bg-gray-800 border border-gray-700">
                                <VStack gap="xs">
                                    <Typography variant="body" weight="bold" className="capitalize">
                                        {ctx.selectedFeature.type}
                                    </Typography>
                                    <Typography variant="caption" className="text-gray-400">
                                        Position: ({ctx.selectedFeature.x}, {ctx.selectedFeature.y})
                                    </Typography>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={ctx.clearSelection}
                                    >
                                        Deselect
                                    </Button>
                                </VStack>
                            </Box>
                        ) : (
                            <Typography variant="caption" className="text-gray-500 italic">
                                Click a building to inspect
                            </Typography>
                        )}
                    </VStack>

                    {/* Garrison list */}
                    <VStack gap="sm">
                        <Typography variant="label" weight="semibold" className="text-gray-300">
                            Garrison
                        </Typography>
                        {MOCK_UNITS.map((u) => (
                            <HStack key={u.id} gap="sm" align="center" className="px-2 py-1 rounded bg-gray-800">
                                <Badge variant="info" size="sm">{u.unitType}</Badge>
                                <Typography variant="caption" className="text-gray-200">{u.name}</Typography>
                                <Typography variant="caption" className="ml-auto text-gray-500">
                                    {u.health}/{u.maxHealth}
                                </Typography>
                            </HStack>
                        ))}
                    </VStack>
                </VStack>
            )}
            overlay={(ctx: CastleSlotContext) => {
                if (!ctx.hoveredTile) return null;

                const label = ctx.hoveredFeature
                    ? ctx.hoveredFeature.type
                    : ctx.hoveredUnit
                    ? ctx.hoveredUnit.name
                    : null;

                if (!label) return null;

                const pos = ctx.tileToScreen(ctx.hoveredTile.x, ctx.hoveredTile.y);
                return (
                    <Box
                        className="absolute pointer-events-none z-50 px-2 py-1 rounded bg-black/80 border border-gray-600 text-xs text-white capitalize whitespace-nowrap"
                        style={{
                            left: pos.x,
                            top: pos.y - 32,
                            transform: 'translateX(-50%)',
                        }}
                    >
                        {label}
                    </Box>
                );
            }}
            footer={(ctx: CastleSlotContext) => (
                <HStack
                    gap="md"
                    align="center"
                    className="px-4 py-2 bg-[var(--color-surface)] border-t border-[var(--color-border)]"
                >
                    <Typography variant="caption" className="text-gray-400">
                        Buildings: {MOCK_FEATURES.length}
                    </Typography>
                    <Typography variant="caption" className="text-gray-400">
                        Garrison: {MOCK_UNITS.length}
                    </Typography>
                    {ctx.hoveredTile && (
                        <Typography variant="caption" className="text-gray-500 ml-auto">
                            Tile: ({ctx.hoveredTile.x}, {ctx.hoveredTile.y})
                        </Typography>
                    )}
                </HStack>
            )}
        />
    );
}

/** CastleBoard with render-prop slots: header, sidePanel, overlay, and footer. */
export const WithSlots: Story = {
    render: () => <WithSlotsRender />,
};

// =============================================================================
// Story: Editor
// =============================================================================

function EditorRender() {
    // Grid state
    const [gridWidth, setGridWidth] = useState(8);
    const [gridHeight, setGridHeight] = useState(8);
    const [tiles, setTiles] = useState<IsometricTile[]>(() => generateCastleTiles(8, 8));

    // Canvas state
    const [scale, setScale] = useState(0.45);

    // Editor mode
    const [mode, setMode] = useState<EditorMode>('select');

    // Feature placement
    const [selectedFeatureType, setSelectedFeatureType] = useState<string>(BUILDING_TYPES[0]);
    const [features, setFeatures] = useState<IsometricFeature[]>([...MOCK_FEATURES]);

    // Unit placement
    const [selectedUnitType, setSelectedUnitType] = useState<string>(UNIT_TYPES[0]);
    const [unitName, setUnitName] = useState('Guard');
    const [units, setUnits] = useState<IsometricUnit[]>([...MOCK_UNITS]);

    // Section collapse state
    const [canvasExpanded, setCanvasExpanded] = useState(true);
    const [gridExpanded, setGridExpanded] = useState(true);
    const [buildingsExpanded, setBuildingsExpanded] = useState(true);
    const [garrisonExpanded, setGarrisonExpanded] = useState(true);
    const [exportExpanded, setExportExpanded] = useState(false);

    // Next IDs
    const [nextFeatureId, setNextFeatureId] = useState(MOCK_FEATURES.length + 1);
    const [nextUnitId, setNextUnitId] = useState(MOCK_UNITS.length + 1);

    // Regenerate grid
    const handleRegenerateGrid = useCallback(() => {
        setTiles(generateCastleTiles(gridWidth, gridHeight));
        // Clear features and units outside new bounds
        setFeatures((prev) => prev.filter((f) => f.x < gridWidth && f.y < gridHeight));
        setUnits((prev) => prev.filter((u) =>
            u.position && u.position.x < gridWidth && u.position.y < gridHeight,
        ));
    }, [gridWidth, gridHeight]);

    // Handle tile click based on mode
    const handleTileClick = useCallback((x: number, y: number) => {
        if (mode === 'feature') {
            // Place building if no feature exists at this tile
            const exists = features.some((f) => f.x === x && f.y === y);
            if (!exists) {
                const id = `editor-feature-${nextFeatureId}`;
                setFeatures((prev) => [...prev, { id, x, y, type: selectedFeatureType }]);
                setNextFeatureId((n) => n + 1);
            }
        } else if (mode === 'unit') {
            // Place unit if no unit exists at this tile
            const exists = units.some((u) => u.position?.x === x && u.position?.y === y);
            if (!exists) {
                const id = `editor-unit-${nextUnitId}`;
                setUnits((prev) => [
                    ...prev,
                    {
                        id,
                        position: { x, y },
                        name: unitName || `Unit ${nextUnitId}`,
                        unitType: selectedUnitType,
                        team: 'player' as const,
                        health: 100,
                        maxHealth: 100,
                    },
                ]);
                setNextUnitId((n) => n + 1);
            }
        } else if (mode === 'erase') {
            // Remove feature or unit at tile
            setFeatures((prev) => prev.filter((f) => !(f.x === x && f.y === y)));
            setUnits((prev) => prev.filter((u) => !(u.position?.x === x && u.position?.y === y)));
        }
    }, [mode, features, units, selectedFeatureType, selectedUnitType, unitName, nextFeatureId, nextUnitId]);

    // Remove feature by ID
    const handleDeleteFeature = useCallback((id: string) => {
        setFeatures((prev) => prev.filter((f) => f.id !== id));
    }, []);

    // Remove unit by ID
    const handleDeleteUnit = useCallback((id: string) => {
        setUnits((prev) => prev.filter((u) => u.id !== id));
    }, []);

    // Export JSON
    const exportData = useMemo(() => JSON.stringify(
        { tiles, features, units, gridWidth, gridHeight },
        null,
        2,
    ), [tiles, features, units, gridWidth, gridHeight]);

    // Import JSON
    const handleImport = useCallback(() => {
        const input = prompt('Paste exported JSON:');
        if (!input) return;
        try {
            const data = JSON.parse(input);
            if (data.tiles) setTiles(data.tiles);
            if (data.features) setFeatures(data.features);
            if (data.units) setUnits(data.units);
            if (data.gridWidth) setGridWidth(data.gridWidth);
            if (data.gridHeight) setGridHeight(data.gridHeight);
        } catch {
            // ignore invalid JSON
        }
    }, []);

    const entity: CastleEntity = useMemo(() => ({
        id: 'editor-castle',
        tiles,
        features,
        units,
    }), [tiles, features, units]);

    const featureOptions = BUILDING_TYPES.map((t) => ({
        value: t,
        label: t.charAt(0).toUpperCase() + t.slice(1),
    }));

    const unitOptions = UNIT_TYPES.map((t) => ({
        value: t,
        label: t.charAt(0).toUpperCase() + t.slice(1),
    }));

    return (
        <HStack gap="none" className="h-screen bg-[var(--color-background)]">
            {/* Editor panel */}
            <Box
                className="shrink-0 bg-gray-900 border-r border-gray-700 overflow-y-auto"
                style={{ width: 320 }}
            >
                <VStack gap="none">
                    {/* Toolbar */}
                    <Box padding="sm" className="border-b border-gray-700">
                        <VStack gap="xs">
                            <Typography variant="label" weight="bold" className="text-gray-200">
                                Castle Editor
                            </Typography>
                            <EditorToolbar mode={mode} onModeChange={setMode} />
                        </VStack>
                    </Box>

                    {/* Sections */}
                    <Box padding="sm">
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
                                </VStack>
                            </CollapsibleSection>

                            {/* Grid */}
                            <CollapsibleSection
                                title="Grid"
                                expanded={gridExpanded}
                                onToggle={() => setGridExpanded((v) => !v)}
                            >
                                <VStack gap="xs">
                                    <EditorSlider
                                        label="Width"
                                        value={gridWidth}
                                        min={4}
                                        max={16}
                                        step={1}
                                        onChange={(v) => setGridWidth(Math.round(v))}
                                    />
                                    <EditorSlider
                                        label="Height"
                                        value={gridHeight}
                                        min={4}
                                        max={16}
                                        step={1}
                                        onChange={(v) => setGridHeight(Math.round(v))}
                                    />
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={handleRegenerateGrid}
                                        className="w-full"
                                    >
                                        Regenerate Grid
                                    </Button>
                                </VStack>
                            </CollapsibleSection>

                            {/* Buildings / Features */}
                            <CollapsibleSection
                                title="Buildings / Features"
                                expanded={buildingsExpanded}
                                onToggle={() => setBuildingsExpanded((v) => !v)}
                            >
                                <VStack gap="xs">
                                    <EditorSelect
                                        label="Type"
                                        value={selectedFeatureType}
                                        options={featureOptions}
                                        onChange={setSelectedFeatureType}
                                    />
                                    <Typography variant="caption" className="text-gray-500">
                                        Switch to Feature mode, then click a tile to place.
                                    </Typography>

                                    {features.length > 0 && (
                                        <VStack gap="xs" className="mt-1">
                                            <Typography variant="caption" className="text-gray-400">
                                                Placed ({features.length}):
                                            </Typography>
                                            {features.map((f) => (
                                                <HStack key={f.id} gap="xs" align="center">
                                                    <Badge variant="info" size="sm" className="capitalize">
                                                        {f.type}
                                                    </Badge>
                                                    <Typography variant="caption" className="text-gray-500">
                                                        ({f.x}, {f.y})
                                                    </Typography>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteFeature(f.id!)}
                                                        className="ml-auto text-red-400 hover:text-red-300"
                                                    >
                                                        x
                                                    </Button>
                                                </HStack>
                                            ))}
                                        </VStack>
                                    )}
                                </VStack>
                            </CollapsibleSection>

                            {/* Garrison */}
                            <CollapsibleSection
                                title="Garrison"
                                expanded={garrisonExpanded}
                                onToggle={() => setGarrisonExpanded((v) => !v)}
                            >
                                <VStack gap="xs">
                                    <EditorSelect
                                        label="Unit Type"
                                        value={selectedUnitType}
                                        options={unitOptions}
                                        onChange={setSelectedUnitType}
                                    />
                                    <EditorTextInput
                                        label="Name"
                                        value={unitName}
                                        onChange={setUnitName}
                                        placeholder="Unit name"
                                    />
                                    <Typography variant="caption" className="text-gray-500">
                                        Switch to Unit mode, then click a tile to place.
                                    </Typography>

                                    {units.length > 0 && (
                                        <VStack gap="xs" className="mt-1">
                                            <Typography variant="caption" className="text-gray-400">
                                                Placed ({units.length}):
                                            </Typography>
                                            {units.map((u) => (
                                                <HStack key={u.id} gap="xs" align="center">
                                                    <Badge variant="success" size="sm" className="capitalize">
                                                        {u.unitType}
                                                    </Badge>
                                                    <Typography variant="caption" className="text-gray-200">
                                                        {u.name}
                                                    </Typography>
                                                    <Typography variant="caption" className="text-gray-500 ml-auto mr-1">
                                                        ({u.position?.x}, {u.position?.y})
                                                    </Typography>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteUnit(u.id)}
                                                        className="text-red-400 hover:text-red-300"
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
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => navigator.clipboard.writeText(exportData)}
                                        className="w-full"
                                    >
                                        Copy JSON to Clipboard
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleImport}
                                        className="w-full"
                                    >
                                        Import from JSON
                                    </Button>
                                    <Box className="max-h-40 overflow-auto rounded bg-gray-800 border border-gray-700 p-2">
                                        <pre className="text-[10px] text-gray-400 whitespace-pre-wrap break-all">
                                            {exportData}
                                        </pre>
                                    </Box>
                                </VStack>
                            </CollapsibleSection>
                        </VStack>
                    </Box>
                </VStack>
            </Box>

            {/* CastleBoard */}
            <Box className="flex-1 min-w-0">
                <CastleBoard
                    entity={entity}
                    scale={scale}
                    onTileClick={handleTileClick}
                    footer={(ctx: CastleSlotContext) => (
                        <HStack
                            gap="md"
                            align="center"
                            className="px-4 py-2 bg-gray-900 border-t border-gray-700"
                        >
                            <Badge variant="info" size="sm">{mode}</Badge>
                            <Typography variant="caption" className="text-gray-400">
                                {ctx.hoveredTile
                                    ? `Tile: (${ctx.hoveredTile.x}, ${ctx.hoveredTile.y})`
                                    : 'Tile: --'}
                            </Typography>
                            <Typography variant="caption" className="text-gray-500">
                                Grid: {gridWidth}x{gridHeight}
                            </Typography>
                            <Typography variant="caption" className="text-gray-500">
                                Buildings: {features.length}
                            </Typography>
                            <Typography variant="caption" className="text-gray-500">
                                Garrison: {units.length}
                            </Typography>
                        </HStack>
                    )}
                />
            </Box>
        </HStack>
    );
}

/**
 * Full editor experience: 320px side panel with canvas settings, grid controls,
 * building/feature placement, garrison management, and export/import.
 * Click tiles in feature/unit/erase mode to place or remove items.
 */
export const Editor: Story = {
    render: () => <EditorRender />,
    parameters: {
        layout: 'fullscreen',
        backgrounds: { default: 'dark' },
    },
};
