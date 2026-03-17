'use client';
/**
 * TileRenderer
 *
 * Renders isometric tiles using Three.js InstancedMesh for performance.
 * Supports texture mapping and custom tile geometries.
 *
 * @packageDocumentation
 */

import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { IsometricTile } from '../../types/isometric';

export interface TileRendererProps {
    /** Array of tiles to render */
    tiles: IsometricTile[];
    /** Grid cell size */
    cellSize?: number;
    /** Grid offset X */
    offsetX?: number;
    /** Grid offset Z */
    offsetZ?: number;
    /** Use instancing for performance */
    useInstancing?: boolean;
    /** Terrain color mapping */
    terrainColors?: Record<string, string>;
    /** Called when tile is clicked */
    onTileClick?: (tile: IsometricTile) => void;
    /** Called when tile is hovered */
    onTileHover?: (tile: IsometricTile | null) => void;
    /** Selected tile IDs */
    selectedTileIds?: string[];
    /** Valid move tile coordinates */
    validMoves?: Array<{ x: number; z: number }>;
    /** Attack target coordinates */
    attackTargets?: Array<{ x: number; z: number }>;
}

// Default terrain colors
const DEFAULT_TERRAIN_COLORS: Record<string, string> = {
    grass: '#44aa44',
    dirt: '#8b7355',
    sand: '#ddcc88',
    water: '#4488cc',
    rock: '#888888',
    snow: '#eeeeee',
    forest: '#228b22',
    desert: '#d4a574',
    mountain: '#696969',
    swamp: '#556b2f',
}

/**
 * TileRenderer Component
 *
 * Renders grid tiles with instancing for optimal performance.
 *
 * @example
 * ```tsx
 * <TileRenderer
 *     tiles={tiles}
 *     cellSize={1}
 *     onTileClick={handleTileClick}
 *     validMoves={[{ x: 1, z: 1 }]}
 * />
 * ```
 */
