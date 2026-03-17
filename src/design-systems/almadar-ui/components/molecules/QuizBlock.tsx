/**
 * QuizBlock Molecule Component
 *
 * A collapsible Q&A block for embedded quiz questions in content.
 * Shows the question with a reveal button for the answer.
 *
 * Event Contract:
 * - No events emitted (self-contained interaction)
 * - entityAware: false
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { Card } from './Card';
import { VStack, HStack } from '../atoms/Stack';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';
import { Icon } from '../atoms/Icon';
import { Box } from '../atoms/Box';
import { useTranslate } from '../../hooks/useTranslate';
import { cn } from '../../lib/cn';

export interface QuizBlockProps {
  /** The quiz question */
  question: string;
  /** The quiz answer (revealed on toggle) */
  answer: string;
  /** Additional CSS classes */
  className?: string;
}

export const QuizBlock: React.FC<QuizBlockProps> = ({
  question,
  answer,
  className,
}) => {
  const { t } = useTranslate();
  const [revealed, setRevealed] = useState(false);

  return (
    <Card className={cn('my-4 border-blue-200 dark:border-blue-800', className)}>
      <VStack gap="sm" className="p-4">
        <HStack gap="sm" align="start">
          <Icon icon={HelpCircle} size="sm" className="text-blue-500 mt-0.5 shrink-0" />
          <Typography variant="body" className="font-medium">
            {question}
          </Typography>
        </HStack>

        {revealed ? (
          <Box className="pl-7 pt-2 border-t border-gray-200 dark:border-gray-700">
            <Typography variant="body" className="text-[var(--color-muted-foreground)]">
              {answer}
            </Typography>
          </Box>
        ) : null}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setRevealed((r) => !r)}
          className="self-start ml-7"
        >
          <HStack gap="xs" align="center">
            <Typography variant="caption">
              {revealed ? t('quiz.hideAnswer') : t('quiz.showAnswer')}
            </Typography>
            {revealed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </HStack>
        </Button>
      </VStack>
    </Card>
  );
};

QuizBlock.displayName = 'QuizBlock';
