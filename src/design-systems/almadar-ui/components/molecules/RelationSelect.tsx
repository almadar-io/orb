'use client';
/**
 * RelationSelect Molecule Component
 *
 * A searchable select component for relation fields.
 * Allows users to search and select from related entities.
 *
 * Composed from: Box, HStack, VStack, Input, Button, Spinner, Typography atoms
 */

import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import { Search, ChevronDown, X } from "lucide-react";
import { cn } from "../../lib/cn";
import { Box } from "../atoms/Box";
import { HStack, VStack } from "../atoms/Stack";
import { Input } from "../atoms/Input";
import { Button } from "../atoms/Button";
import { Spinner } from "../atoms/Spinner";
import { Typography } from "../atoms/Typography";
import {
  debug,
  debugGroup,
  debugGroupEnd,
  isDebugEnabled,
} from "../../lib/debug";
import { useTranslate } from "../../hooks/useTranslate";

// Helper to check if specific debug category is enabled
const isRelationsDebugEnabled = () => isDebugEnabled();

export interface RelationOption {
  /** The value to store (typically the ID) */
  value: string;
  /** The display label */
  label: string;
  /** Optional description */
  description?: string;
  /** Whether this option is disabled */
  disabled?: boolean;
}

export interface RelationSelectProps {
  /** Current value (ID) */
  value?: string;
  /** Callback when value changes */
  onChange?: (value: string | undefined) => void;
  /** Available options - accepts readonly for compatibility with generated const arrays */
  options: readonly RelationOption[];
  /** Placeholder text */
  placeholder?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Whether data is loading */
  isLoading?: boolean;
  /** Error message */
  error?: string;
  /** Allow clearing the selection */
  clearable?: boolean;
  /** Name attribute for forms */
  name?: string;
  /** Additional CSS classes */
  className?: string;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Empty state message */
  emptyMessage?: string;
}

export const RelationSelect: React.FC<RelationSelectProps> = ({
  value,
  onChange,
  options = [],
  placeholder = "Select...",
  required = false,
  disabled = false,
  isLoading = false,
  error,
  clearable = true,
  name,
  className,
  searchPlaceholder,
  emptyMessage,
}) => {
  const { t } = useTranslate();
  const resolvedSearchPlaceholder = searchPlaceholder ?? t('common.search');
  const resolvedEmptyMessage = emptyMessage ?? t('empty.noOptionsFound');
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debug: Log component initialization
  useEffect(() => {
    if (isRelationsDebugEnabled()) {
      debugGroup(`RelationSelect: ${name || "unnamed"}`);
      debug(`Options count: ${options.length}`);
      debug(`Current value: ${value || "none"}`);
      debug(`Is loading: ${isLoading}`);
      if (options.length > 0) {
        debug("Sample options:", options.slice(0, 3));
      } else {
        debug("⚠️ No options available!");
      }
      debugGroupEnd();
    }
  }, [name, options.length, value, isLoading]);

  // Find selected option
  const selectedOption = useMemo(() => {
    const found = options.find((opt) => opt.value === value);
    if (isRelationsDebugEnabled() && value && !found) {
      debug(`⚠️ Value "${value}" not found in options for ${name}`);
    }
    return found;
  }, [options, value, name]);

  // Filter options by search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const query = searchQuery.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(query) ||
        opt.description?.toLowerCase().includes(query),
    );
  }, [options, searchQuery]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleToggle = useCallback(() => {
    if (!disabled) {
      setIsOpen((prev) => !prev);
      if (!isOpen) {
        setSearchQuery("");
      }
    }
  }, [disabled, isOpen]);

  const handleSelect = useCallback(
    (option: RelationOption) => {
      if (option.disabled) return;
      onChange?.(option.value);
      setIsOpen(false);
      setSearchQuery("");
    },
    [onChange],
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange?.(undefined);
    },
    [onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setSearchQuery("");
      } else if (e.key === "Enter" && filteredOptions.length === 1) {
        handleSelect(filteredOptions[0]);
      }
    },
    [filteredOptions, handleSelect],
  );

  return (
    <Box ref={containerRef} className={cn("relative", className)}>
      {/* Hidden input for form submission */}
      <Input type="hidden" name={name} value={value || ""} />

      {/* Trigger button */}
      <Button
        type="button"
        variant="secondary"
        onClick={handleToggle}
        disabled={disabled}
        className={cn(
          "w-full justify-between font-normal",
          error && "border-red-300 focus:border-red-500 focus:ring-red-500",
          isOpen && "ring-2 ring-primary-500 border-primary-500",
        )}
      >
        <Typography
          variant="body"
          className={cn(
            !selectedOption && "text-[var(--color-muted-foreground)]",
          )}
        >
          {isLoading ? (
            <HStack gap="xs" align="center">
              <Spinner size="sm" />
              <Typography as="span">{t('common.loading')}</Typography>
            </HStack>
          ) : selectedOption ? (
            selectedOption.label
          ) : (
            placeholder
          )}
        </Typography>
        <HStack gap="xs" align="center">
          {clearable && selectedOption && !disabled && (
            <Box
              as="button"
              className="p-0.5 hover:bg-[var(--color-muted)] rounded cursor-pointer"
              onClick={handleClear}
            >
              <X className="h-4 w-4 text-[var(--color-muted-foreground)]" />
            </Box>
          )}
          <ChevronDown
            className={cn(
              "h-4 w-4 text-[var(--color-muted-foreground)] transition-transform",
              isOpen && "transform rotate-180",
            )}
          />
        </HStack>
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <Box
          position="absolute"
          bg="surface"
          border
          rounded="md"
          shadow="lg"
          className="z-50 w-full mt-1"
        >
          {/* Search input */}
          <Box padding="sm" className="border-b border-[var(--color-border)]">
            <Input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={resolvedSearchPlaceholder}
              icon={Search}
              className="text-sm"
            />
          </Box>

          {/* Options list */}
          <Box overflow="auto" className="max-h-60">
            {isLoading ? (
              <Box padding="md" display="flex" className="justify-center">
                <Spinner size="md" color="primary" />
              </Box>
            ) : filteredOptions.length === 0 ? (
              <Box padding="md">
                <Typography
                  variant="body"
                  color="muted"
                  className="text-center"
                >
                  {resolvedEmptyMessage}
                </Typography>
              </Box>
            ) : (
              <VStack gap="none">
                {filteredOptions.map((option) => (
                  <Box
                    key={option.value}
                    as="button"
                    fullWidth
                    paddingX="sm"
                    paddingY="sm"
                    className={cn(
                      "text-left text-sm hover:bg-[var(--color-muted)] focus:outline-none focus:bg-[var(--color-muted)]",
                      option.value === value &&
                        "bg-primary-50 text-primary-700",
                      option.disabled && "opacity-50 cursor-not-allowed",
                    )}
                    onClick={() => handleSelect(option)}
                  >
                    <Typography variant="body" className="font-medium">
                      {option.label}
                    </Typography>
                    {option.description && (
                      <Typography variant="caption" color="muted">
                        {option.description}
                      </Typography>
                    )}
                  </Box>
                ))}
              </VStack>
            )}
          </Box>
        </Box>
      )}

      {/* Error message */}
      {error && (
        <Typography variant="caption" color="error" className="mt-1">
          {error}
        </Typography>
      )}
    </Box>
  );
};

RelationSelect.displayName = "RelationSelect";
