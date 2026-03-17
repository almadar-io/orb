/* eslint-disable almadar/organism-rendering-state-only, almadar/organism-no-data-state, almadar/organism-extends-entity-display, almadar/no-raw-dom-elements, almadar/require-event-bus */
/**
 * EventHandlerBoard Organism
 *
 * Contains ALL game logic for the Event Handler tier (ages 9-12).
 * Kids click on world objects, set WHEN/THEN rules, and watch
 * event chains cascade during playback.
 *
 * Encourages experimentation: on failure, resets to editing so the kid
 * can try different rules. After 3 failures, shows a progressive hint.
 *
 * @packageDocumentation
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { VStack, HStack, Box, Typography, Button } from '../../../../atoms';
import { cn } from '../../../../../lib/cn';
import { useEventBus } from '../../../../../hooks/useEventBus';
import { useTranslate } from '../../../../../hooks/useTranslate';
import { TraitStateViewer } from '../../TraitStateViewer';
import type { TraitStateMachineDefinition } from '../../TraitStateViewer';
import type { EntityDisplayProps } from '../../../types';
import { ObjectRulePanel, type PuzzleObjectDef } from './ObjectRulePanel';
import { EventLog, type EventLogEntry } from './EventLog';
import type { RuleDefinition } from './RuleEditor';

// =============================================================================
// Types
// =============================================================================

export interface EventHandlerPuzzleEntity {
    id: string;
    title: string;
    description: string;
    /** Objects the kid can configure */
    objects: PuzzleObjectDef[];
    /** Goal condition description */
    goalCondition: string;
    /** Event that represents goal completion */
    goalEvent: string;
    /** Sequence of events that auto-fire to start the simulation */
    triggerEvents?: string[];
    /** Feedback */
    successMessage?: string;
    failMessage?: string;
    /** Progressive hint shown after 3 failures */
    hint?: string;
    /** Header image URL displayed above the title */
    headerImage?: string;
    /** Visual theme overrides */
    theme?: { background?: string; accentColor?: string };
}

export interface EventHandlerBoardProps extends Omit<EntityDisplayProps, 'entity'> {
    /** Puzzle data */
    entity: EventHandlerPuzzleEntity;
    /** Playback speed in ms per event */
    stepDurationMs?: number;
    /** Emits UI:{playEvent} */
    playEvent?: string;
    /** Emits UI:{completeEvent} with { success } */
    completeEvent?: string;
}

type PlayState = 'editing' | 'playing' | 'success' | 'fail';

const ENCOURAGEMENT_KEYS = [
    'puzzle.tryAgain1',
    'puzzle.tryAgain2',
    'puzzle.tryAgain3',
];

// =============================================================================
// Component
// =============================================================================

