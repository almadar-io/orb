'use client';
/**
 * useRaycaster
 *
 * React hook for mouse raycasting in the 3D scene.
 * Provides intersection detection for tiles, units, and features.
 *
 * @packageDocumentation
 */

import { useRef, useCallback } from 'react';
import * as THREE from 'three';

export interface RaycastHit {
    /** Intersected object */
    object: THREE.Object3D;
    /** Intersection point */
    point: THREE.Vector3;
    /** Distance from camera */
    distance: number;
    /** UV coordinates (if available) */
    uv?: THREE.Vector2;
    /** Face normal */
    face?: THREE.Face;
    /** Face index */
    faceIndex?: number;
    /** Instance ID (for instanced meshes) */
    instanceId?: number;
}

export interface GridHit {
    /** Grid X coordinate */
    gridX: number;
    /** Grid Z coordinate */
    gridZ: number;
    /** World position */
    worldPosition: THREE.Vector3;
    /** Intersected object type */
    objectType?: 'tile' | 'unit' | 'feature';
    /** Object ID if available */
    objectId?: string;
}

export interface UseRaycasterOptions {
    /** Camera reference */
    camera: THREE.Camera | null;
    /** Canvas element for coordinate conversion */
    canvas: HTMLCanvasElement | null;
    /** Grid cell size */
    cellSize?: number;
    /** Grid offset X */
    offsetX?: number;
    /** Grid offset Z */
    offsetZ?: number;
}

export interface UseRaycasterReturn {
    /** Raycaster instance */
    raycaster: React.MutableRefObject<THREE.Raycaster>;
    /** Mouse vector instance */
    mouse: React.MutableRefObject<THREE.Vector2>;
    /** Get intersection at client coordinates */
    getIntersection: (clientX: number, clientY: number, objects: THREE.Object3D[]) => RaycastHit | null;
    /** Get all intersections at client coordinates */
    getAllIntersections: (
        clientX: number,
        clientY: number,
        objects: THREE.Object3D[]
    ) => RaycastHit[];
    /** Get grid coordinates at client position */
    getGridCoordinates: (clientX: number, clientY: number) => { x: number; z: number } | null;
    /** Get tile at client position from scene */
    getTileAtPosition: (
        clientX: number,
        clientY: number,
        scene: THREE.Scene
    ) => GridHit | null;
    /** Convert client coordinates to normalized device coordinates */
    clientToNDC: (clientX: number, clientY: number) => { x: number; y: number };
    /** Check if point is within canvas bounds */
    isWithinCanvas: (clientX: number, clientY: number) => boolean;
}

/**
 * Hook for 3D raycasting operations
 *
 * @example
 * ```tsx
 * const { getIntersection, getGridCoordinates } = useRaycaster({
 *     camera,
 *     canvas: canvasRef.current
 * });
 *
 * const handleClick = (e: MouseEvent) => {
 *     const hit = getIntersection(e.clientX, e.clientY, tileMeshes);
 *     if (hit) {
 *         const grid = getGridCoordinates(e.clientX, e.clientY);
 *         console.log('Clicked grid:', grid);
 *     }
 * };
 * ```
 */
