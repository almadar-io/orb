/**
 * Physics Demo Stories
 *
 * Demonstrates 2D and 3D physics integration with IsometricCanvas and GameCanvas3D.
 *
 * @packageDocumentation
 */

import React, { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { IsometricCanvas } from './IsometricCanvas';
import { GameCanvas3D } from './GameCanvas3D';
import { usePhysics2D } from './hooks/usePhysics2D';
import { PhysicsObject3D } from './three/components/PhysicsObject3D';
import type { IsometricTile, IsometricUnit, IsometricFeature } from './types/isometric';

// =============================================================================
// 2D Physics Demo - Simplified
// =============================================================================

/**
 * Simple 2D Physics Demo Component
 */
function Physics2DDemo() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | undefined>(undefined);
    
    // Store unit positions in refs to avoid re-renders
    const unitsRef = useRef<Array<{
        id: string;
        x: number;
        y: number;
        vx: number;
        vy: number;
        color: string;
    }>>([]);

    // Initialize units once
    useEffect(() => {
        const colors = ['#ef4444', '#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6'];
        unitsRef.current = Array.from({ length: 5 }, (_, i) => ({
            id: `unit-${i}`,
            x: 100 + i * 150,
            y: 50 + Math.random() * 100,
            vx: (Math.random() - 0.5) * 2,
            vy: 0,
            color: colors[i % colors.length],
        }));
        // eslint-disable-next-line no-console
        console.log('Units initialized:', unitsRef.current.length);
    }, []);

    // Animation loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const gravity = 0.5;
        const groundY = 400;

        const animate = () => {
            // Update physics
            unitsRef.current.forEach(unit => {
                // Apply gravity
                unit.vy += gravity;
                
                // Update position
                unit.x += unit.vx;
                unit.y += unit.vy;
                
                // Ground collision
                if (unit.y >= groundY) {
                    unit.y = groundY;
                    unit.vy = -unit.vy * 0.6; // Bounce with damping
                    unit.vx *= 0.95; // Ground friction
                    
                    // Stop if very slow
                    if (Math.abs(unit.vy) < 1) unit.vy = 0;
                }
                
                // Wall collision
                if (unit.x <= 20 || unit.x >= canvas.width - 20) {
                    unit.vx = -unit.vx;
                    unit.x = Math.max(20, Math.min(canvas.width - 20, unit.x));
                }
            });

            // Clear canvas
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw ground
            ctx.strokeStyle = '#4a5568';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, groundY + 20);
            ctx.lineTo(canvas.width, groundY + 20);
            ctx.stroke();

            // Draw units
            unitsRef.current.forEach(unit => {
                // Draw circle
                ctx.fillStyle = unit.color;
                ctx.beginPath();
                ctx.arc(unit.x, unit.y, 20, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw outline
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.stroke();

                // Draw unit ID
                ctx.fillStyle = '#ffffff';
                ctx.font = '12px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(unit.id, unit.x, unit.y - 30);
            });

            // Draw instructions
            ctx.fillStyle = '#ffffff';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('Simple physics demo - units fall and bounce', 20, 30);
            ctx.fillText(`Active units: ${unitsRef.current.length}`, 20, 50);

            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            width={800}
            height={500}
            style={{
                cursor: 'pointer',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
            }}
        />
    );
}

// =============================================================================
// 3D Physics Demo
// =============================================================================

/**
 * 3D Physics Demo Component
 * Demonstrates PhysicsObject3D as children of GameCanvas3D
 */
function Physics3DDemo() {
    const [objects, setObjects] = useState<Array<{
        id: string;
        url: string;
        position: [number, number, number];
        mass: number;
    }>>([]);

    // Asset URLs for demo
    const ASSET_URLS = [
        'https://trait-wars-assets.web.app/3d/medieval/props/barrels.glb',
        'https://trait-wars-assets.web.app/3d/medieval/props/detail-crate.glb',
        'https://trait-wars-assets.web.app/3d/medieval/columns/column.glb',
        'https://trait-wars-assets.web.app/3d/castle/siege/siege-ballista.glb',
    ];

    // Spawn objects
    useEffect(() => {
        const spawnObject = () => {
            const newObject = {
                id: `obj-${Date.now()}-${Math.random()}`,
                url: ASSET_URLS[Math.floor(Math.random() * ASSET_URLS.length)],
                position: [
                    (Math.random() - 0.5) * 10,
                    10 + Math.random() * 5,
                    (Math.random() - 0.5) * 10,
                ] as [number, number, number],
                mass: 1 + Math.random() * 2,
            };

            setObjects(prev => [...prev.slice(-9), newObject]);
        };

        // Spawn initial objects
        for (let i = 0; i < 3; i++) {
            setTimeout(spawnObject, i * 500);
        }

        // Spawn on interval
        const interval = setInterval(spawnObject, 3000);

        return () => clearInterval(interval);
    }, []);

    // Create a simple ground tile configuration
    const tiles = useMemo(() => {
        const groundTiles = [];
        for (let x = -5; x <= 5; x++) {
            for (let z = -5; z <= 5; z++) {
                groundTiles.push({
                    id: `ground-${x}-${z}`,
                    x,
                    y: z,
                    z,
                    type: 'floor',
                    terrain: 'stone',
                    passable: true,
                    elevation: -0.5,
                });
            }
        }
        return groundTiles;
    }, []);

    return (
        <div style={{ height: '500px', width: '100%' }}>
            <GameCanvas3D
                tiles={tiles}
                features={[]}
                units={[]}
                cameraMode="perspective"
                showGrid={true}
                shadows={true}
            >
                {/* Ground plane */}
                <mesh position={[0, -1, 0]} receiveShadow>
                    <boxGeometry args={[20, 1, 20]} />
                    <meshStandardMaterial color="#2d3748" />
                </mesh>

                {/* Physics objects */}
                {objects.map(obj => (
                    <PhysicsObject3D
                        key={obj.id}
                        entityId={obj.id}
                        modelUrl={obj.url}
                        initialPosition={obj.position}
                        mass={obj.mass}
                        gravity={9.8}
                        groundY={-0.5}
                        scale={0.5}
                        onGroundHit={() => {
                            console.log(`Object ${obj.id} hit ground`);
                        }}
                    />
                ))}
            </GameCanvas3D>
        </div>
    );
}

// =============================================================================
// Storybook Config
// =============================================================================

const meta: Meta = {
    title: 'Game/Physics',
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: `
Physics integration demo for Almadar game canvases.

## 2D Physics (Canvas)

Simple canvas-based physics simulation with gravity and bouncing.

## 3D Physics (GameCanvas3D)

Uses \`PhysicsObject3D\` component with \`useFrame\`:
- Three.js integration
- Falling objects
- Ground collision detection
                `,
            },
        },
    },
};

export default meta;

// =============================================================================
// Stories
// =============================================================================

export const Physics2D: StoryObj = {
    name: '2D Physics Demo',
    render: () => (
        <div style={{ padding: '20px' }}>
            <h3>2D Physics - Simple falling units</h3>
            <Physics2DDemo />
        </div>
    ),
};

export const Physics3D: StoryObj = {
    name: '3D Physics Demo',
    render: () => (
        <div style={{ padding: '20px', width: '100%' }}>
            <h3>3D Physics - Falling Objects</h3>
            <p>Objects spawn every 3 seconds and fall with gravity</p>
            <div style={{ height: '500px', width: '800px' }}>
                <Physics3DDemo />
            </div>
        </div>
    ),
};
