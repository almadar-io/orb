/**
 * Grid 3D Utilities
 *
 * Utility functions for 3D grid coordinate transformations,
 * raycasting, and spatial calculations for GameCanvas3D.
 *
 * @packageDocumentation
 */

import * as THREE from 'three';

export interface Grid3DConfig {
    /** Size of each grid cell */
    cellSize: number;
    /** Grid offset X */
    offsetX?: number;
    /** Grid offset Z */
    offsetZ?: number;
    /** Grid Y height (elevation) */
    elevation?: number;
}

export interface GridCoordinate {
    x: number;
    y: number;
    z: number;
}

const DEFAULT_CONFIG: Required<Grid3DConfig> = {
    cellSize: 1,
    offsetX: 0,
    offsetZ: 0,
    elevation: 0,
};

/**
 * Convert grid coordinates to world position
 * @param gridX - Grid X coordinate
 * @param gridZ - Grid Z coordinate
 * @param config - Grid configuration
 * @returns World position vector
 */
export function gridToWorld(
    gridX: number,
    gridZ: number,
    config: Grid3DConfig = DEFAULT_CONFIG
): THREE.Vector3 {
    const opts = { ...DEFAULT_CONFIG, ...config };
    return new THREE.Vector3(
        gridX * opts.cellSize + opts.offsetX,
        opts.elevation,
        gridZ * opts.cellSize + opts.offsetZ
    );
}

/**
 * Convert world position to grid coordinates
 * @param worldX - World X position
 * @param worldZ - World Z position
 * @param config - Grid configuration
 * @returns Grid coordinates
 */
export function worldToGrid(
    worldX: number,
    worldZ: number,
    config: Grid3DConfig = DEFAULT_CONFIG
): { x: number; z: number } {
    const opts = { ...DEFAULT_CONFIG, ...config };
    return {
        x: Math.round((worldX - opts.offsetX) / opts.cellSize),
        z: Math.round((worldZ - opts.offsetZ) / opts.cellSize),
    };
}

/**
 * Raycast from camera through mouse position to find grid intersection
 * @param camera - Three.js camera
 * @param mouseX - Mouse X position (normalized -1 to 1)
 * @param mouseY - Mouse Y position (normalized -1 to 1)
 * @param planeY - Y height of the intersection plane (default: 0)
 * @returns Intersection point or null
 */
export function raycastToPlane(
    camera: THREE.Camera,
    mouseX: number,
    mouseY: number,
    planeY: number = 0
): THREE.Vector3 | null {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(mouseX, mouseY);

    raycaster.setFromCamera(mouse, camera);

    // Create a plane at the specified Y height
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -planeY);
    const target = new THREE.Vector3();

    const intersection = raycaster.ray.intersectPlane(plane, target);
    return intersection ? target : null;
}

/**
 * Raycast from camera through mouse position against a set of objects
 * @param camera - Three.js camera
 * @param mouseX - Mouse X position (normalized -1 to 1)
 * @param mouseY - Mouse Y position (normalized -1 to 1)
 * @param objects - Array of objects to test
 * @returns First intersection or null
 */
export function raycastToObjects(
    camera: THREE.Camera,
    mouseX: number,
    mouseY: number,
    objects: THREE.Object3D[]
): THREE.Intersection | null {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(mouseX, mouseY);

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(objects, true);

    return intersects.length > 0 ? intersects[0] : null;
}

/**
 * Calculate distance between two grid coordinates
 * @param a - First grid coordinate
 * @param b - Second grid coordinate
 * @returns Distance in grid units
 */
export function gridDistance(
    a: { x: number; z: number },
    b: { x: number; z: number }
): number {
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    return Math.sqrt(dx * dx + dz * dz);
}

/**
 * Calculate Manhattan distance between two grid coordinates
 * @param a - First grid coordinate
 * @param b - Second grid coordinate
 * @returns Manhattan distance
 */
export function gridManhattanDistance(
    a: { x: number; z: number },
    b: { x: number; z: number }
): number {
    return Math.abs(b.x - a.x) + Math.abs(b.z - a.z);
}

/**
 * Get neighboring grid cells
 * @param x - Center X coordinate
 * @param z - Center Z coordinate
 * @param includeDiagonal - Whether to include diagonal neighbors
 * @returns Array of neighbor coordinates
 */
export function getNeighbors(
    x: number,
    z: number,
    includeDiagonal: boolean = false
): { x: number; z: number }[] {
    const neighbors = [
        { x: x + 1, z },
        { x: x - 1, z },
        { x, z: z + 1 },
        { x, z: z - 1 },
    ];

    if (includeDiagonal) {
        neighbors.push(
            { x: x + 1, z: z + 1 },
            { x: x - 1, z: z - 1 },
            { x: x + 1, z: z - 1 },
            { x: x - 1, z: z + 1 }
        );
    }

    return neighbors;
}

/**
 * Check if a grid coordinate is within bounds
 * @param x - X coordinate
 * @param z - Z coordinate
 * @param bounds - Bounds object
 * @returns Whether the coordinate is within bounds
 */
export function isInBounds(
    x: number,
    z: number,
    bounds: { minX: number; maxX: number; minZ: number; maxZ: number }
): boolean {
    return x >= bounds.minX && x <= bounds.maxX && z >= bounds.minZ && z <= bounds.maxZ;
}

/**
 * Get all grid cells within a circular radius
 * @param centerX - Center X coordinate
 * @param centerZ - Center Z coordinate
 * @param radius - Radius in grid units
 * @returns Array of coordinates within radius
 */
export function getCellsInRadius(
    centerX: number,
    centerZ: number,
    radius: number
): { x: number; z: number }[] {
    const cells: { x: number; z: number }[] = [];
    const radiusSquared = radius * radius;

    const minX = Math.floor(centerX - radius);
    const maxX = Math.ceil(centerX + radius);
    const minZ = Math.floor(centerZ - radius);
    const maxZ = Math.ceil(centerZ + radius);

    for (let x = minX; x <= maxX; x++) {
        for (let z = minZ; z <= maxZ; z++) {
            const dx = x - centerX;
            const dz = z - centerZ;
            if (dx * dx + dz * dz <= radiusSquared) {
                cells.push({ x, z });
            }
        }
    }

    return cells;
}

/**
 * Create a highlight mesh for grid cells
 * @param color - Highlight color
 * @param opacity - Opacity (0-1)
 * @returns Mesh that can be positioned at grid cells
 */
export function createGridHighlight(
    color: number = 0xffff00,
    opacity: number = 0.3
): THREE.Mesh {
    const geometry = new THREE.PlaneGeometry(0.95, 0.95);
    const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity,
        side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0.01; // Slightly above ground
    return mesh;
}

/**
 * Normalize mouse coordinates to NDC (-1 to 1)
 * @param clientX - Mouse client X
 * @param clientY - Mouse client Y
 * @param element - Canvas element
 * @returns Normalized coordinates
 */
export function normalizeMouseCoordinates(
    clientX: number,
    clientY: number,
    element: HTMLElement
): { x: number; y: number } {
    const rect = element.getBoundingClientRect();
    return {
        x: ((clientX - rect.left) / rect.width) * 2 - 1,
        y: -((clientY - rect.top) / rect.height) * 2 + 1,
    };
}

export default {
    gridToWorld,
    worldToGrid,
    raycastToPlane,
    raycastToObjects,
    gridDistance,
    gridManhattanDistance,
    getNeighbors,
    isInBounds,
    getCellsInRadius,
    createGridHighlight,
    normalizeMouseCoordinates,
};
