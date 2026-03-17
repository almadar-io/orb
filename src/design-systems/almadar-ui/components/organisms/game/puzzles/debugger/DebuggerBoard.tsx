/**
 * DebuggerBoard
 *
 * Error-finding game board. The player reviews a code/system
 * listing and identifies lines or elements that contain bugs.
 *
 * Good for: programming, logic, troubleshooting stories.
 *
 * Events emitted via completeEvent (default UI:PUZZLE_COMPLETE).
 */

/* eslint-disable almadar/organism-rendering-state-only, almadar/no-raw-dom-elements, almadar/require-event-bus */

import React, { useState, useCallback } from 'react';
import { Box, VStack, HStack, Card, Button, Typography, Badge, Icon } from '../../../../atoms';
import { useEventBus } from '../../../../../hooks/useEventBus';
import { useTranslate } from '../../../../../hooks/useTranslate';
import type { EntityDisplayProps } from '../../../types';
import { CheckCircle, XCircle, RotateCcw, Bug, Send } from 'lucide-react';

export interface DebuggerLine {
  id: string;
  content: string;
  isBug: boolean;
  explanation?: string;
}

export interface DebuggerPuzzleEntity {
  id: string;
  title: string;
  description: string;
  language?: string;
  lines: DebuggerLine[];
  /** How many bugs the player should find */
  bugCount: number;
  successMessage?: string;
  failMessage?: string;
  hint?: string;
  /** Header image URL displayed above the title */
  headerImage?: string;
  /** Visual theme overrides */
  theme?: { background?: string; accentColor?: string };
}

export interface DebuggerBoardProps extends Omit<EntityDisplayProps, 'entity'> {
  entity: DebuggerPuzzleEntity;
  completeEvent?: string;
}

export function DebuggerBoard({
  entity,
  completeEvent = 'PUZZLE_COMPLETE',
  className,
}: DebuggerBoardProps): React.JSX.Element {
  const { emit } = useEventBus();
  const { t } = useTranslate();

  const [flaggedLines, setFlaggedLines] = useState<Set<string>>(new Set());
  const [headerError, setHeaderError] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const toggleLine = (lineId: string) => {
    if (submitted) return;
    setFlaggedLines((prev) => {
      const next = new Set(prev);
      if (next.has(lineId)) {
        next.delete(lineId);
      } else {
        next.add(lineId);
      }
      return next;
    });
  };

  const bugLines = entity.lines.filter((l) => l.isBug);
  const correctFlags = entity.lines.filter((l) => l.isBug && flaggedLines.has(l.id));
  const falseFlags = entity.lines.filter((l) => !l.isBug && flaggedLines.has(l.id));
  const allCorrect = submitted && correctFlags.length === bugLines.length && falseFlags.length === 0;

  const handleSubmit = useCallback(() => {
    setSubmitted(true);
    setAttempts((a) => a + 1);
    const correct = correctFlags.length === bugLines.length && falseFlags.length === 0;
    if (correct) {
      emit(`UI:${completeEvent}`, { success: true, attempts: attempts + 1 });
    }
  }, [correctFlags.length, bugLines.length, falseFlags.length, attempts, completeEvent, emit]);

  const handleReset = () => {
    setSubmitted(false);
    if (attempts >= 2 && entity.hint) {
      setShowHint(true);
    }
  };

  const handleFullReset = () => {
    setFlaggedLines(new Set());
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
            <HStack gap="xs" align="center">
              <Icon icon={Bug} size="sm" />
              <Typography variant="h4" weight="bold">{entity.title}</Typography>
            </HStack>
            <Typography variant="body">{entity.description}</Typography>
            <Typography variant="caption" className="text-[var(--color-muted-foreground)]">
              {t('debugger.findBugs', { count: String(entity.bugCount) })}
            </Typography>
          </VStack>
        </Card>

        {/* Code listing */}
        <Card className="p-0 overflow-hidden">
          <VStack gap="none">
            {entity.lines.map((line, i) => {
              const isFlagged = flaggedLines.has(line.id);
              let lineStyle = '';
              if (submitted) {
                if (line.isBug && isFlagged) lineStyle = 'bg-green-50 dark:bg-green-950';
                else if (line.isBug && !isFlagged) lineStyle = 'bg-yellow-50 dark:bg-yellow-950';
                else if (!line.isBug && isFlagged) lineStyle = 'bg-red-50 dark:bg-red-950';
              } else if (isFlagged) {
                lineStyle = 'bg-red-50 dark:bg-red-950';
              }

              return (
                <HStack
                  key={line.id}
                  gap="none"
                  align="stretch"
                  className={`border-b border-[var(--color-border)] cursor-pointer hover:bg-[var(--color-muted)] ${lineStyle}`}
                  onClick={() => toggleLine(line.id)}
                >
                  <Box className="w-10 flex-shrink-0 flex items-center justify-center border-r border-[var(--color-border)] text-[var(--color-muted-foreground)]">
                    <Typography variant="caption">{i + 1}</Typography>
                  </Box>
                  <Box className="flex-1 px-3 py-1.5 font-mono text-sm whitespace-pre">
                    <Typography variant="body" className="font-mono text-sm">{line.content}</Typography>
                  </Box>
                  <Box className="w-8 flex-shrink-0 flex items-center justify-center">
                    {isFlagged && <Icon icon={Bug} size="xs" className="text-red-600" />}
                    {submitted && line.isBug && !isFlagged && <Icon icon={Bug} size="xs" className="text-yellow-600" />}
                  </Box>
                </HStack>
              );
            })}
          </VStack>
        </Card>

        {/* Explanations after submit */}
        {submitted && (
          <Card className="p-4">
            <VStack gap="sm">
              <Typography variant="body" weight="bold">
                {allCorrect
                  ? (entity.successMessage ?? t('debugger.allFound'))
                  : `${correctFlags.length}/${bugLines.length} ${t('debugger.bugsFound')}`}
              </Typography>
              {bugLines.map((line) => (
                <HStack key={line.id} gap="xs" align="start">
                  <Icon
                    icon={flaggedLines.has(line.id) ? CheckCircle : XCircle}
                    size="xs"
                    className={flaggedLines.has(line.id) ? 'text-green-600 mt-0.5' : 'text-yellow-600 mt-0.5'}
                  />
                  <VStack gap="none">
                    <Typography variant="caption" weight="bold" className="font-mono">{line.content.trim()}</Typography>
                    {line.explanation && (
                      <Typography variant="caption" className="text-[var(--color-muted-foreground)]">{line.explanation}</Typography>
                    )}
                  </VStack>
                </HStack>
              ))}
            </VStack>
          </Card>
        )}

        {showHint && entity.hint && (
          <Card className="p-4 border-l-4 border-l-yellow-500">
            <Typography variant="body">{entity.hint}</Typography>
          </Card>
        )}

        <HStack gap="sm" justify="center">
          {!submitted ? (
            <Button variant="primary" onClick={handleSubmit} disabled={flaggedLines.size === 0}>
              <Icon icon={Send} size="sm" />
              {t('debugger.submit')}
            </Button>
          ) : !allCorrect ? (
            <Button variant="primary" onClick={handleReset}>
              {t('debugger.tryAgain')}
            </Button>
          ) : null}
          <Button variant="secondary" onClick={handleFullReset}>
            <Icon icon={RotateCcw} size="sm" />
            {t('debugger.reset')}
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}

DebuggerBoard.displayName = 'DebuggerBoard';
