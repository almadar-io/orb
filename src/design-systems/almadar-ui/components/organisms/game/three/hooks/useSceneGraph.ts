'use client';
/**
 * useSceneGraph
 *
 * React hook for managing the Three.js scene graph.
 * Provides declarative node management for tiles, units, and features.
 *
 * @packageDocumentation
 */

import { useRef, useCallback } from 'react';
import * as THREE from 'three';

export type NodeType = 'tile' | 'unit' | 'feature' | 'highlight' | 'effect';

export interface SceneGraphNode {
    /** Unique node identifier */
    id: string;
    /** Node type classification */
    type: NodeType;
    /** Three.js object */
    mesh: THREE.Object3D;
    /** World position */
    position: { x: number; y: number; z: number };
    /** Grid position */
    gridPosition: { x: number; z: number };
    /** Optional metadata */
    metadata?: Record<string, unknown>;
}

export interface UseSceneGraphReturn {
    /** Reference to the nodes map */
    nodesRef: React.MutableRefObject<Map<string, SceneGraphNode>>;
    /** Add a node to the scene */
    addNode: (node: SceneGraphNode) => void;
    /** Remove a node from the scene */
    removeNode: (id: string) => void;
    /** Get a node by ID */
    getNode: (id: string) => SceneGraphNode | undefined;
    /** Update node position */
    updateNodePosition: (id: string, x: number, y: number, z: number) => void;
    /** Update node grid position */
    updateNodeGridPosition: (id: string, gridX: number, gridZ: number) => void;
    /** Get node at grid position */
    getNodeAtGrid: (x: number, z: number, type?: NodeType) => SceneGraphNode | undefined;
    /** Get all nodes of a specific type */
    getNodesByType: (type: NodeType) => SceneGraphNode[];
    /** Get all nodes within a bounding box */
    getNodesInBounds: (minX: number, maxX: number, minZ: number, maxZ: number) => SceneGraphNode[];
    /** Clear all nodes */
    clearNodes: () => void;
    /** Count nodes by type */
    countNodes: (type?: NodeType) => number;
}

/**
 * Hook for managing the 3D scene graph
 *
 * @example
 * ```tsx
 * const { addNode, removeNode, getNodeAtGrid } = useSceneGraph();
 *
 * // Add a tile
 * addNode({
 *     id: 'tile-0-0',
 *     type: 'tile',
 *     mesh: tileMesh,
 *     position: { x: 0, y: 0, z: 0 },
 *     gridPosition: { x: 0, z: 0 }
 * });
 * ```
 */
export function useSceneGraph(): UseSceneGraphReturn {
    const nodesRef = useRef<Map<string, SceneGraphNode>>(new Map());

    const addNode = useCallback((node: SceneGraphNode): void => {
        // Remove existing node with same ID
        const existing = nodesRef.current.get(node.id);
        if (existing) {
            existing.mesh.removeFromParent();
        }
        nodesRef.current.set(node.id, node);
    }, []);

    const removeNode = useCallback((id: string): void => {
        const node = nodesRef.current.get(id);
        if (node) {
            node.mesh.removeFromParent();
            nodesRef.current.delete(id);
        }
    }, []);

    const getNode = useCallback((id: string): SceneGraphNode | undefined => {
        return nodesRef.current.get(id);
    }, []);

    const updateNodePosition = useCallback(
        (id: string, x: number, y: number, z: number): void => {
            const node = nodesRef.current.get(id);
            if (node) {
                node.mesh.position.set(x, y, z);
                node.position = { x, y, z };
            }
        },
        []
    );

    const updateNodeGridPosition = useCallback(
        (id: string, gridX: number, gridZ: number): void => {
            const node = nodesRef.current.get(id);
            if (node) {
                node.gridPosition = { x: gridX, z: gridZ };
            }
        },
        []
    );

    const getNodeAtGrid = useCallback(
        (x: number, z: number, type?: NodeType): SceneGraphNode | undefined => {
            return Array.from(nodesRef.current.values()).find((node) => {
                const matchesGrid = node.gridPosition.x === x && node.gridPosition.z === z;
                return type ? matchesGrid && node.type === type : matchesGrid;
            });
        },
        []
    );

    const getNodesByType = useCallback((type: NodeType): SceneGraphNode[] => {
        return Array.from(nodesRef.current.values()).filter((node) => node.type === type);
    }, []);

    const getNodesInBounds = useCallback(
        (minX: number, maxX: number, minZ: number, maxZ: number): SceneGraphNode[] => {
            return Array.from(nodesRef.current.values()).filter((node) => {
                const { x, z } = node.gridPosition;
                return x >= minX && x <= maxX && z >= minZ && z <= maxZ;
            });
        },
        []
    );

    const clearNodes = useCallback((): void => {
        nodesRef.current.forEach((node) => {
            node.mesh.removeFromParent();
        });
        nodesRef.current.clear();
    }, []);

    const countNodes = useCallback((type?: NodeType): number => {
        if (!type) {
            return nodesRef.current.size;
        }
        return Array.from(nodesRef.current.values()).filter((node) => node.type === type).length;
    }, []);

    return {
        nodesRef,
        addNode,
        removeNode,
        getNode,
        updateNodePosition,
        updateNodeGridPosition,
        getNodeAtGrid,
        getNodesByType,
        getNodesInBounds,
        clearNodes,
        countNodes,
    };
}

export default useSceneGraph;
