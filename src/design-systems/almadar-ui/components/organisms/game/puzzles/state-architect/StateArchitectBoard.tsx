/* eslint-disable almadar/organism-extends-entity-display, almadar/organism-rendering-state-only, almadar/organism-no-data-state, almadar/no-raw-dom-elements, almadar/require-event-bus */
/**
 * StateArchitectBoard Organism
 *
 * Contains ALL game logic for the State Architect tier (ages 13+).
 * Kids design state machines via a visual graph editor, then run
 * them to see if the behavior matches the puzzle goal.
 *
 * @packageDocumentation
 */

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { VStack, HStack, Box, Typography, Button } from '../../../../atoms';
import { cn } from '../../../../../lib/cn';
import { useEventBus } from '../../../../../hooks/useEventBus';
import { useTranslate } from '../../../../../hooks/useTranslate';
import { TraitStateViewer } from '../../TraitStateViewer';
import type { TraitStateMachineDefinition, TraitTransition } from '../../TraitStateViewer';
import type { EntityDisplayProps } from '../../../types';
import { StateNode } from './StateNode';
import { TransitionArrow } from './TransitionArrow';
import { VariablePanel, type VariableDef } from './VariablePanel';
import { CodeView } from './CodeView';

// =============================================================================
// Types
// =============================================================================

export interface StateArchitectTransition {
    id: string;
    from: string;
    to: string;
    event: string;
    guardHint?: string;
}

export interface TestCase {
    /** Sequence of events to fire */
    events: string[];
    /** Expected final state */
    expectedState: string;
    /** Description */
    label: string;
}

export interface StateArchitectPuzzleEntity {
    id: string;
    title: string;
    description: string;
    hint: string;
    /** Entity being designed */
    entityName: string;
    /** Variables with initial values */
    variables: VariableDef[];
    /** States provided (kid may need to add more) */
    states: string[];
    /** Initial state */
    initialState: string;
    /** Pre-existing transitions (puzzle may have some already) */
    transitions: StateArchitectTransition[];
    /** Events available to use */
    availableEvents: string[];
    /** States available to add */
    availableStates?: string[];
    /** Test cases to validate against */
    testCases: TestCase[];
    /** Show code view toggle */
    showCodeView?: boolean;
    /** Feedback */
    successMessage?: string;
    failMessage?: string;
    /** Header image URL displayed above the title */
    headerImage?: string;
    /** Visual theme overrides */
    theme?: { background?: string; accentColor?: string };
}

export interface StateArchitectBoardProps extends Omit<EntityDisplayProps, 'entity'> {
    /** Puzzle data */
    entity: StateArchitectPuzzleEntity;
    /** Playback speed */
    stepDurationMs?: number;
    /** Emits UI:{testEvent} */
    testEvent?: string;
    /** Emits UI:{completeEvent} with { success, passedTests } */
    completeEvent?: string;
}

type PlayState = 'editing' | 'testing' | 'success' | 'fail';

interface TestResult {
    label: string;
    passed: boolean;
    actualState: string;
    expectedState: string;
}

const ENCOURAGEMENT_KEYS = [
    'puzzle.tryAgain1',
    'puzzle.tryAgain2',
    'puzzle.tryAgain3',
];

// =============================================================================
// Layout helper — position states in a circle
// =============================================================================

function layoutStates(states: string[], width: number, height: number): Record<string, { x: number; y: number }> {
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(cx, cy) - 60;
    const positions: Record<string, { x: number; y: number }> = {};
    states.forEach((state, i) => {
        const angle = (2 * Math.PI * i) / states.length - Math.PI / 2;
        positions[state] = {
            x: cx + radius * Math.cos(angle),
            y: cy + radius * Math.sin(angle),
        };
    });
    return positions;
}

// =============================================================================
// Component
// =============================================================================

let nextTransId = 100;

