'use client';
/**
 * FeatureRenderer
 *
 * Renders static features (trees, rocks, buildings) in the 3D scene.
 * Supports different feature types and selection states.
 *
 * @packageDocumentation
 */

import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { IsometricFeature } from '../../types/isometric';

export interface FeatureRendererProps {
    /** Array of features to render */
    features: IsometricFeature[];
    /** Grid cell size */
    cellSize?: number;
    /** Grid offset X */
    offsetX?: number;
    /** Grid offset Z */
    offsetZ?: number;
    /** Called when feature is clicked */
    onFeatureClick?: (feature: IsometricFeature) => void;
    /** Called when feature is hovered */
    onFeatureHover?: (feature: IsometricFeature | null) => void;
    /** Selected feature IDs */
    selectedFeatureIds?: string[];
    /** Feature color overrides */
    featureColors?: Record<string, string>;
}

// Default feature type configurations
const DEFAULT_FEATURE_CONFIGS: Record<
    string,
    { color: number; height: number; scale: number; geometry: string }
> = {
    tree: { color: 0x228b22, height: 1.5, scale: 1, geometry: 'tree' },
    rock: { color: 0x808080, height: 0.5, scale: 0.8, geometry: 'rock' },
    bush: { color: 0x32cd32, height: 0.4, scale: 0.6, geometry: 'bush' },
    house: { color: 0x8b4513, height: 1.2, scale: 1.2, geometry: 'house' },
    tower: { color: 0x696969, height: 2.5, scale: 1, geometry: 'tower' },
    wall: { color: 0x808080, height: 1, scale: 1, geometry: 'wall' },
    mountain: { color: 0x556b2f, height: 2, scale: 1.5, geometry: 'mountain' },
    hill: { color: 0x6b8e23, height: 0.8, scale: 1.2, geometry: 'hill' },
    water: { color: 0x4488cc, height: 0.1, scale: 1, geometry: 'water' },
    chest: { color: 0xffd700, height: 0.3, scale: 0.4, geometry: 'chest' },
    sign: { color: 0x8b4513, height: 0.8, scale: 0.3, geometry: 'sign' },
    portal: { color: 0x9932cc, height: 1.5, scale: 1, geometry: 'portal' },
};

interface FeatureVisualProps {
    feature: IsometricFeature;
    position: [number, number, number];
    isSelected: boolean;
    onClick: () => void;
    onHover: (hovered: boolean) => void;
}

/**
 * Tree geometry component
 */
function TreeFeature({ height, color }: { height: number; color: number }): React.JSX.Element {
    return (
        <>
            {/* Trunk */}
            <mesh position={[0, height * 0.3, 0]}>
                <cylinderGeometry args={[0.08, 0.1, height * 0.6, 6]} />
                <meshStandardMaterial color={0x8b4513} />
            </mesh>
            {/* Leaves - bottom layer */}
            <mesh position={[0, height * 0.7, 0]}>
                <coneGeometry args={[0.4, height * 0.5, 8]} />
                <meshStandardMaterial color={color} />
            </mesh>
            {/* Leaves - middle layer */}
            <mesh position={[0, height * 0.9, 0]}>
                <coneGeometry args={[0.3, height * 0.4, 8]} />
                <meshStandardMaterial color={color} />
            </mesh>
            {/* Leaves - top layer */}
            <mesh position={[0, height * 1.05, 0]}>
                <coneGeometry args={[0.15, height * 0.25, 8]} />
                <meshStandardMaterial color={color} />
            </mesh>
        </>
    );
}

/**
 * Rock geometry component
 */
function RockFeature({ height, color }: { height: number; color: number }): React.JSX.Element {
    return (
        <mesh position={[0, height * 0.4, 0]}>
            <dodecahedronGeometry args={[height * 0.5, 0]} />
            <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
    );
}

/**
 * Bush geometry component
 */
function BushFeature({ height, color }: { height: number; color: number }): React.JSX.Element {
    return (
        <>
            <mesh position={[0, height * 0.3, 0]}>
                <sphereGeometry args={[height * 0.4, 8, 8]} />
                <meshStandardMaterial color={color} />
            </mesh>
            <mesh position={[0.1, height * 0.4, 0.1]}>
                <sphereGeometry args={[height * 0.25, 8, 8]} />
                <meshStandardMaterial color={color} />
            </mesh>
        </>
    );
}

/**
 * House geometry component
 */
function HouseFeature({ height, color }: { height: number; color: number }): React.JSX.Element {
    return (
        <>
            {/* Base */}
            <mesh position={[0, height * 0.4, 0]}>
                <boxGeometry args={[0.8, height * 0.8, 0.8]} />
                <meshStandardMaterial color={0xd2b48c} />
            </mesh>
            {/* Roof */}
            <mesh position={[0, height * 0.9, 0]}>
                <coneGeometry args={[0.6, height * 0.4, 4]} />
                <meshStandardMaterial color={color} />
            </mesh>
            {/* Door */}
            <mesh position={[0, height * 0.25, 0.41]}>
                <planeGeometry args={[0.25, height * 0.5]} />
                <meshStandardMaterial color={0x4a3728} />
            </mesh>
        </>
    );
}

