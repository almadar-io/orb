'use client';
/**
 * Pagination Molecule Component
 *
 * A pagination component with page numbers, previous/next buttons, and ellipsis.
 * Uses Button, Icon, Typography, and Input atoms.
 */

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../atoms/Button";
import { Typography } from "../atoms/Typography";
import { Input } from "../atoms/Input";
import { Select } from "../atoms/Select";
import { HStack } from "../atoms/Stack";
import { cn } from "../../lib/cn";
import { useEventBus } from "../../hooks/useEventBus";
import { useTranslate } from "../../hooks/useTranslate";

export interface PaginationProps {
  /**
   * Current page (1-indexed)
   */
  currentPage: number;

  /**
   * Total number of pages
   */
  totalPages: number;

  /**
   * Callback when page changes (optional - can be a no-op if not interactive)
   */
  onPageChange?: (page: number) => void;

  /**
   * Show page size selector
   * @default false
   */
  showPageSize?: boolean;

  /**
   * Page size options
   */
  pageSizeOptions?: number[];

  /**
   * Current page size
   */
  pageSize?: number;

  /**
   * Callback when page size changes
   */
  onPageSizeChange?: (size: number) => void;

  /**
   * Show jump to page input
   * @default false
   */
  showJumpToPage?: boolean;

  /**
   * Show total count
   * @default false
   */
  showTotal?: boolean;

  /**
   * Total items count
   */
  totalItems?: number;

  /**
   * Maximum number of page buttons to show
   * @default 7
   */
  maxVisiblePages?: number;

  /**
   * Additional CSS classes
   */
  className?: string;

  /** Declarative page change event — emits UI:{pageChangeEvent} with { page } */
  pageChangeEvent?: string;

  /** Declarative page size change event — emits UI:{pageSizeChangeEvent} with { pageSize } */
  pageSizeChangeEvent?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange = () => {},
  showPageSize = false,
  pageSizeOptions = [10, 20, 50, 100],
  pageSize,
  onPageSizeChange,
  showJumpToPage = false,
  showTotal = false,
  totalItems,
  maxVisiblePages = 7,
  className,
  pageChangeEvent,
  pageSizeChangeEvent,
}) => {
  const eventBus = useEventBus();
  const { t } = useTranslate();
  const [jumpToPage, setJumpToPage] = useState("");

  const handlePageChange = (page: number) => {
    if (pageChangeEvent) eventBus.emit(`UI:${pageChangeEvent}`, { page });
    onPageChange(page);
  };

  const handlePageSizeChange = (size: number) => {
    if (pageSizeChangeEvent) eventBus.emit(`UI:${pageSizeChangeEvent}`, { pageSize: size });
    onPageSizeChange?.(size);
  };

  const handleJumpToPage = () => {
    const page = parseInt(jumpToPage, 10);
    if (page >= 1 && page <= totalPages) {
      handlePageChange(page);
      setJumpToPage("");
    }
  };

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= halfVisible + 1) {
        for (let i = 1; i <= maxVisiblePages - 2; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - halfVisible) {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = totalPages - maxVisiblePages + 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("ellipsis");
        for (
          let i = currentPage - halfVisible + 2;
          i <= currentPage + halfVisible - 2;
          i++
        ) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <HStack align="center" className={cn("justify-between gap-4", className)}>
      <HStack align="center" gap="sm">
        {showTotal && totalItems !== undefined && (
          <Typography variant="small" color="secondary">
            {t('pagination.total')} {totalItems}
          </Typography>
        )}

        {showPageSize && pageSize && onPageSizeChange && (
          <HStack align="center" gap="sm">
            <Typography variant="small" color="secondary">
              {t('pagination.show')}
            </Typography>
            <Select
              value={String(pageSize)}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              options={pageSizeOptions.map((size) => ({
                value: String(size),
                label: String(size),
              }))}
              className="px-2 py-1 text-sm"
            />
          </HStack>
        )}
      </HStack>

      <HStack align="center" gap="xs">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          icon={ChevronLeft}
        >
          {t('pagination.previous')}
        </Button>

        <HStack align="center" gap="xs">
          {pageNumbers.map((page, index) => {
            if (page === "ellipsis") {
              return (
                <Typography
                  key={`ellipsis-${index}`}
                  variant="small"
                  color="muted"
                  className="px-2"
                >
                  ...
                </Typography>
              );
            }

            const isActive = page === currentPage;

            return (
              <Button
                key={page}
                variant={isActive ? "primary" : "ghost"}
                size="sm"
                onClick={() => handlePageChange(page)}
                className="min-w-[2.5rem]"
              >
                {page}
              </Button>
            );
          })}
        </HStack>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          iconRight={ChevronRight}
        >
          {t('pagination.next')}
        </Button>
      </HStack>

      {showJumpToPage && (
        <HStack align="center" gap="sm">
          <Typography variant="small" color="secondary">
            {t('pagination.goTo')}
          </Typography>
          <Input
            type="number"
            value={jumpToPage}
            onChange={(e) => setJumpToPage(e.target.value)}
            placeholder="Page"
            className="w-20"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleJumpToPage();
              }
            }}
          />
          <Button variant="ghost" size="sm" onClick={handleJumpToPage}>
            {t('pagination.go')}
          </Button>
        </HStack>
      )}
    </HStack>
  );
};

Pagination.displayName = "Pagination";
