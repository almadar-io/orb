/**
 * Physics Preset Types
 *
 * Configuration for physics simulation presets.
 */

export interface PhysicsBody {
    id: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    mass: number;
    radius: number;
    color: string;
    fixed: boolean;
}

export interface PhysicsConstraint {
    bodyA: number;
    bodyB: number;
    length: number;
    stiffness: number;
}

export interface PhysicsPreset {
    id: string;
    name: string;
    description: string;
    domain: string;
    gravity?: { x: number; y: number };
    bodies: PhysicsBody[];
    constraints?: PhysicsConstraint[];
    backgroundColor?: string;
    showVelocity?: boolean;
    parameters: Record<string, { value: number; min: number; max: number; step: number; label: string }>;
}
