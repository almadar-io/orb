/**
 * StateNode Component
 *
 * A draggable state circle for the graph editor in the State Architect tier (ages 13+).
 * Shows state name, highlights when current, and supports click to select.
 *
 * @packageDocumentation
 */

import React from 'react';
import { Box, Typography } from '../../../../atoms';
import { cn } from '../../../../../lib/cn';

export interface StateNodeProps {
    /** State name */
    name: string;
    /** Whether this is the current active state */
    isCurrent?: boolean;
    /** Whether this node is selected for editing */
    isSelected?: boolean;
    /** Whether this is the initial state */
    isInitial?: boolean;
    /** Position on the graph canvas */
    position: { x: number; y: number };
    /** Click handler */
    onClick?: () => void;
    /** Additional CSS classes */
    className?: string;
}

export function StateNode({
    name,
    isCurrent = false,
    isSelected = false,
    isInitial = false,
    position,
    onClick,
    className,
}: StateNodeProps): React.JSX.Element {
    return (
        <Box
            position="absolute"
            display="flex"
            className={cn(
                'items-center justify-center rounded-full border-3 transition-all cursor-pointer select-none',
                'min-w-[80px] h-[80px] px-3',
                isCurrent && 'bg-primary/20 border-primary shadow-lg shadow-primary/30 scale-110',
                isSelected && !isCurrent && 'bg-accent/20 border-accent ring-2 ring-accent/50',
                !isCurrent && !isSelected && 'bg-card border-border hover:border-muted-foreground hover:scale-105',
                className,
            )}
            style={{
                left: position.x,
                top: position.y,
                transform: 'translate(-50%, -50%)',
            }}
            onClick={onClick}
        >
            <Box className="text-center">
                {isInitial && (
                    <Typography variant="caption" className="text-muted-foreground text-xs block">
                        {'\u25B6 start'}
                    </Typography>
                )}
                <Typography
                    variant="body2"
                    className={cn(
                        'font-bold whitespace-nowrap',
                        isCurrent ? 'text-primary' : 'text-foreground',
                    )}
                >
                    {name}
                </Typography>
            </Box>
        </Box>
    );
}

StateNode.displayName = 'StateNode';

export default StateNode;
