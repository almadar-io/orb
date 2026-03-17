'use client';
/**
 * GuardsPanel - Displays guard evaluation history
 * Uses existing component library atoms/molecules.
 */

import * as React from 'react';
import type { GuardEvaluation } from '../../../../lib/guardRegistry';
import { Accordion } from '../../../molecules/Accordion';
import { Badge } from '../../../atoms/Badge';
import { Typography } from '../../../atoms/Typography';
import { Stack } from '../../../atoms/Stack';
import { ButtonGroup } from '../../../molecules/ButtonGroup';
import { Button } from '../../../atoms/Button';
import { EmptyState } from '../../../molecules/EmptyState';

interface GuardsPanelProps {
    guards: GuardEvaluation[];
}

export function GuardsPanel({ guards }: GuardsPanelProps) {
    const [filter, setFilter] = React.useState<'all' | 'passed' | 'failed'>('all');

    if (guards.length === 0) {
        return (
            <EmptyState
                title="No guard evaluations"
                description="Guard evaluations will appear when transitions or ticks with guards execute"
                className="py-8"
            />
        );
    }

    const passedCount = guards.filter(g => g.result).length;
    const failedCount = guards.length - passedCount;

    const filteredGuards = React.useMemo(() => {
        if (filter === 'all') return guards;
        if (filter === 'passed') return guards.filter(g => g.result);
        return guards.filter(g => !g.result);
    }, [guards, filter]);

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    const accordionItems = filteredGuards.slice(-50).reverse().map(guard => ({
        id: guard.id,
        header: (
            <div className="flex items-center gap-2 w-full">
                <Badge variant={guard.result ? 'success' : 'danger'} size="sm">
                    {guard.result ? '✓' : '✗'}
                </Badge>
                <Typography variant="body" weight="semibold" className="text-amber-600 dark:text-amber-400">
                    {guard.guardName}
                </Typography>
                <Typography variant="small" className="text-gray-500">
                    {guard.context.type === 'transition'
                        ? `${guard.context.transitionFrom} → ${guard.context.transitionTo}`
                        : guard.context.tickName
                    }
                </Typography>
                <Typography variant="small" className="text-gray-400 ml-auto">
                    {formatTime(guard.timestamp)}
                </Typography>
            </div>
        ),
        content: (
            <Stack gap="sm">
                <div>
                    <Typography variant="small" weight="medium" className="text-gray-500">Expression</Typography>
                    <code className="block mt-1 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">
                        {guard.expression}
                    </code>
                </div>
                <div>
                    <Typography variant="small" weight="medium" className="text-gray-500">Inputs</Typography>
                    <pre className="mt-1 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded overflow-auto max-h-24">
                        {JSON.stringify(guard.inputs, null, 2)}
                    </pre>
                </div>
                <div>
                    <Typography variant="small" weight="medium" className="text-gray-500">Trait</Typography>
                    <Typography variant="small">{guard.context.traitName}</Typography>
                </div>
            </Stack>
        ),
    }));

    return (
        <div className="debug-tab debug-tab--guards">
            {/* Stats and filters */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex gap-3">
                    <Badge variant="success" size="sm">✓ {passedCount}</Badge>
                    <Badge variant="danger" size="sm">✗ {failedCount}</Badge>
                </div>
                <ButtonGroup>
                    <Button size="sm" variant={filter === 'all' ? 'primary' : 'secondary'} onClick={() => setFilter('all')}>
                        All
                    </Button>
                    <Button size="sm" variant={filter === 'passed' ? 'primary' : 'secondary'} onClick={() => setFilter('passed')}>
                        Passed
                    </Button>
                    <Button size="sm" variant={filter === 'failed' ? 'primary' : 'secondary'} onClick={() => setFilter('failed')}>
                        Failed
                    </Button>
                </ButtonGroup>
            </div>

            {/* Guard list */}
            <div className="max-h-80 overflow-y-auto">
                <Accordion items={accordionItems} />
            </div>
        </div>
    );
}

GuardsPanel.displayName = 'GuardsPanel';
