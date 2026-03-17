'use client';
import * as React from 'react';
import { cn } from '../../../lib/cn';

export interface ScoreDisplayProps {
  /** Current score value */
  value: number;
  /** Label to display before score */
  label?: string;
  /** Icon component or emoji */
  icon?: React.ReactNode;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Additional CSS classes */
  className?: string;
  /** Animation on value change */
  animated?: boolean;
  /** Number formatting locale */
  locale?: string;
}

const sizeMap = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl',
  xl: 'text-4xl',
};

export function ScoreDisplay({
  value,
  label,
  icon,
  size = 'md',
  className,
  animated = true,
  locale = 'en-US',
}: ScoreDisplayProps) {
  const [displayValue, setDisplayValue] = React.useState(value);
  const [isAnimating, setIsAnimating] = React.useState(false);

  React.useEffect(() => {
    if (!animated || displayValue === value) {
      setDisplayValue(value);
      return;
    }

    setIsAnimating(true);
    const diff = value - displayValue;
    const steps = Math.min(Math.abs(diff), 20);
    const increment = diff / steps;
    let current = displayValue;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current += increment;
      setDisplayValue(Math.round(current));

      if (step >= steps) {
        clearInterval(timer);
        setDisplayValue(value);
        setIsAnimating(false);
      }
    }, 50);

    return () => clearInterval(timer);
  }, [value, animated]);

  const formattedValue = new Intl.NumberFormat(locale).format(displayValue);

  return (
    <div
      className={cn(
        'flex items-center gap-2 font-bold',
        sizeMap[size],
        isAnimating && 'animate-pulse',
        className
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {label && <span className="text-gray-400">{label}</span>}
      <span className="tabular-nums">{formattedValue}</span>
    </div>
  );
}

ScoreDisplay.displayName = 'ScoreDisplay';