export function TileRenderer({
    tiles,
    cellSize = 1,
    offsetX = 0,
    offsetZ = 0,
    useInstancing = true,
    terrainColors = DEFAULT_TERRAIN_COLORS,
    onTileClick,
    onTileHover,
    selectedTileIds = [],
    validMoves = [],
    attackTargets = [],
}: TileRendererProps): React.JSX.Element {
    const meshRef = useRef<THREE.InstancedMesh>(null)

    // Create geometry and material
    const geometry = useMemo(() => {
        return new THREE.BoxGeometry(cellSize * 0.95, 0.2, cellSize * 0.95)
    }, [cellSize])

    const material = useMemo(() => {
        return new THREE.MeshStandardMaterial({
            roughness: 0.8,
            metalness: 0.1,
        })
    }, [])

    // Calculate tile positions and colors
    const { positions, colors, tileMap } = useMemo(() => {
        const pos: THREE.Vector3[] = []
        const cols: THREE.Color[] = []
        const map = new Map<string, IsometricTile>()

        tiles.forEach((tile) => {
            const x = (tile.x - offsetX) * cellSize
            const z = ((tile.z ?? tile.y ?? 0) - offsetZ) * cellSize
            const y = (tile.elevation ?? 0) * 0.1

            pos.push(new THREE.Vector3(x, y, z))

            // Determine color based on terrain type
            const colorHex =
                terrainColors[tile.type || ''] || terrainColors[tile.terrain || ''] || '#808080'
            const color = new THREE.Color(colorHex)

            // Apply highlight for valid moves
            const isValidMove = validMoves.some(
                (m) => m.x === tile.x && m.z === (tile.z ?? tile.y ?? 0)
            )
            const isAttackTarget = attackTargets.some(
                (m) => m.x === tile.x && m.z === (tile.z ?? tile.y ?? 0)
            )
            const isSelected = tile.id ? selectedTileIds.includes(tile.id) : false

            if (isSelected) {
                color.addScalar(0.3)
            } else if (isAttackTarget) {
                color.setHex(0xff4444)
            } else if (isValidMove) {
                color.setHex(0x44ff44)
            }

            cols.push(color)
            map.set(`${tile.x},${tile.z ?? tile.y ?? 0}`, tile)
        })

        return { positions: pos, colors: cols, tileMap: map }
    }, [tiles, cellSize, offsetX, offsetZ, terrainColors, selectedTileIds, validMoves, attackTargets])

    // Update instanced mesh
    useEffect(() => {
        if (!meshRef.current || !useInstancing) return

        const mesh = meshRef.current
        mesh.count = positions.length

        const dummy = new THREE.Object3D()

        positions.forEach((pos, i) => {
            dummy.position.copy(pos)
            dummy.updateMatrix()
            mesh.setMatrixAt(i, dummy.matrix)
            if (mesh.setColorAt) {
                mesh.setColorAt(i, colors[i])
            }
        })

        mesh.instanceMatrix.needsUpdate = true
        if (mesh.instanceColor) {
            mesh.instanceColor.needsUpdate = true
        }
    }, [positions, colors, useInstancing])

    // Raycasting for tile interaction
    const handlePointerMove = (e: any) => {
        if (!onTileHover) return

        const instanceId = e.instanceId
        if (instanceId !== undefined) {
            const pos = positions[instanceId]
            if (pos) {
                const gridX = Math.round(pos.x / cellSize + offsetX)
                const gridZ = Math.round(pos.z / cellSize + offsetZ)
                const tile = tileMap.get(`${gridX},${gridZ}`)
                if (tile) {
                    onTileHover(tile)
                }
            }
        }
    }

    const handleClick = (e: any) => {
        if (!onTileClick) return

        const instanceId = e.instanceId
        if (instanceId !== undefined) {
            const pos = positions[instanceId]
            if (pos) {
                const gridX = Math.round(pos.x / cellSize + offsetX)
                const gridZ = Math.round(pos.z / cellSize + offsetZ)
                const tile = tileMap.get(`${gridX},${gridZ}`)
                if (tile) {
                    onTileClick(tile)
                }
            }
        }
    }

    // Individual tiles (fallback when not using instancing)
    const renderIndividualTiles = () => {
        return tiles.map((tile) => {
            const x = (tile.x - offsetX) * cellSize
            const z = ((tile.z ?? tile.y ?? 0) - offsetZ) * cellSize
            const y = (tile.elevation ?? 0) * 0.1

            const colorHex =
                terrainColors[tile.type || ''] || terrainColors[tile.terrain || ''] || '#808080'
            const isSelected = tile.id ? selectedTileIds.includes(tile.id) : false
            const isValidMove = validMoves.some(
                (m) => m.x === tile.x && m.z === (tile.z ?? tile.y ?? 0)
            )
            const isAttackTarget = attackTargets.some(
                (m) => m.x === tile.x && m.z === (tile.z ?? tile.y ?? 0)
            )

            let emissive = '#000000'
            if (isSelected) emissive = '#444444'
            else if (isAttackTarget) emissive = '#440000'
            else if (isValidMove) emissive = '#004400'

            return (
                <mesh
                    key={tile.id ?? `tile-${tile.x}-${tile.y}`}
                    position={[x, y, z]}
                    userData={{ type: 'tile', tileId: tile.id, gridX: tile.x, gridZ: tile.z ?? tile.y }}
                    onClick={() => onTileClick?.(tile)}
                    onPointerEnter={() => onTileHover?.(tile)}
                    onPointerLeave={() => onTileHover?.(null)}
                >
                    <boxGeometry args={[cellSize * 0.95, 0.2, cellSize * 0.95]} />
                    <meshStandardMaterial
                        color={colorHex}
                        emissive={emissive}
                        roughness={0.8}
                        metalness={0.1}
                    />
                </mesh>
            )
        })
    }

    if (useInstancing && tiles.length > 0) {
        return (
            <instancedMesh
                ref={meshRef}
                args={[geometry, material, tiles.length]}
                onPointerMove={handlePointerMove}
                onClick={handleClick}
            />
        )
    }

    return <group>{renderIndividualTiles()}</group>
}

export default TileRenderer
