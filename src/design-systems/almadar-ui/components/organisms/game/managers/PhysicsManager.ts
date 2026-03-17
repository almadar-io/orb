/**
 * PhysicsManager
 *
 * Manages 2D physics simulation for entities with Physics2D state.
 * This implements the tick logic that would normally be compiled from .orb schemas.
 *
 * @packageDocumentation
 */

import type { IsometricUnit } from '../types/isometric';

export interface Physics2DState {
    id: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    isGrounded: boolean;
    gravity: number;
    friction: number;
    airResistance: number;
    maxVelocityY: number;
    mass?: number;
    restitution?: number;
    state: 'Active' | 'Frozen';
}

export interface PhysicsBounds {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface PhysicsConfig {
    gravity?: number;
    friction?: number;
    airResistance?: number;
    maxVelocityY?: number;
    groundY?: number; // Ground plane Y position
}

export class PhysicsManager {
    private entities: Map<string, Physics2DState> = new Map();
    private config: Required<PhysicsConfig>;

    constructor(config: PhysicsConfig = {}) {
        this.config = {
            gravity: 0.5,
            friction: 0.8,
            airResistance: 0.99,
            maxVelocityY: 20,
            groundY: 500, // Default ground position in pixels
            ...config,
        };
    }

    /**
     * Register an entity for physics simulation
     */
    registerEntity(entityId: string, initialState: Partial<Physics2DState> = {}): Physics2DState {
        const state: Physics2DState = {
            id: entityId,
            x: initialState.x ?? 0,
            y: initialState.y ?? 0,
            vx: initialState.vx ?? 0,
            vy: initialState.vy ?? 0,
            isGrounded: initialState.isGrounded ?? false,
            gravity: initialState.gravity ?? this.config.gravity,
            friction: initialState.friction ?? this.config.friction,
            airResistance: initialState.airResistance ?? this.config.airResistance,
            maxVelocityY: initialState.maxVelocityY ?? this.config.maxVelocityY,
            mass: initialState.mass ?? 1,
            restitution: initialState.restitution ?? 0.8,
            state: initialState.state ?? 'Active',
        };

        this.entities.set(entityId, state);
        return state;
    }

    /**
     * Unregister an entity from physics simulation
     */
    unregisterEntity(entityId: string): void {
        this.entities.delete(entityId);
    }

    /**
     * Get physics state for an entity
     */
    getState(entityId: string): Physics2DState | undefined {
        return this.entities.get(entityId);
    }

    /**
     * Get all registered entities
     */
    getAllEntities(): Physics2DState[] {
        return Array.from(this.entities.values());
    }

    /**
     * Apply a force to an entity (impulse)
     */
    applyForce(entityId: string, fx: number, fy: number): void {
        const state = this.entities.get(entityId);
        if (!state || state.state !== 'Active') return;

        state.vx += fx;
        state.vy += fy;
    }

    /**
     * Set velocity directly
     */
    setVelocity(entityId: string, vx: number, vy: number): void {
        const state = this.entities.get(entityId);
        if (!state) return;

        state.vx = vx;
        state.vy = vy;
    }

    /**
     * Set position directly
     */
    setPosition(entityId: string, x: number, y: number): void {
        const state = this.entities.get(entityId);
        if (!state) return;

        state.x = x;
        state.y = y;
    }

    /**
     * Freeze/unfreeze an entity
     */
    setFrozen(entityId: string, frozen: boolean): void {
        const state = this.entities.get(entityId);
        if (!state) return;

        state.state = frozen ? 'Frozen' : 'Active';
    }

    /**
     * Main tick function - call this every frame
     * Implements the logic from std-physics2d ticks
     */
    tick(deltaTime: number = 16): void {
        for (const state of this.entities.values()) {
            if (state.state !== 'Active') continue;

            this.applyGravity(state, deltaTime);
            this.applyVelocity(state, deltaTime);
            this.checkGroundCollision(state);
        }
    }

    /**
     * ApplyGravity tick implementation
     */
    private applyGravity(state: Physics2DState, deltaTime: number): void {
        // Only apply gravity if not grounded
        if (state.isGrounded) return;

        // Apply gravity with max velocity clamp
        const gravityForce = state.gravity * (deltaTime / 16); // Normalize to 60fps
        state.vy = Math.min(state.maxVelocityY, state.vy + gravityForce);
    }

    /**
     * ApplyVelocity tick implementation
     */
    private applyVelocity(state: Physics2DState, deltaTime: number): void {
        const dt = deltaTime / 16; // Normalize to 60fps

        // Apply air resistance
        state.vx *= Math.pow(state.airResistance, dt);

        // Update position
        state.x += state.vx * dt;
        state.y += state.vy * dt;
    }

    /**
     * Check and handle ground collision
     */
    private checkGroundCollision(state: Physics2DState): void {
        const groundY = this.config.groundY;

        if (state.y >= groundY) {
            // Hit ground
            state.y = groundY;
            state.isGrounded = true;
            state.vy = 0;

            // Apply friction
            state.vx *= state.friction;

            // Stop if moving very slowly
            if (Math.abs(state.vx) < 0.01) {
                state.vx = 0;
            }
        } else {
            state.isGrounded = false;
        }
    }

    /**
     * Check AABB collision between two entities
     */
    checkCollision(entityIdA: string, entityIdB: string, boundsA: PhysicsBounds, boundsB: PhysicsBounds): boolean {
        const stateA = this.entities.get(entityIdA);
        const stateB = this.entities.get(entityIdB);

        if (!stateA || !stateB) return false;

        // Update bounds positions with current physics positions
        const absBoundsA = {
            x: stateA.x + boundsA.x,
            y: stateA.y + boundsA.y,
            width: boundsA.width,
            height: boundsA.height,
        };

        const absBoundsB = {
            x: stateB.x + boundsB.x,
            y: stateB.y + boundsB.y,
            width: boundsB.width,
            height: boundsB.height,
        };

        return (
            absBoundsA.x < absBoundsB.x + absBoundsB.width &&
            absBoundsA.x + absBoundsA.width > absBoundsB.x &&
            absBoundsA.y < absBoundsB.y + absBoundsB.height &&
            absBoundsA.y + absBoundsA.height > absBoundsB.y
        );
    }

    /**
     * Resolve collision with bounce
     */
    resolveCollision(entityIdA: string, entityIdB: string): void {
        const stateA = this.entities.get(entityIdA);
        const stateB = this.entities.get(entityIdB);

        if (!stateA || !stateB) return;

        // Simple elastic collision response
        const restitution = Math.min(stateA.restitution ?? 0.8, stateB.restitution ?? 0.8);

        // Swap velocities with restitution
        const tempVx = stateA.vx;
        const tempVy = stateA.vy;

        stateA.vx = stateB.vx * restitution;
        stateA.vy = stateB.vy * restitution;
        stateB.vx = tempVx * restitution;
        stateB.vy = tempVy * restitution;

        // Separate entities slightly to prevent sticking
        const dx = stateB.x - stateA.x;
        const dy = stateB.y - stateA.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            const overlap = 1; // Minimum separation
            const nx = dx / distance;
            const ny = dy / distance;

            stateA.x -= nx * overlap * 0.5;
            stateA.y -= ny * overlap * 0.5;
            stateB.x += nx * overlap * 0.5;
            stateB.y += ny * overlap * 0.5;
        }
    }

    /**
     * Reset all physics state
     */
    reset(): void {
        this.entities.clear();
    }
}

export default PhysicsManager;
