/**
 * SimulationCanvas
 *
 * Self-contained 2D physics canvas for educational presets.
 * Runs its own Euler integration loop — no external physics hook needed.
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { Box } from '../../../atoms';
import type { PhysicsPreset, PhysicsBody } from './presets/types';

export interface SimulationCanvasProps {
    preset: PhysicsPreset;
    width?: number;
    height?: number;
    running: boolean;
    speed?: number;
    className?: string;
}

export function SimulationCanvas({
    preset,
    width = 600,
    height = 400,
    running,
    speed = 1,
    className,
}: SimulationCanvasProps): React.JSX.Element {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const bodiesRef = useRef<PhysicsBody[]>(structuredClone(preset.bodies));

    // Reset bodies when preset changes
    useEffect(() => {
        bodiesRef.current = structuredClone(preset.bodies);
    }, [preset]);

    const step = useCallback(() => {
        const dt = (1 / 60) * speed;
        const gx = preset.gravity?.x ?? 0;
        const gy = preset.gravity?.y ?? 9.81;
        const bodies = bodiesRef.current;

        for (const body of bodies) {
            if (body.fixed) continue;

            // Euler integration
            body.vx += gx * dt;
            body.vy += gy * dt;
            body.x += body.vx * dt;
            body.y += body.vy * dt;

            // Boundary bounce
            if (body.y + body.radius > height) {
                body.y = height - body.radius;
                body.vy = -body.vy * 0.8;
            }
            if (body.x + body.radius > width) {
                body.x = width - body.radius;
                body.vx = -body.vx * 0.8;
            }
            if (body.x - body.radius < 0) {
                body.x = body.radius;
                body.vx = -body.vx * 0.8;
            }
        }

        // Spring constraints
        if (preset.constraints) {
            for (const c of preset.constraints) {
                const a = bodies[c.bodyA];
                const b = bodies[c.bodyB];
                if (!a || !b) continue;
                const dx = b.x - a.x;
                const dy = b.y - a.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
                const diff = (dist - c.length) / dist;
                const fx = dx * diff * c.stiffness;
                const fy = dy * diff * c.stiffness;
                if (!a.fixed) { a.vx += fx * dt; a.vy += fy * dt; }
                if (!b.fixed) { b.vx -= fx * dt; b.vy -= fy * dt; }
            }
        }
    }, [preset, width, height, speed]);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const bodies = bodiesRef.current;

        ctx.clearRect(0, 0, width, height);

        // Background
        ctx.fillStyle = preset.backgroundColor ?? '#1a1a2e';
        ctx.fillRect(0, 0, width, height);

        // Draw constraints/springs
        if (preset.constraints) {
            for (const c of preset.constraints) {
                const a = bodies[c.bodyA];
                const b = bodies[c.bodyB];
                if (a && b) {
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.strokeStyle = '#533483';
                    ctx.lineWidth = 1;
                    ctx.setLineDash([4, 4]);
                    ctx.stroke();
                    ctx.setLineDash([]);
                }
            }
        }

        // Draw bodies
        for (const body of bodies) {
            ctx.beginPath();
            ctx.arc(body.x, body.y, body.radius, 0, Math.PI * 2);
            ctx.fillStyle = body.color ?? '#e94560';
            ctx.fill();

            // Velocity vector
            if (preset.showVelocity) {
                ctx.beginPath();
                ctx.moveTo(body.x, body.y);
                ctx.lineTo(body.x + body.vx * 0.1, body.y + body.vy * 0.1);
                ctx.strokeStyle = '#16213e';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        }
    }, [width, height, preset]);

    // Animation loop
    useEffect(() => {
        if (!running) return;
        let raf: number;
        const loop = () => {
            step();
            draw();
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(raf);
    }, [running, step, draw]);

    // Initial draw
    useEffect(() => {
        draw();
    }, [draw]);

    return (
        <Box className={className}>
            <canvas ref={canvasRef} width={width} height={height} className="rounded-md" />
        </Box>
    );
}

SimulationCanvas.displayName = 'SimulationCanvas';
