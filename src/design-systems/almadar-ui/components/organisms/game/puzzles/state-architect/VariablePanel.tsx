/**
 * VariablePanel Component
 *
 * Shows entity variables and their current values during State Architect playback.
 *
 * @packageDocumentation
 */

import React from 'react';
import { VStack, HStack, Box, Typography, ProgressBar } from '../../../../atoms';
import { cn } from '../../../../../lib/cn';
import { useTranslate } from '../../../../../hooks/useTranslate';

export interface VariableDef {
    name: string;
    value: number;
    min?: number;
    max?: number;
    unit?: string;
}

export interface VariablePanelProps {
    /** Entity name */
    entityName: string;
    /** Variables to display */
    variables: VariableDef[];
    /** Additional CSS classes */
    className?: string;
}

export function VariablePanel({
    entityName,
    variables,
    className,
}: VariablePanelProps): React.JSX.Element {
    const { t } = useTranslate();
    return (
        <VStack className={cn('p-3 rounded-lg bg-card border border-border', className)} gap="sm">
            <Typography variant="body2" className="text-muted-foreground font-medium">
                {t('stateArchitect.variables', { name: entityName })}
            </Typography>
            {variables.map(v => {
                const max = v.max ?? 100;
                const min = v.min ?? 0;
                const pct = Math.round(((v.value - min) / (max - min)) * 100);
                const isHigh = pct > 80;
                const isLow = pct < 20;

                return (
                    <VStack key={v.name} gap="none">
                        <HStack className="items-center justify-between">
                            <Typography variant="caption" className="text-foreground font-medium">
                                {v.name}
                            </Typography>
                            <Typography variant="caption" className={cn(
                                isHigh ? 'text-error' : isLow ? 'text-warning' : 'text-foreground',
                            )}>
                                {v.value}{v.unit || ''} / {max}{v.unit || ''}
                            </Typography>
                        </HStack>
                        <ProgressBar
                            value={pct}
                            color={isHigh ? 'danger' : isLow ? 'warning' : 'primary'}
                            size="sm"
                        />
                    </VStack>
                );
            })}
        </VStack>
    );
}

VariablePanel.displayName = 'VariablePanel';

export default VariablePanel;
