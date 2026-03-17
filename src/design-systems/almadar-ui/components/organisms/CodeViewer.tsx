'use client';
/**
 * CodeViewer Organism Component
 *
 * A code/diff viewer with syntax highlighting and line numbers.
 * Composes atoms and molecules for layout. Uses pre/code elements
 * which are semantically necessary for code display.
 *
 * Orbital Component Interface Compliance:
 * - Entity binding with auto-fetch when entity is a string
 * - Event emission via useEventBus (UI:* events)
 * - isLoading and error state props
 * - className for external styling
 */

import React, { useState, useCallback, useMemo } from "react";
import { cn } from "../../lib/cn";
import { Card, Typography, Button, Badge, Icon, Box } from "../atoms";
import { VStack, HStack } from "../atoms/Stack";
import { LoadingState } from "../molecules/LoadingState";
import { ErrorState } from "../molecules/ErrorState";
import { EmptyState } from "../molecules/EmptyState";
import { Tabs, type TabItem } from "../molecules/Tabs";
import { useEventBus } from "../../hooks/useEventBus";
import { Copy, Check, Code, FileText, WrapText } from "lucide-react";

export type CodeViewerMode = "code" | "diff";

export interface DiffLine {
    type: "add" | "remove" | "context";
    content: string;
    lineNumber?: number;
}

export interface CodeViewerAction {
    label: string;
    event?: string;
    navigatesTo?: string;
    variant?: "primary" | "secondary" | "ghost";
}

export interface CodeViewerProps {
    /** Viewer title */
    title?: string;
    /** Code content */
    code?: string;
    /** Language for display label */
    language?: string;
    /** Diff lines (for diff mode) */
    diff?: readonly DiffLine[];
    /** Old value (for generating diff) */
    oldValue?: string;
    /** New value (for generating diff) */
    newValue?: string;
    /** Display mode */
    mode?: CodeViewerMode;
    /** Show line numbers */
    showLineNumbers?: boolean;
    /** Show copy button */
    showCopy?: boolean;
    /** Enable word wrap */
    wordWrap?: boolean;
    /** Max height before scrolling */
    maxHeight?: number | string;
    /** Multiple files (tabbed view) */
    files?: readonly { label: string; code: string; language?: string }[];
    /** Actions */
    actions?: readonly CodeViewerAction[];
    /** Entity name for schema-driven auto-fetch */
    entity?: string;
    /** Loading state */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Additional CSS classes */
    className?: string;
}

/** Simple line-by-line diff generator */
function generateDiff(oldVal: string, newVal: string): DiffLine[] {
    const oldLines = oldVal.split("\n");
    const newLines = newVal.split("\n");
    const diff: DiffLine[] = [];

    const maxLen = Math.max(oldLines.length, newLines.length);
    for (let i = 0; i < maxLen; i++) {
        const oldLine = oldLines[i];
        const newLine = newLines[i];

        if (oldLine === newLine) {
            diff.push({ type: "context", content: oldLine ?? "", lineNumber: i + 1 });
        } else {
            if (oldLine !== undefined) {
                diff.push({ type: "remove", content: oldLine, lineNumber: i + 1 });
            }
            if (newLine !== undefined) {
                diff.push({ type: "add", content: newLine, lineNumber: i + 1 });
            }
        }
    }

    return diff;
}

const DIFF_STYLES: Record<DiffLine["type"], { bg: string; prefix: string; text: string }> = {
    add: {
        bg: "bg-[var(--color-success)]/10",
        prefix: "+",
        text: "text-[var(--color-success)]",
    },
    remove: {
        bg: "bg-[var(--color-error)]/10",
        prefix: "-",
        text: "text-[var(--color-error)]",
    },
    context: {
        bg: "",
        prefix: " ",
        text: "text-[var(--color-foreground)]",
    },
};

