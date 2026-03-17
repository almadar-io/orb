/**
 * Canvas3DErrorBoundary
 *
 * Error boundary for 3D canvas components.
 * Catches Three.js and React Three Fiber errors gracefully.
 *
 * @packageDocumentation
 */

import React, { Component, type ReactNode, type ErrorInfo } from 'react';
import './Canvas3DErrorBoundary.css';

export interface Canvas3DErrorBoundaryProps {
    /** Child components */
    children: ReactNode;
    /** Custom fallback component */
    fallback?: ReactNode;
    /** Error callback */
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    /** Reset callback */
    onReset?: () => void;
}

export interface Canvas3DErrorBoundaryState {
    /** Whether an error has occurred */
    hasError: boolean;
    /** The error that occurred */
    error: Error | null;
    /** Error info from React */
    errorInfo: ErrorInfo | null;
}

/**
 * Canvas3DErrorBoundary Component
 *
 * Catches errors in 3D canvas and displays a user-friendly fallback.
 *
 * @example
 * ```tsx
 * <Canvas3DErrorBoundary
 *     onError={(error) => console.error('3D Error:', error)}
 *     onReset={() => console.log('Resetting...')}
 * >
 *     <GameCanvas3D {...props} />
 * </Canvas3DErrorBoundary>
 * ```
 */
export class Canvas3DErrorBoundary extends Component<
    Canvas3DErrorBoundaryProps,
    Canvas3DErrorBoundaryState
> {
    constructor(props: Canvas3DErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Canvas3DErrorBoundaryState {
        return {
            hasError: true,
            error,
            errorInfo: null,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        this.setState({ errorInfo });
        this.props.onError?.(error, errorInfo);

        // Log to console for debugging
        console.error('[Canvas3DErrorBoundary] Error caught:', error);
        console.error('[Canvas3DErrorBoundary] Component stack:', errorInfo.componentStack);
    }

    handleReset = (): void => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
        this.props.onReset?.();
    };

    render(): ReactNode {
        if (this.state.hasError) {
            // Custom fallback
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <div className="canvas-3d-error">
                    <div className="canvas-3d-error__content">
                        <div className="canvas-3d-error__icon">⚠️</div>
                        <h2 className="canvas-3d-error__title">3D Scene Error</h2>
                        <p className="canvas-3d-error__message">
                            Something went wrong while rendering the 3D scene.
                        </p>

                        {this.state.error && (
                            <details className="canvas-3d-error__details">
                                <summary>Error Details</summary>
                                <pre className="error__stack">
                                    {this.state.error.message}
                                    {'\n'}
                                    {this.state.error.stack}
                                </pre>
                                {this.state.errorInfo && (
                                    <pre className="error__component-stack">
                                        {this.state.errorInfo.componentStack}
                                    </pre>
                                )}
                            </details>
                        )}

                        <div className="canvas-3d-error__actions">
                            <button
                                className="error__button error__button--primary"
                                onClick={this.handleReset}
                            >
                                Try Again
                            </button>
                            <button
                                className="error__button error__button--secondary"
                                onClick={() => window.location.reload()}
                            >
                                Reload Page
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default Canvas3DErrorBoundary;
