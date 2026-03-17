'use client';
/**
 * VerificationTab - Displays pass/fail verification checklist
 *
 * Shows all registered checks with their status, grouped by category.
 * Green = pass, Red = fail, Yellow = warn, Gray = pending.
 */

import * as React from 'react';
import type { VerificationCheck, VerificationSummary } from '../../../../lib/verificationRegistry';
import { Badge } from '../../../atoms/Badge';
import { Typography } from '../../../atoms/Typography';
import { Stack } from '../../../atoms/Stack';
import { EmptyState } from '../../../molecules/EmptyState';

interface VerificationTabProps {
    checks: VerificationCheck[];
    summary: VerificationSummary;
}

const STATUS_CONFIG: Record<string, {
    variant: 'success' | 'danger' | 'warning' | 'default';
    icon: string;
    label: string;
}> = {
    pass: { variant: 'success', icon: '\u2713', label: 'PASS' },
    fail: { variant: 'danger', icon: '\u2717', label: 'FAIL' },
    warn: { variant: 'warning', icon: '!', label: 'WARN' },
    pending: { variant: 'default', icon: '?', label: 'PENDING' },
};

export function VerificationTab({ checks, summary }: VerificationTabProps) {
    if (checks.length === 0) {
        return (
            <EmptyState
                title="No verification checks yet"
                description="Checks will appear as the app executes transitions and effects"
                className="py-8"
            />
        );
    }

    // Sort: failures first, then warnings, then pending, then pass
    const sortOrder: Record<string, number> = { fail: 0, warn: 1, pending: 2, pass: 3 };
    const sorted = [...checks].sort(
        (a, b) => (sortOrder[a.status] ?? 4) - (sortOrder[b.status] ?? 4)
    );

    return (
        <div className="debug-tab debug-tab--verification">
            {/* Summary bar */}
            <div className="flex items-center gap-3 mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <Badge variant="success" size="sm">{summary.passed} passed</Badge>
                {summary.failed > 0 && (
                    <Badge variant="danger" size="sm">{summary.failed} failed</Badge>
                )}
                {summary.warnings > 0 && (
                    <Badge variant="warning" size="sm">{summary.warnings} warnings</Badge>
                )}
                {summary.pending > 0 && (
                    <Badge variant="default" size="sm">{summary.pending} pending</Badge>
                )}
                <Typography variant="small" className="text-gray-500 ml-auto">
                    {summary.totalChecks} total checks
                </Typography>
            </div>

            {/* Checklist */}
            <div className="max-h-64 overflow-y-auto space-y-1">
                <Stack gap="xs">
                    {sorted.map((check) => {
                        const config = STATUS_CONFIG[check.status] || STATUS_CONFIG.pending;
                        return (
                            <div
                                key={check.id}
                                className="flex items-start gap-2 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                                <Badge variant={config.variant} size="sm" className="min-w-[20px] justify-center mt-0.5">
                                    {config.icon}
                                </Badge>
                                <div className="flex-1 min-w-0">
                                    <Typography variant="small" className="break-words">
                                        {check.label}
                                    </Typography>
                                    {check.details && (
                                        <Typography variant="small" className="text-gray-500 break-words">
                                            {check.details}
                                        </Typography>
                                    )}
                                </div>
                                <Typography variant="small" className="text-gray-400 font-mono text-[10px] shrink-0">
                                    {new Date(check.updatedAt).toLocaleTimeString('en-US', {
                                        hour12: false,
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit',
                                    })}
                                </Typography>
                            </div>
                        );
                    })}
                </Stack>
            </div>
        </div>
    );
}

VerificationTab.displayName = 'VerificationTab';
