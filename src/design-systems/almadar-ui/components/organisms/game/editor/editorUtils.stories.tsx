import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Box } from '../../../atoms/Box';
import { VStack } from '../../../atoms/Stack';
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
} from './editorUtils';

// =============================================================================
// Meta
// =============================================================================

/**
 * Generic editor utility components for Storybook-based map editing.
 * Includes toolbar, collapsible sections, sliders, selects, checkboxes,
 * text inputs, terrain palette, and status bar.
 */
const meta: Meta = {
    title: 'Game/Editor Utils',
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'dark' },
    },
};

export default meta;

// =============================================================================
// Helpers
// =============================================================================

const TERRAIN_LIST = Object.keys(TERRAIN_COLORS);

const FEATURE_OPTIONS = FEATURE_TYPES.map((f) => ({
    value: f,
    label: f.replace(/([A-Z])/g, ' $1').trim(),
}));

// =============================================================================
// Story: AllControls
// =============================================================================

function AllControlsRender() {
    const [mode, setMode] = useState<EditorMode>('select');
    const [tileWidth, setTileWidth] = useState(64);
    const [tileHeight, setTileHeight] = useState(32);
    const [unitScale, setUnitScale] = useState(2.5);
    const [animSpeed, setAnimSpeed] = useState(2.0);
    const [selectedTerrain, setSelectedTerrain] = useState('grass');
    const [selectedFeature, setSelectedFeature] = useState<string>(FEATURE_TYPES[0]);
    const [showGrid, setShowGrid] = useState(true);
    const [showCoords, setShowCoords] = useState(false);
    const [unitName, setUnitName] = useState('Knight');
    const [unitTeam, setUnitTeam] = useState('player');

    const [canvasExpanded, setCanvasExpanded] = useState(true);
    const [terrainExpanded, setTerrainExpanded] = useState(true);
    const [unitExpanded, setUnitExpanded] = useState(false);

    const [hoveredTile, setHoveredTile] = useState<{ x: number; y: number } | null>({ x: 5, y: 3 });

    return (
        <Box
            className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden"
            style={{ width: 320 }}
        >
            <VStack gap="none">
                {/* Toolbar */}
                <Box padding="sm" className="border-b border-gray-700">
                    <EditorToolbar mode={mode} onModeChange={setMode} />
                </Box>

                {/* Scrollable panel area */}
                <Box padding="sm" style={{ maxHeight: 420, overflowY: 'auto' }}>
                    <VStack gap="sm">
                        {/* Canvas Settings */}
                        <CollapsibleSection
                            title="Canvas Settings"
                            expanded={canvasExpanded}
                            onToggle={() => setCanvasExpanded((v) => !v)}
                        >
                            <VStack gap="xs">
                                <EditorSlider
                                    label="Tile W"
                                    value={tileWidth}
                                    min={32}
                                    max={128}
                                    step={4}
                                    onChange={setTileWidth}
                                />
                                <EditorSlider
                                    label="Tile H"
                                    value={tileHeight}
                                    min={16}
                                    max={64}
                                    step={2}
                                    onChange={setTileHeight}
                                />
                                <EditorSlider
                                    label="Unit Scale"
                                    value={unitScale}
                                    min={0.5}
                                    max={5}
                                    step={0.1}
                                    onChange={setUnitScale}
                                />
                                <EditorSlider
                                    label="Anim Speed"
                                    value={animSpeed}
                                    min={0.25}
                                    max={5}
                                    step={0.25}
                                    onChange={setAnimSpeed}
                                />
                                <EditorCheckbox
                                    label="Show Grid"
                                    checked={showGrid}
                                    onChange={setShowGrid}
                                />
                                <EditorCheckbox
                                    label="Coordinates"
                                    checked={showCoords}
                                    onChange={setShowCoords}
                                />
                            </VStack>
                        </CollapsibleSection>

                        {/* Terrain Palette */}
                        <CollapsibleSection
                            title="Terrain Palette"
                            expanded={terrainExpanded}
                            onToggle={() => setTerrainExpanded((v) => !v)}
                        >
                            <TerrainPalette
                                terrains={TERRAIN_LIST}
                                selectedTerrain={selectedTerrain}
                                onSelect={setSelectedTerrain}
                            />
                        </CollapsibleSection>

                        {/* Unit Controls */}
                        <CollapsibleSection
                            title="Unit Controls"
                            expanded={unitExpanded}
                            onToggle={() => setUnitExpanded((v) => !v)}
                        >
                            <VStack gap="xs">
                                <EditorTextInput
                                    label="Unit Name"
                                    value={unitName}
                                    onChange={setUnitName}
                                    placeholder="Enter unit name"
                                />
                                <EditorSelect
                                    label="Team"
                                    value={unitTeam}
                                    options={[
                                        { value: 'player', label: 'Player' },
                                        { value: 'enemy', label: 'Enemy' },
                                        { value: 'neutral', label: 'Neutral' },
                                    ]}
                                    onChange={setUnitTeam}
                                />
                                <EditorSelect
                                    label="Feature"
                                    value={selectedFeature}
                                    options={FEATURE_OPTIONS}
                                    onChange={setSelectedFeature}
                                />
                            </VStack>
                        </CollapsibleSection>
                    </VStack>
                </Box>

                {/* Status Bar */}
                <StatusBar
                    hoveredTile={hoveredTile}
                    mode={mode}
                    gridSize={{ width: 12, height: 12 }}
                    unitCount={6}
                    featureCount={4}
                />
            </VStack>
        </Box>
    );
}

