'use client';
/**
 * MediaGallery Organism Component
 *
 * A gallery component for displaying images and media in a grid layout.
 * Supports lightbox viewing, selection, and upload interactions.
 *
 * Orbital Component Interface Compliance:
 * - Entity binding with auto-fetch when entity is a string
 * - Event emission via useEventBus (UI:* events)
 * - isLoading and error state props
 * - className for external styling
 */

import React, { useState, useCallback } from "react";
import { cn } from "../../lib/cn";
import { Card, Typography, Badge, Button, Icon, Box } from "../atoms";
import { VStack, HStack } from "../atoms/Stack";
import { LoadingState } from "../molecules/LoadingState";
import { ErrorState } from "../molecules/ErrorState";
import { EmptyState } from "../molecules/EmptyState";
import { useEventBus, useEventListener } from "../../hooks/useEventBus";
import { useTranslate } from "../../hooks/useTranslate";
import type { EntityDisplayProps } from "./types";
import { X, ZoomIn, Upload, Image as ImageIcon } from "lucide-react";

export interface MediaItem {
    /** Unique identifier */
    id: string;
    /** Media URL */
    src: string;
    /** Alt text */
    alt?: string;
    /** Thumbnail URL (defaults to src) */
    thumbnail?: string;
    /** Media type */
    mediaType?: "image" | "video";
    /** Caption */
    caption?: string;
    /** File size */
    fileSize?: string;
}

export interface MediaGalleryAction {
    label: string;
    event?: string;
    navigatesTo?: string;
    variant?: "primary" | "secondary" | "ghost";
}

export interface MediaGalleryProps extends EntityDisplayProps<MediaItem> {
    /** Gallery title */
    title?: string;
    /** Media items */
    items?: readonly MediaItem[];
    /** Column count */
    columns?: 2 | 3 | 4 | 5 | 6;
    /** Enable item selection */
    selectable?: boolean;
    /** Selected item IDs */
    selectedItems?: readonly string[];
    /** Event name emitted when selection changes (emitted as UI:{selectionEvent}) */
    selectionEvent?: string;
    /** Show upload button */
    showUpload?: boolean;
    /** Actions */
    actions?: readonly MediaGalleryAction[];
    /** Aspect ratio for thumbnails */
    aspectRatio?: "square" | "landscape" | "portrait";
}

const COLUMN_CLASSES: Record<number, string> = {
    2: "grid-cols-2",
    3: "grid-cols-2 sm:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
    6: "grid-cols-3 sm:grid-cols-4 lg:grid-cols-6",
};

const ASPECT_CLASSES: Record<string, string> = {
    square: "aspect-square",
    landscape: "aspect-video",
    portrait: "aspect-[3/4]",
};

