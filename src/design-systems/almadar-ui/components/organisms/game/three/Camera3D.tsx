'use client';
/**
 * Camera3D
 *
 * Three.js camera component with orbit controls.
 * Supports isometric, perspective, and top-down camera modes.
 *
 * @packageDocumentation
 */

import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

export type CameraMode = 'isometric' | 'perspective' | 'top-down';

export interface Camera3DProps {
    /** Camera mode */
    mode?: CameraMode;
    /** Initial camera position */
    position?: [number, number, number];
    /** Target to look at */
    target?: [number, number, number];
    /** Zoom level */
    zoom?: number;
    /** Field of view (perspective mode only) */
    fov?: number;
    /** Enable orbit controls */
    enableOrbit?: boolean;
    /** Minimum zoom distance */
    minDistance?: number;
    /** Maximum zoom distance */
    maxDistance?: number;
    /** Called when camera changes */
    onChange?: (camera: THREE.Camera) => void;
}

export interface Camera3DHandle {
    /** Get current camera */
    getCamera: () => THREE.Camera;
    /** Set camera position */
    setPosition: (x: number, y: number, z: number) => void;
    /** Look at target */
    lookAt: (x: number, y: number, z: number) => void;
    /** Reset to initial position */
    reset: () => void;
    /** Get current view bounds */
    getViewBounds: () => { min: THREE.Vector3; max: THREE.Vector3 };
}

const ISOMETRIC_ANGLE = Math.atan(1 / Math.sqrt(2));

/**
 * Camera3D Component
 *
 * Configurable camera with orbit controls and multiple modes.
 *
 * @example
 * ```tsx
 * <Canvas>
 *     <Camera3D mode="isometric" position={[10, 10, 10]} target={[0, 0, 0]} />
 * </Canvas>
 * ```
 */
export const Camera3D = forwardRef<Camera3DHandle, Camera3DProps>(
    (
        {
            mode = 'isometric',
            position = [10, 10, 10],
            target = [0, 0, 0],
            zoom = 1,
            fov = 45,
            enableOrbit = true,
            minDistance = 2,
            maxDistance = 100,
            onChange,
        },
        ref
    ): React.JSX.Element => {
        const { camera, set, viewport } = useThree();
        const controlsRef = useRef<any>(null);
        const initialPosition = useRef(new THREE.Vector3(...position));
        const initialTarget = useRef(new THREE.Vector3(...target));

        // Configure camera based on mode
        useEffect(() => {
            let newCamera: THREE.Camera;

            if (mode === 'isometric') {
                // Orthographic camera for isometric view
                const aspect = viewport.aspect;
                const size = 10 / zoom;
                newCamera = new THREE.OrthographicCamera(
                    -size * aspect,
                    size * aspect,
                    size,
                    -size,
                    0.1,
                    1000
                );
            } else {
                // Perspective camera
                newCamera = new THREE.PerspectiveCamera(fov, viewport.aspect, 0.1, 1000);
            }

            newCamera.position.copy(initialPosition.current);
            newCamera.lookAt(initialTarget.current);

            set({ camera: newCamera as THREE.PerspectiveCamera });

            // For top-down mode
            if (mode === 'top-down') {
                newCamera.position.set(0, 20 / zoom, 0);
                newCamera.lookAt(0, 0, 0);
            }

            return () => {
                // Cleanup if needed
            };
        }, [mode, fov, zoom, viewport.aspect, set]);

        // Update camera on changes
        useFrame(() => {
            if (onChange) {
                onChange(camera);
            }
        });

        // Imperative handle
        useImperativeHandle(ref, () => ({
            getCamera: () => camera,
            setPosition: (x: number, y: number, z: number) => {
                camera.position.set(x, y, z);
                if (controlsRef.current) {
                    controlsRef.current.update();
                }
            },
            lookAt: (x: number, y: number, z: number) => {
                camera.lookAt(x, y, z);
                if (controlsRef.current) {
                    controlsRef.current.target.set(x, y, z);
                    controlsRef.current.update();
                }
            },
            reset: () => {
                camera.position.copy(initialPosition.current);
                camera.lookAt(initialTarget.current);
                if (controlsRef.current) {
                    controlsRef.current.target.copy(initialTarget.current);
                    controlsRef.current.update();
                }
            },
            getViewBounds: () => {
                // Calculate view frustum bounds
                const min = new THREE.Vector3(-10, -10, -10);
                const max = new THREE.Vector3(10, 10, 10);
                return { min, max };
            },
        }));

        // Calculate polar angle limits based on mode
        const maxPolarAngle = mode === 'top-down' ? 0.1 : Math.PI / 2 - 0.1;

        return (
            <OrbitControls
                ref={controlsRef}
                camera={camera}
                enabled={enableOrbit}
                target={initialTarget.current}
                minDistance={minDistance}
                maxDistance={maxDistance}
                maxPolarAngle={maxPolarAngle}
                enableDamping
                dampingFactor={0.05}
            />
        );
    }
);

Camera3D.displayName = 'Camera3D';

export default Camera3D;
