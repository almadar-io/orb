import React, { useState, useCallback } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { BattleBoard } from './BattleBoard';
import { UncontrolledBattleBoard } from './UncontrolledBattleBoard';
import type { UncontrolledBattleBoardProps } from './UncontrolledBattleBoard';
import type { BattleEntity, BattleUnit, BattleSlotContext } from './BattleBoard';
import type { IsometricTile } from './types/isometric';
import { Box } from '../../atoms/Box';
import { VStack, HStack } from '../../atoms/Stack';
import { Typography } from '../../atoms/Typography';
import { Button } from '../../atoms/Button';
import { Badge } from '../../atoms/Badge';
import { cn } from '../../../lib/cn';
import {
    CollapsibleSection,
    EditorSlider,
    EditorCheckbox,
    EditorTextInput,
    EditorSelect,
    EditorToolbar,
    TerrainPalette,
    StatusBar,
    TERRAIN_COLORS,
    type EditorMode,
} from './editor/editorUtils';

// =============================================================================
// Helpers
// =============================================================================

const UNIT_TYPES = ['infantry', 'cavalry', 'archer', 'mage', 'siege', 'scout'] as const;

const TERRAINS = Object.keys(TERRAIN_COLORS);

function generateBattleTiles(
    w: number,
    h: number,
    terrain: string = 'grass',
): IsometricTile[] {
    const tiles: IsometricTile[] = [];
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            // Border tiles are stone, interior is the chosen terrain
            const t = (x === 0 || x === w - 1 || y === 0 || y === h - 1)
                ? 'stone'
                : terrain;
            tiles.push({ x, y, terrain: t, passable: true });
        }
    }
    return tiles;
}

const MOCK_UNITS: BattleUnit[] = [
    // Player units
    {
        id: 'p1',
        name: 'Vanguard',
        unitType: 'infantry',
        team: 'player',
        position: { x: 1, y: 2 },
        health: 85,
        maxHealth: 100,
        movement: 3,
        attack: 12,
        defense: 8,
    },
    {
        id: 'p2',
        name: 'Ranger',
        unitType: 'archer',
        team: 'player',
        position: { x: 2, y: 1 },
        health: 55,
        maxHealth: 60,
        movement: 4,
        attack: 14,
        defense: 4,
    },
    {
        id: 'p3',
        name: 'Battlemage',
        unitType: 'mage',
        team: 'player',
        position: { x: 1, y: 4 },
        health: 40,
        maxHealth: 50,
        movement: 2,
        attack: 18,
        defense: 3,
    },
    // Enemy units
    {
        id: 'e1',
        name: 'Ironclad',
        unitType: 'cavalry',
        team: 'enemy',
        position: { x: 6, y: 5 },
        health: 90,
        maxHealth: 110,
        movement: 4,
        attack: 15,
        defense: 10,
    },
    {
        id: 'e2',
        name: 'Bombardier',
        unitType: 'siege',
        team: 'enemy',
        position: { x: 5, y: 6 },
        health: 70,
        maxHealth: 80,
        movement: 1,
        attack: 22,
        defense: 6,
    },
    {
        id: 'e3',
        name: 'Prowler',
        unitType: 'scout',
        team: 'enemy',
        position: { x: 6, y: 3 },
        health: 35,
        maxHealth: 45,
        movement: 5,
        attack: 8,
        defense: 3,
    },
];

/** Mock entity for uncontrolled stories (uses initialUnits). */
const MOCK_UNCONTROLLED_ENTITY: UncontrolledBattleBoardProps['entity'] = {
    id: 'battle-001',
    initialUnits: MOCK_UNITS,
    tiles: generateBattleTiles(8, 8, 'grass'),
    features: [],
    boardWidth: 8,
    boardHeight: 8,
};

/** Mock entity for controlled stories (uses required game-state fields). */
const MOCK_CONTROLLED_ENTITY: BattleEntity = {
    id: 'battle-001',
    units: MOCK_UNITS,
    phase: 'observation',
    turn: 1,
    gameResult: null,
    selectedUnitId: null,
    tiles: generateBattleTiles(8, 8, 'grass'),
    features: [],
    boardWidth: 8,
    boardHeight: 8,
};

// =============================================================================
// Meta
// =============================================================================