export function useRaycaster(options: UseRaycasterOptions): UseRaycasterReturn {
    const { camera, canvas, cellSize = 1, offsetX = 0, offsetZ = 0 } = options;
    const raycaster = useRef(new THREE.Raycaster());
    const mouse = useRef(new THREE.Vector2());

    const clientToNDC = useCallback(
        (clientX: number, clientY: number): { x: number; y: number } => {
            if (!canvas) {
                return { x: 0, y: 0 };
            }
            const rect = canvas.getBoundingClientRect();
            return {
                x: ((clientX - rect.left) / rect.width) * 2 - 1,
                y: -((clientY - rect.top) / rect.height) * 2 + 1,
            };
        },
        [canvas]
    );

    const isWithinCanvas = useCallback(
        (clientX: number, clientY: number): boolean => {
            if (!canvas) return false;
            const rect = canvas.getBoundingClientRect();
            return (
                clientX >= rect.left &&
                clientX <= rect.right &&
                clientY >= rect.top &&
                clientY <= rect.bottom
            );
        },
        [canvas]
    );

    const getIntersection = useCallback(
        (clientX: number, clientY: number, objects: THREE.Object3D[]): RaycastHit | null => {
            if (!camera || !canvas) return null;

            const ndc = clientToNDC(clientX, clientY);
            mouse.current.set(ndc.x, ndc.y);
            raycaster.current.setFromCamera(mouse.current, camera);

            const intersects = raycaster.current.intersectObjects(objects, true);

            if (intersects.length > 0) {
                const hit = intersects[0];
                return {
                    object: hit.object,
                    point: hit.point,
                    distance: hit.distance,
                    uv: hit.uv,
                    face: hit.face as THREE.Face | undefined,
                    faceIndex: hit.faceIndex,
                    instanceId: hit.instanceId,
                };
            }

            return null;
        },
        [camera, canvas, clientToNDC]
    );

    const getAllIntersections = useCallback(
        (clientX: number, clientY: number, objects: THREE.Object3D[]): RaycastHit[] => {
            if (!camera || !canvas) return [];

            const ndc = clientToNDC(clientX, clientY);
            mouse.current.set(ndc.x, ndc.y);
            raycaster.current.setFromCamera(mouse.current, camera);

            const intersects = raycaster.current.intersectObjects(objects, true);

            return intersects.map((hit) => ({
                object: hit.object,
                point: hit.point,
                distance: hit.distance,
                uv: hit.uv,
                face: hit.face as THREE.Face | undefined,
                faceIndex: hit.faceIndex,
                instanceId: hit.instanceId,
            }));
        },
        [camera, canvas, clientToNDC]
    );

    const getGridCoordinates = useCallback(
        (clientX: number, clientY: number): { x: number; z: number } | null => {
            if (!camera || !canvas) return null;

            const ndc = clientToNDC(clientX, clientY);
            mouse.current.set(ndc.x, ndc.y);
            raycaster.current.setFromCamera(mouse.current, camera);

            // Create a plane at y=0 for ground intersection
            const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
            const target = new THREE.Vector3();
            const intersection = raycaster.current.ray.intersectPlane(plane, target);

            if (intersection) {
                const gridX = Math.round((target.x - offsetX) / cellSize);
                const gridZ = Math.round((target.z - offsetZ) / cellSize);
                return { x: gridX, z: gridZ };
            }

            return null;
        },
        [camera, canvas, cellSize, offsetX, offsetZ, clientToNDC]
    );

    const getTileAtPosition = useCallback(
        (clientX: number, clientY: number, scene: THREE.Scene): GridHit | null => {
            if (!camera || !canvas) return null;

            // Collect all tile meshes from scene
            const tileMeshes: THREE.Object3D[] = [];
            scene.traverse((obj) => {
                if (obj.userData.type === 'tile' || obj.userData.isTile) {
                    tileMeshes.push(obj);
                }
            });

            const hit = getIntersection(clientX, clientY, tileMeshes);

            if (hit) {
                const gridCoords = getGridCoordinates(clientX, clientY);
                if (gridCoords) {
                    return {
                        gridX: gridCoords.x,
                        gridZ: gridCoords.z,
                        worldPosition: hit.point,
                        objectType: hit.object.userData.type || 'tile',
                        objectId: hit.object.userData.id || hit.object.userData.tileId,
                    };
                }
            }

            // Try ground plane intersection if no tile hit
            const gridCoords = getGridCoordinates(clientX, clientY);
            if (gridCoords) {
                return {
                    gridX: gridCoords.x,
                    gridZ: gridCoords.z,
                    worldPosition: new THREE.Vector3(
                        gridCoords.x * cellSize + offsetX,
                        0,
                        gridCoords.z * cellSize + offsetZ
                    ),
                };
            }

            return null;
        },
        [camera, canvas, getIntersection, getGridCoordinates, cellSize, offsetX, offsetZ]
    );

    return {
        raycaster,
        mouse,
        getIntersection,
        getAllIntersections,
        getGridCoordinates,
        getTileAtPosition,
        clientToNDC,
        isWithinCanvas,
    };
}

export default useRaycaster;
