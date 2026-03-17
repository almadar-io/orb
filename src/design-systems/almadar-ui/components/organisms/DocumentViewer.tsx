'use client';
/**
 * DocumentViewer Organism Component
 *
 * A document viewer for displaying PDFs, documents, and rich text content.
 * Uses iframe for PDF rendering (necessary) and atoms for all surrounding UI.
 *
 * Orbital Component Interface Compliance:
 * - Entity binding with auto-fetch when entity is a string
 * - Event emission via useEventBus (UI:* events)
 * - isLoading and error state props
 * - className for external styling
 */

import React, { useState, useCallback } from "react";
import { cn } from "../../lib/cn";
import { Card, Typography, Button, Badge, Icon, Box } from "../atoms";
import { VStack, HStack } from "../atoms/Stack";
import { LoadingState } from "../molecules/LoadingState";
import { ErrorState } from "../molecules/ErrorState";
import { EmptyState } from "../molecules/EmptyState";
import { Tabs, type TabItem } from "../molecules/Tabs";
import { useEventBus } from "../../hooks/useEventBus";
import {
    FileText,
    Download,
    Printer,
    ZoomIn,
    ZoomOut,
    ChevronLeft,
    ChevronRight,
    Maximize2,
} from "lucide-react";

export type DocumentType = "pdf" | "text" | "html" | "markdown";

export interface DocumentAction {
    label: string;
    event?: string;
    navigatesTo?: string;
    variant?: "primary" | "secondary" | "ghost";
}

