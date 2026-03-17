/**
 * BookNavBar Molecule
 *
 * Navigation bar for the BookViewer with prev/next, page indicator,
 * print button, and TOC toggle.
 *
 * Event Contract:
 * - Emits: UI:BOOK_PAGE_PREV, UI:BOOK_PAGE_NEXT, UI:BOOK_PRINT, UI:BOOK_SHOW_TOC
 */

import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Printer,
  List,
} from 'lucide-react';
import { HStack } from '../../atoms/Stack';
import { Button } from '../../atoms/Button';
import { Typography } from '../../atoms/Typography';
import { ProgressBar } from '../../atoms/ProgressBar';
import { Box } from '../../atoms/Box';
import { useTranslate } from '../../../hooks/useTranslate';
import { cn } from '../../../lib/cn';
import type { EntityDisplayProps } from '../types';
import type { BookData } from './types';

export interface BookNavBarProps extends EntityDisplayProps<BookData> {
  currentPage: number;
  totalPages: number;
  chapterTitle?: string;
  direction?: 'rtl' | 'ltr';
}

export const BookNavBar: React.FC<BookNavBarProps> = ({
  currentPage,
  totalPages,
  chapterTitle,
  direction,
  className,
}) => {
  const { t } = useTranslate();
  const isRtl = direction === 'rtl';
  const progress = totalPages > 1 ? (currentPage / (totalPages - 1)) * 100 : 0;

  const PrevIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;

  return (
    <Box
      className={cn(
        'sticky bottom-0 bg-[var(--color-background)] border-t border-[var(--color-border)] print:hidden z-10',
        className,
      )}
      style={{ direction }}
    >
      <HStack justify="between" align="center" className="px-4 py-2">
        {/* Left: TOC + Print */}
        <HStack gap="xs">
          <Button
            variant="ghost"
            size="sm"
            action="BOOK_SHOW_TOC"
            aria-label={t('book.tableOfContents')}
          >
            <List size={18} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            action="BOOK_PRINT"
            aria-label={t('book.print')}
          >
            <Printer size={18} />
          </Button>
        </HStack>

        {/* Center: Chapter title + progress */}
        <Box className="flex-1 mx-4 max-w-md">
          {chapterTitle && (
            <Typography
              variant="caption"
              className="text-center block truncate text-[var(--color-muted-foreground)]"
            >
              {chapterTitle}
            </Typography>
          )}
          <ProgressBar value={progress} size="sm" variant="primary" />
        </Box>

        {/* Right: Prev/Next */}
        <HStack gap="xs">
          <Button
            variant="ghost"
            size="sm"
            action="BOOK_PAGE_PREV"
            actionPayload={{ pageIndex: currentPage }}
            disabled={currentPage <= 0}
            aria-label={t('book.previousPage')}
          >
            <PrevIcon size={18} />
          </Button>

          <Typography variant="caption" className="min-w-[3rem] text-center">
            {currentPage + 1} / {totalPages}
          </Typography>

          <Button
            variant="ghost"
            size="sm"
            action="BOOK_PAGE_NEXT"
            actionPayload={{ pageIndex: currentPage }}
            disabled={currentPage >= totalPages - 1}
            aria-label={t('book.nextPage')}
          >
            <NextIcon size={18} />
          </Button>
        </HStack>
      </HStack>
    </Box>
  );
};

BookNavBar.displayName = 'BookNavBar';
