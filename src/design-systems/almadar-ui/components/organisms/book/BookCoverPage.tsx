/**
 * BookCoverPage Molecule
 *
 * Renders a book cover with title, subtitle, author, and optional image.
 * Centered layout suitable for the first "page" of a BookViewer.
 *
 * Event Contract:
 * - Emits: UI:BOOK_START
 */

import React from 'react';
import { VStack } from '../../atoms/Stack';
import { Typography } from '../../atoms/Typography';
import { Button } from '../../atoms/Button';
import { Box } from '../../atoms/Box';
import { useTranslate } from '../../../hooks/useTranslate';
import { cn } from '../../../lib/cn';
import type { EntityDisplayProps } from '../types';
import type { BookData } from './types';

export interface BookCoverPageProps extends EntityDisplayProps<BookData> {
  title: string;
  subtitle?: string;
  author?: string;
  coverImageUrl?: string;
  direction?: 'rtl' | 'ltr';
}

export const BookCoverPage: React.FC<BookCoverPageProps> = ({
  title,
  subtitle,
  author,
  coverImageUrl,
  direction,
  className,
}) => {
  const { t } = useTranslate();

  return (
    <VStack
      gap="lg"
      align="center"
      justify="center"
      className={cn(
        'min-h-[80vh] p-8 text-center',
        className,
      )}
      style={{ direction }}
    >
      {coverImageUrl && (
        <Box
          className="w-64 h-80 rounded-lg overflow-hidden shadow-xl"
          style={{
            backgroundImage: `url(${coverImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          aria-label={title}
          role="img"
        />
      )}

      <VStack gap="sm" align="center" className="max-w-lg">
        <Typography variant="h1" className="text-4xl font-bold">
          {title}
        </Typography>

        {subtitle && (
          <Typography
            variant="h2"
            className="text-xl text-[var(--color-muted-foreground)]"
          >
            {subtitle}
          </Typography>
        )}

        {author && (
          <Typography
            variant="body"
            className="text-[var(--color-muted-foreground)] mt-4"
          >
            {author}
          </Typography>
        )}
      </VStack>

      <Button
        variant="primary"
        size="lg"
        action="BOOK_START"
        className="mt-8"
      >
        <Typography variant="body">
          {t('book.startReading')}
        </Typography>
      </Button>
    </VStack>
  );
};

BookCoverPage.displayName = 'BookCoverPage';
