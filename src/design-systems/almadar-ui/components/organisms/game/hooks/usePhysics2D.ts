'use client';
/**
 * usePhysics2D Hook
 *
 * React hook for integrating 2D physics with the IsometricCanvas.
 * Provides physics state management and tick synchronization.
 *
 * @example
 * ```tsx
 * const { registerUnit, getPosition, applyForce, tick } = usePhysics2D({
 *   gravity: 0.5,
 *   groundY: 400
 * });
 *
 * // Register units
 * useEffect(() => {
 *   units.forEach(unit => {
 *     registerUnit(unit.id, { x: unit.x, y: unit.y, mass: 1 });
 *   });
 * }, [units]);
 *
 * // In animation loop
 * useEffect(() => {
 *   const animate = (timestamp) => {
 *     tick(16); // Run physics
 *     draw();   // Render
 *     requestAnimationFrame(animate);
 *   };
 *   requestAnimationFrame(animate);
 * }, []);
 * ```
 *
 * @packageDocumentation
 */

import { useRef, useCallback, useEffect } from 'react';
import { PhysicsManager, Physics2DState, PhysicsConfig, PhysicsBounds } from '../managers/PhysicsManager';
import type { IsometricUnit } from '../types/isometric';

export interface UsePhysics2DOptions extends PhysicsConfig {
    /** Enable physics debug visualization */
    debug?: boolean;
    /** Callback when collision occurs */
    onCollision?: (entityIdA: string, entityIdB: string) => void;
    /** Ground Y position (default: 500) */
    groundY?: number;
}

export interface UsePhysics2DReturn {
    /** Register a unit for physics simulation */
    registerUnit: (unitId: string, options?: Partial<Physics2DState>) => void;
    /** Unregister a unit from physics */
    unregisterUnit: (unitId: string) => void;
    /** Get current physics position for a unit */
    getPosition: (unitId: string) => { x: number; y: number } | null;
    /** Get full physics state for a unit */
    getState: (unitId: string) => Physics2DState | undefined;
    /** Apply force to a unit */
    applyForce: (unitId: string, fx: number, fy: number) => void;
    /** Set velocity directly */
    setVelocity: (unitId: string, vx: number, vy: number) => void;
    /** Set position directly (teleport) */
    setPosition: (unitId: string, x: number, y: number) => void;
    /** Run physics tick - call this in your RAF loop */
    tick: (deltaTime?: number) => void;
    /** Check collision between two units */
    checkCollision: (unitIdA: string, unitIdB: string, boundsA: PhysicsBounds, boundsB: PhysicsBounds) => boolean;
    /** Resolve collision between two units */
    resolveCollision: (unitIdA: string, unitIdB: string) => void;
    /** Freeze/unfreeze a unit */
    setFrozen: (unitId: string, frozen: boolean) => void;
    /** Get all physics-enabled units */
    getAllUnits: () => Physics2DState[];
    /** Reset all physics */
    reset: () => void;
}

/**
 * Hook for managing 2D physics simulation
 */
export function usePhysics2D(options: UsePhysics2DOptions = {}): UsePhysics2DReturn {
    const physicsManagerRef = useRef<PhysicsManager | null>(null);
    const collisionCallbacksRef = useRef<Set<(entityIdA: string, entityIdB: string) => void>>(new Set());

    // Initialize physics manager
    if (!physicsManagerRef.current) {
        physicsManagerRef.current = new PhysicsManager({
            gravity: options.gravity,
            friction: options.friction,
            airResistance: options.airResistance,
            maxVelocityY: options.maxVelocityY,
            groundY: options.groundY,
        });
    }

    const manager = physicsManagerRef.current;

    // Register collision callback
    useEffect(() => {
        if (options.onCollision) {
            collisionCallbacksRef.current.add(options.onCollision);
        }
        return () => {
            if (options.onCollision) {
                collisionCallbacksRef.current.delete(options.onCollision);
            }
        };
    }, [options.onCollision]);

    const registerUnit = useCallback((unitId: string, initialState: Partial<Physics2DState> = {}) => {
        manager.registerEntity(unitId, initialState);
    }, [manager]);

    const unregisterUnit = useCallback((unitId: string) => {
        manager.unregisterEntity(unitId);
    }, [manager]);

    const getPosition = useCallback((unitId: string) => {
        const state = manager.getState(unitId);
        if (!state) return null;
        return { x: state.x, y: state.y };
    }, [manager]);

    const getState = useCallback((unitId: string) => {
        return manager.getState(unitId);
    }, [manager]);

    const applyForce = useCallback((unitId: string, fx: number, fy: number) => {
        manager.applyForce(unitId, fx, fy);
    }, [manager]);

    const setVelocity = useCallback((unitId: string, vx: number, vy: number) => {
        manager.setVelocity(unitId, vx, vy);
    }, [manager]);

    const setPosition = useCallback((unitId: string, x: number, y: number) => {
        manager.setPosition(unitId, x, y);
    }, [manager]);

    const tick = useCallback((deltaTime: number = 16) => {
        manager.tick(deltaTime);
    }, [manager]);

    const checkCollision = useCallback((unitIdA: string, unitIdB: string, boundsA: PhysicsBounds, boundsB: PhysicsBounds) => {
        return manager.checkCollision(unitIdA, unitIdB, boundsA, boundsB);
    }, [manager]);

    const resolveCollision = useCallback((unitIdA: string, unitIdB: string) => {
        manager.resolveCollision(unitIdA, unitIdB);
        
        // Notify collision callbacks
        collisionCallbacksRef.current.forEach(callback => {
            callback(unitIdA, unitIdB);
        });
    }, [manager]);

    const setFrozen = useCallback((unitId: string, frozen: boolean) => {
        manager.setFrozen(unitId, frozen);
    }, [manager]);

    const getAllUnits = useCallback(() => {
        return manager.getAllEntities();
    }, [manager]);

    const reset = useCallback(() => {
        manager.reset();
    }, [manager]);

    return {
        registerUnit,
        unregisterUnit,
        getPosition,
        getState,
        applyForce,
        setVelocity,
        setPosition,
        tick,
        checkCollision,
        resolveCollision,
        setFrozen,
        getAllUnits,
        reset,
    };
}

export default usePhysics2D;
