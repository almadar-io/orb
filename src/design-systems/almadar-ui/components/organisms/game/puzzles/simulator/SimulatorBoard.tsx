/* eslint-disable almadar/organism-rendering-state-only, almadar/no-raw-dom-elements, almadar/organism-extends-entity-display */
/**
 * SimulatorBoard
 *
 * Parameter-slider game board. The player adjusts parameters
 * and observes real-time output. Correct parameter values
 * must bring the output within a target range to win.
 *
 * Good for: physics, economics, system design stories.
 *
 * Events emitted via completeEvent (default UI:PUZZLE_COMPLETE).
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Box, VStack, HStack, Card, Button, Typography, Badge, Icon } from '../../../../atoms';
import { useEventBus } from '../../../../../hooks/useEventBus';
import { useTranslate } from '../../../../../hooks/useTranslate';
import type { EntityDisplayProps } from '../../../types';
import { Play, RotateCcw, CheckCircle, XCircle } from 'lucide-react';

export interface SimulatorParameter {
  id: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  initial: number;
  correct: number;
  tolerance: number;
}

export interface SimulatorPuzzleEntity {
  id: string;
  title: string;
  description: string;
  parameters: SimulatorParameter[];
  outputLabel: string;
  outputUnit: string;
  /** Pure function body as string: receives params object, returns number */
  computeExpression: string;
  targetValue: number;
  targetTolerance: number;
  successMessage?: string;
  failMessage?: string;
  hint?: string;
  /** Header image URL displayed above the title */
  headerImage?: string;
  /** Visual theme overrides */
  theme?: { background?: string; accentColor?: string };
}

export interface SimulatorBoardProps extends Omit<EntityDisplayProps, 'entity'> {
  entity: SimulatorPuzzleEntity;
  completeEvent?: string;
}

export function SimulatorBoard({
  entity,
  completeEvent = 'PUZZLE_COMPLETE',
  className,
}: SimulatorBoardProps): React.JSX.Element {
  const { emit } = useEventBus();
  const { t } = useTranslate();

  const [values, setValues] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    for (const p of entity.parameters) {
      init[p.id] = p.initial;
    }
    return init;
  });
  const [headerError, setHeaderError] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const computeOutput = useCallback((params: Record<string, number>): number => {
    try {
      const fn = new Function('params', `return (${entity.computeExpression})`);
      return fn(params) as number;
    } catch {
      return 0;
    }
  }, [entity.computeExpression]);

  const output = useMemo(() => computeOutput(values), [computeOutput, values]);
  const isCorrect = Math.abs(output - entity.targetValue) <= entity.targetTolerance;

  const handleParameterChange = (id: string, value: number) => {
    if (submitted) return;
    setValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setAttempts((a) => a + 1);
    if (isCorrect) {
      emit(`UI:${completeEvent}`, { success: true, attempts: attempts + 1 });
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    if (attempts >= 2 && entity.hint) {
      setShowHint(true);
    }
  };

  const handleFullReset = () => {
    const init: Record<string, number> = {};
    for (const p of entity.parameters) {
      init[p.id] = p.initial;
    }
    setValues(init);
    setSubmitted(false);
    setAttempts(0);
    setShowHint(false);
  };

  return (
    <Box
      className={className}
      style={{
        backgroundImage: entity.theme?.background ? `url(${entity.theme.background})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <VStack gap="lg" className="p-4">
        {/* Header image */}
        {entity.headerImage && !headerError ? (
          <Box className="w-full h-32 overflow-hidden rounded-lg">
            <img src={entity.headerImage} alt="" onError={() => setHeaderError(true)} className="w-full h-full object-cover" />
          </Box>
        ) : entity.headerImage && headerError ? (
          <Box className="w-full h-32 rounded-lg bg-gradient-to-br from-[var(--color-muted)] to-[var(--color-accent)] opacity-60" />
        ) : null}

        <Card className="p-4">
          <VStack gap="sm">
            <Typography variant="h4" weight="bold">{entity.title}</Typography>
            <Typography variant="body">{entity.description}</Typography>
          </VStack>
        </Card>

        {/* Parameter sliders */}
        <Card className="p-4">
          <VStack gap="md">
            <Typography variant="small" weight="bold" className="uppercase tracking-wider text-[var(--color-muted-foreground)]">
              {t('simulator.parameters')}
            </Typography>
            {entity.parameters.map((param) => (
              <VStack key={param.id} gap="xs">
                <HStack justify="between" align="center">
                  <Typography variant="body" weight="medium">{param.label}</Typography>
                  <Badge size="sm">{values[param.id]} {param.unit}</Badge>
                </HStack>
                <input
                  type="range"
                  min={param.min}
                  max={param.max}
                  step={param.step}
                  value={values[param.id]}
                  onChange={(e) => handleParameterChange(param.id, Number(e.target.value))}
                  disabled={submitted}
                  className="w-full accent-[var(--color-foreground)]"
                />
                <HStack justify="between">
                  <Typography variant="caption" className="text-[var(--color-muted-foreground)]">{param.min} {param.unit}</Typography>
                  <Typography variant="caption" className="text-[var(--color-muted-foreground)]">{param.max} {param.unit}</Typography>
                </HStack>
              </VStack>
            ))}
          </VStack>
        </Card>

        {/* Output display */}
        <Card className="p-4">
          <VStack gap="sm" align="center">
            <Typography variant="small" weight="bold" className="uppercase tracking-wider text-[var(--color-muted-foreground)]">
              {entity.outputLabel}
            </Typography>
            <Typography variant="h3" weight="bold">
              {output.toFixed(2)} {entity.outputUnit}
            </Typography>
            {submitted && (
              <HStack gap="xs" align="center">
                <Icon icon={isCorrect ? CheckCircle : XCircle} size="sm" className={isCorrect ? 'text-green-600' : 'text-red-600'} />
                <Typography variant="body" className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                  {isCorrect
                    ? (entity.successMessage ?? t('simulator.correct'))
                    : (entity.failMessage ?? t('simulator.incorrect'))}
                </Typography>
              </HStack>
            )}
            <Typography variant="caption" className="text-[var(--color-muted-foreground)]">
              {t('simulator.target')}: {entity.targetValue} {entity.outputUnit} (±{entity.targetTolerance})
            </Typography>
          </VStack>
        </Card>

        {/* Hint */}
        {showHint && entity.hint && (
          <Card className="p-4 border-l-4 border-l-yellow-500">
            <Typography variant="body">{entity.hint}</Typography>
          </Card>
        )}

        {/* Actions */}
        <HStack gap="sm" justify="center">
          {!submitted ? (
            <Button variant="primary" onClick={handleSubmit}>
              <Icon icon={Play} size="sm" />
              {t('simulator.simulate')}
            </Button>
          ) : !isCorrect ? (
            <Button variant="primary" onClick={handleReset}>
              {t('simulator.tryAgain')}
            </Button>
          ) : null}
          <Button variant="secondary" onClick={handleFullReset}>
            <Icon icon={RotateCcw} size="sm" />
            {t('simulator.reset')}
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}

SimulatorBoard.displayName = 'SimulatorBoard';
