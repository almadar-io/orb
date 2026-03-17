'use client';
/**
 * UnitRenderer
 *
 * Renders animated units in the 3D scene.
 * Supports skeletal animations, health bars, and selection indicators.
 *
 * @packageDocumentation
 */

import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import type { IsometricUnit } from '../../types/isometric';

export type UnitAnimationState = 'idle' | 'walk' | 'attack' | 'hurt' | 'die';

export interface UnitRendererProps {
    /** Array of units to render */
    units: IsometricUnit[];
    /** Grid cell size */
    cellSize?: number;
    /** Grid offset X */
    offsetX?: number;
    /** Grid offset Z */
    offsetZ?: number;
    /** Currently selected unit ID */
    selectedUnitId?: string | null;
    /** Called when unit is clicked */
    onUnitClick?: (unit: IsometricUnit) => void;
    /** Called when unit animation state changes */
    onAnimationStateChange?: (unitId: string, state: UnitAnimationState) => void;
    /** Animation speed multiplier */
    animationSpeed?: number;
}

interface UnitVisualProps {
    unit: IsometricUnit;
    position: [number, number, number];
    isSelected: boolean;
    onClick: () => void;
}

/**
 * Individual unit visual component
 */
function UnitVisual({ unit, position, isSelected, onClick }: UnitVisualProps): React.JSX.Element {
    const groupRef = useRef<THREE.Group>(null);
    const [animationState, setAnimationState] = useState<UnitAnimationState>('idle');
    const [isHovered, setIsHovered] = useState(false);

    // Determine team color
    const teamColor = useMemo(() => {
        if (unit.faction === 'player' || unit.team === 'player') return 0x4488ff;
        if (unit.faction === 'enemy' || unit.team === 'enemy') return 0xff4444;
        if (unit.faction === 'neutral' || unit.team === 'neutral') return 0xffff44;
        return 0x888888;
    }, [unit.faction, unit.team]);

    // Idle animation
    useFrame((state) => {
        if (groupRef.current && animationState === 'idle') {
            // Subtle bobbing animation
            const y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.05;
            groupRef.current.position.y = y;
        }
    });

    // Calculate health percentage
    const healthPercent = useMemo(() => {
        if (unit.health === undefined || unit.maxHealth === undefined) return 1;
        return Math.max(0, Math.min(1, unit.health / unit.maxHealth));
    }, [unit.health, unit.maxHealth]);

    // Health bar color
    const healthColor = useMemo(() => {
        if (healthPercent > 0.5) return '#44aa44';
        if (healthPercent > 0.25) return '#aaaa44';
        return '#ff4444';
    }, [healthPercent]);

    return (
        <group
            ref={groupRef}
            position={position}
            onClick={onClick}
            onPointerEnter={() => setIsHovered(true)}
            onPointerLeave={() => setIsHovered(false)}
            userData={{ type: 'unit', unitId: unit.id }}
        >
            {/* Selection ring */}
            {isSelected && (
                <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.4, 0.5, 32]} />
                    <meshBasicMaterial color="#ffff00" transparent opacity={0.8} />
                </mesh>
            )}

            {/* Hover ring */}
            {isHovered && !isSelected && (
                <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.4, 0.5, 32]} />
                    <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
                </mesh>
            )}

            {/* Unit base */}
            <mesh position={[0, 0.1, 0]}>
                <cylinderGeometry args={[0.25, 0.25, 0.1, 8]} />
                <meshStandardMaterial color={teamColor} />
            </mesh>

            {/* Unit body */}
            <mesh position={[0, 0.5, 0]}>
                <capsuleGeometry args={[0.15, 0.5, 4, 8]} />
                <meshStandardMaterial color={teamColor} />
            </mesh>

            {/* Unit head */}
            <mesh position={[0, 0.9, 0]}>
                <sphereGeometry args={[0.12, 8, 8]} />
                <meshStandardMaterial color={teamColor} />
            </mesh>

            {/* Health bar background */}
            <mesh position={[0, 1.3, 0]}>
                <planeGeometry args={[0.5, 0.06]} />
                <meshBasicMaterial color="#333333" />
            </mesh>

            {/* Health bar fill */}
            <mesh position={[(-0.25 + 0.25 * healthPercent), 1.3, 0.01]}>
                <planeGeometry args={[0.5 * healthPercent, 0.04]} />
                <meshBasicMaterial color={healthColor} />
            </mesh>

            {/* Unit name label (if provided) */}
            {unit.name && (
                <mesh position={[0, 1.5, 0]}>
                    {/* Placeholder for text - would use Text component in production */}
                    <planeGeometry args={[0.4, 0.1]} />
                    <meshBasicMaterial color="#000000" transparent opacity={0.5} />
                </mesh>
            )}
        </group>
    );
}

/**
 * UnitRenderer Component
 *
 * Renders all units in the scene.
 *
 * @example
 * ```tsx
 * <UnitRenderer
 *     units={units}
 *     cellSize={1}
 *     selectedUnitId="unit-1"
 *     onUnitClick={handleUnitClick}
 * />
 * ```
 */
export function UnitRenderer({
    units,
    cellSize = 1,
    offsetX = 0,
    offsetZ = 0,
    selectedUnitId,
    onUnitClick,
    onAnimationStateChange,
    animationSpeed = 1,
}: UnitRendererProps): React.JSX.Element {
    const handleUnitClick = React.useCallback(
        (unit: IsometricUnit) => {
            onUnitClick?.(unit);
        },
        [onUnitClick]
    );

    return (
        <group>
            {units.map((unit) => {
                const unitX = unit.x ?? unit.position?.x ?? 0;
                const unitY = unit.z ?? unit.y ?? unit.position?.y ?? 0;
                const x = (unitX - offsetX) * cellSize;
                const z = (unitY - offsetZ) * cellSize;
                const y = (unit.elevation ?? 0) * 0.1 + 0.5;

                return (
                    <UnitVisual
                        key={unit.id}
                        unit={unit}
                        position={[x, y, z]}
                        isSelected={selectedUnitId === unit.id}
                        onClick={() => handleUnitClick(unit)}
                    />
                );
            })}
        </group>
    );
}

export default UnitRenderer;
