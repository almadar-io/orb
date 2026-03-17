'use client';
/**
 * FeatureRenderer3D
 *
 * Renders 3D features with GLB model loading from CDN.
 * Supports assetUrl property on features for external model loading.
 *
 * @packageDocumentation
 */

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import type { IsometricFeature } from '../../types/isometric';

// Extend IsometricFeature to support rotation
type FeatureWithRotation = IsometricFeature & { rotation?: number };

export interface FeatureRenderer3DProps {
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
}

interface FeatureModelProps {
    feature: FeatureWithRotation;
    position: [number, number, number];
    isSelected: boolean;
    onClick: () => void;
    onHover: (hovered: boolean) => void;
}

/**
 * Detect the 3D asset root from a model URL.
 * Looks for "/3d/" segment and returns everything up to and including it.
 */
function detectAssetRoot(modelUrl: string): string {
    const idx = modelUrl.indexOf('/3d/');
    if (idx !== -1) {
        return modelUrl.substring(0, idx + 4);
    }
    return modelUrl.substring(0, modelUrl.lastIndexOf('/') + 1);
}

/**
 * Hook to load GLTF model without Suspense.
 * Resolves shared texture paths against the asset root directory.
 */
function useGLTFModel(url: string | undefined) {
    const [model, setModel] = useState<THREE.Group | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!url) {
            setModel(null);
            return;
        }

        setIsLoading(true);
        setError(null);

        const assetRoot = detectAssetRoot(url);
        const loader = new GLTFLoader();
        loader.setResourcePath(assetRoot);
        loader.load(
            url,
            (gltf) => {
                setModel(gltf.scene);
                setIsLoading(false);
            },
            undefined,
            (err) => {
                setError(err instanceof Error ? err : new Error(String(err)));
                setIsLoading(false);
            }
        );
    }, [url]);

    return { model, isLoading, error };
}

/**
 * Individual feature with 3D model loading
 */
function FeatureModel({
    feature,
    position,
    isSelected,
    onClick,
    onHover,
}: FeatureModelProps): React.JSX.Element | null {
    const groupRef = useRef<THREE.Group>(null);
    
    // Load GLB model if assetUrl is provided (without Suspense)
    const { model: loadedModel, isLoading } = useGLTFModel(feature.assetUrl);
    
    // Clone and prepare the scene for this instance
    const model = useMemo(() => {
        if (!loadedModel) return null;
        const cloned = loadedModel.clone();
        
        // Adjust model scale - many Kenny assets are large, scale down to fit grid
        cloned.scale.setScalar(0.3); // Adjust based on model size
        
        // Enable shadows
        cloned.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        
        return cloned;
    }, [loadedModel]);

    // Idle animation and apply rotation
    useFrame((state) => {
        if (groupRef.current) {
            // Apply base rotation
            const featureRotation = feature.rotation;
            const baseRotation = featureRotation !== undefined 
                ? (featureRotation * Math.PI / 180) - Math.PI / 4 
                : -Math.PI / 4;
            
            // Add idle wobble when selected
            const wobble = isSelected ? Math.sin(state.clock.elapsedTime * 2) * 0.1 : 0;
            groupRef.current.rotation.y = baseRotation + wobble;
        }
    });

    // Show loading indicator
    if (isLoading) {
        return (
            <group position={position}>
                {/* Loading spinner */}
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.3, 0.35, 16]} />
                    <meshBasicMaterial color="#4a90d9" transparent opacity={0.8} />
                </mesh>
            </group>
        );
    }

    // Show fallback if no model and no asset URL
    if (!model && !feature.assetUrl) {
        // Fallback to primitive geometry if no asset URL
        return (
            <group
                position={position}
                onClick={onClick}
                onPointerEnter={() => onHover(true)}
                onPointerLeave={() => onHover(false)}
                userData={{ type: 'feature', featureId: feature.id, featureType: feature.type }}
            >
                {isSelected && (
                    <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                        <ringGeometry args={[0.4, 0.5, 32]} />
                        <meshBasicMaterial color="#ffff00" transparent opacity={0.8} />
                    </mesh>
                )}
                <mesh position={[0, 0.5, 0]}>
                    <boxGeometry args={[0.4, 0.4, 0.4]} />
                    <meshStandardMaterial color={0x888888} />
                </mesh>
            </group>
        );
    }

    return (
        <group
            ref={groupRef}
            position={position}
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

            {/* 3D Model */}
            {model && <primitive object={model} />}
        </group>
    );
}

/**
 * FeatureRenderer3D Component
 *
 * Renders 3D features with GLB model loading support.
 *
 * @example
 * ```tsx
 * <FeatureRenderer3D
 *     features={[
 *         { id: 'gate', x: 0, y: 0, type: 'gate', assetUrl: 'https://.../gate.glb' }
 *     ]}
 *     cellSize={1}
 * />
 * ```
 */
export function FeatureRenderer3D({
    features,
    cellSize = 1,
    offsetX = 0,
    offsetZ = 0,
    onFeatureClick,
    onFeatureHover,
    selectedFeatureIds = [],
}: FeatureRenderer3DProps): React.JSX.Element {
    return (
        <group>
            {features.map((feature) => {
                const x = (feature.x - offsetX) * cellSize;
                const z = ((feature.z ?? feature.y ?? 0) - offsetZ) * cellSize;
                const y = (feature.elevation ?? 0) * 0.1;

                const isSelected = feature.id ? selectedFeatureIds.includes(feature.id) : false;

                return (
                    <FeatureModel
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

export default FeatureRenderer3D;

// Preload function for storybook - preloads GLB models into THREE.js cache
export function preloadFeatures(urls: string[]) {
    urls.forEach(url => {
        if (url) {
            const loader = new GLTFLoader();
            loader.setResourcePath(detectAssetRoot(url));
            loader.load(url, () => {
                console.log('[FeatureRenderer3D] Preloaded:', url);
            });
        }
    });
}
