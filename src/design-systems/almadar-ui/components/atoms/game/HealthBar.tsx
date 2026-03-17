import * as React from 'react';
import { cn } from '../../../lib/cn';

export interface HealthBarProps {
  /** Current health value */
  current: number;
  /** Maximum health value */
  max: number;
  /** Display format */
  format?: 'hearts' | 'bar' | 'numeric';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
  /** Animation on change */
  animated?: boolean;
}

const heartIcon = (filled: boolean, size: string) => (
  <svg
    className={cn('transition-all duration-200', size, filled ? 'text-red-500' : 'text-gray-400')}
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth={filled ? 0 : 2}
  >
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const sizeMap = {
  sm: { heart: 'w-4 h-4', bar: 'h-2', text: 'text-sm' },
  md: { heart: 'w-6 h-6', bar: 'h-3', text: 'text-base' },
  lg: { heart: 'w-8 h-8', bar: 'h-4', text: 'text-lg' },
};

export function HealthBar({
  current,
  max,
  format = 'hearts',
  size = 'md',
  className,
  animated = true,
}: HealthBarProps) {
  const sizes = sizeMap[size];
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));

  if (format === 'hearts') {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        {Array.from({ length: max }).map((_, i) => (
          <span
            key={i}
            className={cn(animated && 'transition-transform hover:scale-110')}
          >
            {heartIcon(i < current, sizes.heart)}
          </span>
        ))}
      </div>
    );
  }

  if (format === 'bar') {
    return (
      <div
        className={cn(
          'relative overflow-hidden rounded-full bg-gray-700',
          sizes.bar,
          'w-24',
          className
        )}
      >
        <div
          className={cn(
            'absolute inset-y-0 left-0 rounded-full',
            percentage > 66 ? 'bg-green-500' : percentage > 33 ? 'bg-yellow-500' : 'bg-red-500',
            animated && 'transition-all duration-300'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  }

  // Numeric format
  return (
    <span className={cn('font-mono font-bold', sizes.text, className)}>
      {current}/{max}
    </span>
  );
}

HealthBar.displayName = 'HealthBar';
