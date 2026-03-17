/**
 * Shared Map Editor Utilities
 *
 * Reusable editor components for Storybook-based map editing.
 * All composed from @almadar/ui atoms (Box, VStack, HStack, Typography, Button, Badge).
 *
 * NOTE: These are Storybook editor controls, NOT Orbital templates.
 * They use native HTML inputs wrapped in Box for lightweight editor UX.
 */

import React from 'react';
import { Box } from '../../../atoms/Box';
import { VStack, HStack } from '../../../atoms/Stack';
import { Typography } from '../../../atoms/Typography';
import { Button } from '../../../atoms/Button';
import { Badge } from '../../../atoms/Badge';
import { ChevronDown, ChevronRight } from 'lucide-react';

// =============================================================================
// Types
// =============================================================================

export type EditorMode = 'select' | 'paint' | 'unit' | 'feature' | 'erase';

// =============================================================================
// Constants
// =============================================================================

export const TERRAIN_COLORS: Record<string, string> = {
    grass: '#4a7c3f',
    dirt: '#8b6c42',
    stone: '#7a7a7a',
    sand: '#c4a84d',
    water: '#3a6ea5',
    forest: '#2d5a1e',
    mountain: '#5a4a3a',
    lava: '#c44b2b',
    ice: '#a0d2e8',
    plains: '#6b8e4e',
    fortress: '#4a4a5a',
    castle: '#5a5a6a',
};

export const FEATURE_TYPES = [
    'goldMine', 'resonanceCrystal', 'traitCache', 'salvageYard',
    'portal', 'battleMarker', 'treasure', 'castle',
] as const;

// =============================================================================
// CollapsibleSection
// =============================================================================

export interface CollapsibleSectionProps {
    title: string;
    expanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    className?: string;
}

export function CollapsibleSection({ title, expanded, onToggle, children, className }: CollapsibleSectionProps) {
    const Icon = expanded ? ChevronDown : ChevronRight;
    return (
        <VStack gap="xs" className={className}>
            <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="w-full justify-start text-left"
            >
                <HStack gap="xs" align="center">
                    <Icon size={14} />
                    <Typography variant="label" weight="semibold">{title}</Typography>
                </HStack>
            </Button>
            {expanded && (
                <Box padding="xs" paddingX="sm">
                    {children}
                </Box>
            )}
        </VStack>
    );
}
CollapsibleSection.displayName = 'CollapsibleSection';

// =============================================================================
// EditorSlider
// =============================================================================

export interface EditorSliderProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    onChange: (value: number) => void;
    className?: string;
}

