/**
 * SimulationGraph
 *
 * Real-time measurement graph for physics simulations.
 * Renders measurement data as a simple line chart on canvas.
 */

import React, { useRef, useEffect } from 'react';
import { Card, Typography, VStack } from '../../../atoms';

export interface MeasurementPoint {
    time: number;
    value: number;
}

export interface SimulationGraphProps {
    label: string;
    unit: string;
    data: MeasurementPoint[];
    maxPoints?: number;
    width?: number;
    height?: number;
    color?: string;
    className?: string;
}

export function SimulationGraph({
    label,
    unit,
    data,
    maxPoints = 200,
    width = 300,
    height = 120,
    color = '#e94560',
    className,
}: SimulationGraphProps): React.JSX.Element {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const visibleData = data.slice(-maxPoints);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || visibleData.length < 2) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, width, height);

        // Background
        ctx.fillStyle = '#0f0f23';
        ctx.fillRect(0, 0, width, height);

        // Grid lines
        ctx.strokeStyle = '#1a1a3e';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < 5; i++) {
            const y = (height / 5) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // Find min/max
        let minVal = Infinity;
        let maxVal = -Infinity;
        for (const pt of visibleData) {
            if (pt.value < minVal) minVal = pt.value;
            if (pt.value > maxVal) maxVal = pt.value;
        }
        const range = maxVal - minVal || 1;
        const pad = height * 0.1;

        // Draw line
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        for (let i = 0; i < visibleData.length; i++) {
            const x = (i / (maxPoints - 1)) * width;
            const y = pad + ((maxVal - visibleData[i].value) / range) * (height - 2 * pad);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Current value label
        const last = visibleData[visibleData.length - 1];
        ctx.fillStyle = color;
        ctx.font = '12px monospace';
        ctx.fillText(`${last.value.toFixed(2)} ${unit}`, width - 80, 16);
    }, [visibleData, width, height, color, unit, maxPoints]);

    return (
        <Card padding="sm" className={className}>
            <VStack gap="xs">
                <Typography variant="caption" weight="bold">{label}</Typography>
                <canvas ref={canvasRef} width={width} height={height} className="rounded" />
            </VStack>
        </Card>
    );
}

SimulationGraph.displayName = 'SimulationGraph';
