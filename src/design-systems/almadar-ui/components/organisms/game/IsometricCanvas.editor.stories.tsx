/**
 * IsometricCanvas Map Editor (Generic)
 *
 * Full-featured Storybook map editor for the core IsometricCanvas organism.
 * Split layout: 320px editor panel (left) + canvas (right).
 * Supports terrain painting, unit/feature placement, canvas settings, export/import.
 *
 * This is a GENERIC version with no project-specific dependencies.
 * No asset manifest is provided — the canvas uses the built-in colored diamond fallback.
 *
 * NOTE: This is a Storybook render function, not an Orbital template.
 * useState/useCallback usage is expected for interactive editor demos.
 */

import React, { useState, useCallback } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import IsometricCanvas from './IsometricCanvas';
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
    EditorCheckbox,
    EditorTextInput,
    StatusBar,
    TerrainPalette,
    EditorToolbar,
    TERRAIN_COLORS,
    FEATURE_TYPES,
    type EditorMode,
} from './editor/editorUtils';
import { TILE_WIDTH, TILE_HEIGHT, FLOOR_HEIGHT, DIAMOND_TOP_Y } from './utils/isometric';

// =============================================================================
// Constants
// =============================================================================

const UNIT_TYPES = ['infantry', 'cavalry', 'archer', 'mage', 'siege', 'scout'];
const HERO_TYPES = ['warrior', 'ranger', 'sorcerer', 'paladin', 'rogue'];
const TERRAINS = Object.keys(TERRAIN_COLORS);

// =============================================================================
// Helpers
// =============================================================================

function generateGrid(width: number, height: number, terrain = 'grass'): IsometricTile[] {
    const tiles: IsometricTile[] = [];
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            tiles.push({ x, y, terrain });
        }
    }
    return tiles;
}

let nextUnitId = 1;
function makeUnitId(): string {
    return `unit-${nextUnitId++}`;
}

// =============================================================================
// Meta
// =============================================================================