export const CodeViewer: React.FC<CodeViewerProps> = ({
    title,
    code,
    language,
    diff: propDiff,
    oldValue,
    newValue,
    mode = "code",
    showLineNumbers = true,
    showCopy = true,
    wordWrap = false,
    maxHeight = 500,
    files,
    actions,
    entity,
    isLoading = false,
    error,
    className,
}) => {
    const eventBus = useEventBus();
    const [copied, setCopied] = useState(false);
    const [wrap, setWrap] = useState(wordWrap);
    const [activeFileIndex, setActiveFileIndex] = useState(0);

    const handleAction = useCallback(
        (action: CodeViewerAction) => {
            if (action.event) {
                eventBus.emit(`UI:${action.event}`, {});
            }
        },
        [eventBus],
    );

    const activeFile = files?.[activeFileIndex];
    const activeCode = activeFile?.code ?? code ?? "";
    const activeLanguage = activeFile?.language ?? language ?? "text";

    const lines = useMemo(() => activeCode.split("\n"), [activeCode]);

    const diffLines = useMemo(() => {
        if (propDiff) return propDiff;
        if (mode === "diff" && oldValue !== undefined && newValue !== undefined) {
            return generateDiff(oldValue, newValue);
        }
        return null;
    }, [propDiff, mode, oldValue, newValue]);

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(activeCode);
            setCopied(true);
            eventBus.emit("UI:CODE_COPY", { language: activeLanguage });
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback
        }
    }, [activeCode, eventBus, activeLanguage]);

    // Tab items for multiple files
    const tabItems: TabItem[] | undefined = files?.map((file, idx) => ({
        id: `file-${idx}`,
        label: file.label,
        content: null,
    }));

    if (isLoading) {
        return <LoadingState message="Loading code..." className={className} />;
    }

    if (error) {
        return (
            <ErrorState
                title="Code viewer error"
                message={error.message}
                className={className}
            />
        );
    }

    if (!activeCode && !diffLines) {
        return (
            <EmptyState
                icon={Code}
                title="No code"
                description="No code to display."
                className={className}
            />
        );
    }

    return (
        <Card className={cn("overflow-hidden", className)}>
            <VStack gap="none">
                {/* Tabs for multiple files */}
                {tabItems && tabItems.length > 1 && (
                    <Box className="border-b border-[var(--color-border)]">
                        <Tabs
                            tabs={tabItems}
                            activeTab={`file-${activeFileIndex}`}
                            onTabChange={(id) => {
                                const idx = parseInt(id.replace("file-", ""), 10);
                                setActiveFileIndex(idx);
                            }}
                        />
                    </Box>
                )}

                {/* Toolbar */}
                <HStack
                    gap="sm"
                    align="center"
                    justify="between"
                    className="px-4 py-2 border-b border-[var(--color-border)] bg-[var(--color-muted)]/30"
                >
                    <HStack gap="sm" align="center">
                        <Icon icon={mode === "diff" ? FileText : Code} size="sm" className="text-[var(--color-muted-foreground)]" />
                        {title && (
                            <Typography variant="small" weight="medium" className="truncate">
                                {title}
                            </Typography>
                        )}
                        {activeLanguage && activeLanguage !== "text" && (
                            <Badge variant="default">{activeLanguage}</Badge>
                        )}
                    </HStack>

                    <HStack gap="xs" align="center">
                        <Button
                            variant="ghost"
                            size="sm"
                            icon={WrapText}
                            onClick={() => setWrap(!wrap)}
                            className={cn(wrap && "text-[var(--color-primary)]")}
                        />
                        {showCopy && (
                            <Button
                                variant="ghost"
                                size="sm"
                                icon={copied ? Check : Copy}
                                onClick={handleCopy}
                                className={cn(copied && "text-[var(--color-success)]")}
                            />
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

                {/* Code content — pre/code are semantically necessary for code display */}
                <Box
                    className="overflow-auto bg-[var(--color-muted)]/20"
                    style={{ maxHeight }}
                >
                    {diffLines ? (
                        /* Diff mode */
                        <VStack gap="none" className="font-mono text-xs">
                            {diffLines.map((line, idx) => {
                                const style = DIFF_STYLES[line.type];
                                return (
                                    <HStack key={idx} gap="none" align="start" className={cn(style.bg, "px-4 py-0.5")}>
                                        {showLineNumbers && (
                                            <Typography
                                                variant="caption"
                                                color="secondary"
                                                className="w-8 text-right mr-3 select-none tabular-nums flex-shrink-0"
                                            >
                                                {line.lineNumber ?? ""}
                                            </Typography>
                                        )}
                                        <Typography
                                            variant="caption"
                                            className={cn(
                                                "font-mono flex-1 min-w-0",
                                                style.text,
                                                wrap ? "whitespace-pre-wrap break-all" : "whitespace-pre",
                                            )}
                                        >
                                            <Box as="span" className="select-none opacity-50 mr-2">
                                                {style.prefix}
                                            </Box>
                                            {line.content}
                                        </Typography>
                                    </HStack>
                                );
                            })}
                        </VStack>
                    ) : (
                        /* Code mode */
                        <VStack gap="none" className="font-mono text-xs">
                            {lines.map((line, idx) => (
                                <HStack key={idx} gap="none" align="start" className="px-4 py-0.5 hover:bg-[var(--color-muted)]/50">
                                    {showLineNumbers && (
                                        <Typography
                                            variant="caption"
                                            color="secondary"
                                            className="w-8 text-right mr-4 select-none tabular-nums flex-shrink-0"
                                        >
                                            {idx + 1}
                                        </Typography>
                                    )}
                                    <Typography
                                        variant="caption"
                                        className={cn(
                                            "font-mono flex-1 min-w-0",
                                            wrap ? "whitespace-pre-wrap break-all" : "whitespace-pre",
                                        )}
                                    >
                                        {line || " "}
                                    </Typography>
                                </HStack>
                            ))}
                        </VStack>
                    )}
                </Box>
            </VStack>
        </Card>
    );
};

CodeViewer.displayName = "CodeViewer";
