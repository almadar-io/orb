'use client';

import React from 'react';
import { cn } from '../../lib/cn';
import { useTranslate } from '../../hooks/useTranslate';
import { Box } from '../atoms/Box';
import { VStack } from '../atoms/Stack';
import { HStack } from '../atoms/Stack';

export type SkeletonVariant = 'header' | 'table' | 'form' | 'card' | 'text';

export interface SkeletonProps {
  /** The skeleton variant to render */
  variant?: SkeletonVariant;
  /** Number of rows for table/text variants */
  rows?: number;
  /** Number of columns for table variant */
  columns?: number;
  /** Number of fields for form variant */
  fields?: number;
  /** Additional CSS classes */
  className?: string;
}

const pulseClass = 'animate-pulse bg-[var(--color-muted)]/60 rounded';

function SkeletonLine({ className }: { className?: string }) {
  return <Box className={cn(pulseClass, 'h-4', className)} />;
}

function SkeletonBlock({ className }: { className?: string }) {
  return <Box className={cn(pulseClass, className)} />;
}

function HeaderSkeleton({ className }: { className?: string }) {
  return (
    <HStack className={cn('items-center justify-between px-6 py-5', className)}>
      <VStack gap="sm" className="flex-1">
        <SkeletonBlock className="h-7 w-48" />
        <SkeletonLine className="w-64" />
      </VStack>
      <HStack gap="sm">
        <SkeletonBlock className="h-9 w-24 rounded-[var(--radius-md)]" />
        <SkeletonBlock className="h-9 w-32 rounded-[var(--radius-md)]" />
      </HStack>
    </HStack>
  );
}

function TableSkeleton({ rows = 5, columns = 4, className }: { rows?: number; columns?: number; className?: string }) {
  return (
    <VStack gap="none" className={cn('border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden', className)}>
      {/* Table header */}
      <HStack className="px-4 py-3 bg-[var(--color-muted)]/30 border-b border-[var(--color-border)]">
        {Array.from({ length: columns }).map((_, i) => (
          <SkeletonBlock key={i} className="h-4 flex-1 mx-2" />
        ))}
      </HStack>
      {/* Table rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <HStack
          key={rowIdx}
          className={cn(
            'px-4 py-3',
            rowIdx < rows - 1 && 'border-b border-[var(--color-border)]',
          )}
        >
          {Array.from({ length: columns }).map((_, colIdx) => (
            <SkeletonLine key={colIdx} className="flex-1 mx-2" />
          ))}
        </HStack>
      ))}
    </VStack>
  );
}

function FormSkeleton({ fields = 4, className }: { fields?: number; className?: string }) {
  return (
    <VStack gap="lg" className={cn('p-6', className)}>
      {/* Form title */}
      <SkeletonBlock className="h-6 w-40" />
      {/* Form fields */}
      {Array.from({ length: fields }).map((_, i) => (
        <VStack key={i} gap="sm">
          <SkeletonBlock className="h-4 w-24" />
          <SkeletonBlock className="h-10 w-full rounded-[var(--radius-md)]" />
        </VStack>
      ))}
      {/* Form actions */}
      <HStack gap="md" className="justify-end pt-2">
        <SkeletonBlock className="h-10 w-20 rounded-[var(--radius-md)]" />
        <SkeletonBlock className="h-10 w-24 rounded-[var(--radius-md)]" />
      </HStack>
    </VStack>
  );
}

function CardSkeleton({ className }: { className?: string }) {
  return (
    <VStack
      gap="md"
      className={cn(
        'p-5 border border-[var(--color-border)] rounded-[var(--radius-lg)]',
        className,
      )}
    >
      <HStack className="items-center" gap="md">
        <SkeletonBlock className="h-10 w-10 rounded-full" />
        <VStack gap="xs" className="flex-1">
          <SkeletonBlock className="h-5 w-32" />
          <SkeletonLine className="w-48" />
        </VStack>
      </HStack>
      <SkeletonLine className="w-full" />
      <SkeletonLine className="w-3/4" />
      <HStack gap="sm" className="pt-2">
        <SkeletonBlock className="h-6 w-16 rounded-full" />
        <SkeletonBlock className="h-6 w-20 rounded-full" />
      </HStack>
    </VStack>
  );
}

function TextSkeleton({ rows = 3, className }: { rows?: number; className?: string }) {
  return (
    <VStack gap="sm" className={className}>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonLine
          key={i}
          className={i === rows - 1 ? 'w-2/3' : 'w-full'}
        />
      ))}
    </VStack>
  );
}

/**
 * Skeleton — loading placeholder with 5 variants for Suspense fallbacks.
 *
 * Variants: `header`, `table`, `form`, `card`, `text`.
 * Used as fallback content inside `<Suspense>` boundaries.
 *
 * @example
 * ```tsx
 * <Suspense fallback={<Skeleton variant="table" rows={8} columns={5} />}>
 *   <DataTable entity="Task" />
 * </Suspense>
 *
 * <Suspense fallback={<Skeleton variant="form" fields={6} />}>
 *   <Form entity="Task" />
 * </Suspense>
 * ```
 */
export function Skeleton({
  variant = 'text',
  rows,
  columns,
  fields,
  className,
}: SkeletonProps): React.ReactElement {
  const { t: _t } = useTranslate();
  switch (variant) {
    case 'header':
      return <HeaderSkeleton className={className} />;
    case 'table':
      return <TableSkeleton rows={rows} columns={columns} className={className} />;
    case 'form':
      return <FormSkeleton fields={fields} className={className} />;
    case 'card':
      return <CardSkeleton className={className} />;
    case 'text':
      return <TextSkeleton rows={rows} className={className} />;
    default:
      return <TextSkeleton rows={rows} className={className} />;
  }
}

Skeleton.displayName = 'Skeleton';
