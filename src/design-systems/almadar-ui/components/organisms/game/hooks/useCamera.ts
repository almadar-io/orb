'use client';
/**
 * useCamera Hook
 *
 * Manages camera pan/zoom state for canvas rendering.
 * Provides mouse event handlers and coordinate conversion.
 *
 * @packageDocumentation
 */

import { useRef, useCallback } from 'react';
import type { CameraState } from '../types/isometric';

interface CameraResult {
    /** Mutable camera state ref (x, y, zoom) */
    cameraRef: React.MutableRefObject<CameraState>;
    /** Target camera position for smooth lerp centering. Set to null when reached. */
    targetCameraRef: React.MutableRefObject<{ x: number; y: number } | null>;
    /** Whether the user is currently dragging */
    isDragging: () => boolean;
    /** Total drag distance — used to distinguish click from pan (threshold: 5px) */
    dragDistance: () => number;
    /** Mouse down handler — starts panning */
    handleMouseDown: (e: React.MouseEvent) => void;
    /** Mouse up handler — stops panning */
    handleMouseUp: () => void;
    /** Mouse move handler — pans camera if dragging, returns true if panning */
    handleMouseMove: (e: React.MouseEvent, drawFn?: () => void) => boolean;
    /** Mouse leave handler — cancels drag */
    handleMouseLeave: () => void;
    /** Wheel handler — zoom in/out */
    handleWheel: (e: React.WheelEvent, drawFn?: () => void) => void;
    /** Convert screen coordinates to world coordinates (inverse camera transform) */
    screenToWorld: (clientX: number, clientY: number, canvas: HTMLCanvasElement, viewportSize: { width: number; height: number }) => { x: number; y: number };
    /** Lerp camera toward target. Call in animation loop. Returns true if still animating. */
    lerpToTarget: (t?: number) => boolean;
}

/**
 * Camera hook for pan/zoom canvas rendering.
 *
 * @returns Camera state, event handlers, and coordinate conversion
 */
export function useCamera(): CameraResult {
    const cameraRef = useRef<CameraState>({ x: 0, y: 0, zoom: 1 });
    const targetCameraRef = useRef<{ x: number; y: number } | null>(null);
    const isDraggingRef = useRef(false);
    const dragDistanceRef = useRef(0);
    const lastMouseRef = useRef({ x: 0, y: 0 });

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        isDraggingRef.current = true;
        dragDistanceRef.current = 0;
        lastMouseRef.current = { x: e.clientX, y: e.clientY };
        if (e.button === 1 || e.button === 2) {
            e.preventDefault();
        }
    }, []);

    const handleMouseUp = useCallback(() => {
        isDraggingRef.current = false;
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent, drawFn?: () => void): boolean => {
        if (!isDraggingRef.current) return false;

        const dx = e.clientX - lastMouseRef.current.x;
        const dy = e.clientY - lastMouseRef.current.y;
        dragDistanceRef.current += Math.abs(dx) + Math.abs(dy);
        cameraRef.current.x -= dx;
        cameraRef.current.y -= dy;
        lastMouseRef.current = { x: e.clientX, y: e.clientY };
        // Cancel auto-centering while user drags
        targetCameraRef.current = null;
        drawFn?.();
        return dragDistanceRef.current > 5;
    }, []);

    const handleMouseLeave = useCallback(() => {
        isDraggingRef.current = false;
    }, []);

    const handleWheel = useCallback((e: React.WheelEvent, drawFn?: () => void) => {
        e.preventDefault();
        const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1;
        cameraRef.current.zoom = Math.max(0.5, Math.min(3, cameraRef.current.zoom * zoomDelta));
        drawFn?.();
    }, []);

    const screenToWorld = useCallback((
        clientX: number,
        clientY: number,
        canvas: HTMLCanvasElement,
        viewportSize: { width: number; height: number },
    ): { x: number; y: number } => {
        const rect = canvas.getBoundingClientRect();
        const screenX = clientX - rect.left;
        const screenY = clientY - rect.top;

        const cam = cameraRef.current;
        const worldX = (screenX - viewportSize.width / 2) / cam.zoom + viewportSize.width / 2 + cam.x;
        const worldY = (screenY - viewportSize.height / 2) / cam.zoom + viewportSize.height / 2 + cam.y;

        return { x: worldX, y: worldY };
    }, []);

    const lerpToTarget = useCallback((t = 0.08): boolean => {
        if (!targetCameraRef.current) return false;

        const cam = cameraRef.current;
        cam.x += (targetCameraRef.current.x - cam.x) * t;
        cam.y += (targetCameraRef.current.y - cam.y) * t;

        if (Math.abs(cam.x - targetCameraRef.current.x) < 0.5 &&
            Math.abs(cam.y - targetCameraRef.current.y) < 0.5) {
            cam.x = targetCameraRef.current.x;
            cam.y = targetCameraRef.current.y;
            targetCameraRef.current = null;
        }

        return true;
    }, []);

    return {
        cameraRef,
        targetCameraRef,
        isDragging: () => isDraggingRef.current,
        dragDistance: () => dragDistanceRef.current,
        handleMouseDown,
        handleMouseUp,
        handleMouseMove,
        handleMouseLeave,
        handleWheel,
        screenToWorld,
        lerpToTarget,
    };
}
