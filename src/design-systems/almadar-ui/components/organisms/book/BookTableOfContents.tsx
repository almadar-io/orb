/**
 * BookTableOfContents Molecule
 *
 * Renders a clickable table of contents grouped by parts.
 * Highlights the current chapter.
 *
 * Event Contract:
 * - Emits: UI:BOOK_NAVIGATE { chapterId }
 */

import React from 'react';
import { VStack, HStack } from '../../atoms/Stack';
import { Typography } from '../../atoms/Typography';
import { Button } from '../../atoms/Button';
import { Box } from '../../atoms/Box';
import { Badge } from '../../atoms/Badge';
import { useTranslate } from '../../../hooks/useTranslate';
import { cn } from '../../../lib/cn';
import type { EntityDisplayProps } from '../types';
import type { BookPart } from './types';

export interface BookTableOfContentsProps extends EntityDisplayProps<BookPart> {
  parts: BookPart[];
  currentChapterId?: string;
  direction?: 'rtl' | 'ltr';
}

export const BookTableOfContents: React.FC<BookTableOfContentsProps> = ({
  parts,
  currentChapterId,
  direction,
  className,
}) => {
  const { t } = useTranslate();

  return (
    <VStack
      gap="lg"
      className={cn('p-8 max-w-2xl mx-auto', className)}
      style={{ direction }}
    >
      <Typography variant="h1" className="text-3xl font-bold text-center mb-4">
        {t('book.tableOfContents')}
      </Typography>

      {parts.map((part, partIdx) => (
        <VStack key={partIdx} gap="sm">
          <HStack gap="sm" align="center">
            <Badge variant="default" size="sm">
              {t('book.partNumber', { number: String(partIdx + 1) })}
            </Badge>
            <Typography variant="h3" className="font-semibold">
              {part.title}
            </Typography>
          </HStack>

          <VStack gap="xs" className={direction === 'rtl' ? 'pr-6' : 'pl-6'}>
            {part.chapters.map((chapter) => {
              const isCurrent = chapter.id === currentChapterId;
              return (
                <Button
                  key={chapter.id}
                  variant="ghost"
                  size="sm"
                  action="BOOK_NAVIGATE"
                  actionPayload={{ chapterId: chapter.id }}
                  className={cn(
                    'justify-start text-left w-full',
                    direction === 'rtl' && 'text-right',
                    isCurrent && 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400',
                  )}
                >
                  <Box className="truncate">
                    <Typography variant="body">
                      {chapter.title}
                    </Typography>
                  </Box>
                </Button>
              );
            })}
          </VStack>
        </VStack>
      ))}
    </VStack>
  );
};

BookTableOfContents.displayName = 'BookTableOfContents';