export const MediaGallery: React.FC<MediaGalleryProps> = ({
    title,
    items: propItems,
    columns = 3,
    selectable = false,
    selectedItems = [],
    selectionEvent = "SELECTION_CHANGE",
    showUpload = false,
    actions,
    aspectRatio = "square",
    entity,
    isLoading = false,
    error,
    className,
}) => {
    const eventBus = useEventBus();
    const { t } = useTranslate();
    void t;
    const [lightboxItem, setLightboxItem] = useState<MediaItem | null>(null);

    const closeLightbox = useCallback(() => setLightboxItem(null), []);
    useEventListener("UI:LIGHTBOX_CLOSE", closeLightbox);

    const handleItemClick = useCallback(
        (item: MediaItem) => {
            if (selectable) {
                const isSelected = selectedItems.includes(item.id);
                const newSelection = isSelected
                    ? selectedItems.filter((id) => id !== item.id)
                    : [...selectedItems, item.id];
                eventBus.emit(`UI:${selectionEvent}`, { selection: newSelection });
            } else {
                setLightboxItem(item);
            }
            eventBus.emit("UI:MEDIA_SELECT", { row: item });
        },
        [selectable, selectedItems, selectionEvent, eventBus],
    );

    // Normalize entity data
    const entityData = Array.isArray(entity) ? entity as readonly Record<string, unknown>[] : [];
    const items: readonly MediaItem[] = React.useMemo(() => {
        if (propItems) return propItems;
        if (entityData.length === 0) return [];

        return entityData.map((record, idx) => ({
            id: String(record.id ?? idx),
            src: String(record.src ?? record.url ?? record.image ?? ""),
            alt: record.alt ? String(record.alt) : undefined,
            thumbnail: record.thumbnail ? String(record.thumbnail) : undefined,
            caption: record.caption ? String(record.caption) : record.title ? String(record.title) : undefined,
        }));
    }, [propItems, entityData]);

    if (isLoading) {
        return <LoadingState message="Loading media..." className={className} />;
    }

    if (error) {
        return (
            <ErrorState
                title="Gallery error"
                message={error.message}
                className={className}
            />
        );
    }

    if (items.length === 0 && !showUpload) {
        return (
            <EmptyState
                icon={ImageIcon}
                title="No media"
                description="No media items to display."
                className={className}
            />
        );
    }

    return (
        <>
            <Card className={cn("p-6", className)}>
                <VStack gap="md">
                    {/* Header */}
                    {(title || showUpload || (actions && actions.length > 0)) && (
                        <HStack justify="between" align="center">
                            {title && (
                                <Typography variant="h5" weight="semibold">
                                    {title}
                                </Typography>
                            )}
                            <HStack gap="sm">
                                {showUpload && (
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        icon={Upload}
                                        action="MEDIA_UPLOAD"
                                    >
                                        Upload
                                    </Button>
                                )}
                                {actions?.map((action, idx) => (
                                    <Box
                                        key={idx}
                                        action={action.event}
                                        className="cursor-pointer hover:opacity-80 transition-opacity"
                                    >
                                        <Badge variant="default">
                                            {action.label}
                                        </Badge>
                                    </Box>
                                ))}
                            </HStack>
                        </HStack>
                    )}

                    {/* Selection count */}
                    {selectable && selectedItems.length > 0 && (
                        <HStack gap="sm" align="center">
                            <Badge variant="info">{selectedItems.length} selected</Badge>
                        </HStack>
                    )}

                    {/* Grid — using CSS grid here since almadar SimpleGrid doesn't support all column configs */}
                    <Box
                        className={cn(
                            "grid gap-3",
                            COLUMN_CLASSES[columns],
                        )}
                    >
                        {items.map((item) => {
                            const isSelected = selectedItems.includes(item.id);
                            return (
                                <Box
                                    key={item.id}
                                    className={cn(
                                        "group relative overflow-hidden rounded-[var(--radius-md)] cursor-pointer",
                                        "border-2 transition-all duration-200",
                                        isSelected
                                            ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/30"
                                            : "border-transparent hover:border-[var(--color-border)]",
                                        ASPECT_CLASSES[aspectRatio],
                                    )}
                                    // eslint-disable-next-line almadar/require-event-bus -- onClick manages local lightbox/selection state + emits UI:MEDIA_SELECT
                                    onClick={() => handleItemClick(item)}
                                >
                                    {/* eslint-disable-next-line almadar/no-raw-dom-elements -- semantic img with src/alt */}
                                    <img
                                        src={item.thumbnail || item.src}
                                        alt={item.alt || item.caption || ""}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                    {/* Hover overlay */}
                                    <Box
                                        className={cn(
                                            "absolute inset-0 bg-[var(--color-foreground)]/0 group-hover:bg-[var(--color-foreground)]/20",
                                            "transition-colors duration-200 flex items-center justify-center",
                                        )}
                                    >
                                        <Icon
                                            icon={ZoomIn}
                                            size="md"
                                            className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                        />
                                    </Box>
                                    {/* Caption */}
                                    {item.caption && (
                                        <Box className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                                            <Typography variant="caption" className="text-white truncate">
                                                {item.caption}
                                            </Typography>
                                        </Box>
                                    )}
                                    {/* Selection indicator */}
                                    {selectable && isSelected && (
                                        <Box className="absolute top-2 right-2 w-5 h-5 rounded-[var(--radius-full)] bg-[var(--color-primary)] flex items-center justify-center">
                                            <Typography variant="caption" className="text-white text-[10px]">
                                                ✓
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            );
                        })}
                    </Box>
                </VStack>
            </Card>

            {/* Lightbox */}
            {lightboxItem && (
                <Box
                    className="fixed inset-0 z-50 bg-[var(--color-background)]/80 backdrop-blur-sm flex items-center justify-center"
                    action="LIGHTBOX_CLOSE"
                >
                    <VStack
                        align="center"
                        justify="center"
                        className="w-full h-full p-8"
                        // eslint-disable-next-line almadar/require-event-bus -- stopPropagation prevents backdrop close when clicking content
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    >
                        <HStack justify="end" className="w-full max-w-4xl mb-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                icon={X}
                                action="LIGHTBOX_CLOSE"
                                className="text-white hover:bg-white/20"
                            />
                        </HStack>
                        {/* eslint-disable-next-line almadar/no-raw-dom-elements -- semantic img with src/alt */}
                        <img
                            src={lightboxItem.src}
                            alt={lightboxItem.alt || lightboxItem.caption || ""}
                            className="max-w-full max-h-[80vh] object-contain rounded-[var(--radius-md)]"
                        />
                        {lightboxItem.caption && (
                            <Typography variant="body" className="text-white mt-3 text-center">
                                {lightboxItem.caption}
                            </Typography>
                        )}
                    </VStack>
                </Box>
            )}
        </>
    );
};

MediaGallery.displayName = "MediaGallery";
