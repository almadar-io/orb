'use client';
/**
 * useThree
 *
 * React hook for managing a Three.js scene within the GameCanvas3D component.
 * Provides camera controls, scene management, and lifecycle handling.
 *
 * @packageDocumentation
 */

import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { AssetLoader } from '../loaders/AssetLoader';

export type CameraMode = 'isometric' | 'perspective' | 'top-down';

export interface UseThreeOptions {
    /** Camera mode for viewing the scene */
    cameraMode?: CameraMode;
    /** Initial camera position [x, y, z] */
    cameraPosition?: [number, number, number];
    /** Background color */
    backgroundColor?: string;
    /** Enable shadows */
    shadows?: boolean;
    /** Enable grid helper */
    showGrid?: boolean;
    /** Grid size */
    gridSize?: number;
    /** Asset loader instance */
    assetLoader?: AssetLoader;
}

export interface UseThreeReturn {
    /** Canvas element reference (for React Three Fiber) */
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    /** Three.js renderer */
    renderer: THREE.WebGLRenderer | null;
    /** Three.js scene */
    scene: THREE.Scene | null;
    /** Three.js camera */
    camera: THREE.Camera | null;
    /** Orbit controls */
    controls: OrbitControls | null;
    /** Is scene ready */
    isReady: boolean;
    /** Canvas dimensions */
    dimensions: { width: number; height: number };
    /** Set camera position */
    setCameraPosition: (x: number, y: number, z: number) => void;
    /** Look at a specific point */
    lookAt: (x: number, y: number, z: number) => void;
    /** Reset camera to initial position */
    resetCamera: () => void;
    /** Fit view to bounds */
    fitView: (bounds: { minX: number; maxX: number; minZ: number; maxZ: number }) => void;
}

const DEFAULT_OPTIONS: Required<UseThreeOptions> = {
    cameraMode: 'isometric',
    cameraPosition: [10, 10, 10],
    backgroundColor: '#1a1a2e',
    shadows: true,
    showGrid: true,
    gridSize: 20,
    assetLoader: new AssetLoader(),
};

/**
 * Hook for managing a Three.js scene
 * This is a lower-level hook used by GameCanvas3D
 */
export function useThree(options: UseThreeOptions = {}): UseThreeReturn {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.Camera | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const gridHelperRef = useRef<THREE.GridHelper | null>(null);
    const rafRef = useRef<number>(0);

    const [isReady, setIsReady] = useState(false);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // Initial camera position for reset
    const initialCameraPosition = useMemo(
        () => new THREE.Vector3(...opts.cameraPosition),
        []
    );

    // Initialize scene
    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const { clientWidth, clientHeight } = container;

        // Scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(opts.backgroundColor);
        sceneRef.current = scene;

        // Camera
        let camera: THREE.Camera;
        const aspect = clientWidth / clientHeight;

        if (opts.cameraMode === 'isometric') {
            // Isometric camera using orthographic projection
            const size = 10;
            camera = new THREE.OrthographicCamera(
                -size * aspect,
                size * aspect,
                size,
                -size,
                0.1,
                1000
            );
        } else {
            // Perspective camera
            camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
        }

        camera.position.copy(initialCameraPosition);
        cameraRef.current = camera;

        // Renderer
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            canvas: canvasRef.current || undefined,
        });
        renderer.setSize(clientWidth, clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = opts.shadows;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        rendererRef.current = renderer;

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 2;
        controls.maxDistance = 100;
        controls.maxPolarAngle = Math.PI / 2 - 0.1; // Don't go below ground
        controlsRef.current = controls;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = opts.shadows;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        scene.add(directionalLight);

        // Grid
        if (opts.showGrid) {
            const gridHelper = new THREE.GridHelper(
                opts.gridSize,
                opts.gridSize,
                0x444444,
                0x222222
            );
            scene.add(gridHelper);
            gridHelperRef.current = gridHelper;
        }

        // Animation loop
        const animate = () => {
            rafRef.current = requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        // Handle resize
        const handleResize = () => {
            const { clientWidth: width, clientHeight: height } = container;
            setDimensions({ width, height });

            if (camera instanceof THREE.PerspectiveCamera) {
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
            } else if (camera instanceof THREE.OrthographicCamera) {
                const aspect = width / height;
                const size = 10;
                camera.left = -size * aspect;
                camera.right = size * aspect;
                camera.top = size;
                camera.bottom = -size;
                camera.updateProjectionMatrix();
            }

            renderer.setSize(width, height);
        };

        window.addEventListener('resize', handleResize);
        handleResize();
        setIsReady(true);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(rafRef.current);
            controls.dispose();
            renderer.dispose();
            scene.clear();
        };
    }, []);

    // Camera mode effect
    useEffect(() => {
        if (!cameraRef.current || !containerRef.current) return;

        const container = containerRef.current;
        const { clientWidth, clientHeight } = container;
        const aspect = clientWidth / clientHeight;

        // Store current position before switching
        const currentPos = cameraRef.current.position.clone();

        let newCamera: THREE.Camera;

        if (opts.cameraMode === 'isometric') {
            const size = 10;
            newCamera = new THREE.OrthographicCamera(
                -size * aspect,
                size * aspect,
                size,
                -size,
                0.1,
                1000
            );
        } else {
            newCamera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
        }

        newCamera.position.copy(currentPos);
        cameraRef.current = newCamera;

        // Update controls
        if (controlsRef.current) {
            controlsRef.current.object = newCamera;
        }

        // Update renderer
        if (rendererRef.current) {
            const animate = () => {
                rafRef.current = requestAnimationFrame(animate);
                controlsRef.current?.update();
                rendererRef.current?.render(sceneRef.current!, newCamera);
            };
            cancelAnimationFrame(rafRef.current);
            animate();
        }
    }, [opts.cameraMode]);

    const setCameraPosition = useCallback((x: number, y: number, z: number) => {
        if (cameraRef.current) {
            cameraRef.current.position.set(x, y, z);
            controlsRef.current?.update();
        }
    }, []);

    const lookAt = useCallback((x: number, y: number, z: number) => {
        if (cameraRef.current) {
            cameraRef.current.lookAt(x, y, z);
            controlsRef.current?.target.set(x, y, z);
            controlsRef.current?.update();
        }
    }, []);

    const resetCamera = useCallback(() => {
        if (cameraRef.current) {
            cameraRef.current.position.copy(initialCameraPosition);
            cameraRef.current.lookAt(0, 0, 0);
            if (controlsRef.current) {
                controlsRef.current.target.set(0, 0, 0);
                controlsRef.current.update();
            }
        }
    }, [initialCameraPosition]);

    const fitView = useCallback(
        (bounds: { minX: number; maxX: number; minZ: number; maxZ: number }) => {
            if (!cameraRef.current) return;

            const centerX = (bounds.minX + bounds.maxX) / 2;
            const centerZ = (bounds.minZ + bounds.maxZ) / 2;
            const width = bounds.maxX - bounds.minX;
            const depth = bounds.maxZ - bounds.minZ;
            const maxDim = Math.max(width, depth);

            // Position camera to see all
            const distance = maxDim * 1.5;
            const height = distance * 0.8;

            cameraRef.current.position.set(centerX + distance, height, centerZ + distance);
            lookAt(centerX, 0, centerZ);
        },
        [lookAt]
    );

    return {
        canvasRef,
        renderer: rendererRef.current,
        scene: sceneRef.current,
        camera: cameraRef.current,
        controls: controlsRef.current,
        isReady,
        dimensions,
        setCameraPosition,
        lookAt,
        resetCamera,
        fitView,
    };
}

export default useThree;
