'use client';
/**
 * GraphCanvas Organism Component
 *
 * A force-directed graph visualization component for node-link data.
 * Uses canvas (necessary for performant graph rendering) with atom wrappers.
 *
 * Orbital Component Interface Compliance:
 * - Entity binding with auto-fetch when entity is a string
 * - Event emission via useEventBus (UI:* events)
 * - isLoading and error state props
 * - className for external styling
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { cn } from "../../lib/cn";
import { Card, Typography, Badge, Button, Box } from "../atoms";
import { VStack, HStack } from "../atoms/Stack";
import { LoadingState } from "../molecules/LoadingState";
import { ErrorState } from "../molecules/ErrorState";
import { EmptyState } from "../molecules/EmptyState";
import { useEventBus } from "../../hooks/useEventBus";
import { Maximize2, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

export interface GraphNode {
    id: string;
    label?: string;
    group?: string;
    color?: string;
    size?: number;
    /** Position (optional, computed if missing) */
    x?: number;
    y?: number;
}

export interface GraphEdge {
    source: string;
    target: string;
    label?: string;
    weight?: number;
    color?: string;
}

export interface GraphAction {
    label: string;
    event?: string;
    navigatesTo?: string;
    variant?: "primary" | "secondary" | "ghost";
}

export interface GraphCanvasProps {
    /** Graph title */
    title?: string;
    /** Graph nodes */
    nodes?: readonly GraphNode[];
    /** Graph edges */
    edges?: readonly GraphEdge[];
    /** Canvas height */
    height?: number;
    /** Show node labels */
    showLabels?: boolean;
    /** Enable zoom/pan */
    interactive?: boolean;
    /** Enable node dragging */
    draggable?: boolean;
    /** Actions */
    actions?: readonly GraphAction[];
    /** On node click */
    onNodeClick?: (node: GraphNode) => void;
    /** Node click event */
    nodeClickEvent?: string;
    /** Layout algorithm */
    layout?: "force" | "circular" | "grid";
    /** Entity name for schema-driven auto-fetch */
    entity?: string;
    /** Loading state */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Additional CSS classes */
    className?: string;
}

/** Group colors using CSS variables */
const GROUP_COLORS = [
    "var(--color-primary)",
    "var(--color-success)",
    "var(--color-warning)",
    "var(--color-error)",
    "var(--color-info)",
    "var(--color-accent)",
];

interface SimNode extends GraphNode {
    vx: number;
    vy: number;
    fx: number;
    fy: number;
}

