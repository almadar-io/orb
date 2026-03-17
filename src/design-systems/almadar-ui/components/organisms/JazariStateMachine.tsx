'use client';

/**
 * JazariStateMachine — Al-Jazari themed state machine diagram.
 *
 * Thin wrapper around StateMachineView that:
 * 1. Extracts a state machine from an orbital schema (or accepts a trait directly)
 * 2. Converts it to DomLayoutData via the visualizer lib
 * 3. Applies Al-Jazari brass/gold/lapis color theme
 * 4. Renders gear-shaped state nodes via the renderStateNode prop
 */

import React, { useMemo } from 'react';
import { Box } from '../atoms/Box';
import { Typography } from '../atoms/Typography';
import { LoadingState } from '../molecules/LoadingState';
import { ErrorState } from '../molecules/ErrorState';
import { StateMachineView } from './StateMachineView';
import { renderStateMachineToDomData, DEFAULT_CONFIG } from '../../lib/visualizer/index.js';
import type { DomStateNode, VisualizerConfig, StateMachineDefinition } from '../../lib/visualizer/index.js';
import { gearTeethPath } from '../../lib/jazari/svg-paths';

import { useTranslate } from '../../hooks/useTranslate';
import { cn } from '../../lib/cn';
import type { EntityDisplayProps } from './types';

// ---------------------------------------------------------------------------
// Loose schema types (avoid hard dependency on @almadar/core)
// ---------------------------------------------------------------------------

interface SmState {
  name: string;
  isInitial?: boolean;
  isTerminal?: boolean;
  isFinal?: boolean;
}

interface SmTransition {
  from: string;
  to: string;
  event: string;
  guard?: unknown;
  effects?: unknown[];
}

interface SmStateMachine {
  states: SmState[];
  transitions: SmTransition[];
}

interface SmTrait {
  name: string;
  stateMachine?: SmStateMachine;
  linkedEntity?: string;
}

interface SmEntity {
  name: string;
  fields?: Array<{ name: string }>;
}

interface SmOrbital {
  entity?: SmEntity;
  traits?: SmTrait[];
}

interface SmSchema {
  orbitals?: SmOrbital[];
}

// ---------------------------------------------------------------------------
// Jazari theme config
// ---------------------------------------------------------------------------

/**
 * Theme-aware config: uses CSS custom properties so colors adapt to
 * whichever theme (minimalist-light, almadar-dark, trait-wars, …) is active.
 */
