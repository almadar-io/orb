/**
 * Culling Utilities
 *
 * Frustum culling and LOD (Level of Detail) management for 3D scene optimization.
 *
 * @packageDocumentation
 */

import * as THREE from 'three';

export interface CullingOptions {
    /** Camera frustum for culling */
    camera: THREE.Camera;
    /** Optional padding around frustum */
    padding?: number;
}

export interface LODLevel {
    /** Distance threshold for this LOD level */
    distance: number;
    /** Geometry or mesh for this level */
    geometry?: THREE.BufferGeometry;
    /** Scale multiplier for this level */
    scale?: number;
    /** Whether to use simplified material */
    simpleMaterial?: boolean;
}

export interface LODConfig {
    /** LOD levels from closest to farthest */
    levels: LODLevel[];
    /** Transition smoothness (0-1) */
    transitionSmoothness?: number;
}

/**
 * Frustum culling check for a position
 * @param position - World position to check
 * @param camera - Camera to check against
 * @param padding - Optional padding in world units
 * @returns Whether the position is within the frustum
 */
export function isInFrustum(
    position: THREE.Vector3,
    camera: THREE.Camera,
    padding: number = 0
): boolean {
    const frustum = new THREE.Frustum();
    const projScreenMatrix = new THREE.Matrix4();

    projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    frustum.setFromProjectionMatrix(projScreenMatrix);

    // Create a bounding sphere around the position
    const sphere = new THREE.Sphere(position, padding);

    return frustum.intersectsSphere(sphere);
}

/**
 * Filter an array of positions to only those within the frustum
 * @param positions - Array of world positions
 * @param camera - Camera to check against
 * @param padding - Optional padding in world units
 * @returns Array of positions within frustum
 */
export function filterByFrustum(
    positions: THREE.Vector3[],
    camera: THREE.Camera,
    padding: number = 0
): THREE.Vector3[] {
    const frustum = new THREE.Frustum();
    const projScreenMatrix = new THREE.Matrix4();

    projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    frustum.setFromProjectionMatrix(projScreenMatrix);

    return positions.filter((position) => {
        const sphere = new THREE.Sphere(position, padding);
        return frustum.intersectsSphere(sphere);
    });
}

/**
 * Get indices of visible items from an array
 * @param positions - Array of world positions
 * @param camera - Camera to check against
 * @param padding - Optional padding in world units
 * @returns Set of visible indices
 */
export function getVisibleIndices(
    positions: THREE.Vector3[],
    camera: THREE.Camera,
    padding: number = 0
): Set<number> {
    const frustum = new THREE.Frustum();
    const projScreenMatrix = new THREE.Matrix4();
    const visible = new Set<number>();

    projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    frustum.setFromProjectionMatrix(projScreenMatrix);

    positions.forEach((position, index) => {
        const sphere = new THREE.Sphere(position, padding);
        if (frustum.intersectsSphere(sphere)) {
            visible.add(index);
        }
    });

    return visible;
}

/**
 * Calculate LOD level based on distance from camera
 * @param position - Object position
 * @param camera - Camera position
 * @param lodLevels - Array of distance thresholds (sorted closest to farthest)
 * @returns Index of the LOD level to use
 */
export function calculateLODLevel(
    position: THREE.Vector3,
    camera: THREE.Camera,
    lodLevels: number[]
): number {
    const distance = position.distanceTo(camera.position);

    for (let i = 0; i < lodLevels.length; i++) {
        if (distance < lodLevels[i]) {
            return i;
        }
    }

    return lodLevels.length;
}

/**
 * Create a distance-based LOD system for an instanced mesh
 * @param instancedMesh - The instanced mesh to manage
 * @param positions - Array of instance positions
 * @param camera - Camera to calculate distances from
 * @param lodDistances - Distance thresholds for LOD levels
 * @returns Array of LOD indices for each instance
 */
export function updateInstanceLOD(
    instancedMesh: THREE.InstancedMesh,
    positions: THREE.Vector3[],
    camera: THREE.Camera,
    lodDistances: number[]
): Uint8Array {
    const lodIndices = new Uint8Array(positions.length);

    positions.forEach((position, index) => {
        lodIndices[index] = calculateLODLevel(position, camera, lodDistances);
    });

    return lodIndices;
}

/**
 * Create visibility data for instanced mesh culling
 * Updates the instance matrix to hide/show instances
 * @param instancedMesh - The instanced mesh
 * @param positions - Array of instance positions
 * @param visibleIndices - Set of visible indices
 * @returns Updated count of visible instances
 */
