/* eslint-disable almadar/organism-rendering-state-only, almadar/organism-extends-entity-display, almadar/no-raw-dom-elements, almadar/require-event-bus */
/**
 * NegotiatorBoard
 *
 * Turn-based decision matrix game. The player makes choices
 * over multiple rounds against an AI opponent. Each round
 * both sides pick an action, and payoffs are determined by
 * the combination.
 *
 * Good for: ethics, business, game theory, economics stories.
 *
 * Events emitted via completeEvent (default UI:PUZZLE_COMPLETE).
 */

import React, { useState, useCallback } from 'react';
import { Box, VStack, HStack, Card, Button, Typography, Badge, Icon } from '../../../../atoms';
import { useEventBus } from '../../../../../hooks/useEventBus';
import { useTranslate } from '../../../../../hooks/useTranslate';
import type { EntityDisplayProps } from '../../../types';
import { CheckCircle, ArrowRight } from 'lucide-react';

export interface NegotiatorAction {
  id: string;
  label: string;
  description?: string;
}

export interface PayoffEntry {
  playerAction: string;
  opponentAction: string;
  playerPayoff: number;
  opponentPayoff: number;
}

export interface NegotiatorPuzzleEntity {
  id: string;
  title: string;
  description: string;
  actions: NegotiatorAction[];
  payoffMatrix: PayoffEntry[];
  totalRounds: number;
  /** AI strategy: 'tit-for-tat' | 'always-cooperate' | 'always-defect' | 'random' */
  opponentStrategy: string;
  targetScore: number;
  successMessage?: string;
  failMessage?: string;
  hint?: string;
  /** Header image URL displayed above the title */
  headerImage?: string;
  /** Visual theme overrides */
  theme?: { background?: string; accentColor?: string };
}

export interface NegotiatorBoardProps extends Omit<EntityDisplayProps, 'entity'> {
  entity: NegotiatorPuzzleEntity;
  completeEvent?: string;
}

interface RoundResult {
  round: number;
  playerAction: string;
  opponentAction: string;
  playerPayoff: number;
  opponentPayoff: number;
}

function getOpponentAction(
  strategy: string,
  actions: NegotiatorAction[],
  history: RoundResult[],
): string {
  const actionIds = actions.map((a) => a.id);
  switch (strategy) {
    case 'always-cooperate':
      return actionIds[0];
    case 'always-defect':
      return actionIds[actionIds.length - 1];
    case 'tit-for-tat':
      if (history.length === 0) return actionIds[0];
      return history[history.length - 1].playerAction;
    case 'random':
    default:
      return actionIds[Math.floor(Math.random() * actionIds.length)];
  }
}