/**
 * Tower geometry component
 */
function TowerFeature({ height, color }: { height: number; color: number }): React.JSX.Element {
    return (
        <>
            {/* Tower base */}
            <mesh position={[0, height * 0.5, 0]}>
                <cylinderGeometry args={[0.3, 0.35, height, 8]} />
                <meshStandardMaterial color={color} />
            </mesh>
            {/* Battlements */}
            <mesh position={[0, height + 0.05, 0]}>
                <cylinderGeometry args={[0.35, 0.35, 0.1, 8]} />
                <meshStandardMaterial color={color} />
            </mesh>
        </>
    );
}

/**
 * Chest geometry component
 */
function ChestFeature({ height, color }: { height: number; color: number }): React.JSX.Element {
    return (
        <>
            {/* Chest base */}
            <mesh position={[0, height * 0.5, 0]}>
                <boxGeometry args={[0.3, height, 0.2]} />
                <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
            </mesh>
            {/* Lid */}
            <mesh position={[0, height + 0.05, 0]}>
                <cylinderGeometry args={[0.15, 0.15, 0.3, 8, 1, false, 0, Math.PI]} />
                <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
            </mesh>
        </>
    );
}

/**
 * Default geometry for unknown feature types
 */
function DefaultFeature({ height, color }: { height: number; color: number }): React.JSX.Element {
    return (
        <mesh position={[0, height * 0.5, 0]}>
            <boxGeometry args={[0.5, height, 0.5]} />
            <meshStandardMaterial color={color} />
        </mesh>
    );
}

/**
 * Individual feature visual component
 */
function FeatureVisual({
    feature,
    position,
    isSelected,
    onClick,
    onHover,
}: FeatureVisualProps): React.JSX.Element {
    const config = DEFAULT_FEATURE_CONFIGS[feature.type] || {
        color: 0x888888,
        height: 0.5,
        scale: 1,
        geometry: 'default',
    };

    const color = feature.color ? parseInt(feature.color.replace('#', ''), 16) : config.color;

    const renderGeometry = () => {
        switch (config.geometry) {
            case 'tree':
                return <TreeFeature height={config.height} color={color} />;
            case 'rock':
                return <RockFeature height={config.height} color={color} />;
            case 'bush':
                return <BushFeature height={config.height} color={color} />;
            case 'house':
                return <HouseFeature height={config.height} color={color} />;
            case 'tower':
                return <TowerFeature height={config.height} color={color} />;
            case 'chest':
                return <ChestFeature height={config.height} color={color} />;
            default:
                return <DefaultFeature height={config.height} color={color} />;
        }
    };

    return (
        <group
            position={position}
            scale={config.scale}
            onClick={onClick}
            onPointerEnter={() => onHover(true)}
            onPointerLeave={() => onHover(false)}
            userData={{ type: 'feature', featureId: feature.id, featureType: feature.type }}
        >
            {/* Selection ring */}
            {isSelected && (
                <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.4, 0.5, 32]} />
                    <meshBasicMaterial color="#ffff00" transparent opacity={0.8} />
                </mesh>
            )}

            {/* Shadow plane */}
            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.35, 16]} />
                <meshBasicMaterial color="#000000" transparent opacity={0.2} />
            </mesh>

            {/* Feature geometry */}
            {renderGeometry()}
        </group>
    );
}

/**
 * FeatureRenderer Component
 *
 * Renders all features in the scene.
 *
 * @example
 * ```tsx
 * <FeatureRenderer
 *     features={features}
 *     cellSize={1}
 *     onFeatureClick={handleFeatureClick}
 * />
 * ```
 */
export function FeatureRenderer({
    features,
    cellSize = 1,
    offsetX = 0,
    offsetZ = 0,
    onFeatureClick,
    onFeatureHover,
    selectedFeatureIds = [],
    featureColors,
}: FeatureRendererProps): React.JSX.Element {
    return (
        <group>
            {features.map((feature) => {
                const x = (feature.x - offsetX) * cellSize;
                const z = ((feature.z ?? feature.y ?? 0) - offsetZ) * cellSize;
                const y = (feature.elevation ?? 0) * 0.1;

                const isSelected = feature.id ? selectedFeatureIds.includes(feature.id) : false;

                return (
                    <FeatureVisual
                        key={feature.id ?? `feature-${feature.x}-${feature.y}`}
                        feature={feature}
                        position={[x, y, z]}
                        isSelected={isSelected}
                        onClick={() => onFeatureClick?.(feature)}
                        onHover={(hovered) => onFeatureHover?.(hovered ? feature : null)}
                    />
                );
            })}
        </group>
    );
}

export default FeatureRenderer;