const meta: Meta<typeof UncontrolledBattleBoard> = {
    title: 'Game/BattleBoard',
    component: UncontrolledBattleBoard,
    parameters: {
        layout: 'fullscreen',
        backgrounds: { default: 'dark' },
        tags: ['autodocs'],
    },
    decorators: [
        (Story) => (
            <div style={{ width: '100%', minHeight: '100vh', background: '#0a0a1a' }}>
                <Story />
            </div>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// =============================================================================
// 1. Default (Uncontrolled — self-managing state via useBattleState hook)
// =============================================================================

/** Interactive BattleBoard with self-managed game state. */
export const Default: Story = {
    args: {
        entity: MOCK_UNCONTROLLED_ENTITY,
    },
};

// =============================================================================
// 2. WithSlots
// =============================================================================

function HeaderSlot(ctx: BattleSlotContext) {
    return (
        <HStack gap="md" align="center" className="w-full justify-between">
            <HStack gap="sm" align="center">
                <Badge variant="info" size="sm">
                    {ctx.phase.replace('_', ' ').toUpperCase()}
                </Badge>
                <Typography variant="body" className="text-gray-300">
                    Turn {ctx.turn}
                </Typography>
            </HStack>
            <Button variant="primary" size="sm" onClick={ctx.onEndTurn}>
                End Turn
            </Button>
        </HStack>
    );
}

function SidebarSlot(ctx: BattleSlotContext) {
    const renderUnitList = (units: BattleUnit[], label: string, color: string) => (
        <VStack gap="xs">
            <Typography variant="label" weight="semibold" className={color}>
                {label} ({units.length})
            </Typography>
            {units.map((u) => (
                <Box
                    key={u.id}
                    padding="xs"
                    className={cn(
                        'rounded border border-gray-700 bg-gray-800/60',
                        ctx.selectedUnit?.id === u.id && 'border-blue-500 bg-blue-900/30',
                    )}
                >
                    <HStack gap="sm" align="center" className="justify-between">
                        <VStack gap="none">
                            <Typography variant="caption" weight="semibold" className="text-gray-200">
                                {u.name}
                            </Typography>
                            <Typography variant="caption" className="text-gray-500">
                                {u.unitType ?? 'unknown'}
                            </Typography>
                        </VStack>
                        <Typography variant="caption" className="text-gray-400">
                            ATK {u.attack} / DEF {u.defense}
                        </Typography>
                    </HStack>
                    <Box className="mt-1">
                        <Box className="h-1.5 rounded-full bg-gray-700 overflow-hidden">
                            <Box
                                className="h-full rounded-full transition-all"
                                style={{
                                    width: `${(u.health / u.maxHealth) * 100}%`,
                                    backgroundColor: u.health / u.maxHealth > 0.5
                                        ? '#22c55e'
                                        : u.health / u.maxHealth > 0.25
                                            ? '#eab308'
                                            : '#ef4444',
                                }}
                            />
                        </Box>
                        <Typography variant="caption" className="text-gray-500 text-right">
                            {u.health}/{u.maxHealth}
                        </Typography>
                    </Box>
                </Box>
            ))}
        </VStack>
    );

    return (
        <VStack gap="md" className="p-3 bg-gray-900/80 rounded-lg border border-gray-700 h-full overflow-y-auto">
            <Typography variant="h3" size="sm" weight="bold" className="text-gray-100">
                Unit Roster
            </Typography>
            {renderUnitList(ctx.playerUnits, 'Player Units', 'text-blue-400')}
            {renderUnitList(ctx.enemyUnits, 'Enemy Units', 'text-red-400')}
        </VStack>
    );
}

function OverlaySlot(ctx: BattleSlotContext) {
    if (!ctx.hoveredUnit) return null;
    const u = ctx.hoveredUnit;
    const screenPos = ctx.tileToScreen(u.position.x, u.position.y);

    return (
        <Box
            className="absolute z-40 pointer-events-none"
            style={{
                left: screenPos.x - 60,
                top: screenPos.y - 90,
            }}
        >
            <VStack
                gap="xs"
                className="p-2 bg-gray-900/95 border border-gray-600 rounded-lg shadow-xl min-w-[140px]"
            >
                <HStack gap="xs" align="center" className="justify-between">
                    <Typography variant="caption" weight="bold" className="text-gray-100">
                        {u.name}
                    </Typography>
                    <Badge variant={u.team === 'player' ? 'info' : 'error'} size="sm">
                        {u.team}
                    </Badge>
                </HStack>
                <Typography variant="caption" className="text-gray-400">
                    HP: {u.health}/{u.maxHealth} | ATK: {u.attack} | DEF: {u.defense}
                </Typography>
            </VStack>
        </Box>
    );
}

function ActionsSlot(ctx: BattleSlotContext) {
    if (ctx.gameResult) return null;
    return (
        <Box className="fixed bottom-6 right-6 z-50">
            <HStack gap="sm">
                {(ctx.phase === 'movement' || ctx.phase === 'action') && (
                    <Button variant="secondary" size="md" onClick={ctx.onCancel}>
                        Cancel
                    </Button>
                )}
                <Button variant="primary" size="md" onClick={ctx.onEndTurn}>
                    End Turn
                </Button>
            </HStack>
        </Box>
    );
}

/** UncontrolledBattleBoard with render-prop slots: header, sidebar, overlay, and actions. */
export const WithSlots: Story = {
    args: {
        entity: MOCK_UNCONTROLLED_ENTITY,
        header: HeaderSlot,
        sidebar: SidebarSlot,
        overlay: OverlaySlot,
        actions: ActionsSlot,
    },
};

// =============================================================================
// 3. Editor
// =============================================================================

interface EditorUnit {
    id: string;
    name: string;
    unitType: string;
    team: 'player' | 'enemy';
    position: { x: number; y: number };
    health: number;
    maxHealth: number;
    movement: number;
    attack: number;
    defense: number;
}

function EditorStory() {
    // Canvas settings
    const [scale, setScale] = useState(0.45);
    const [debug, setDebug] = useState(false);

    // Grid
    const [gridWidth] = useState(8);
    const [gridHeight] = useState(8);
    const [tiles, setTiles] = useState<IsometricTile[]>(() => generateBattleTiles(gridWidth, gridHeight, 'grass'));

    // Editor mode
    const [mode, setMode] = useState<EditorMode>('select');
    const [selectedTerrain, setSelectedTerrain] = useState('grass');

    // Unit placement
    const [unitTeam, setUnitTeam] = useState<'player' | 'enemy'>('player');
    const [unitName, setUnitName] = useState('');
    const [unitType, setUnitType] = useState<string>(UNIT_TYPES[0]);
    const [placedUnits, setPlacedUnits] = useState<EditorUnit[]>([]);
    const [nextUnitId, setNextUnitId] = useState(1);

    // Section collapse state
    const [canvasExpanded, setCanvasExpanded] = useState(true);
    const [unitsExpanded, setUnitsExpanded] = useState(true);
    const [terrainExpanded, setTerrainExpanded] = useState(true);
    const [exportExpanded, setExportExpanded] = useState(false);

    // Import
    const [importJson, setImportJson] = useState('');

    // Hovered tile for status bar
    const [hoveredTile, setHoveredTile] = useState<{ x: number; y: number } | null>(null);

    // Build entity from editor state (uncontrolled — uses initialUnits)
    const entity: UncontrolledBattleBoardProps['entity'] = {
        id: 'editor-battle',
        initialUnits: placedUnits,
        tiles,
        features: [],
        boardWidth: gridWidth,
        boardHeight: gridHeight,
    };

    // Handle tile click based on mode
    const handleTileClick = useCallback((x: number, y: number) => {
        if (mode === 'unit') {
            // Check for existing unit at this position
            if (placedUnits.some((u) => u.position.x === x && u.position.y === y)) return;
            const name = unitName || `${unitType}-${nextUnitId}`;
            const newUnit: EditorUnit = {
                id: `unit-${nextUnitId}`,
                name,
                unitType,
                team: unitTeam,
                position: { x, y },
                health: 100,
                maxHealth: 100,
                movement: 3,
                attack: 10,
                defense: 5,
            };
            setPlacedUnits((prev) => [...prev, newUnit]);
            setNextUnitId((n) => n + 1);
            setUnitName('');
        } else if (mode === 'paint') {
            setTiles((prev) =>
                prev.map((t) =>
                    t.x === x && t.y === y ? { ...t, terrain: selectedTerrain } : t,
                ),
            );
        } else if (mode === 'erase') {
            // Remove unit at position
            setPlacedUnits((prev) => prev.filter((u) => !(u.position.x === x && u.position.y === y)));
            // Reset terrain to grass
            setTiles((prev) =>
                prev.map((t) =>
                    t.x === x && t.y === y ? { ...t, terrain: 'grass' } : t,
                ),
            );
        }
    }, [mode, unitName, unitType, unitTeam, nextUnitId, placedUnits, selectedTerrain]);

    // Delete a placed unit
    const handleDeleteUnit = useCallback((unitId: string) => {
        setPlacedUnits((prev) => prev.filter((u) => u.id !== unitId));
    }, []);

    // Export JSON
    const handleExport = useCallback(() => {
        const data = {
            boardWidth: gridWidth,
            boardHeight: gridHeight,
            tiles: tiles.map((t) => ({ x: t.x, y: t.y, terrain: t.terrain })),
            units: placedUnits.map((u) => ({
                id: u.id,
                name: u.name,
                unitType: u.unitType,
                team: u.team,
                position: u.position,
                health: u.health,
                maxHealth: u.maxHealth,
                movement: u.movement,
                attack: u.attack,
                defense: u.defense,
            })),
        };
        navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    }, [gridWidth, gridHeight, tiles, placedUnits]);

    // Import JSON
    const handleImport = useCallback(() => {
        try {
            const data = JSON.parse(importJson);
            if (data.tiles && Array.isArray(data.tiles)) {
                setTiles(
                    data.tiles.map((t: { x: number; y: number; terrain?: string }) => ({
                        x: t.x,
                        y: t.y,
                        terrain: t.terrain ?? 'grass',
                        passable: true,
                    })),
                );
            }
            if (data.units && Array.isArray(data.units)) {
                setPlacedUnits(data.units);
                setNextUnitId(data.units.length + 1);
            }
            setImportJson('');
        } catch {
            // Invalid JSON -- silently ignore
        }
    }, [importJson]);

    // Regenerate tiles
    const handleRegenerateTiles = useCallback(() => {
        setTiles(generateBattleTiles(gridWidth, gridHeight, selectedTerrain));
    }, [gridWidth, gridHeight, selectedTerrain]);

    return (
        <HStack gap="none" className="h-screen w-full">
            {/* Editor Panel */}
            <VStack
                gap="none"
                className="w-[320px] shrink-0 h-full bg-gray-900 border-r border-gray-700 overflow-y-auto"
            >
                <Box padding="sm" className="border-b border-gray-700">
                    <Typography variant="h3" size="sm" weight="bold" className="text-gray-100">
                        BattleBoard Editor
                    </Typography>
                </Box>

                <Box padding="sm" className="border-b border-gray-700">
                    <EditorToolbar mode={mode} onModeChange={setMode} />
                </Box>

                <VStack gap="none" className="flex-1">
                    {/* Canvas Settings */}
                    <Box className="border-b border-gray-700">
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
                                    max={1.5}
                                    step={0.05}
                                    onChange={setScale}
                                />
                                <EditorCheckbox
                                    label="Debug"
                                    checked={debug}
                                    onChange={setDebug}
                                />
                                <Button variant="ghost" size="sm" onClick={handleRegenerateTiles}>
                                    Regenerate Tiles
                                </Button>
                            </VStack>
                        </CollapsibleSection>
                    </Box>

                    {/* Units */}
                    <Box className="border-b border-gray-700">
                        <CollapsibleSection
                            title="Units"
                            expanded={unitsExpanded}
                            onToggle={() => setUnitsExpanded((v) => !v)}
                        >
                            <VStack gap="sm">
                                <EditorSelect
                                    label="Team"
                                    value={unitTeam}
                                    options={[
                                        { value: 'player', label: 'Player' },
                                        { value: 'enemy', label: 'Enemy' },
                                    ]}
                                    onChange={(v) => setUnitTeam(v as 'player' | 'enemy')}
                                />
                                <EditorSelect
                                    label="Type"
                                    value={unitType}
                                    options={UNIT_TYPES.map((t) => ({ value: t, label: t }))}
                                    onChange={setUnitType}
                                />
                                <EditorTextInput
                                    label="Name"
                                    value={unitName}
                                    onChange={setUnitName}
                                    placeholder="Auto-generated if empty"
                                />
                                {mode === 'unit' && (
                                    <Typography variant="caption" className="text-blue-400">
                                        Click a tile to place a unit
                                    </Typography>
                                )}

                                {/* Placed units list */}
                                {placedUnits.length > 0 && (
                                    <VStack gap="xs">
                                        <Typography variant="caption" weight="semibold" className="text-gray-400">
                                            Placed ({placedUnits.length})
                                        </Typography>
                                        {placedUnits.map((u) => (
                                            <HStack
                                                key={u.id}
                                                gap="xs"
                                                align="center"
                                                className="justify-between"
                                            >
                                                <HStack gap="xs" align="center">
                                                    <Badge
                                                        variant={u.team === 'player' ? 'info' : 'error'}
                                                        size="sm"
                                                    >
                                                        {u.team[0].toUpperCase()}
                                                    </Badge>
                                                    <Typography variant="caption" className="text-gray-300">
                                                        {u.name} ({u.position.x},{u.position.y})
                                                    </Typography>
                                                </HStack>
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
                    </Box>

                    {/* Terrain */}
                    <Box className="border-b border-gray-700">
                        <CollapsibleSection
                            title="Terrain"
                            expanded={terrainExpanded}
                            onToggle={() => setTerrainExpanded((v) => !v)}
                        >
                            <VStack gap="sm">
                                <Typography variant="caption" className="text-gray-400">
                                    {mode === 'paint'
                                        ? 'Click tiles to paint terrain'
                                        : 'Switch to Paint mode to edit terrain'}
                                </Typography>
                                <TerrainPalette
                                    terrains={TERRAINS}
                                    selectedTerrain={selectedTerrain}
                                    onSelect={setSelectedTerrain}
                                />
                            </VStack>
                        </CollapsibleSection>
                    </Box>

                    {/* Export / Import */}
                    <Box className="border-b border-gray-700">
                        <CollapsibleSection
                            title="Export / Import"
                            expanded={exportExpanded}
                            onToggle={() => setExportExpanded((v) => !v)}
                        >
                            <VStack gap="sm">
                                <Button variant="primary" size="sm" onClick={handleExport}>
                                    Copy JSON to Clipboard
                                </Button>
                                <Box>
                                    <textarea
                                        value={importJson}
                                        onChange={(e) => setImportJson(e.target.value)}
                                        placeholder="Paste JSON here..."
                                        rows={4}
                                        className="w-full px-2 py-1 text-xs bg-gray-700 text-gray-200 border border-gray-600 rounded resize-y font-mono"
                                    />
                                </Box>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={handleImport}
                                    disabled={!importJson.trim()}
                                >
                                    Load JSON
                                </Button>
                            </VStack>
                        </CollapsibleSection>
                    </Box>
                </VStack>

                {/* Status bar */}
                <StatusBar
                    hoveredTile={hoveredTile}
                    mode={mode}
                    gridSize={{ width: gridWidth, height: gridHeight }}
                    unitCount={placedUnits.length}
                />
            </VStack>

            {/* Board */}
            <Box className="flex-1 h-full overflow-hidden">
                <UncontrolledBattleBoard
                    entity={entity}
                    scale={scale}
                    tileClickEvent={undefined}
                    header={(ctx) => (
                        <HStack gap="sm" align="center" className="justify-between">
                            <HStack gap="sm" align="center">
                                <Badge variant="info" size="sm">
                                    {ctx.phase.replace('_', ' ').toUpperCase()}
                                </Badge>
                                <Typography variant="caption" className="text-gray-400">
                                    Turn {ctx.turn}
                                </Typography>
                                <Typography variant="caption" className="text-gray-500">
                                    Units: {ctx.playerUnits.length}P / {ctx.enemyUnits.length}E
                                </Typography>
                            </HStack>
                            <HStack gap="xs">
                                <Button variant="ghost" size="sm" onClick={ctx.onCancel}>
                                    Cancel
                                </Button>
                                <Button variant="primary" size="sm" onClick={ctx.onEndTurn}>
                                    End Turn
                                </Button>
                            </HStack>
                        </HStack>
                    )}
                />
            </Box>
        </HStack>
    );
}

/**
 * Full editor variant with a 320px editor panel (left) and the board (right).
 * Supports unit placement, terrain painting, erasing, and JSON export/import.
 */
export const Editor: Story = {
    render: () => <EditorStory />,
    parameters: {
        layout: 'fullscreen',
        backgrounds: { default: 'dark' },
    },
};

// =============================================================================
// 4. Controlled (state passed directly to BattleBoard)
// =============================================================================

/**
 * Controlled BattleBoard — all game state is passed via entity props.
 * No internal state management; parent is responsible for state transitions.
 * This story renders a static snapshot (no interactions mutate state).
 */
export const Controlled: StoryObj<typeof BattleBoard> = {
    render: (args) => <BattleBoard {...args} />,
    args: {
        entity: MOCK_CONTROLLED_ENTITY,
    },
};
