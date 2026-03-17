'use client';
/**
 * LawReferenceTooltip Atom Component
 *
 * A specialized tooltip for displaying law references in inspection forms.
 * Shows law name, article number, and relevant clause text.
 */

import React from "react";
import { Box } from "./Box";
import { VStack } from "./Stack";
import { Typography } from "./Typography";
import { Divider } from "./Divider";
import { cn } from "../../lib/cn";

/**
 * Law reference definition
 */
export interface LawReference {
  /** Law identifier (e.g., "VVO", "TPED") */
  law: string;
  /** Full name of the law */
  lawName?: string;
  /** Article number (e.g., "§8", "Artikel 5") */
  article: string;
  /** Clause or paragraph text */
  clause?: string;
  /** Optional link to full law text */
  link?: string;
}

export interface LawReferenceTooltipProps {
  /** The law reference to display */
  reference: LawReference;
  /** Children element that triggers the tooltip */
  children: React.ReactNode;
  /** Tooltip position */
  position?: "top" | "bottom" | "left" | "right";
  /** Additional CSS classes */
  className?: string;
}

/**
 * Position styles for tooltip placement
 */
const positionStyles = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

/**
 * Arrow styles based on position
 */
const arrowStyles = {
  top: "top-full left-1/2 -translate-x-1/2 border-t-[var(--color-foreground)] border-l-transparent border-r-transparent border-b-transparent",
  bottom:
    "bottom-full left-1/2 -translate-x-1/2 border-b-[var(--color-foreground)] border-l-transparent border-r-transparent border-t-transparent",
  left: "left-full top-1/2 -translate-y-1/2 border-l-[var(--color-foreground)] border-t-transparent border-b-transparent border-r-transparent",
  right:
    "right-full top-1/2 -translate-y-1/2 border-r-[var(--color-foreground)] border-t-transparent border-b-transparent border-l-transparent",
};

/**
 * LawReferenceTooltip displays legal references with structured formatting.
 *
 * @example
 * <LawReferenceTooltip
 *   reference={{
 *     law: "VVO",
 *     lawName: "Verkehrsverordnung",
 *     article: "§8 Abs. 3",
 *     clause: "Die zulässige Gesamtmasse darf 3500 kg nicht überschreiten."
 *   }}
 * >
 *   <Typography variant="small" className="text-blue-600 underline cursor-help">VVO §8</Typography>
 * </LawReferenceTooltip>
 */
export const LawReferenceTooltip: React.FC<LawReferenceTooltipProps> = ({
  reference,
  children,
  position = "top",
  className,
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsVisible(true), 200);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <Box
      as="span"
      position="relative"
      display="inline-block"
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <Box
          padding="sm"
          rounded="lg"
          shadow="lg"
          position="absolute"
          className={cn(
            "z-50 w-64 bg-[var(--color-foreground)] text-[var(--color-background)]",
            positionStyles[position],
          )}
          role="tooltip"
        >
          <VStack gap="xs">
            {/* Law header */}
            <Typography
              variant="label"
              weight="semibold"
              className="text-amber-400"
            >
              {reference.law} {reference.article}
            </Typography>

            {/* Law name */}
            {reference.lawName && (
              <Typography
                variant="caption"
                className="text-[var(--color-muted-foreground)]"
              >
                {reference.lawName}
              </Typography>
            )}

            {/* Clause text */}
            {reference.clause && (
              <>
                <Divider className="border-[var(--color-border)]" />
                <Typography
                  variant="caption"
                  className="text-[var(--color-background)] leading-relaxed"
                >
                  {reference.clause}
                </Typography>
              </>
            )}

            {/* Link to full text */}
            {reference.link && (
              <Typography
                as="a"
                variant="caption"
                className="text-blue-400 hover:text-blue-300 underline cursor-pointer"
                // @ts-expect-error - anchor props
                href={reference.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              >
                View full law text
              </Typography>
            )}
          </VStack>

          {/* Arrow */}
          <Box
            as="span"
            position="absolute"
            className={cn("w-0 h-0 border-4", arrowStyles[position])}
          />
        </Box>
      )}
    </Box>
  );
};

LawReferenceTooltip.displayName = "LawReferenceTooltip";
