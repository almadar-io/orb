/**
 * ObjectRulePanel Component
 *
 * Shows the rules panel for a selected world object in the Event Handler tier.
 * Displays object info, its current state (via TraitStateViewer), and
 * a list of WHEN/THEN rules the kid has set.
 *
 * @packageDocumentation
 */

import React, { useCallback } from 'react';
import { VStack, HStack, Box, Typography, Button } from '../../../../atoms';
import { cn } from '../../../../../lib/cn';
import { useTranslate } from '../../../../../hooks/useTranslate';
import { TraitStateViewer } from '../../TraitStateViewer';
import type { TraitStateMachineDefinition } from '../../TraitStateViewer';
import { RuleEditor, type RuleDefinition } from './RuleEditor';

export interface PuzzleObjectDef {
    id: string;
    name: string;
    icon: string;
    states: string[];
    initialState: string;
    currentState: string;
    availableEvents: Array<{ value: string; label: string }>;
    availableActions: Array<{ value: string; label: string }>;
    rules: RuleDefinition[];
    /** Max rules allowed on this object */
    maxRules?: number;
}

export interface ObjectRulePanelProps {
    /** The selected object */
    object: PuzzleObjectDef;
    /** Called when rules change */
    onRulesChange: (objectId: string, rules: RuleDefinition[]) => void;
    /** Whether editing is disabled */
    disabled?: boolean;
    /** Additional CSS classes */
    className?: string;
}

let nextRuleId = 1;

export function ObjectRulePanel({
    object,
    onRulesChange,
    disabled = false,
    className,
}: ObjectRulePanelProps): React.JSX.Element {
    const { t } = useTranslate();
    const maxRules = object.maxRules || 3;
    const canAdd = object.rules.length < maxRules;

    const handleRuleChange = useCallback((index: number, updatedRule: RuleDefinition) => {
        const newRules = [...object.rules];
        newRules[index] = updatedRule;
        onRulesChange(object.id, newRules);
    }, [object.id, object.rules, onRulesChange]);

    const handleRuleRemove = useCallback((index: number) => {
        const newRules = object.rules.filter((_, i) => i !== index);
        onRulesChange(object.id, newRules);
    }, [object.id, object.rules, onRulesChange]);

    const handleAddRule = useCallback(() => {
        if (!canAdd || disabled) return;
        const firstEvent = object.availableEvents[0]?.value || '';
        const firstAction = object.availableActions[0]?.value || '';
        const newRule: RuleDefinition = {
            id: `rule-${nextRuleId++}`,
            whenEvent: firstEvent,
            thenAction: firstAction,
        };
        onRulesChange(object.id, [...object.rules, newRule]);
    }, [canAdd, disabled, object, onRulesChange]);

    // Build a simple state machine for the viewer
    const machine: TraitStateMachineDefinition = {
        name: object.name,
        states: object.states,
        currentState: object.currentState,
        transitions: object.rules.map(r => ({
            from: object.currentState,
            to: object.states.find(s => s !== object.currentState) || object.currentState,
            event: r.whenEvent,
        })),
    };

    return (
        <VStack className={cn('p-4 rounded-lg bg-card border border-border', className)} gap="sm">
            {/* Object header */}
            <HStack className="items-center" gap="sm">
                <Typography variant="h5">{object.icon}</Typography>
                <VStack gap="none">
                    <Typography variant="body1" className="text-foreground font-bold">
                        {object.name}
                    </Typography>
                    <Typography variant="caption" className="text-muted-foreground">
                        {t('eventHandler.state') + ': ' + object.currentState}
                    </Typography>
                </VStack>
            </HStack>

            {/* State viewer */}
            <TraitStateViewer trait={machine} variant="compact" size="sm" />

            {/* Rules */}
            <VStack gap="xs">
                <Typography variant="body2" className="text-muted-foreground font-medium">
                    {t('eventHandler.rules', { count: object.rules.length, max: maxRules }) + ':'}
                </Typography>
                {object.rules.map((rule, i) => (
                    <RuleEditor
                        key={rule.id}
                        rule={rule}
                        availableEvents={object.availableEvents}
                        availableActions={object.availableActions}
                        onChange={(r) => handleRuleChange(i, r)}
                        onRemove={() => handleRuleRemove(i)}
                        disabled={disabled}
                    />
                ))}
                {canAdd && !disabled && (
                    <Button variant="ghost" onClick={handleAddRule} className="self-start">
                        {t('eventHandler.addRule')}
                    </Button>
                )}
            </VStack>
        </VStack>
    );
}

ObjectRulePanel.displayName = 'ObjectRulePanel';

export default ObjectRulePanel;