export function EventHandlerBoard({
    entity,
    stepDurationMs = 800,
    playEvent,
    completeEvent,
    className,
}: EventHandlerBoardProps): React.JSX.Element {
    const { emit } = useEventBus();
    const { t } = useTranslate();
    const [objects, setObjects] = useState<PuzzleObjectDef[]>(entity.objects);
    const [selectedObjectId, setSelectedObjectId] = useState<string | null>(
        entity.objects[0]?.id || null,
    );
    const [headerError, setHeaderError] = useState(false);
    const [playState, setPlayState] = useState<PlayState>('editing');
    const [eventLog, setEventLog] = useState<EventLogEntry[]>([]);
    const [attempts, setAttempts] = useState(0);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const logIdCounter = useRef(0);

    useEffect(() => () => {
        if (timerRef.current) clearTimeout(timerRef.current);
    }, []);

    const selectedObject = objects.find(o => o.id === selectedObjectId) || null;

    // -- Rule changes ---------------------------------------------------------

    const handleRulesChange = useCallback((objectId: string, rules: RuleDefinition[]) => {
        setObjects(prev => prev.map(o =>
            o.id === objectId ? { ...o, rules } : o,
        ));
    }, []);

    // -- Add log entry --------------------------------------------------------

    const addLogEntry = useCallback((icon: string, message: string, status: EventLogEntry['status'] = 'done') => {
        const id = `log-${logIdCounter.current++}`;
        setEventLog(prev => [...prev, { id, timestamp: Date.now(), icon, message, status }]);
    }, []);

    // -- Playback: simulate event chain ---------------------------------------

    const handlePlay = useCallback(() => {
        if (playState !== 'editing') return;
        if (playEvent) emit(`UI:${playEvent}`, {});

        setPlayState('playing');
        setEventLog([]);

        const allRules: Array<{ object: PuzzleObjectDef; rule: RuleDefinition }> = [];
        objects.forEach(obj => {
            obj.rules.forEach(rule => {
                allRules.push({ object: obj, rule });
            });
        });

        const triggers = entity.triggerEvents || [];
        const eventQueue = [...triggers];
        const firedEvents = new Set<string>();
        let stepIdx = 0;
        let goalReached = false;

        const processNext = () => {
            if (eventQueue.length === 0 || stepIdx > 20) {
                if (goalReached) {
                    setPlayState('success');
                    if (completeEvent) {
                        emit(`UI:${completeEvent}`, { success: true });
                    }
                } else {
                    setAttempts(prev => prev + 1);
                    setPlayState('fail');
                    // Do NOT emit PUZZLE_COMPLETE on failure — kid keeps trying
                }
                return;
            }

            const currentEvent = eventQueue.shift()!;
            if (firedEvents.has(currentEvent)) {
                timerRef.current = setTimeout(processNext, 100);
                return;
            }
            firedEvents.add(currentEvent);

            const matching = allRules.filter(r => r.rule.whenEvent === currentEvent);

            if (matching.length === 0) {
                addLogEntry('\u26A1', t('eventHandler.noListeners', { event: currentEvent }), 'done');
            } else {
                matching.forEach(({ object, rule }) => {
                    addLogEntry(object.icon, t('eventHandler.heardEvent', { object: object.name, event: currentEvent, action: rule.thenAction }), 'done');
                    eventQueue.push(rule.thenAction);
                    if (rule.thenAction === entity.goalEvent) {
                        goalReached = true;
                    }
                });
            }

            if (currentEvent === entity.goalEvent) {
                goalReached = true;
            }

            stepIdx++;
            timerRef.current = setTimeout(processNext, stepDurationMs);
        };

        if (triggers.length > 0) {
            addLogEntry('\uD83C\uDFAC', t('eventHandler.simulationStarted', { events: triggers.join(', ') }), 'active');
        }
        timerRef.current = setTimeout(processNext, stepDurationMs);
    }, [playState, objects, entity, stepDurationMs, playEvent, completeEvent, emit, addLogEntry, t]);

    const handleTryAgain = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        // Keep the rules the kid set — just reset play state so they can tweak
        setPlayState('editing');
        setEventLog([]);
    }, []);

    const handleReset = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setObjects(entity.objects);
        setPlayState('editing');
        setEventLog([]);
        setSelectedObjectId(entity.objects[0]?.id || null);
        setAttempts(0);
    }, [entity.objects]);

    // -- Build compact viewers ------------------------------------------------

    const objectViewers = objects.map(obj => {
        const machine: TraitStateMachineDefinition = {
            name: obj.name,
            states: obj.states,
            currentState: obj.currentState,
            transitions: obj.rules.map(r => ({
                from: obj.currentState,
                to: obj.states.find(s => s !== obj.currentState) || obj.currentState,
                event: r.whenEvent,
            })),
        };
        return { obj, machine };
    });

    const showHint = attempts >= 3 && entity.hint;
    const encourageKey = ENCOURAGEMENT_KEYS[Math.min(attempts - 1, ENCOURAGEMENT_KEYS.length - 1)] ?? ENCOURAGEMENT_KEYS[0];

    return (
        <VStack
            className={cn('p-4 gap-6', className)}
            style={{
                backgroundImage: entity.theme?.background ? `url(${entity.theme.background})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            {/* Header image */}
            {entity.headerImage && !headerError ? (
                <Box className="w-full h-32 overflow-hidden rounded-lg">
                    <img src={entity.headerImage} alt="" onError={() => setHeaderError(true)} className="w-full h-full object-cover" />
                </Box>
            ) : entity.headerImage && headerError ? (
                <Box className="w-full h-32 rounded-lg bg-gradient-to-br from-[var(--color-muted)] to-[var(--color-accent)] opacity-60" />
            ) : null}

            {/* Title + goal */}
            <VStack gap="xs">
                <Typography variant="h4" className="text-foreground">
                    {entity.title}
                </Typography>
                <Typography variant="body2" className="text-muted-foreground">
                    {entity.description}
                </Typography>
                <HStack className="items-center p-2 rounded bg-primary/10 border border-primary/30" gap="xs">
                    <Typography variant="caption" className="text-primary font-bold">
                        {t('game.goal') + ':'}
                    </Typography>
                    <Typography variant="caption" className="text-foreground">
                        {entity.goalCondition}
                    </Typography>
                </HStack>
            </VStack>

            {/* Object selectors + compact viewers */}
            <VStack gap="sm">
                <Typography variant="body2" className="text-muted-foreground font-medium">
                    {t('eventHandler.clickObject') + ':'}
                </Typography>
                <HStack className="flex-wrap" gap="sm">
                    {objectViewers.map(({ obj, machine }) => (
                        <Box
                            key={obj.id}
                            className={cn(
                                'p-3 rounded-lg border-2 cursor-pointer transition-all hover:scale-105',
                                selectedObjectId === obj.id
                                    ? 'border-primary bg-primary/10'
                                    : 'border-border bg-card hover:border-muted-foreground',
                            )}
                            onClick={() => setSelectedObjectId(obj.id)}
                        >
                            <VStack gap="xs" className="items-center min-w-[120px]">
                                <Typography variant="h5">{obj.icon}</Typography>
                                <Typography variant="body2" className="text-foreground font-medium">
                                    {obj.name}
                                </Typography>
                                <TraitStateViewer trait={machine} variant="compact" size="sm" />
                            </VStack>
                        </Box>
                    ))}
                </HStack>
            </VStack>

            {/* Selected object rule panel */}
            {selectedObject && (
                <ObjectRulePanel
                    object={selectedObject}
                    onRulesChange={handleRulesChange}
                    disabled={playState !== 'editing'}
                />
            )}

            {/* Event log during playback */}
            {eventLog.length > 0 && (
                <EventLog entries={eventLog} />
            )}

            {/* Result feedback */}
            {playState === 'success' && (
                <Box className="p-4 rounded-lg bg-success/20 border border-success text-center">
                    <Typography variant="h5" className="text-success">
                        {entity.successMessage || t('eventHandler.chainComplete')}
                    </Typography>
                </Box>
            )}

            {playState === 'fail' && (
                <VStack gap="sm">
                    <Box className="p-4 rounded-lg bg-warning/10 border border-warning/30 text-center">
                        <Typography variant="body1" className="text-foreground font-medium">
                            {t(encourageKey)}
                        </Typography>
                    </Box>
                    {showHint && (
                        <Box className="p-3 rounded-lg bg-accent/10 border border-accent/30">
                            <HStack className="items-start" gap="xs">
                                <Typography variant="body2" className="text-accent font-bold shrink-0">
                                    {'\uD83D\uDCA1 ' + t('game.hint') + ':'}
                                </Typography>
                                <Typography variant="body2" className="text-foreground">
                                    {entity.hint}
                                </Typography>
                            </HStack>
                        </Box>
                    )}
                </VStack>
            )}

            {/* Controls */}
            <HStack gap="sm">
                {playState === 'fail' ? (
                    <Button variant="primary" onClick={handleTryAgain}>
                        {'\uD83D\uDD04 ' + t('puzzle.tryAgainButton')}
                    </Button>
                ) : (
                    <Button
                        variant="primary"
                        onClick={handlePlay}
                        disabled={playState !== 'editing'}
                    >
                        {'\u25B6 ' + t('game.play')}
                    </Button>
                )}
                <Button variant="ghost" onClick={handleReset}>
                    {'\u21BA ' + t('game.reset')}
                </Button>
            </HStack>
        </VStack>
    );
}

EventHandlerBoard.displayName = 'EventHandlerBoard';

export default EventHandlerBoard;
