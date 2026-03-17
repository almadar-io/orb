import type { PhysicsPreset } from './types';

export const projectileMotion: PhysicsPreset = {
    id: 'mechanics-projectile',
    name: 'Projectile Motion',
    description: 'Launch a ball and observe parabolic trajectory under gravity.',
    domain: 'natural',
    gravity: { x: 0, y: 9.81 },
    bodies: [
        { id: 'ball', x: 50, y: 350, vx: 80, vy: -120, mass: 1, radius: 10, color: '#e94560', fixed: false },
        { id: 'ground', x: 300, y: 390, vx: 0, vy: 0, mass: 1000, radius: 400, color: '#333', fixed: true },
    ],
    showVelocity: true,
    parameters: {
        angle: { value: 45, min: 0, max: 90, step: 1, label: 'Launch angle (deg)' },
        velocity: { value: 100, min: 10, max: 200, step: 5, label: 'Initial velocity (m/s)' },
        gravity: { value: 9.81, min: 0, max: 20, step: 0.1, label: 'Gravity (m/s²)' },
    },
};

export const pendulum: PhysicsPreset = {
    id: 'mechanics-pendulum',
    name: 'Simple Pendulum',
    description: 'A mass on a string swinging under gravity.',
    domain: 'natural',
    gravity: { x: 0, y: 9.81 },
    bodies: [
        { id: 'pivot', x: 300, y: 50, vx: 0, vy: 0, mass: 1000, radius: 5, color: '#888', fixed: true },
        { id: 'bob', x: 400, y: 200, vx: 0, vy: 0, mass: 5, radius: 15, color: '#e94560', fixed: false },
    ],
    constraints: [{ bodyA: 0, bodyB: 1, length: 180, stiffness: 1 }],
    parameters: {
        length: { value: 180, min: 50, max: 300, step: 10, label: 'String length (px)' },
        mass: { value: 5, min: 1, max: 20, step: 0.5, label: 'Mass (kg)' },
        gravity: { value: 9.81, min: 0, max: 20, step: 0.1, label: 'Gravity (m/s²)' },
    },
};

export const springOscillator: PhysicsPreset = {
    id: 'mechanics-spring',
    name: 'Spring Oscillator',
    description: 'A mass bouncing on a spring — simple harmonic motion.',
    domain: 'natural',
    gravity: { x: 0, y: 0 },
    bodies: [
        { id: 'anchor', x: 300, y: 50, vx: 0, vy: 0, mass: 1000, radius: 8, color: '#888', fixed: true },
        { id: 'mass', x: 300, y: 250, vx: 0, vy: 0, mass: 2, radius: 20, color: '#0f3460', fixed: false },
    ],
    constraints: [{ bodyA: 0, bodyB: 1, length: 150, stiffness: 0.5 }],
    parameters: {
        stiffness: { value: 0.5, min: 0.1, max: 2, step: 0.05, label: 'Spring stiffness (k)' },
        mass: { value: 2, min: 0.5, max: 10, step: 0.5, label: 'Mass (kg)' },
        damping: { value: 0, min: 0, max: 0.5, step: 0.01, label: 'Damping' },
    },
};
