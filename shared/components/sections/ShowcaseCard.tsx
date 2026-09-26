'use client';
/**
 * ShowcaseCard Molecule Component
 *
 * A card for showcasing projects, demos, or portfolio items with an image, badge, and description.
 * Composes Card, Box, VStack, Badge, and Typography atoms.
 */

import React from 'react';
import { cn } from './cn';
import { Badge, Box, Card, Typography, VStack } from '@almadar/ui/ssr';
type ImageSource = { src: string; alt: string };

export interface ShowcaseCardProps {
  title: string;
  description?: string;
  image: ImageSource;
  href?: string;
  badge?: string;
  accentColor?: string;
  className?: string;
}

export const ShowcaseCard: React.FC<ShowcaseCardProps> = ({
  title,
  description,
  image,
  href,
  badge,
  accentColor,
  className,
}) => {
  const cardVariant = href ? 'interactive' : 'bordered';

  const handleClick = () => {
    if (href) {
      window.open(href, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card
      variant={cardVariant}
      padding="none"
      className={cn('overflow-hidden w-full', className)}
      style={accentColor ? { borderTopColor: accentColor, borderTopWidth: '3px' } : undefined}
      onClick={href ? handleClick : undefined}
    >
      <Box
        className={cn(
          'w-full aspect-video bg-cover bg-center',
          'rounded-t-md',
        )}
        style={{ backgroundImage: `url(${image.src})` }}
        role="img"
        aria-label={image.alt}
      />
      <VStack gap="sm" className="p-4">
        {badge && <Badge variant="primary" label={badge} />}
        <Typography variant="h3">{title}</Typography>
        {description && (
          <Typography variant="body" color="muted">
            {description}
          </Typography>
        )}
      </VStack>
    </Card>
  );
};

ShowcaseCard.displayName = 'ShowcaseCard';
