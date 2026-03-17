import * as React from 'react';
import { cn } from '../../../lib/cn';
import { HealthBar } from '../../atoms/game/HealthBar';
import { ScoreDisplay } from '../../atoms/game/ScoreDisplay';

export interface StatBadgeProps {
  /** Stat label */
  label: string;
  /** Current value (defaults to 0 if not provided) */
  value?: number | string;
  /** Maximum value (for bar/hearts format) */
  max?: number;
  /** Data source entity name (for schema config) */
  source?: string;
  /** Field name in the source (for schema config) */
  field?: string;
  /** Display format */
  format?: 'number' | 'hearts' | 'bar' | 'text' | string;
  /** Icon component or emoji */
  icon?: React.ReactNode;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | string;
  /** Visual variant */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | string;
  /** Additional CSS classes */
  className?: string;
}

const sizeMap = {
  sm: 'text-xs px-2 py-1',
  md: 'text-sm px-3 py-1.5',
  lg: 'text-base px-4 py-2',
};

const variantMap = {
  default: 'bg-gray-800/80 border-gray-700',
  primary: 'bg-blue-900/80 border-blue-700',
  success: 'bg-green-900/80 border-green-700',
  warning: 'bg-yellow-900/80 border-yellow-700',
  danger: 'bg-red-900/80 border-red-700',
};

export function StatBadge({
  label,
  value = 0,
  max,
  format = 'number',
  icon,
  size = 'md',
  variant = 'default',
  className,
  // Ignored config props (used for schema binding)
  source: _source,
  field: _field,
}: StatBadgeProps) {
  const numValue = typeof value === 'number' ? value : parseInt(String(value), 10) || 0;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-lg border backdrop-blur-sm',
        sizeMap[size as keyof typeof sizeMap] ?? sizeMap.md,
        variantMap[variant as keyof typeof variantMap] ?? variantMap.default,
        className
      )}
    >
      {icon && <span className="flex-shrink-0 text-lg">{icon}</span>}
      
      <span className="text-gray-400 font-medium">{label}</span>
      
      {format === 'hearts' && max && (
        <HealthBar
          current={numValue}
          max={max}
          format="hearts"
          size={size === 'lg' ? 'md' : 'sm'}
        />
      )}
      
      {format === 'bar' && max && (
        <HealthBar
          current={numValue}
          max={max}
          format="bar"
          size={size === 'lg' ? 'md' : 'sm'}
        />
      )}
      
      {format === 'number' && (
        <ScoreDisplay
          value={numValue}
          size={size === 'lg' ? 'md' : 'sm'}
          animated
        />
      )}
      
      {format === 'text' && (
        <span className="font-bold text-white">{value}</span>
      )}
    </div>
  );
}

StatBadge.displayName = 'StatBadge';