export function EditorSlider({ label, value, min, max, step = 0.1, onChange, className }: EditorSliderProps) {
    return (
        <HStack gap="sm" align="center" className={className}>
            <Typography variant="caption" className="min-w-[80px] text-gray-300">{label}</Typography>
            <Box className="flex-1">
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onChange(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
            </Box>
            <Typography variant="caption" className="min-w-[40px] text-right text-gray-400">
                {typeof step === 'number' && step < 1 ? value.toFixed(1) : value}
            </Typography>
        </HStack>
    );
}
EditorSlider.displayName = 'EditorSlider';

// =============================================================================
// EditorSelect
// =============================================================================

export interface EditorSelectProps {
    label: string;
    value: string;
    options: Array<{ value: string; label: string }>;
    onChange: (value: string) => void;
    className?: string;
}

export function EditorSelect({ label, value, options, onChange, className }: EditorSelectProps) {
    return (
        <HStack gap="sm" align="center" className={className}>
            <Typography variant="caption" className="min-w-[80px] text-gray-300">{label}</Typography>
            <Box className="flex-1">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full px-2 py-1 text-xs bg-gray-700 text-gray-200 border border-gray-600 rounded cursor-pointer"
                >
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </Box>
        </HStack>
    );
}
EditorSelect.displayName = 'EditorSelect';

// =============================================================================
// EditorCheckbox
// =============================================================================

export interface EditorCheckboxProps {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    className?: string;
}

export function EditorCheckbox({ label, checked, onChange, className }: EditorCheckboxProps) {
    return (
        <HStack gap="sm" align="center" className={className}>
            <Typography variant="caption" className="min-w-[80px] text-gray-300">{label}</Typography>
            <Box>
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    className="w-4 h-4 accent-blue-500 cursor-pointer"
                />
            </Box>
        </HStack>
    );
}
EditorCheckbox.displayName = 'EditorCheckbox';

// =============================================================================
// EditorTextInput
// =============================================================================

export interface EditorTextInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function EditorTextInput({ label, value, onChange, placeholder, className }: EditorTextInputProps) {
    return (
        <HStack gap="sm" align="center" className={className}>
            <Typography variant="caption" className="min-w-[80px] text-gray-300">{label}</Typography>
            <Box className="flex-1">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full px-2 py-1 text-xs bg-gray-700 text-gray-200 border border-gray-600 rounded"
                />
            </Box>
        </HStack>
    );
}
EditorTextInput.displayName = 'EditorTextInput';

// =============================================================================
// StatusBar
// =============================================================================

export interface StatusBarProps {
    hoveredTile: { x: number; y: number } | null;
    mode: EditorMode;
    gridSize?: { width: number; height: number };
    unitCount?: number;
    featureCount?: number;
    className?: string;
}

export function StatusBar({ hoveredTile, mode, gridSize, unitCount, featureCount, className }: StatusBarProps) {
    return (
        <HStack gap="sm" align="center" className={`px-3 py-1.5 bg-gray-800 border-t border-gray-700 ${className ?? ''}`}>
            <Badge variant="info" size="sm">{mode}</Badge>
            <Typography variant="caption" className="text-gray-400">
                Tile: {hoveredTile ? `(${hoveredTile.x}, ${hoveredTile.y})` : '—'}
            </Typography>
            {gridSize && (
                <Typography variant="caption" className="text-gray-500">
                    Grid: {gridSize.width}x{gridSize.height}
                </Typography>
            )}
            {unitCount !== undefined && (
                <Typography variant="caption" className="text-gray-500">
                    Units: {unitCount}
                </Typography>
            )}
            {featureCount !== undefined && (
                <Typography variant="caption" className="text-gray-500">
                    Features: {featureCount}
                </Typography>
            )}
        </HStack>
    );
}
StatusBar.displayName = 'StatusBar';

// =============================================================================
// TerrainPalette
// =============================================================================

export interface TerrainPaletteProps {
    terrains: string[];
    selectedTerrain: string;
    onSelect: (terrain: string) => void;
    className?: string;
}

export function TerrainPalette({ terrains, selectedTerrain, onSelect, className }: TerrainPaletteProps) {
    return (
        <HStack gap="xs" wrap className={className}>
            {terrains.map((terrain) => (
                <Box
                    key={terrain}
                    onClick={() => onSelect(terrain)}
                    className={`w-8 h-8 rounded cursor-pointer border-2 transition-all ${
                        selectedTerrain === terrain
                            ? 'border-white scale-110 shadow-lg'
                            : 'border-gray-600 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: TERRAIN_COLORS[terrain] || '#555' }}
                    title={terrain}
                />
            ))}
        </HStack>
    );
}
TerrainPalette.displayName = 'TerrainPalette';

// =============================================================================
// EditorToolbar
// =============================================================================

const MODE_LABELS: Record<EditorMode, string> = {
    select: 'Select',
    paint: 'Paint',
    unit: 'Unit',
    feature: 'Feature',
    erase: 'Erase',
};

export interface EditorToolbarProps {
    mode: EditorMode;
    onModeChange: (mode: EditorMode) => void;
    className?: string;
}

export function EditorToolbar({ mode, onModeChange, className }: EditorToolbarProps) {
    const modes: EditorMode[] = ['select', 'paint', 'unit', 'feature', 'erase'];
    return (
        <HStack gap="xs" wrap className={className}>
            {modes.map((m) => (
                <Button
                    key={m}
                    variant={mode === m ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => onModeChange(m)}
                >
                    {MODE_LABELS[m]}
                </Button>
            ))}
        </HStack>
    );
}
EditorToolbar.displayName = 'EditorToolbar';
