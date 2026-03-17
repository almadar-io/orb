'use client';
/**
 * SignaturePad Organism Component
 *
 * A canvas-based signature capture pad.
 * Uses a minimal canvas wrapper (necessary for drawing) but composes all
 * surrounding UI with atoms and molecules.
 *
 * Orbital Component Interface Compliance:
 * - Event emission via useEventBus (UI:* events)
 * - isLoading and error state props
 * - className for external styling
 */

import React, { useRef, useState, useCallback, useEffect } from "react";
import { cn } from "../../lib/cn";
import { Card, Typography, Button, Box } from "../atoms";
import { VStack, HStack } from "../atoms/Stack";
import { LoadingState } from "../molecules/LoadingState";
import { ErrorState } from "../molecules/ErrorState";
import { useEventBus } from "../../hooks/useEventBus";
import { Eraser, Check } from "lucide-react";

export interface SignaturePadProps {
    /** Label above the pad */
    label?: string;
    /** Helper text */
    helperText?: string;
    /** Stroke color */
    strokeColor?: string;
    /** Stroke width */
    strokeWidth?: number;
    /** Pad height */
    height?: number;
    /** Whether the pad is read-only */
    readOnly?: boolean;
    /** Existing signature image URL */
    value?: string;
    /** Callback when signature changes */
    onChange?: (dataUrl: string | null) => void;
    /** Event to emit on sign */
    signEvent?: string;
    /** Event to emit on clear */
    clearEvent?: string;
    /** Entity name for schema-driven context */
    entity?: string;
    /** Loading state */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Additional CSS classes */
    className?: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
    label = "Signature",
    helperText = "Draw your signature above",
    strokeColor,
    strokeWidth = 2,
    height = 200,
    readOnly = false,
    value,
    onChange,
    signEvent,
    clearEvent,
    entity,
    isLoading = false,
    error,
    className,
}) => {
    const eventBus = useEventBus();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSignature, setHasSignature] = useState(!!value);

    // Initialize canvas with existing value
    useEffect(() => {
        if (value && canvasRef.current) {
            const ctx = canvasRef.current.getContext("2d");
            if (!ctx) return;

            const img = new Image();
            img.onload = () => {
                ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
                ctx.drawImage(img, 0, 0);
                setHasSignature(true);
            };
            img.src = value;
        }
    }, [value]);

    const getCoords = useCallback(
        (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
            const canvas = canvasRef.current;
            if (!canvas) return { x: 0, y: 0 };
            const rect = canvas.getBoundingClientRect();

            if ("touches" in e) {
                const touch = e.touches[0];
                return {
                    x: touch.clientX - rect.left,
                    y: touch.clientY - rect.top,
                };
            }

            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            };
        },
        [],
    );

    const startDrawing = useCallback(
        (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
            if (readOnly) return;
            const ctx = canvasRef.current?.getContext("2d");
            if (!ctx) return;

            const { x, y } = getCoords(e);
            ctx.beginPath();
            ctx.moveTo(x, y);
            setIsDrawing(true);
        },
        [readOnly, getCoords],
    );

    const draw = useCallback(
        (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
            if (!isDrawing || readOnly) return;
            const ctx = canvasRef.current?.getContext("2d");
            if (!ctx) return;

            const { x, y } = getCoords(e);
            const resolvedColor = strokeColor || "var(--color-foreground)";

            ctx.strokeStyle = resolvedColor;
            ctx.lineWidth = strokeWidth;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.lineTo(x, y);
            ctx.stroke();
        },
        [isDrawing, readOnly, strokeColor, strokeWidth, getCoords],
    );

    const stopDrawing = useCallback(() => {
        if (isDrawing) {
            setIsDrawing(false);
            setHasSignature(true);
            const dataUrl = canvasRef.current?.toDataURL("image/png") ?? null;
            onChange?.(dataUrl);
        }
    }, [isDrawing, onChange]);

    const clearSignature = useCallback(() => {
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx && canvasRef.current) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
        setHasSignature(false);
        onChange?.(null);
        if (clearEvent) {
            eventBus.emit(`UI:${clearEvent}`, {});
        }
    }, [onChange, clearEvent, eventBus]);

    const confirmSignature = useCallback(() => {
        const dataUrl = canvasRef.current?.toDataURL("image/png") ?? null;
        if (signEvent) {
            eventBus.emit(`UI:${signEvent}`, { signature: dataUrl });
        }
    }, [signEvent, eventBus]);

    if (isLoading) {
        return <LoadingState message="Loading signature pad..." className={className} />;
    }

    if (error) {
        return (
            <ErrorState
                title="Signature pad error"
                message={error.message}
                className={className}
            />
        );
    }

    return (
        <Card className={cn("p-4", className)}>
            <VStack gap="sm">
                {label && (
                    <Typography variant="label" weight="medium">
                        {label}
                    </Typography>
                )}

                {/* Canvas container — canvas element is necessary for drawing */}
                <Box
                    className={cn(
                        "w-full rounded-[var(--radius-md)] border border-[var(--color-border)]",
                        "bg-[var(--color-background)]",
                        readOnly && "opacity-60 cursor-not-allowed",
                        !readOnly && "cursor-crosshair",
                    )}
                >
                    <canvas
                        ref={canvasRef}
                        width={600}
                        height={height}
                        className="w-full touch-none"
                        style={{ height }}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                    />
                </Box>

                {helperText && (
                    <Typography variant="caption" color="secondary">
                        {helperText}
                    </Typography>
                )}

                {!readOnly && (
                    <HStack gap="sm" justify="end">
                        <Button
                            variant="ghost"
                            size="sm"
                            icon={Eraser}
                            onClick={clearSignature}
                            disabled={!hasSignature}
                        >
                            Clear
                        </Button>
                        {signEvent && (
                            <Button
                                variant="primary"
                                size="sm"
                                icon={Check}
                                onClick={confirmSignature}
                                disabled={!hasSignature}
                            >
                                Confirm
                            </Button>
                        )}
                    </HStack>
                )}
            </VStack>
        </Card>
    );
};

SignaturePad.displayName = "SignaturePad";