export function StateArchitectBoard({
    entity,
    stepDurationMs = 600,
    testEvent,
    completeEvent,
    className,
}: StateArchitectBoardProps): React.JSX.Element {
    const { emit } = useEventBus();
    const { t } = useTranslate();
    const [transitions, setTransitions] = useState<StateArchitectTransition[]>(entity.transitions);
    const [headerError, setHeaderError] = useState(false);
    const [playState, setPlayState] = useState<PlayState>('editing');
    const [currentState, setCurrentState] = useState(entity.initialState);
    const [selectedState, setSelectedState] = useState<string | null>(null);
    const [testResults, setTestResults] = useState<TestResult[]>([]);
    const [variables, setVariables] = useState<VariableDef[]>(entity.variables);
    const [attempts, setAttempts] = useState(0);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // -- Adding a new transition (simplified UI) ------------------------------
    const [addingFrom, setAddingFrom] = useState<string | null>(null);

    useEffect(() => () => {
        if (timerRef.current) clearTimeout(timerRef.current);
    }, []);

    // -- Graph layout ---------------------------------------------------------
    const GRAPH_W = 500;
    const GRAPH_H = 400;
    const positions = useMemo(() => layoutStates(entity.states, GRAPH_W, GRAPH_H), [entity.states]);

    // -- Add transition -------------------------------------------------------

    const handleStateClick = useCallback((state: string) => {
        if (playState !== 'editing') return;

        if (addingFrom) {
            // Second click — create transition
            if (addingFrom !== state) {
                const event = entity.availableEvents[0] || 'EVENT';
                const newTrans: StateArchitectTransition = {
                    id: `t-${nextTransId++}`,
                    from: addingFrom,
                    to: state,
                    event,
                };
                setTransitions(prev => [...prev, newTrans]);
            }
            setAddingFrom(null);
        } else {
            setSelectedState(state);
        }
    }, [playState, addingFrom, entity.availableEvents]);

    const handleStartAddTransition = useCallback(() => {
        if (!selectedState) return;
        setAddingFrom(selectedState);
    }, [selectedState]);

    const handleRemoveTransition = useCallback((transId: string) => {
        setTransitions(prev => prev.filter(t => t.id !== transId));
    }, []);

    // -- Build TraitStateMachineDefinition ------------------------------------

    const machine: TraitStateMachineDefinition = useMemo(() => ({
        name: entity.entityName,
        description: entity.description,
        states: entity.states,
        currentState,
        transitions: transitions.map(t => ({
            from: t.from,
            to: t.to,
            event: t.event,
            guardHint: t.guardHint,
        })),
    }), [entity, currentState, transitions]);

    // -- Test runner ----------------------------------------------------------

    const handleTest = useCallback(() => {
        if (playState !== 'editing') return;
        if (testEvent) emit(`UI:${testEvent}`, {});

        setPlayState('testing');
        setTestResults([]);

        const results: TestResult[] = [];
        let testIdx = 0;

        const runNextTest = () => {
            if (testIdx >= entity.testCases.length) {
                const allPassed = results.every(r => r.passed);
                setPlayState(allPassed ? 'success' : 'fail');
                setTestResults(results);
                if (allPassed && completeEvent) {
                    emit(`UI:${completeEvent}`, {
                        success: true,
                        passedTests: results.filter(r => r.passed).length,
                    });
                }
                if (!allPassed) {
                    setAttempts(prev => prev + 1);
                }
                return;
            }

            const testCase = entity.testCases[testIdx];
            let state = entity.initialState;

            // Simulate events
            for (const event of testCase.events) {
                const trans = transitions.find(t => t.from === state && t.event === event);
                if (trans) {
                    state = trans.to;
                }
            }

            setCurrentState(state);
            results.push({
                label: testCase.label,
                passed: state === testCase.expectedState,
                actualState: state,
                expectedState: testCase.expectedState,
            });

            testIdx++;
            timerRef.current = setTimeout(runNextTest, stepDurationMs);
        };

        timerRef.current = setTimeout(runNextTest, stepDurationMs);
    }, [playState, transitions, entity, stepDurationMs, testEvent, completeEvent, emit]);

    const handleTryAgain = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        // Keep the transitions the kid built — just reset play state
        setPlayState('editing');
        setCurrentState(entity.initialState);
        setTestResults([]);
    }, [entity.initialState]);

    const handleReset = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setTransitions(entity.transitions);
        setPlayState('editing');
        setCurrentState(entity.initialState);
        setTestResults([]);
        setVariables(entity.variables);
        setSelectedState(null);
        setAddingFrom(null);
        setAttempts(0);
    }, [entity]);

    // -- Code view data -------------------------------------------------------

    const codeData = useMemo(() => ({
        name: entity.entityName,
        states: entity.states,
        initialState: entity.initialState,
        transitions: transitions.map(t => ({
            from: t.from,
            to: t.to,
            event: t.event,
            ...(t.guardHint ? { guard: t.guardHint } : {}),
        })),
    }), [entity, transitions]);

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

            {/* Title */}
            <VStack gap="xs">
                <Typography variant="h4" className="text-foreground">
                    {entity.title}
                </Typography>
                <Typography variant="body2" className="text-muted-foreground">
                    {entity.description}
                </Typography>
                <HStack className="items-center p-2 rounded bg-warning/10 border border-warning/30" gap="xs">
                    <Typography variant="caption" className="text-warning font-bold">
                        {t('game.hint') + ':'}
                    </Typography>
                    <Typography variant="caption" className="text-foreground">
                        {entity.hint}
                    </Typography>
                </HStack>
            </VStack>

            <HStack className="flex-wrap items-start" gap="lg">
                {/* Graph editor */}
                <VStack gap="sm" className="flex-1 min-w-[300px]">
                    <HStack className="items-center justify-between">
                        <Typography variant="body2" className="text-muted-foreground font-medium">
                            {t('stateArchitect.graph')}
                        </Typography>
                        {addingFrom && (
                            <Typography variant="caption" className="text-accent animate-pulse">
                                {t('stateArchitect.clickTarget', { state: addingFrom || '' })}
                            </Typography>
                        )}
                    </HStack>
                    <Box
                        position="relative"
                        className="rounded-lg border border-border bg-background overflow-hidden"
                        style={{ width: GRAPH_W, height: GRAPH_H }}
                    >
                        {/* SVG arrows */}
                        <svg
                            width={GRAPH_W}
                            height={GRAPH_H}
                            className="absolute inset-0"
                            style={{ pointerEvents: 'none' }}
                        >
                            <defs>
                                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                                    <polygon points="0 0, 10 3.5, 0 7" fill="var(--color-border)" />
                                </marker>
                                <marker id="arrowhead-active" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                                    <polygon points="0 0, 10 3.5, 0 7" fill="var(--color-primary)" />
                                </marker>
                            </defs>
                            {transitions.map(t => {
                                const fromPos = positions[t.from];
                                const toPos = positions[t.to];
                                if (!fromPos || !toPos) return null;
                                const isActive = t.from === currentState;
                                return (
                                    <TransitionArrow
                                        key={t.id}
                                        from={fromPos}
                                        to={toPos}
                                        eventLabel={t.event}
                                        guardHint={t.guardHint}
                                        isActive={isActive}
                                    />
                                );
                            })}
                        </svg>

                        {/* State nodes */}
                        {entity.states.map(state => (
                            <StateNode
                                key={state}
                                name={state}
                                position={positions[state]}
                                isCurrent={state === currentState}
                                isSelected={state === selectedState}
                                isInitial={state === entity.initialState}
                                onClick={() => handleStateClick(state)}
                            />
                        ))}
                    </Box>

                    {/* Graph controls */}
                    {playState === 'editing' && (
                        <HStack gap="sm">
                            <Button
                                variant="ghost"
                                onClick={handleStartAddTransition}
                                disabled={!selectedState}
                            >
                                {selectedState ? t('stateArchitect.addTransition', { state: selectedState }) : t('stateArchitect.addTransitionPrompt')}
                            </Button>
                        </HStack>
                    )}

                    {/* Transition list */}
                    {transitions.length > 0 && (
                        <VStack gap="xs" className="p-3 rounded-lg bg-muted/50 border border-border">
                            <Typography variant="caption" className="text-muted-foreground font-medium">
                                {t('stateArchitect.transitions', { count: transitions.length }) + ':'}
                            </Typography>
                            {transitions.map(t => (
                                <HStack key={t.id} className="items-center text-xs" gap="xs">
                                    <Typography variant="caption" className="text-foreground">
                                        {t.from}
                                    </Typography>
                                    <Typography variant="caption" className="text-muted-foreground">
                                        {'\u2014['}
                                    </Typography>
                                    <Typography variant="caption" className="text-accent font-medium">
                                        {t.event}
                                    </Typography>
                                    <Typography variant="caption" className="text-muted-foreground">
                                        {']\u2192'}
                                    </Typography>
                                    <Typography variant="caption" className="text-success">
                                        {t.to}
                                    </Typography>
                                    {t.guardHint && (
                                        <Typography variant="caption" className="text-warning">
                                            ({t.guardHint})
                                        </Typography>
                                    )}
                                    {playState === 'editing' && (
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleRemoveTransition(t.id)}
                                            className="text-xs ml-auto"
                                        >
                                            {'\u00D7'}
                                        </Button>
                                    )}
                                </HStack>
                            ))}
                        </VStack>
                    )}
                </VStack>

                {/* Side panel */}
                <VStack gap="sm" className="w-[280px] shrink-0">
                    {/* Full state viewer */}
                    <TraitStateViewer trait={machine} variant="full" size="sm" />

                    {/* Variables */}
                    <VariablePanel
                        entityName={entity.entityName}
                        variables={variables}
                    />

                    {/* Test results */}
                    {testResults.length > 0 && (
                        <VStack className="p-3 rounded-lg bg-card border border-border" gap="xs">
                            <Typography variant="body2" className="text-muted-foreground font-medium">
                                {t('stateArchitect.testResults') + ':'}
                            </Typography>
                            {testResults.map((r, i) => (
                                <HStack key={i} className="items-center text-xs" gap="xs">
                                    <Typography variant="caption" className={r.passed ? 'text-success' : 'text-error'}>
                                        {r.passed ? '\u2714' : '\u2717'}
                                    </Typography>
                                    <Typography variant="caption" className="text-foreground flex-1">
                                        {r.label}
                                    </Typography>
                                    {!r.passed && (
                                        <Typography variant="caption" className="text-error">
                                            {t('stateArchitect.gotState', { state: r.actualState })}
                                        </Typography>
                                    )}
                                </HStack>
                            ))}
                        </VStack>
                    )}

                    {/* Code view */}
                    {entity.showCodeView !== false && (
                        <CodeView data={codeData} label="View Code" />
                    )}
                </VStack>
            </HStack>

            {/* Result feedback */}
            {playState === 'success' && (
                <Box className="p-4 rounded-lg bg-success/20 border border-success text-center">
                    <Typography variant="h5" className="text-success">
                        {entity.successMessage || t('stateArchitect.allPassed')}
                    </Typography>
                </Box>
            )}
            {playState === 'fail' && (
                <VStack gap="sm">
                    <Box className="p-4 rounded-lg bg-warning/10 border border-warning/30 text-center">
                        <Typography variant="body1" className="text-foreground font-medium">
                            {t(ENCOURAGEMENT_KEYS[Math.min(attempts - 1, ENCOURAGEMENT_KEYS.length - 1)] ?? ENCOURAGEMENT_KEYS[0])}
                        </Typography>
                    </Box>
                    {attempts >= 3 && entity.hint && (
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
                        onClick={handleTest}
                        disabled={playState !== 'editing'}
                    >
                        {'\u25B6 ' + t('game.runTests')}
                    </Button>
                )}
                <Button variant="ghost" onClick={handleReset}>
                    {'\u21BA ' + t('game.reset')}
                </Button>
            </HStack>
        </VStack>
    );
}

StateArchitectBoard.displayName = 'StateArchitectBoard';

export default StateArchitectBoard;