function getGroupColor(group: string | undefined, groups: string[]): string {
    if (!group) return GROUP_COLORS[0];
    const idx = groups.indexOf(group);
    return GROUP_COLORS[idx % GROUP_COLORS.length];
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
    title,
    nodes: propNodes = [],
    edges: propEdges = [],
    height = 400,
    showLabels = true,
    interactive = true,
    draggable = true,
    actions,
    onNodeClick,
    nodeClickEvent,
    layout = "force",
    entity,
    isLoading = false,
    error,
    className,
}) => {
    const eventBus = useEventBus();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number>(0);
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const nodesRef = useRef<SimNode[]>([]);
    const [, forceUpdate] = useState(0);

    const handleAction = useCallback(
        (action: GraphAction) => {
            if (action.event) {
                eventBus.emit(`UI:${action.event}`, {});
            }
        },
        [eventBus],
    );

    const handleNodeClick = useCallback(
        (node: GraphNode) => {
            if (nodeClickEvent) {
                eventBus.emit(`UI:${nodeClickEvent}`, { row: node });
            }
            onNodeClick?.(node);
        },
        [nodeClickEvent, eventBus, onNodeClick],
    );

    const groups = useMemo(
        () => [...new Set(propNodes.map((n) => n.group).filter(Boolean))] as string[],
        [propNodes],
    );

    // Initialize node positions
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || propNodes.length === 0) return;

        const w = canvas.width;
        const h = canvas.height;

        const simNodes: SimNode[] = propNodes.map((n, idx) => {
            let x = n.x ?? 0;
            let y = n.y ?? 0;

            if (!n.x || !n.y) {
                if (layout === "circular") {
                    const angle = (idx / propNodes.length) * 2 * Math.PI;
                    const radius = Math.min(w, h) * 0.35;
                    x = w / 2 + radius * Math.cos(angle);
                    y = h / 2 + radius * Math.sin(angle);
                } else if (layout === "grid") {
                    const cols = Math.ceil(Math.sqrt(propNodes.length));
                    const gapX = w / (cols + 1);
                    const gapY = h / (Math.ceil(propNodes.length / cols) + 1);
                    x = gapX * ((idx % cols) + 1);
                    y = gapY * (Math.floor(idx / cols) + 1);
                } else {
                    // Force layout: random initial positions
                    x = w * 0.2 + Math.random() * w * 0.6;
                    y = h * 0.2 + Math.random() * h * 0.6;
                }
            }

            return { ...n, x, y, vx: 0, vy: 0, fx: 0, fy: 0 };
        });

        nodesRef.current = simNodes;

        // Simple force simulation for force layout
        if (layout === "force") {
            let iterations = 0;
            const maxIterations = 100;

            const tick = () => {
                const nodes = nodesRef.current;
                const centerX = w / 2;
                const centerY = h / 2;

                // Reset forces
                for (const node of nodes) {
                    node.fx = 0;
                    node.fy = 0;
                }

                // Repulsion between all nodes
                for (let i = 0; i < nodes.length; i++) {
                    for (let j = i + 1; j < nodes.length; j++) {
                        const dx = nodes[j].x! - nodes[i].x!;
                        const dy = nodes[j].y! - nodes[i].y!;
                        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                        const force = 800 / (dist * dist);
                        const fx = (dx / dist) * force;
                        const fy = (dy / dist) * force;
                        nodes[i].fx -= fx;
                        nodes[i].fy -= fy;
                        nodes[j].fx += fx;
                        nodes[j].fy += fy;
                    }
                }

                // Attraction along edges
                for (const edge of propEdges) {
                    const source = nodes.find((n) => n.id === edge.source);
                    const target = nodes.find((n) => n.id === edge.target);
                    if (!source || !target) continue;

                    const dx = target.x! - source.x!;
                    const dy = target.y! - source.y!;
                    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                    const force = (dist - 100) * 0.05;
                    const fx = (dx / dist) * force;
                    const fy = (dy / dist) * force;
                    source.fx += fx;
                    source.fy += fy;
                    target.fx -= fx;
                    target.fy -= fy;
                }

                // Center gravity
                for (const node of nodes) {
                    node.fx += (centerX - node.x!) * 0.01;
                    node.fy += (centerY - node.y!) * 0.01;
                }

                // Apply forces
                const damping = 0.9;
                for (const node of nodes) {
                    node.vx = (node.vx + node.fx) * damping;
                    node.vy = (node.vy + node.fy) * damping;
                    node.x! += node.vx;
                    node.y! += node.vy;

                    // Boundary
                    node.x = Math.max(30, Math.min(w - 30, node.x!));
                    node.y = Math.max(30, Math.min(h - 30, node.y!));
                }

                iterations++;
                forceUpdate((n) => n + 1);
                if (iterations < maxIterations) {
                    animRef.current = requestAnimationFrame(tick);
                }
            };

            animRef.current = requestAnimationFrame(tick);
        } else {
            forceUpdate((n) => n + 1);
        }

        return () => {
            cancelAnimationFrame(animRef.current);
        };
    }, [propNodes, propEdges, layout]);

    // Render
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const w = canvas.width;
        const h = canvas.height;
        const nodes = nodesRef.current;

        ctx.clearRect(0, 0, w, h);
        ctx.save();
        ctx.translate(offset.x, offset.y);
        ctx.scale(zoom, zoom);

        // Draw edges
        for (const edge of propEdges) {
            const source = nodes.find((n) => n.id === edge.source);
            const target = nodes.find((n) => n.id === edge.target);
            if (!source || !target) continue;

            ctx.beginPath();
            ctx.moveTo(source.x!, source.y!);
            ctx.lineTo(target.x!, target.y!);
            ctx.strokeStyle = edge.color || "#88888866";
            ctx.lineWidth = edge.weight ? Math.max(1, edge.weight) : 1;
            ctx.stroke();

            // Edge label
            if (edge.label && showLabels) {
                const mx = (source.x! + target.x!) / 2;
                const my = (source.y! + target.y!) / 2;
                ctx.fillStyle = "#888888";
                ctx.font = "9px system-ui";
                ctx.textAlign = "center";
                ctx.fillText(edge.label, mx, my - 4);
            }
        }

        // Draw nodes
        for (const node of nodes) {
            const size = node.size || 8;
            const color = node.color || getGroupColor(node.group, groups);
            const isHovered = hoveredNode === node.id;

            // Node circle
            ctx.beginPath();
            ctx.arc(node.x!, node.y!, isHovered ? size + 2 : size, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.strokeStyle = isHovered ? "#ffffff" : "#00000020";
            ctx.lineWidth = isHovered ? 2 : 1;
            ctx.stroke();

            // Label
            if (showLabels && node.label) {
                ctx.fillStyle = "#666666";
                ctx.font = `${isHovered ? "bold " : ""}10px system-ui`;
                ctx.textAlign = "center";
                ctx.fillText(node.label, node.x!, node.y! + size + 12);
            }
        }

        ctx.restore();
    });

    const handleZoomIn = useCallback(() => setZoom((z) => Math.min(z * 1.2, 3)), []);
    const handleZoomOut = useCallback(() => setZoom((z) => Math.max(z / 1.2, 0.3)), []);
    const handleReset = useCallback(() => {
        setZoom(1);
        setOffset({ x: 0, y: 0 });
    }, []);

    if (isLoading) {
        return <LoadingState message="Loading graph..." className={className} />;
    }

    if (error) {
        return (
            <ErrorState
                title="Graph error"
                message={error.message}
                className={className}
            />
        );
    }

    if (propNodes.length === 0) {
        return (
            <EmptyState
                title="No graph data"
                description="No nodes to display."
                className={className}
            />
        );
    }

    return (
        <Card className={cn("overflow-hidden", className)}>
            <VStack gap="none">
                {/* Header */}
                {(title || (actions && actions.length > 0) || interactive) && (
                    <HStack
                        gap="sm"
                        align="center"
                        justify="between"
                        className="px-4 py-2 border-b border-[var(--color-border)]"
                    >
                        {title && (
                            <Typography variant="h6" weight="semibold">
                                {title}
                            </Typography>
                        )}
                        <HStack gap="xs" align="center">
                            {interactive && (
                                <>
                                    <Button variant="ghost" size="sm" icon={ZoomOut} onClick={handleZoomOut} />
                                    <Button variant="ghost" size="sm" icon={ZoomIn} onClick={handleZoomIn} />
                                    <Button variant="ghost" size="sm" icon={RotateCcw} onClick={handleReset} />
                                </>
                            )}
                            {actions?.map((action, idx) => (
                                <Badge
                                    key={idx}
                                    variant="default"
                                    className="cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => handleAction(action)}
                                >
                                    {action.label}
                                </Badge>
                            ))}
                        </HStack>
                    </HStack>
                )}

                {/* Canvas — necessary for performant graph rendering */}
                <Box className="w-full bg-[var(--color-background)]">
                    <canvas
                        ref={canvasRef}
                        width={800}
                        height={height}
                        className="w-full cursor-grab active:cursor-grabbing"
                        style={{ height }}
                        onClick={(e) => {
                            const canvas = canvasRef.current;
                            if (!canvas) return;
                            const rect = canvas.getBoundingClientRect();
                            const x = (e.clientX - rect.left - offset.x) / zoom;
                            const y = (e.clientY - rect.top - offset.y) / zoom;

                            // Find clicked node
                            const clickedNode = nodesRef.current.find((n) => {
                                const dist = Math.sqrt((n.x! - x) ** 2 + (n.y! - y) ** 2);
                                return dist < (n.size || 8) + 4;
                            });

                            if (clickedNode) {
                                handleNodeClick(clickedNode);
                            }
                        }}
                    />
                </Box>

                {/* Legend */}
                {groups.length > 1 && (
                    <HStack gap="md" className="px-4 py-2 border-t border-[var(--color-border)]" wrap>
                        {groups.map((group, idx) => (
                            <HStack key={group} gap="xs" align="center">
                                <Box
                                    className="w-3 h-3 rounded-[var(--radius-full)] flex-shrink-0"
                                    style={{ backgroundColor: GROUP_COLORS[idx % GROUP_COLORS.length] }}
                                />
                                <Typography variant="caption" color="secondary">
                                    {group}
                                </Typography>
                            </HStack>
                        ))}
                    </HStack>
                )}
            </VStack>
        </Card>
    );
};

GraphCanvas.displayName = "GraphCanvas";
