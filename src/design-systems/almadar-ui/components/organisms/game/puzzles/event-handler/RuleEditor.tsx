/**
 * RuleEditor Component
 *
 * A single WHEN/THEN rule row for the Event Handler tier (ages 9-12).
 * Kid picks an event trigger and an action from dropdowns.
 *
 * @packageDocumentation
 */

import React, { useCallback } from 'react';
import { HStack, Box, Typography, Select, Button } from '../../../../atoms';
import { cn } from '../../../../../lib/cn';
import { useTranslate } from '../../../../../hooks/useTranslate';

export interface RuleDefinition {
    id: string;
    whenEvent: string;
    thenAction: string;
}

export interface RuleEditorProps {
    /** The current rule */
    rule: RuleDefinition;
    /** Available event triggers to listen for */
    availableEvents: Array<{ value: string; label: string }>;
    /** Available actions to perform */
    availableActions: Array<{ value: string; label: string }>;
    /** Called when rule changes */
    onChange: (rule: RuleDefinition) => void;
    /** Called when rule is removed */
    onRemove?: () => void;
    /** Whether editing is disabled (during playback) */
    disabled?: boolean;
    /** Additional CSS classes */
    className?: string;
}

export function RuleEditor({
    rule,
    availableEvents,
    availableActions,
    onChange,
    onRemove,
    disabled = false,
    className,
}: RuleEditorProps): React.JSX.Element {
    const { t } = useTranslate();
    const handleWhenChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange({ ...rule, whenEvent: e.target.value });
    }, [rule, onChange]);

    const handleThenChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange({ ...rule, thenAction: e.target.value });
    }, [rule, onChange]);

    return (
        <HStack className={cn('items-center p-2 rounded-lg bg-muted/50 border border-border', className)} gap="sm">
            <Typography variant="caption" className="text-primary font-bold whitespace-nowrap">
                {t('eventHandler.when')}
            </Typography>
            <Select
                value={rule.whenEvent}
                onChange={handleWhenChange}
                options={availableEvents}
                disabled={disabled}
                className="flex-1 min-w-0"
            />
            <Typography variant="caption" className="text-accent font-bold whitespace-nowrap">
                {'\u2192 ' + t('eventHandler.then')}
            </Typography>
            <Select
                value={rule.thenAction}
                onChange={handleThenChange}
                options={availableActions}
                disabled={disabled}
                className="flex-1 min-w-0"
            />
            {onRemove && (
                <Button variant="ghost" onClick={onRemove} disabled={disabled} className="shrink-0">
                    {'\u00D7'}
                </Button>
            )}
        </HStack>
    );
}

RuleEditor.displayName = 'RuleEditor';

export default RuleEditor;