const JAZARI_VISUALIZER_CONFIG: VisualizerConfig = {
  ...DEFAULT_CONFIG,
  colors: {
    background: 'var(--color-card)',
    node: 'var(--color-card)',
    nodeBorder: 'var(--color-border)',
    nodeText: 'var(--color-foreground)',
    initialNode: 'var(--color-success)',
    finalNode: 'var(--color-error)',
    arrow: 'var(--color-muted-foreground)',
    arrowText: 'var(--color-foreground)',
    effectText: 'var(--color-warning)',
    guardText: 'var(--color-error)',
    initial: 'var(--color-success)',
  },
  fonts: {
    node: "18px 'Noto Naskh Arabic', serif",
    event: "13px 'JetBrains Mono', monospace",
    effect: "12px 'JetBrains Mono', monospace",
  },
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface JazariStateMachineProps extends EntityDisplayProps<SmSchema> {
  /** Full schema — extracts first trait's state machine */
  schema?: SmSchema;
  /** Or pass a single trait directly */
  trait?: SmTrait;
  /** Which trait to visualize (default: 0) */
  traitIndex?: number;
  /** Override entity field labels */
  entityFields?: string[];
  /** Text direction (default: 'ltr') */
  direction?: 'ltr' | 'rtl';
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractTrait(
  schema: SmSchema | undefined,
  trait: SmTrait | undefined,
  traitIndex: number,
): SmTrait | null {
  if (trait) return trait;
  if (!schema?.orbitals?.length) return null;
  for (const orbital of schema.orbitals) {
    const traits = orbital.traits ?? [];
    if (traitIndex < traits.length) {
      return traits[traitIndex];
    }
  }
  return null;
}

function extractEntityFields(schema: SmSchema | undefined): string[] {
  if (!schema?.orbitals?.length) return [];
  const entity = schema.orbitals[0].entity;
  if (!entity?.fields) return [];
  return entity.fields.map((f) => f.name);
}

function toStateMachineDefinition(sm: SmStateMachine): StateMachineDefinition {
  return {
    states: sm.states.map((s) => ({
      name: s.name,
      isInitial: s.isInitial,
      isFinal: s.isTerminal ?? s.isFinal,
    })),
    transitions: sm.transitions.map((t) => ({
      from: t.from,
      to: t.to,
      event: t.event,
      guard: t.guard,
      effects: t.effects,
    })),
  };
}

// ---------------------------------------------------------------------------
// Gear node renderer
// ---------------------------------------------------------------------------

const GEAR_INNER_RADIUS = 0.6;
const GEAR_NUM_TEETH = 12;
const GEAR_TEETH_DEPTH = 7;

function renderJazariGearNode(state: DomStateNode, config: VisualizerConfig): React.ReactNode {
  const outerR = state.radius * 0.5 + GEAR_TEETH_DEPTH;
  const innerR = state.radius * 0.5 - 2;
  const coreR = state.radius * 0.5 * GEAR_INNER_RADIUS;

  const fillColor = state.isInitial ? config.colors.initialNode : config.colors.nodeBorder;
  const teethD = gearTeethPath(state.radius, state.radius, innerR, outerR, GEAR_NUM_TEETH);

  const label = state.name.length > 10 ? `${state.name.slice(0, 9)}…` : state.name;
  const fontSize = state.name.length > 7 ? 11 : 14;

  const size = state.radius * 2;

  return (
    <Box
      className="absolute"
      style={{
        left: state.x - state.radius,
        top: state.y - state.radius,
        width: size,
        height: size,
        zIndex: 5,
      }}
      action="STATE_CLICK"
      actionPayload={{ stateName: state.name }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Glow for initial */}
        {state.isInitial && (
          <defs>
            <filter id={`jazari-glow-${state.name}`}>
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        )}

        {/* Gear teeth */}
        <path
          d={teethD}
          fill={fillColor}
          fillOpacity={0.2}
          stroke={fillColor}
          strokeWidth={1.5}
          strokeDasharray={state.isFinal ? '4 3' : undefined}
          filter={state.isInitial ? `url(#jazari-glow-${state.name})` : undefined}
        />

        {/* Inner circle */}
        <circle
          cx={state.radius}
          cy={state.radius}
          r={coreR}
          fill={fillColor}
          fillOpacity={0.15}
          stroke={fillColor}
          strokeWidth={1}
          strokeDasharray={state.isFinal ? '4 3' : undefined}
        />

        {/* State name */}
        <text
          x={state.radius}
          y={state.radius}
          textAnchor="middle"
          dominantBaseline="central"
          fill={config.colors.nodeText}
          fontSize={fontSize}
          fontWeight={600}
          fontFamily="'Noto Naskh Arabic', serif"
        >
          {label}
        </text>
      </svg>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const JazariStateMachine: React.FC<JazariStateMachineProps> = ({
  schema,
  trait: traitProp,
  traitIndex = 0,
  entityFields: entityFieldsProp,
  direction = 'ltr',
  className,
  isLoading = false,
  error = null,
}) => {
  const { t } = useTranslate();
  void t;

  const resolvedTrait = useMemo(
    () => extractTrait(schema, traitProp, traitIndex),
    [schema, traitProp, traitIndex],
  );

  const entityFields = useMemo(
    () => entityFieldsProp ?? extractEntityFields(schema),
    [entityFieldsProp, schema],
  );

  const layoutData = useMemo(() => {
    if (!resolvedTrait?.stateMachine) return null;
    const sm = toStateMachineDefinition(resolvedTrait.stateMachine);
    const entityDef = entityFields.length > 0
      ? { name: 'entity', fields: entityFields }
      : undefined;
    return renderStateMachineToDomData(
      sm,
      { title: resolvedTrait.name, entity: entityDef },
      JAZARI_VISUALIZER_CONFIG,
    );
  }, [resolvedTrait, entityFields]);

  if (isLoading) {
    return <LoadingState message="Loading state machine…" />;
  }

  if (error) {
    return <ErrorState message={error instanceof Error ? error.message : String(error)} />;
  }

  if (!resolvedTrait || !layoutData || layoutData.states.length === 0) {
    return (
      <Box padding="lg" className={cn('text-center', className)}>
        <Typography variant="body" className="opacity-60">
          No state machine to visualize
        </Typography>
      </Box>
    );
  }

  return (
    <StateMachineView
      layoutData={layoutData}
      renderStateNode={renderJazariGearNode}
      className={cn('jazari-state-machine', className)}
    />
  );
};

JazariStateMachine.displayName = 'JazariStateMachine';
