'use client';
/**
 * Scene3D
 *
 * Three.js scene wrapper component for React Three Fiber.
 * Manages the scene environment, fog, and background.
 *
 * @packageDocumentation
 */

import React, { useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

export interface Scene3DProps {
    /** Background color or URL */
    background?: string;
    /** Fog configuration */
    fog?: {
        color: string;
        near: number;
        far: number;
    };
    /** Children to render in scene */
    children?: React.ReactNode;
}

/**
 * Scene3D Component
 *
 * Manages Three.js scene settings like background and fog.
 *
 * @example
 * ```tsx
 * <Canvas>
 *     <Scene3D background="#1a1a2e" fog={{ color: '#1a1a2e', near: 10, far: 50 }}>
 *         <GameObjects />
 *     </Scene3D>
 * </Canvas>
 * ```
 */
export function Scene3D({ background = '#1a1a2e', fog, children }: Scene3DProps): React.JSX.Element {
    const { scene } = useThree();
    const initializedRef = useRef(false);

    useEffect(() => {
        if (initializedRef.current) return;
        initializedRef.current = true;

        // Set background
        if (background.startsWith('#') || background.startsWith('rgb')) {
            scene.background = new THREE.Color(background);
        } else {
            // Assume it's a texture URL
            const loader = new THREE.TextureLoader();
            loader.load(background, (texture) => {
                scene.background = texture;
            });
        }

        // Set fog
        if (fog) {
            scene.fog = new THREE.Fog(fog.color, fog.near, fog.far);
        }

        return () => {
            scene.background = null;
            scene.fog = null;
        };
    }, [scene, background, fog]);

    return <>{children}</>;
}

export default Scene3D;