export function cullInstancedMesh(
    instancedMesh: THREE.InstancedMesh,
    positions: THREE.Vector3[],
    visibleIndices: Set<number>
): number {
    const dummy = new THREE.Object3D();
    let visibleCount = 0;

    positions.forEach((position, index) => {
        if (visibleIndices.has(index)) {
            dummy.position.copy(position);
            dummy.updateMatrix();
            instancedMesh.setMatrixAt(visibleCount, dummy.matrix);
            visibleCount++;
        }
    });

    instancedMesh.count = visibleCount;
    instancedMesh.instanceMatrix.needsUpdate = true;

    return visibleCount;
}

/**
 * Spatial hash grid for efficient object queries
 */
export class SpatialHashGrid {
    private cellSize: number;
    private cells: Map<string, Set<string>>;
    private objectPositions: Map<string, THREE.Vector3>;

    constructor(cellSize: number = 10) {
        this.cellSize = cellSize;
        this.cells = new Map();
        this.objectPositions = new Map();
    }

    /**
     * Get cell key for a position
     */
    private getCellKey(x: number, z: number): string {
        const cellX = Math.floor(x / this.cellSize);
        const cellZ = Math.floor(z / this.cellSize);
        return `${cellX},${cellZ}`;
    }

    /**
     * Insert an object into the grid
     */
    insert(id: string, position: THREE.Vector3): void {
        const key = this.getCellKey(position.x, position.z);

        if (!this.cells.has(key)) {
            this.cells.set(key, new Set());
        }

        this.cells.get(key)!.add(id);
        this.objectPositions.set(id, position.clone());
    }

    /**
     * Remove an object from the grid
     */
    remove(id: string): void {
        const position = this.objectPositions.get(id);
        if (position) {
            const key = this.getCellKey(position.x, position.z);
            this.cells.get(key)?.delete(id);
            this.objectPositions.delete(id);
        }
    }

    /**
     * Update an object's position
     */
    update(id: string, newPosition: THREE.Vector3): void {
        this.remove(id);
        this.insert(id, newPosition);
    }

    /**
     * Query objects within a radius of a position
     */
    queryRadius(center: THREE.Vector3, radius: number): string[] {
        const results: string[] = [];
        const radiusSquared = radius * radius;

        // Calculate cell range to check
        const minCellX = Math.floor((center.x - radius) / this.cellSize);
        const maxCellX = Math.floor((center.x + radius) / this.cellSize);
        const minCellZ = Math.floor((center.z - radius) / this.cellSize);
        const maxCellZ = Math.floor((center.z + radius) / this.cellSize);

        for (let x = minCellX; x <= maxCellX; x++) {
            for (let z = minCellZ; z <= maxCellZ; z++) {
                const key = `${x},${z}`;
                const cell = this.cells.get(key);

                if (cell) {
                    cell.forEach((id) => {
                        const position = this.objectPositions.get(id);
                        if (position) {
                            const dx = position.x - center.x;
                            const dz = position.z - center.z;
                            if (dx * dx + dz * dz <= radiusSquared) {
                                results.push(id);
                            }
                        }
                    });
                }
            }
        }

        return results;
    }

    /**
     * Query objects within a bounding box
     */
    queryBox(minX: number, maxX: number, minZ: number, maxZ: number): string[] {
        const results: string[] = [];

        const minCellX = Math.floor(minX / this.cellSize);
        const maxCellX = Math.floor(maxX / this.cellSize);
        const minCellZ = Math.floor(minZ / this.cellSize);
        const maxCellZ = Math.floor(maxZ / this.cellSize);

        for (let x = minCellX; x <= maxCellX; x++) {
            for (let z = minCellZ; z <= maxCellZ; z++) {
                const key = `${x},${z}`;
                const cell = this.cells.get(key);

                if (cell) {
                    cell.forEach((id) => {
                        const position = this.objectPositions.get(id);
                        if (
                            position &&
                            position.x >= minX &&
                            position.x <= maxX &&
                            position.z >= minZ &&
                            position.z <= maxZ
                        ) {
                            results.push(id);
                        }
                    });
                }
            }
        }

        return results;
    }

    /**
     * Clear all objects from the grid
     */
    clear(): void {
        this.cells.clear();
        this.objectPositions.clear();
    }

    /**
     * Get statistics about the grid
     */
    getStats(): { objects: number; cells: number } {
        return {
            objects: this.objectPositions.size,
            cells: this.cells.size,
        };
    }
}

export default {
    isInFrustum,
    filterByFrustum,
    getVisibleIndices,
    calculateLODLevel,
    updateInstanceLOD,
    cullInstancedMesh,
    SpatialHashGrid,
};
