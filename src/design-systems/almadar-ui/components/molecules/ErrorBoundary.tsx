'use client';

import React from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { cn } from '../../lib/cn';
import { ErrorState } from './ErrorState';

export interface ErrorBoundaryProps {
  /** Content to render when no error */
  children: ReactNode;
  /** Fallback UI when an error is caught — ReactNode or render function */
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  /** Additional CSS classes for the wrapper */
  className?: string;
  /** Called when an error is caught (for logging/telemetry) */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * ErrorBoundary — catches React render errors in child components.
 *
 * Uses `getDerivedStateFromError` and `componentDidCatch` to capture errors
 * and render a fallback UI. Supports both static ReactNode fallbacks and
 * render-function fallbacks that receive the error and a reset function.
 *
 * @example
 * ```tsx
 * // Static fallback
 * <ErrorBoundary fallback={<Alert variant="error">Something broke</Alert>}>
 *   <MyComponent />
 * </ErrorBoundary>
 *
 * // Render function fallback with reset
 * <ErrorBoundary fallback={(error, reset) => (
 *   <VStack>
 *     <Typography>Error: {error.message}</Typography>
 *     <Button onClick={reset}>Try Again</Button>
 *   </VStack>
 * )}>
 *   <MyComponent />
 * </ErrorBoundary>
 *
 * // Default fallback (uses ErrorState molecule)
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  static displayName = 'ErrorBoundary';

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
  }

  private reset = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    const { error } = this.state;
    const { children, fallback, className } = this.props;

    if (error) {
      const wrapper = className ? (
        <div className={cn(className)}>{this.renderFallback(error, fallback)}</div>
      ) : (
        this.renderFallback(error, fallback)
      );
      return wrapper;
    }

    return children;
  }

  private renderFallback(error: Error, fallback: ErrorBoundaryProps['fallback']): ReactNode {
    if (typeof fallback === 'function') {
      return fallback(error, this.reset);
    }
    if (fallback) {
      return fallback;
    }
    return (
      <ErrorState
        title="Something went wrong"
        message={error.message}
        onRetry={this.reset}
      />
    );
  }
}

export default ErrorBoundary;