export interface DocumentViewerProps {
    /** Document title */
    title?: string;
    /** Document URL (for PDF/external documents) */
    src?: string;
    /** Document content (for text/html/markdown) */
    content?: string;
    /** Document type */
    documentType?: DocumentType;
    /** Current page (for multi-page documents) */
    currentPage?: number;
    /** Total pages */
    totalPages?: number;
    /** Viewer height */
    height?: number | string;
    /** Show toolbar */
    showToolbar?: boolean;
    /** Show download button */
    showDownload?: boolean;
    /** Show print button */
    showPrint?: boolean;
    /** Actions */
    actions?: readonly DocumentAction[];
    /** Multiple documents (tabbed view) */
    documents?: readonly { label: string; src?: string; content?: string; documentType?: DocumentType }[];
    /** Entity name for schema-driven auto-fetch */
    entity?: string;
    /** Loading state */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Additional CSS classes */
    className?: string;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
    title,
    src,
    content,
    documentType = "pdf",
    currentPage: propPage,
    totalPages,
    height = 600,
    showToolbar = true,
    showDownload = false,
    showPrint = false,
    actions,
    documents,
    entity,
    isLoading = false,
    error,
    className,
}) => {
    const eventBus = useEventBus();
    const [zoom, setZoom] = useState(100);
    const [currentPage, setCurrentPage] = useState(propPage ?? 1);
    const [activeDocIndex, setActiveDocIndex] = useState(0);

    const handleAction = useCallback(
        (action: DocumentAction) => {
            if (action.event) {
                eventBus.emit(`UI:${action.event}`, { page: currentPage });
            }
        },
        [eventBus, currentPage],
    );

    const handleDownload = useCallback(() => {
        const downloadSrc = documents?.[activeDocIndex]?.src ?? src;
        if (downloadSrc) {
            eventBus.emit("UI:DOCUMENT_DOWNLOAD", { src: downloadSrc });
            window.open(downloadSrc, "_blank");
        }
    }, [documents, activeDocIndex, src, eventBus]);

    const handlePrint = useCallback(() => {
        eventBus.emit("UI:DOCUMENT_PRINT", {});
        window.print();
    }, [eventBus]);

    const handleZoomIn = useCallback(() => setZoom((z) => Math.min(z + 25, 200)), []);
    const handleZoomOut = useCallback(() => setZoom((z) => Math.max(z - 25, 50)), []);

    const handlePagePrev = useCallback(() => {
        setCurrentPage((p) => Math.max(p - 1, 1));
        eventBus.emit("UI:DOCUMENT_PAGE_CHANGE", { page: currentPage - 1 });
    }, [eventBus, currentPage]);

    const handlePageNext = useCallback(() => {
        if (totalPages) {
            setCurrentPage((p) => Math.min(p + 1, totalPages));
            eventBus.emit("UI:DOCUMENT_PAGE_CHANGE", { page: currentPage + 1 });
        }
    }, [totalPages, eventBus, currentPage]);

    if (isLoading) {
        return <LoadingState message="Loading document..." className={className} />;
    }

    if (error) {
        return (
            <ErrorState
                title="Document error"
                message={error.message}
                className={className}
            />
        );
    }

    // Determine active document source
    const activeDoc = documents?.[activeDocIndex];
    const activeSrc = activeDoc?.src ?? src;
    const activeContent = activeDoc?.content ?? content;
    const activeDocType = activeDoc?.documentType ?? documentType;

    if (!activeSrc && !activeContent) {
        return (
            <EmptyState
                icon={FileText}
                title="No document"
                description="No document to display."
                className={className}
            />
        );
    }

    // Tab items for multiple documents
    const tabItems: TabItem[] | undefined = documents?.map((doc, idx) => ({
        id: `doc-${idx}`,
        label: doc.label,
        content: null, // We handle content rendering separately
    }));

    const renderContent = () => {
        if (activeDocType === "pdf" && activeSrc) {
            // iframe is necessary for PDF rendering
            return (
                <iframe
                    src={activeSrc}
                    title={title || "Document"}
                    className="w-full border-0"
                    style={{
                        height: typeof height === "number" ? height : height,
                        transform: `scale(${zoom / 100})`,
                        transformOrigin: "top left",
                        width: `${10000 / zoom}%`,
                    }}
                />
            );
        }

        if (activeDocType === "html" && activeContent) {
            return (
                <Box
                    className="w-full overflow-auto p-4"
                    style={{ height, fontSize: `${zoom}%` }}
                    dangerouslySetInnerHTML={{ __html: activeContent }}
                />
            );
        }

        // Text/Markdown
        return (
            <Box
                className="w-full overflow-auto p-4 font-mono text-sm"
                style={{ height, fontSize: `${zoom}%` }}
            >
                <Typography variant="body" className="whitespace-pre-wrap break-words">
                    {activeContent}
                </Typography>
            </Box>
        );
    };

    return (
        <Card className={cn("overflow-hidden", className)}>
            <VStack gap="none">
                {/* Tabs for multiple documents */}
                {tabItems && tabItems.length > 1 && (
                    <Box className="border-b border-[var(--color-border)]">
                        <Tabs
                            tabs={tabItems}
                            activeTab={`doc-${activeDocIndex}`}
                            onTabChange={(id) => {
                                const idx = parseInt(id.replace("doc-", ""), 10);
                                setActiveDocIndex(idx);
                            }}
                        />
                    </Box>
                )}

                {/* Toolbar */}
                {showToolbar && (
                    <HStack
                        gap="sm"
                        align="center"
                        justify="between"
                        className="px-4 py-2 border-b border-[var(--color-border)] bg-[var(--color-muted)]/30"
                    >
                        <HStack gap="sm" align="center">
                            <Icon icon={FileText} size="sm" className="text-[var(--color-muted-foreground)]" />
                            {title && (
                                <Typography variant="small" weight="medium" className="truncate max-w-[200px]">
                                    {title}
                                </Typography>
                            )}
                        </HStack>

                        <HStack gap="xs" align="center">
                            {/* Zoom controls */}
                            <Button variant="ghost" size="sm" icon={ZoomOut} onClick={handleZoomOut} />
                            <Typography variant="caption" color="secondary" className="tabular-nums w-10 text-center">
                                {zoom}%
                            </Typography>
                            <Button variant="ghost" size="sm" icon={ZoomIn} onClick={handleZoomIn} />

                            {/* Page navigation */}
                            {totalPages && totalPages > 1 && (
                                <>
                                    <Box className="w-px h-4 bg-[var(--color-border)] mx-1" />
                                    <Button variant="ghost" size="sm" icon={ChevronLeft} onClick={handlePagePrev} disabled={currentPage <= 1} />
                                    <Typography variant="caption" color="secondary" className="tabular-nums">
                                        {currentPage} / {totalPages}
                                    </Typography>
                                    <Button variant="ghost" size="sm" icon={ChevronRight} onClick={handlePageNext} disabled={currentPage >= totalPages} />
                                </>
                            )}

                            {/* Utility actions */}
                            <Box className="w-px h-4 bg-[var(--color-border)] mx-1" />
                            {showDownload && (
                                <Button variant="ghost" size="sm" icon={Download} onClick={handleDownload} />
                            )}
                            {showPrint && (
                                <Button variant="ghost" size="sm" icon={Printer} onClick={handlePrint} />
                            )}
                            {actions?.map((action, idx) => (
                                <Badge
                                    key={idx}
                                    variant="default"
                                    className="cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => handleAction(action)}
                                >
                                    {action.label}
                                </Badge>
                            ))}
                        </HStack>
                    </HStack>
                )}

                {/* Document content */}
                <Box className="w-full overflow-hidden bg-[var(--color-muted)]/20">
                    {renderContent()}
                </Box>
            </VStack>
        </Card>
    );
};

DocumentViewer.displayName = "DocumentViewer";