const meta: Meta<typeof IsometricCanvas> = {
    title: 'Game/IsometricCanvas Editor',
    component: IsometricCanvas,
    parameters: {
        layout: 'fullscreen',
        backgrounds: { default: 'dark' },
        docs: {
            description: {
                component:
                    'Full-featured generic map editor for the core IsometricCanvas. ' +
                    'Paint terrain, place units/features, adjust canvas settings, and export/import map data. ' +
                    'No asset manifest — uses colored diamond fallback rendering.',
            },
        },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// =============================================================================
// Editor Story
// =============================================================================

export const Editor: Story = {
    render: () => {
        // -----------------------------------------------------------------
        // State
        // -----------------------------------------------------------------
        const [mode, setMode] = useState<EditorMode>('select');
        const [selectedTerrain, setSelectedTerrain] = useState('grass');
        const [selectedFeatureType, setSelectedFeatureType] = useState<string>(FEATURE_TYPES[0]);

        // Unit template
        const [unitTeam, setUnitTeam] = useState<'player' | 'enemy'>('player');
        const [unitName, setUnitName] = useState('');
        const [unitType, setUnitType] = useState<string>(UNIT_TYPES[0]);
        const [unitHeroId, setUnitHeroId] = useState<string>('');

        // Canvas settings
        const [scale, setScale] = useState(0.4);
        const [unitScale, setUnitScale] = useState(2.5);
        const [debug, setDebug] = useState(false);
        const [diamondTopY, setDiamondTopY] = useState(DIAMOND_TOP_Y);

        // Grid data
        const [gridWidth, setGridWidth] = useState(8);
        const [gridHeight, setGridHeight] = useState(8);
        const [tiles, setTiles] = useState<IsometricTile[]>(() => generateGrid(8, 8));
        const [units, setUnits] = useState<IsometricUnit[]>([]);
        const [features, setFeatures] = useState<IsometricFeature[]>([]);

        // Selection
        const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
        const [hoveredTile, setHoveredTile] = useState<{ x: number; y: number } | null>(null);

        // Collapsible sections
        const [expanded, setExpanded] = useState<Record<string, boolean>>({
            canvas: true,
            grid: true,
            units: false,
            features: false,
            alignment: false,
            export: false,
        });
        const toggle = (key: string) =>
            setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

        // Import textarea
        const [importJson, setImportJson] = useState('');

        // -----------------------------------------------------------------
        // Canvas Click Handler
        // -----------------------------------------------------------------
        const handleTileClick = useCallback(
            (x: number, y: number) => {
                switch (mode) {
                    case 'select': {
                        const unitAtTile = units.find(
                            (u) => u.position?.x === x && u.position?.y === y,
                        );
                        setSelectedUnitId(unitAtTile ? unitAtTile.id : null);
                        break;
                    }

                    case 'paint':
                        setTiles((prev) =>
                            prev.map((t) =>
                                t.x === x && t.y === y
                                    ? { ...t, terrain: selectedTerrain }
                                    : t,
                            ),
                        );
                        break;

                    case 'unit': {
                        const hasUnit = units.some(
                            (u) => u.position?.x === x && u.position?.y === y,
                        );
                        if (hasUnit) {
                            const u = units.find(
                                (u) => u.position?.x === x && u.position?.y === y,
                            );
                            if (u) setSelectedUnitId(u.id);
                        } else {
                            const newUnit: IsometricUnit = {
                                id: makeUnitId(),
                                position: { x, y },
                                name: unitName || (unitHeroId || unitType),
                                team: unitTeam,
                                unitType: unitHeroId ? undefined : unitType,
                                heroId: unitHeroId || undefined,
                                health: 100,
                                maxHealth: 100,
                            };
                            setUnits((prev) => [...prev, newUnit]);
                        }
                        break;
                    }

                    case 'feature': {
                        const hasFeature = features.some(
                            (f) => f.x === x && f.y === y,
                        );
                        if (!hasFeature) {
                            setFeatures((prev) => [
                                ...prev,
                                { x, y, type: selectedFeatureType },
                            ]);
                        }
                        break;
                    }

                    case 'erase': {
                        setUnits((prev) =>
                            prev.filter(
                                (u) =>
                                    !(u.position?.x === x && u.position?.y === y),
                            ),
                        );
                        setFeatures((prev) =>
                            prev.filter((f) => !(f.x === x && f.y === y)),
                        );
                        setTiles((prev) =>
                            prev.map((t) =>
                                t.x === x && t.y === y
                                    ? { ...t, terrain: 'grass' }
                                    : t,
                            ),
                        );
                        break;
                    }
                }
            },
            [
                mode,
                selectedTerrain,
                selectedFeatureType,
                unitTeam,
                unitName,
                unitType,
                unitHeroId,
                units,
                features,
            ],
        );

        const handleUnitClick = useCallback((unitId: string) => {
            setSelectedUnitId(unitId);
        }, []);

        // -----------------------------------------------------------------
        // Grid regeneration
        // -----------------------------------------------------------------
        const regenerateGrid = useCallback(() => {
            setTiles(generateGrid(gridWidth, gridHeight));
            setUnits([]);
            setFeatures([]);
            setSelectedUnitId(null);
        }, [gridWidth, gridHeight]);

        const fillAll = useCallback((terrain: string) => {
            setTiles((prev) => prev.map((t) => ({ ...t, terrain })));
        }, []);

        // -----------------------------------------------------------------
        // Export / Import
        // -----------------------------------------------------------------
        const exportJson = useCallback(() => {
            const data = {
                gridWidth,
                gridHeight,
                scale,
                unitScale,
                diamondTopY,
                tiles,
                units,
                features,
            };
            navigator.clipboard.writeText(JSON.stringify(data, null, 2));
        }, [gridWidth, gridHeight, scale, unitScale, diamondTopY, tiles, units, features]);

        const loadJson = useCallback(() => {
            try {
                const data = JSON.parse(importJson);
                if (data.tiles) setTiles(data.tiles);
                if (data.units) setUnits(data.units);
                if (data.features) setFeatures(data.features);
                if (data.gridWidth) setGridWidth(data.gridWidth);
                if (data.gridHeight) setGridHeight(data.gridHeight);
                if (typeof data.scale === 'number') setScale(data.scale);
                if (typeof data.unitScale === 'number') setUnitScale(data.unitScale);
                if (typeof data.diamondTopY === 'number') setDiamondTopY(data.diamondTopY);
                setImportJson('');
            } catch {
                // Invalid JSON — no-op
            }
        }, [importJson]);

        // -----------------------------------------------------------------
        // Unit editing helpers
        // -----------------------------------------------------------------
        const deleteUnit = useCallback(
            (id: string) => {
                setUnits((prev) => prev.filter((u) => u.id !== id));
                if (selectedUnitId === id) setSelectedUnitId(null);
            },
            [selectedUnitId],
        );

        const updateUnit = useCallback(
            (id: string, patch: Partial<IsometricUnit>) => {
                setUnits((prev) =>
                    prev.map((u) => (u.id === id ? { ...u, ...patch } : u)),
                );
            },
            [],
        );

        // -----------------------------------------------------------------
        // Render
        // -----------------------------------------------------------------
        return (
            <HStack gap="none" className="h-screen w-screen bg-gray-950">
                {/* ==================== Editor Panel ==================== */}
                <VStack
                    gap="none"
                    className="w-[320px] min-w-[320px] border-r border-gray-700 bg-gray-900 h-full"
                >
                    {/* Toolbar */}
                    <Box padding="sm" className="border-b border-gray-700">
                        <EditorToolbar mode={mode} onModeChange={setMode} />
                    </Box>

                    {/* Scrollable sections */}
                    <VStack gap="none" className="flex-1 overflow-y-auto">
                        {/* ---- Canvas Settings ---- */}
                        <CollapsibleSection
                            title="Canvas Settings"
                            expanded={expanded.canvas ?? false}
                            onToggle={() => toggle('canvas')}
                        >
                            <VStack gap="xs">
                                <EditorSlider
                                    label="Scale"
                                    value={scale}
                                    min={0.1}
                                    max={1.5}
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
                                <EditorCheckbox
                                    label="Debug"
                                    checked={debug}
                                    onChange={setDebug}
                                />
                                <EditorSlider
                                    label="Diamond Y"
                                    value={diamondTopY}
                                    min={200}
                                    max={500}
                                    step={1}
                                    onChange={(v) => setDiamondTopY(Math.round(v))}
                                />
                            </VStack>
                        </CollapsibleSection>

                        {/* ---- Grid & Terrain ---- */}
                        <CollapsibleSection
                            title="Grid & Terrain"
                            expanded={expanded.grid ?? false}
                            onToggle={() => toggle('grid')}
                        >
                            <VStack gap="sm">
                                <EditorSlider
                                    label="Width"
                                    value={gridWidth}
                                    min={1}
                                    max={20}
                                    step={1}
                                    onChange={(v) => setGridWidth(Math.round(v))}
                                />
                                <EditorSlider
                                    label="Height"
                                    value={gridHeight}
                                    min={1}
                                    max={20}
                                    step={1}
                                    onChange={(v) => setGridHeight(Math.round(v))}
                                />
                                <HStack gap="xs">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={regenerateGrid}
                                    >
                                        Regenerate
                                    </Button>
                                    <EditorSelect
                                        label="Fill"
                                        value={selectedTerrain}
                                        options={TERRAINS.map((t) => ({
                                            value: t,
                                            label: t,
                                        }))}
                                        onChange={(t) => fillAll(t)}
                                    />
                                </HStack>
                                <Typography
                                    variant="caption"
                                    className="text-gray-500"
                                >
                                    Terrain Palette
                                </Typography>
                                <TerrainPalette
                                    terrains={TERRAINS}
                                    selectedTerrain={selectedTerrain}
                                    onSelect={(t) => {
                                        setSelectedTerrain(t);
                                        setMode('paint');
                                    }}
                                />
                            </VStack>
                        </CollapsibleSection>

                        {/* ---- Units ---- */}
                        <CollapsibleSection
                            title="Units"
                            expanded={expanded.units ?? false}
                            onToggle={() => toggle('units')}
                        >
                            <VStack gap="sm">
                                <EditorSelect
                                    label="Team"
                                    value={unitTeam}
                                    options={[
                                        { value: 'player', label: 'Player' },
                                        { value: 'enemy', label: 'Enemy' },
                                    ]}
                                    onChange={(v) =>
                                        setUnitTeam(v as 'player' | 'enemy')
                                    }
                                />
                                <EditorTextInput
                                    label="Name"
                                    value={unitName}
                                    onChange={setUnitName}
                                    placeholder="Auto"
                                />
                                <EditorSelect
                                    label="Unit Type"
                                    value={unitType}
                                    options={UNIT_TYPES.map((t) => ({
                                        value: t,
                                        label: t,
                                    }))}
                                    onChange={setUnitType}
                                />
                                <EditorSelect
                                    label="Hero ID"
                                    value={unitHeroId}
                                    options={[
                                        { value: '', label: '(none)' },
                                        ...HERO_TYPES.map((h) => ({
                                            value: h,
                                            label: h,
                                        })),
                                    ]}
                                    onChange={setUnitHeroId}
                                />
                                <Typography
                                    variant="caption"
                                    className="text-gray-400"
                                >
                                    Click canvas in Unit mode to place.
                                </Typography>

                                {/* Placed units list */}
                                {units.length > 0 && (
                                    <VStack gap="xs" className="mt-2">
                                        <Typography
                                            variant="caption"
                                            weight="semibold"
                                            className="text-gray-300"
                                        >
                                            Placed Units ({units.length})
                                        </Typography>
                                        {units.map((u) => (
                                            <HStack
                                                key={u.id}
                                                gap="xs"
                                                align="center"
                                                className="py-1 px-2 bg-gray-800 rounded"
                                            >
                                                <Badge
                                                    variant={
                                                        u.team === 'player'
                                                            ? 'success'
                                                            : 'danger'
                                                    }
                                                    size="sm"
                                                >
                                                    {u.team === 'player'
                                                        ? 'P'
                                                        : 'E'}
                                                </Badge>
                                                <Typography
                                                    variant="caption"
                                                    className="flex-1 text-gray-200 truncate"
                                                >
                                                    {u.name ||
                                                        u.unitType ||
                                                        u.heroId}{' '}
                                                    ({u.position?.x},
                                                    {u.position?.y})
                                                </Typography>
                                                <Button
                                                    variant={
                                                        selectedUnitId === u.id
                                                            ? 'primary'
                                                            : 'ghost'
                                                    }
                                                    size="sm"
                                                    onClick={() =>
                                                        setSelectedUnitId(u.id)
                                                    }
                                                >
                                                    Sel
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() =>
                                                        deleteUnit(u.id)
                                                    }
                                                >
                                                    X
                                                </Button>
                                            </HStack>
                                        ))}
                                    </VStack>
                                )}

                                {/* Selected unit editor */}
                                {selectedUnitId &&
                                    units.find(
                                        (u) => u.id === selectedUnitId,
                                    ) &&
                                    (() => {
                                        const su = units.find(
                                            (u) => u.id === selectedUnitId,
                                        )!;
                                        return (
                                            <VStack
                                                gap="xs"
                                                className="mt-2 p-2 border border-blue-600 rounded"
                                            >
                                                <Typography
                                                    variant="caption"
                                                    weight="semibold"
                                                    className="text-blue-400"
                                                >
                                                    Editing: {su.name || su.id}
                                                </Typography>
                                                <EditorTextInput
                                                    label="Name"
                                                    value={su.name || ''}
                                                    onChange={(v) =>
                                                        updateUnit(su.id, {
                                                            name: v,
                                                        })
                                                    }
                                                />
                                                <EditorSlider
                                                    label="Health"
                                                    value={su.health ?? 100}
                                                    min={0}
                                                    max={su.maxHealth ?? 200}
                                                    step={1}
                                                    onChange={(v) =>
                                                        updateUnit(su.id, {
                                                            health: Math.round(
                                                                v,
                                                            ),
                                                        })
                                                    }
                                                />
                                                <EditorSlider
                                                    label="Max HP"
                                                    value={su.maxHealth ?? 100}
                                                    min={1}
                                                    max={500}
                                                    step={1}
                                                    onChange={(v) =>
                                                        updateUnit(su.id, {
                                                            maxHealth:
                                                                Math.round(v),
                                                        })
                                                    }
                                                />
                                            </VStack>
                                        );
                                    })()}
                            </VStack>
                        </CollapsibleSection>

                        {/* ---- Features ---- */}
                        <CollapsibleSection
                            title="Features"
                            expanded={expanded.features ?? false}
                            onToggle={() => toggle('features')}
                        >
                            <VStack gap="sm">
                                <EditorSelect
                                    label="Type"
                                    value={selectedFeatureType}
                                    options={FEATURE_TYPES.map((f) => ({
                                        value: f,
                                        label: f,
                                    }))}
                                    onChange={setSelectedFeatureType}
                                />
                                <Typography
                                    variant="caption"
                                    className="text-gray-400"
                                >
                                    Click canvas in Feature mode to place.
                                </Typography>

                                {features.length > 0 && (
                                    <VStack gap="xs" className="mt-2">
                                        <Typography
                                            variant="caption"
                                            weight="semibold"
                                            className="text-gray-300"
                                        >
                                            Placed Features ({features.length})
                                        </Typography>
                                        {features.map((f, i) => (
                                            <HStack
                                                key={`${f.x}-${f.y}-${i}`}
                                                gap="xs"
                                                align="center"
                                                className="py-1 px-2 bg-gray-800 rounded"
                                            >
                                                <Badge variant="info" size="sm">
                                                    {f.type}
                                                </Badge>
                                                <Typography
                                                    variant="caption"
                                                    className="flex-1 text-gray-300"
                                                >
                                                    ({f.x}, {f.y})
                                                </Typography>
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() =>
                                                        setFeatures((prev) =>
                                                            prev.filter(
                                                                (_, idx) =>
                                                                    idx !== i,
                                                            ),
                                                        )
                                                    }
                                                >
                                                    X
                                                </Button>
                                            </HStack>
                                        ))}
                                    </VStack>
                                )}
                            </VStack>
                        </CollapsibleSection>

                        {/* ---- Alignment / Tuning ---- */}
                        <CollapsibleSection
                            title="Alignment / Tuning"
                            expanded={expanded.alignment ?? false}
                            onToggle={() => toggle('alignment')}
                        >
                            <VStack gap="xs">
                                <EditorSlider
                                    label="Diamond Top Y"
                                    value={diamondTopY}
                                    min={200}
                                    max={500}
                                    step={1}
                                    onChange={(v) =>
                                        setDiamondTopY(Math.round(v))
                                    }
                                />
                                <Typography
                                    variant="caption"
                                    className="text-gray-500"
                                >
                                    Scaled:{' '}
                                    {(diamondTopY * scale).toFixed(0)}px —
                                    where the flat diamond face sits vertically
                                    inside tile sprite
                                </Typography>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setDiamondTopY(DIAMOND_TOP_Y)}
                                    className="text-gray-400"
                                >
                                    Reset to {DIAMOND_TOP_Y}
                                </Button>
                                <Box className="border-t border-gray-700 pt-2 mt-1">
                                    <VStack gap="xs">
                                        <Typography
                                            variant="caption"
                                            className="text-gray-500"
                                        >
                                            TILE_WIDTH: {TILE_WIDTH} (scaled:{' '}
                                            {(TILE_WIDTH * scale).toFixed(0)})
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            className="text-gray-500"
                                        >
                                            TILE_HEIGHT: {TILE_HEIGHT} (scaled:{' '}
                                            {(TILE_HEIGHT * scale).toFixed(0)})
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            className="text-gray-500"
                                        >
                                            FLOOR_HEIGHT: {FLOOR_HEIGHT}{' '}
                                            (scaled:{' '}
                                            {(FLOOR_HEIGHT * scale).toFixed(0)})
                                        </Typography>
                                    </VStack>
                                </Box>
                            </VStack>
                        </CollapsibleSection>

                        {/* ---- Export / Import ---- */}
                        <CollapsibleSection
                            title="Export / Import"
                            expanded={expanded.export ?? false}
                            onToggle={() => toggle('export')}
                        >
                            <VStack gap="sm">
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={exportJson}
                                >
                                    Copy Map JSON
                                </Button>
                                <Box>
                                    <textarea
                                        value={importJson}
                                        onChange={(e) =>
                                            setImportJson(e.target.value)
                                        }
                                        placeholder="Paste map JSON here..."
                                        className="w-full h-20 px-2 py-1 text-xs bg-gray-800 text-gray-300 border border-gray-600 rounded font-mono resize-y"
                                    />
                                </Box>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={loadJson}
                                    disabled={!importJson}
                                >
                                    Load JSON
                                </Button>
                            </VStack>
                        </CollapsibleSection>
                    </VStack>

                    {/* Status Bar */}
                    <StatusBar
                        hoveredTile={hoveredTile}
                        mode={mode}
                        gridSize={{ width: gridWidth, height: gridHeight }}
                        unitCount={units.length}
                        featureCount={features.length}
                    />
                </VStack>

                {/* ==================== Canvas ==================== */}
                <Box className="flex-1 h-full overflow-hidden bg-gray-950">
                    <IsometricCanvas
                        tiles={tiles}
                        units={units}
                        features={features}
                        scale={scale}
                        unitScale={unitScale}
                        debug={debug}
                        diamondTopY={diamondTopY}
                        selectedUnitId={selectedUnitId}
                        hoveredTile={hoveredTile}
                        onTileClick={handleTileClick}
                        onUnitClick={handleUnitClick}
                        onTileHover={(x, y) => setHoveredTile({ x, y })}
                        onTileLeave={() => setHoveredTile(null)}
                    />
                </Box>
            </HStack>
        );
    },
};
