'use client';
/**
 * SiteFooter Molecule Component
 *
 * A themed footer for marketing/documentation sites.
 * Displays link columns, optional logo, and copyright text.
 * Uses @almadar/ui theme CSS variables for consistent branding.
 */

import React from 'react';
type AssetUrl = string;
import { cn } from './cn';
import { Box, Button, HStack, Image, Typography, VStack } from '@almadar/ui/ssr';
export interface FooterLinkItem {
  label: string;
  href: string;
}

export interface FooterLinkColumn {
  title: string;
  items: FooterLinkItem[];
}

export interface FooterLogo {
  src: AssetUrl;
  alt: string;
  href?: string;
}

export interface SiteFooterProps {
  columns: FooterLinkColumn[];
  copyright?: string;
  logo?: FooterLogo;
  className?: string;
}

export const SiteFooter: React.FC<SiteFooterProps> = ({
  columns,
  copyright,
  logo,
  className,
}) => {
  const safeColumns = Array.isArray(columns) ? columns : [];
  return (
    <Box
      as="footer"
      className={cn(
        'bg-surface',
        'border-t border-border',
        'pt-12 pb-8 px-4',
        className,
      )}
    >
      <VStack gap="lg" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Link columns */}
        <HStack gap="lg" align="start" className="flex-wrap w-full justify-between">
          {logo && (
            <VStack gap="sm" className="min-w-[140px] mb-4">
              {logo.href ? (
                <Button variant="link" href={logo.href} aria-label={logo.alt}>
                  <Image src={logo.src} alt={logo.alt} rounded="none" className="h-8 w-auto" />
                </Button>
              ) : (
                <Image src={logo.src} alt={logo.alt} rounded="none" className="h-8 w-auto" />
              )}
            </VStack>
          )}
          {safeColumns.map((col) => (
            <VStack key={col.title} gap="sm" className="min-w-[140px] mb-4">
              <Typography
                variant="body2"
                className="font-semibold text-foreground mb-1"
              >
                {col.title}
              </Typography>
              {(Array.isArray(col.items) ? col.items : []).map((item) => (
                <Button key={item.label} variant="link" href={item.href} label={item.label} className="justify-start" />
              ))}
            </VStack>
          ))}
        </HStack>

        {/* Copyright */}
        {copyright && (
          <Typography
            variant="caption"
            className="text-foreground/30 text-center w-full pt-6"
          >
            {copyright}
          </Typography>
        )}
      </VStack>
    </Box>
  );
};

SiteFooter.displayName = 'SiteFooter';