export function NegotiatorBoard({
  entity,
  completeEvent = 'PUZZLE_COMPLETE',
  className,
}: NegotiatorBoardProps): React.JSX.Element {
  const { emit } = useEventBus();
  const { t } = useTranslate();

  const [history, setHistory] = useState<RoundResult[]>([]);
  const [headerError, setHeaderError] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const currentRound = history.length;
  const isComplete = currentRound >= entity.totalRounds;
  const playerTotal = history.reduce((s, r) => s + r.playerPayoff, 0);
  const opponentTotal = history.reduce((s, r) => s + r.opponentPayoff, 0);
  const won = isComplete && playerTotal >= entity.targetScore;

  const handleAction = useCallback((actionId: string) => {
    if (isComplete) return;
    const opponentAction = getOpponentAction(entity.opponentStrategy, entity.actions, history);
    const payoff = entity.payoffMatrix.find(
      (p) => p.playerAction === actionId && p.opponentAction === opponentAction,
    );
    const result: RoundResult = {
      round: currentRound + 1,
      playerAction: actionId,
      opponentAction,
      playerPayoff: payoff?.playerPayoff ?? 0,
      opponentPayoff: payoff?.opponentPayoff ?? 0,
    };
    const newHistory = [...history, result];
    setHistory(newHistory);

    if (newHistory.length >= entity.totalRounds) {
      const total = newHistory.reduce((s, r) => s + r.playerPayoff, 0);
      if (total >= entity.targetScore) {
        emit(`UI:${completeEvent}`, { success: true, score: total });
      }
      if (newHistory.length >= 3 && entity.hint) {
        setShowHint(true);
      }
    }
  }, [isComplete, entity, history, currentRound, completeEvent, emit]);

  const handleReset = () => {
    setHistory([]);
    setShowHint(false);
  };

  const getActionLabel = (id: string) => entity.actions.find((a) => a.id === id)?.label ?? id;

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
            <HStack gap="md">
              <Badge size="sm">{t('negotiator.round', { current: String(currentRound), total: String(entity.totalRounds) })}</Badge>
              <Badge size="sm">{t('negotiator.target')}: {entity.targetScore}</Badge>
            </HStack>
          </VStack>
        </Card>

        {/* Score */}
        <HStack gap="md" justify="center">
          <Card className="p-4 flex-1 text-center">
            <VStack gap="xs" align="center">
              <Typography variant="caption" className="text-[var(--color-muted-foreground)]">{t('negotiator.you')}</Typography>
              <Typography variant="h3" weight="bold">{playerTotal}</Typography>
            </VStack>
          </Card>
          <Card className="p-4 flex-1 text-center">
            <VStack gap="xs" align="center">
              <Typography variant="caption" className="text-[var(--color-muted-foreground)]">{t('negotiator.opponent')}</Typography>
              <Typography variant="h3" weight="bold">{opponentTotal}</Typography>
            </VStack>
          </Card>
        </HStack>

        {/* Action buttons */}
        {!isComplete && (
          <Card className="p-4">
            <VStack gap="sm">
              <Typography variant="small" weight="bold" className="uppercase tracking-wider text-[var(--color-muted-foreground)]">
                {t('negotiator.chooseAction')}
              </Typography>
              <HStack gap="sm" justify="center" className="flex-wrap">
                {entity.actions.map((action) => (
                  <Button
                    key={action.id}
                    variant="primary"
                    onClick={() => handleAction(action.id)}
                  >
                    {action.label}
                  </Button>
                ))}
              </HStack>
            </VStack>
          </Card>
        )}

        {/* History */}
        {history.length > 0 && (
          <Card className="p-4">
            <VStack gap="sm">
              <Typography variant="small" weight="bold" className="uppercase tracking-wider text-[var(--color-muted-foreground)]">
                {t('negotiator.history')}
              </Typography>
              {history.map((round) => (
                <HStack key={round.round} gap="sm" align="center" className="text-sm">
                  <Badge size="sm">R{round.round}</Badge>
                  <Typography variant="caption">{getActionLabel(round.playerAction)}</Typography>
                  <Typography variant="caption" className="text-[var(--color-muted-foreground)]">vs</Typography>
                  <Typography variant="caption">{getActionLabel(round.opponentAction)}</Typography>
                  <Icon icon={ArrowRight} size="xs" />
                  <Typography variant="caption" weight="bold" className="text-green-600">+{round.playerPayoff}</Typography>
                  <Typography variant="caption" className="text-[var(--color-muted-foreground)]">/ +{round.opponentPayoff}</Typography>
                </HStack>
              ))}
            </VStack>
          </Card>
        )}

        {/* Result */}
        {isComplete && (
          <Card className="p-4">
            <VStack gap="sm" align="center">
              <Icon icon={CheckCircle} size="lg" className={won ? 'text-green-600' : 'text-red-600'} />
              <Typography variant="body" weight="bold">
                {won
                  ? (entity.successMessage ?? t('negotiator.success'))
                  : (entity.failMessage ?? t('negotiator.failed'))}
              </Typography>
              <Typography variant="caption" className="text-[var(--color-muted-foreground)]">
                {t('negotiator.finalScore')}: {playerTotal}/{entity.targetScore}
              </Typography>
            </VStack>
          </Card>
        )}

        {showHint && entity.hint && !won && (
          <Card className="p-4 border-l-4 border-l-yellow-500">
            <Typography variant="body">{entity.hint}</Typography>
          </Card>
        )}

        {isComplete && !won && (
          <HStack justify="center">
            <Button variant="primary" onClick={handleReset}>
              {t('negotiator.playAgain')}
            </Button>
          </HStack>
        )}
      </VStack>
    </Box>
  );
}

NegotiatorBoard.displayName = 'NegotiatorBoard';
