/**
 * SimulationControls
 *
 * Play/pause/step/reset controls with speed and parameter sliders.
 */

import React from 'react';
import { HStack, VStack, Button, Typography, Icon } from '../../../atoms';
import { Play, Pause, SkipForward, RotateCcw } from 'lucide-react';

export interface SimulationControlsProps {
    running: boolean;
    speed: number;
    parameters: Record<string, { value: number; min: number; max: number; step: number; label: string }>;
    onPlay: () => void;
    onPause: () => void;
    onStep: () => void;
    onReset: () => void;
    onSpeedChange: (speed: number) => void;
    onParameterChange: (name: string, value: number) => void;
    className?: string;
}

export function SimulationControls({
    running,
    speed,
    parameters,
    onPlay,
    onPause,
    onStep,
    onReset,
    onSpeedChange,
    onParameterChange,
    className,
}: SimulationControlsProps): React.JSX.Element {
    return (
        <VStack gap="md" className={className}>
            <HStack gap="sm" align="center">
                {running ? (
                    <Button size="sm" variant="secondary" onClick={onPause} icon={Pause}>
                        Pause
                    </Button>
                ) : (
                    <Button size="sm" variant="primary" onClick={onPlay} icon={Play}>
                        Play
                    </Button>
                )}
                <Button size="sm" variant="ghost" onClick={onStep} icon={SkipForward} disabled={running}>
                    Step
                </Button>
                <Button size="sm" variant="ghost" onClick={onReset} icon={RotateCcw}>
                    Reset
                </Button>
            </HStack>

            <VStack gap="xs">
                <Typography variant="caption" color="muted">Speed: {speed.toFixed(1)}x</Typography>
                <input
                    type="range"
                    min={0.1}
                    max={5}
                    step={0.1}
                    value={speed}
                    onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
                    className="w-full"
                />
            </VStack>

            {Object.entries(parameters).map(([name, param]) => (
                <VStack key={name} gap="xs">
                    <Typography variant="caption" color="muted">
                        {param.label}: {param.value.toFixed(2)}
                    </Typography>
                    <input
                        type="range"
                        min={param.min}
                        max={param.max}
                        step={param.step}
                        value={param.value}
                        onChange={(e) => onParameterChange(name, parseFloat(e.target.value))}
                        className="w-full"
                    />
                </VStack>
            ))}
        </VStack>
    );
}

SimulationControls.displayName = 'SimulationControls';