export const AllControls: StoryObj = {
    render: () => <AllControlsRender />,
};

// =============================================================================
// Story: CollapsibleSectionDemo
// =============================================================================

function CollapsibleSectionDemoRender() {
    const [expanded, setExpanded] = useState(true);
    const [zoom, setZoom] = useState(1.0);
    const [opacity, setOpacity] = useState(0.8);

    return (
        <Box className="bg-gray-900 rounded-lg border border-gray-700 p-4" style={{ width: 320 }}>
            <CollapsibleSection
                title="Display Settings"
                expanded={expanded}
                onToggle={() => setExpanded((v) => !v)}
            >
                <VStack gap="xs">
                    <EditorSlider
                        label="Zoom"
                        value={zoom}
                        min={0.25}
                        max={4}
                        step={0.25}
                        onChange={setZoom}
                    />
                    <EditorSlider
                        label="Opacity"
                        value={opacity}
                        min={0}
                        max={1}
                        step={0.05}
                        onChange={setOpacity}
                    />
                </VStack>
            </CollapsibleSection>
        </Box>
    );
}

export const CollapsibleSectionDemo: StoryObj = {
    render: () => <CollapsibleSectionDemoRender />,
};

// =============================================================================
// Story: TerrainPaletteDemo
// =============================================================================

function TerrainPaletteDemoRender() {
    const [selected, setSelected] = useState('grass');

    return (
        <Box className="bg-gray-900 rounded-lg border border-gray-700 p-4" style={{ width: 360 }}>
            <VStack gap="sm">
                <Box className="text-gray-300 text-xs">
                    Selected: <strong className="text-white">{selected}</strong>
                </Box>
                <TerrainPalette
                    terrains={TERRAIN_LIST}
                    selectedTerrain={selected}
                    onSelect={setSelected}
                />
            </VStack>
        </Box>
    );
}

export const TerrainPaletteDemo: StoryObj = {
    render: () => <TerrainPaletteDemoRender />,
};

// =============================================================================
// Story: ToolbarDemo
// =============================================================================

function ToolbarDemoRender() {
    const [mode, setMode] = useState<EditorMode>('select');

    return (
        <Box className="bg-gray-900 rounded-lg border border-gray-700 p-4" style={{ width: 400 }}>
            <VStack gap="sm">
                <Box className="text-gray-300 text-xs">
                    Active mode: <strong className="text-white">{mode}</strong>
                </Box>
                <EditorToolbar mode={mode} onModeChange={setMode} />
            </VStack>
        </Box>
    );
}

export const ToolbarDemo: StoryObj = {
    render: () => <ToolbarDemoRender />,
};

// =============================================================================
// Story: StatusBarDemo
// =============================================================================

function StatusBarDemoRender() {
    return (
        <VStack gap="md" style={{ width: '100%', maxWidth: 600 }}>
            <Box className="text-gray-400 text-xs">Paint mode with hovered tile:</Box>
            <StatusBar
                hoveredTile={{ x: 7, y: 4 }}
                mode="paint"
                gridSize={{ width: 16, height: 16 }}
                unitCount={12}
                featureCount={5}
            />

            <Box className="text-gray-400 text-xs">Select mode, no tile hovered:</Box>
            <StatusBar
                hoveredTile={null}
                mode="select"
                gridSize={{ width: 8, height: 8 }}
                unitCount={3}
                featureCount={0}
            />

            <Box className="text-gray-400 text-xs">Erase mode, minimal info:</Box>
            <StatusBar
                hoveredTile={{ x: 0, y: 0 }}
                mode="erase"
            />
        </VStack>
    );
}

export const StatusBarDemo: StoryObj = {
    parameters: {
        layout: 'padded',
    },
    render: () => <StatusBarDemoRender />,
};
