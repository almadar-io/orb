'use client';
/**
 * PhysicsObject3D Component
 *
 * Three.js component that syncs a 3D object's position with physics state.
 * Use this to render physics-enabled entities in GameCanvas3D.
 *
 * @example
 * ```tsx
 * <PhysicsObject3D
 *   entityId="player-1"
 *   modelUrl="https://trait-wars-assets.web.app/3d/medieval/props/barrels.glb"
 *   initialPosition={[0, 10, 0]}
 *   mass={1}
 * />
 * ```
 *
 * @packageDocumentation
 */

import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ModelLoader } from './ModelLoader';

export interface Physics3DState {
    id: string;
    x: number;
    y: number;
    z: number;
    vx: number;
    vy: number;
    vz: number;
    rx: number;
    ry: number;
    rz: number;
    isGrounded: boolean;
    gravity: number;
    friction: number;
    mass: number;
    state: 'Active' | 'Frozen';
}

export interface PhysicsObject3DProps {
    /** Unique entity ID */
    entityId: string;
    /** GLB model URL */
    modelUrl: string;
    /** Initial position [x, y, z] */
    initialPosition?: [number, number, number];
    /** Initial velocity [vx, vy, vz] */
    initialVelocity?: [number, number, number];
    /** Mass for collision response */
    mass?: number;
    /** Gravity force (default: 9.8) */
    gravity?: number;
    /** Ground plane Y position (default: 0) */
    groundY?: number;
    /** Model scale */
    scale?: number | [number, number, number];
    /** Called when physics state updates */
    onPhysicsUpdate?: (state: Physics3DState) => void;
    /** Called when object hits ground */
    onGroundHit?: () => void;
    /** Called when collision occurs */
    onCollision?: (otherEntityId: string) => void;
}

/**
 * 3D Physics-enabled object for GameCanvas3D
 */
export function PhysicsObject3D({
    entityId,
    modelUrl,
    initialPosition = [0, 0, 0],
    initialVelocity = [0, 0, 0],
    mass = 1,
    gravity = 9.8,
    groundY = 0,
    scale = 1,
    onPhysicsUpdate,
    onGroundHit,
    onCollision,
}: PhysicsObject3DProps): React.JSX.Element {
    const groupRef = useRef<THREE.Group>(null);
    const physicsStateRef = useRef<Physics3DState>({
        id: entityId,
        x: initialPosition[0],
        y: initialPosition[1],
        z: initialPosition[2],
        vx: initialVelocity[0],
        vy: initialVelocity[1],
        vz: initialVelocity[2],
        rx: 0,
        ry: 0,
        rz: 0,
        isGrounded: false,
        gravity,
        friction: 0.8,
        mass,
        state: 'Active',
    });
    const groundHitRef = useRef(false);

    // Sync Three.js position on mount
    useEffect(() => {
        if (groupRef.current) {
            groupRef.current.position.set(
                initialPosition[0],
                initialPosition[1],
                initialPosition[2]
            );
        }
    }, []);

    // Physics simulation loop
    useFrame((state, delta) => {
        const physics = physicsStateRef.current;
        if (physics.state !== 'Active') return;

        const dt = Math.min(delta, 0.1); // Cap delta to prevent large jumps

        // Apply gravity
        if (!physics.isGrounded) {
            physics.vy -= physics.gravity * dt;
        }

        // Apply velocity
        physics.x += physics.vx * dt;
        physics.y += physics.vy * dt;
        physics.z += physics.vz * dt;

        // Apply air resistance
        const airResistance = Math.pow(0.99, dt * 60);
        physics.vx *= airResistance;
        physics.vz *= airResistance;

        // Ground collision
        if (physics.y <= groundY) {
            physics.y = groundY;
            
            if (!physics.isGrounded) {
                physics.isGrounded = true;
                groundHitRef.current = true;
                
                // Apply friction
                physics.vx *= physics.friction;
                physics.vz *= physics.friction;
                
                onGroundHit?.();
            }
            
            physics.vy = 0;
        } else {
            physics.isGrounded = false;
        }

        // Update Three.js position
        if (groupRef.current) {
            groupRef.current.position.set(physics.x, physics.y, physics.z);
            
            // Add slight rotation based on velocity for visual effect
            if (!physics.isGrounded) {
                physics.rx += physics.vz * dt * 0.5;
                physics.rz -= physics.vx * dt * 0.5;
                groupRef.current.rotation.set(physics.rx, physics.ry, physics.rz);
            }
        }

        // Notify listeners
        onPhysicsUpdate?.({ ...physics });
    });

    // Public API via ref could be added here if needed
    
    // Calculate scale array
    const scaleArray: [number, number, number] = typeof scale === 'number' 
        ? [scale, scale, scale] 
        : scale;

    return (
        <group ref={groupRef} scale={scaleArray}>
            <ModelLoader 
                url={modelUrl}
                fallbackGeometry="box"
            />
            
            {/* Debug visualization of physics bounds */}
            {/* 
            <mesh position={[0, 0.5, 0]} visible={false}>
                <boxGeometry args={[1, 1, 1]} />
                <meshBasicMaterial wireframe color="red" />
            </mesh>
            */}
        </group>
    );
}

/**
 * Hook for controlling a PhysicsObject3D from parent component
 */
export function usePhysics3DController(entityId: string) {
    const applyForce = (fx: number, fy: number, fz: number) => {
        // This would need to be connected to the physics state
        // Implementation depends on your state management approach
        console.log(`Apply force to ${entityId}:`, { fx, fy, fz });
    };

    const setVelocity = (vx: number, vy: number, vz: number) => {
        console.log(`Set velocity for ${entityId}:`, { vx, vy, vz });
    };

    const setPosition = (x: number, y: number, z: number) => {
        console.log(`Set position for ${entityId}:`, { x, y, z });
    };

    const jump = (force: number = 10) => {
        applyForce(0, force, 0);
    };

    return {
        applyForce,
        setVelocity,
        setPosition,
        jump,
    };
}

export default PhysicsObject3D;
