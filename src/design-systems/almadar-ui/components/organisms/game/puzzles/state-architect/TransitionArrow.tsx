/**
 * TransitionArrow Component
 *
 * An SVG arrow connecting two state nodes in the graph editor.
 * Shows the event name as a label on the arrow.
 *
 * @packageDocumentation
 */

import React from 'react';
import { cn } from '../../../../../lib/cn';

export interface TransitionArrowProps {
    /** Start position (center of from-node) */
    from: { x: number; y: number };
    /** End position (center of to-node) */
    to: { x: number; y: number };
    /** Event label shown on the arrow */
    eventLabel: string;
    /** Guard hint shown below event */
    guardHint?: string;
    /** Whether this transition is currently active */
    isActive?: boolean;
    /** Click handler */
    onClick?: () => void;
    /** Additional CSS classes for the SVG group */
    className?: string;
}

const NODE_RADIUS = 40;

export function TransitionArrow({
    from,
    to,
    eventLabel,
    guardHint,
    isActive = false,
    onClick,
    className,
}: TransitionArrowProps): React.JSX.Element {
    // Shorten arrow to stop at node edge
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return <></>;

    const nx = dx / dist;
    const ny = dy / dist;
    const startX = from.x + nx * NODE_RADIUS;
    const startY = from.y + ny * NODE_RADIUS;
    const endX = to.x - nx * NODE_RADIUS;
    const endY = to.y - ny * NODE_RADIUS;

    // Midpoint for label
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;

    // Slight curve offset
    const perpX = -ny * 20;
    const perpY = nx * 20;
    const ctrlX = midX + perpX;
    const ctrlY = midY + perpY;

    const path = `M ${startX} ${startY} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`;

    return (
        <g className={cn('cursor-pointer', className)} onClick={onClick}>
            {/* Arrow line */}
            <path
                d={path}
                fill="none"
                stroke={isActive ? 'var(--color-primary)' : 'var(--color-border)'}
                strokeWidth={isActive ? 3 : 2}
                markerEnd={isActive ? 'url(#arrowhead-active)' : 'url(#arrowhead)'}
            />
            {/* Event label */}
            <text
                x={ctrlX}
                y={ctrlY - 8}
                textAnchor="middle"
                fill={isActive ? 'var(--color-primary)' : 'var(--color-foreground)'}
                fontSize={12}
                fontWeight={isActive ? 'bold' : 'normal'}
                className="select-none"
            >
                {eventLabel}
            </text>
            {/* Guard hint */}
            {guardHint && (
                <text
                    x={ctrlX}
                    y={ctrlY + 6}
                    textAnchor="middle"
                    fill="var(--color-warning)"
                    fontSize={10}
                    className="select-none"
                >
                    {'\u26A0 ' + guardHint}
                </text>
            )}
        </g>
    );
}

TransitionArrow.displayName = 'TransitionArrow';

export default TransitionArrow;
