/**
 * Lighting3D
 *
 * Default lighting setup for 3D game scenes.
 * Includes ambient, directional, and optional point lights.
 *
 * @packageDocumentation
 */

import React from 'react';
import * as THREE from 'three';

export interface Lighting3DProps {
    /** Ambient light intensity */
    ambientIntensity?: number;
    /** Ambient light color */
    ambientColor?: string;
    /** Directional light intensity */
    directionalIntensity?: number;
    /** Directional light color */
    directionalColor?: string;
    /** Directional light position */
    directionalPosition?: [number, number, number];
    /** Enable shadows */
    shadows?: boolean;
    /** Shadow map size */
    shadowMapSize?: number;
    /** Shadow camera size */
    shadowCameraSize?: number;
    /** Show helper for directional light */
    showHelpers?: boolean;
}

/**
 * Lighting3D Component
 *
 * Pre-configured lighting setup for game scenes.
 *
 * @example
 * ```tsx
 * <Canvas>
 *     <Lighting3D
 *         ambientIntensity={0.6}
 *         directionalIntensity={1.0}
 *         shadows={true}
 *     />
 * </Canvas>
 * ```
 */
export function Lighting3D({
    ambientIntensity = 0.6,
    ambientColor = '#ffffff',
    directionalIntensity = 0.8,
    directionalColor = '#ffffff',
    directionalPosition = [10, 20, 10],
    shadows = true,
    shadowMapSize = 2048,
    shadowCameraSize = 20,
    showHelpers = false,
}: Lighting3DProps): React.JSX.Element {
    return (
        <>
            {/* Ambient Light */}
            <ambientLight intensity={ambientIntensity} color={ambientColor} />

            {/* Directional Light (Sun) */}
            <directionalLight
                position={directionalPosition}
                intensity={directionalIntensity}
                color={directionalColor}
                castShadow={shadows}
                shadow-mapSize={[shadowMapSize, shadowMapSize]}
                shadow-camera-left={-shadowCameraSize}
                shadow-camera-right={shadowCameraSize}
                shadow-camera-top={shadowCameraSize}
                shadow-camera-bottom={-shadowCameraSize}
                shadow-camera-near={0.1}
                shadow-camera-far={100}
                shadow-bias={-0.001}
            />

            {/* Hemisphere Light for natural outdoor feel */}
            <hemisphereLight
                intensity={0.3}
                color="#87ceeb"
                groundColor="#362d1d"
            />

            {/* Light Helpers (debug) */}
            {showHelpers && (
                <>
                    <directionalLightHelper
                        args={[
                            new THREE.DirectionalLight(directionalColor, directionalIntensity),
                            5,
                        ]}
                    />
                </>
            )}
        </>
    );
}

export default Lighting3D;
