'use client';
import React from "react";
import { cn } from "../../lib/cn";
import { Spinner } from "../atoms";
import { VStack } from "../atoms/Stack";
import { Typography } from "../atoms/Typography";
import { useTranslate } from "../../hooks/useTranslate";

export interface LoadingStateProps {
  title?: string;
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  title,
  message,
  className,
}) => {
  const { t } = useTranslate();
  const displayMessage = message ?? t('common.loading');
  return (
    <VStack
      align="center"
      className={cn(
        "justify-center py-12",
        className,
      )}
    >
      <Spinner size="lg" />
      {title && (
        <Typography variant="h3" className="mt-4 text-lg font-semibold text-[var(--color-foreground)]">
          {title}
        </Typography>
      )}
      <Typography
        variant="small"
        className={cn(
          "text-[var(--color-muted-foreground)]",
          title ? "mt-2" : "mt-4",
        )}
      >
        {displayMessage}
      </Typography>
    </VStack>
  );
};

LoadingState.displayName = "LoadingState";
