/**
 * CounterTemplate
 *
 * A presentational template for counter/incrementer features.
 * Supports increment, decrement, and reset operations.
 */

import React from "react";
import { cn } from "../../lib/cn";
import { Container } from "../molecules/Container";
import { VStack, HStack } from "../atoms/Stack";
import { Typography } from "../atoms/Typography";
import { Button } from "../atoms/Button";
import { Minus, Plus, RotateCcw } from "lucide-react";
import type { TemplateProps } from "./types";

export type CounterSize = "sm" | "md" | "lg";
export type CounterVariant = "minimal" | "standard" | "full";

export interface CounterEntity {
  /** Entity ID */
  id: string;
  /** Current count value */
  count: number;
  /** Whether decrement button is disabled */
  decrementDisabled?: boolean;
  /** Whether increment button is disabled */
  incrementDisabled?: boolean;
  /** Step label for decrement button (e.g. "-5") */
  decrementLabel?: string;
  /** Step label for increment button (e.g. "+5") */
  incrementLabel?: string;
  /** Formatted range text (e.g. "Range: 0 to 100") */
  rangeText?: string;
}

export interface CounterTemplateProps extends TemplateProps<CounterEntity> {
  /** Called when increment is clicked */
  onIncrement?: () => void;
  /** Called when decrement is clicked */
  onDecrement?: () => void;
  /** Called when reset is clicked */
  onReset?: () => void;
  /** Title displayed above the counter */
  title?: string;
  /** Show reset button */
  showReset?: boolean;
  /** Counter display size */
  size?: CounterSize;
  /** Template variant */
  variant?: CounterVariant;
}

const sizeStyles: Record<
  CounterSize,
  { display: string; button: "sm" | "md" | "lg" }
> = {
  sm: { display: "text-4xl", button: "sm" },
  md: { display: "text-6xl", button: "md" },
  lg: { display: "text-8xl", button: "lg" },
};

function CounterMinimal({
  entity,
  size = "md",
  onDecrement,
  onIncrement,
  className,
}: CounterTemplateProps): React.JSX.Element {
  return (
    <HStack gap="lg" align="center" justify="center" className={className}>
      <Button
        variant="secondary"
        size={sizeStyles[size].button}
        onClick={onDecrement}
        disabled={entity.decrementDisabled}
        icon={Minus}
      >
        {entity.decrementLabel}
      </Button>
      <Typography
        variant="h1"
        className={cn(
          sizeStyles[size].display,
          "font-bold tabular-nums min-w-[3ch] text-center",
        )}
      >
        {entity.count}
      </Typography>
      <Button
        variant="secondary"
        size={sizeStyles[size].button}
        onClick={onIncrement}
        disabled={entity.incrementDisabled}
        icon={Plus}
      >
        {entity.incrementLabel}
      </Button>
    </HStack>
  );
}
CounterMinimal.displayName = "CounterMinimal";

function CounterStandard({
  entity,
  size = "md",
  title = "Counter",
  showReset = true,
  onDecrement,
  onIncrement,
  onReset,
  className,
}: CounterTemplateProps): React.JSX.Element {
  return (
    <Container size="sm" padding="lg" className={className}>
      <VStack gap="lg" align="center">
        <Typography
          variant="h2"
          className="text-[var(--color-muted-foreground)]"
        >
          {title}
        </Typography>
        <Typography
          variant="h1"
          className={cn(
            sizeStyles[size].display,
            "font-bold tabular-nums text-primary-600",
          )}
        >
          {entity.count}
        </Typography>
        <HStack gap="md">
          <Button
            variant="secondary"
            size={sizeStyles[size].button}
            onClick={onDecrement}
            disabled={entity.decrementDisabled}
            icon={Minus}
          />
          <Button
            variant="primary"
            size={sizeStyles[size].button}
            onClick={onIncrement}
            disabled={entity.incrementDisabled}
            icon={Plus}
          />
        </HStack>
        {showReset && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            icon={RotateCcw}
          >
            Reset
          </Button>
        )}
      </VStack>
    </Container>
  );
}
CounterStandard.displayName = "CounterStandard";

function CounterFull({
  entity,
  size = "md",
  title = "Counter",
  showReset = true,
  onDecrement,
  onIncrement,
  onReset,
  className,
}: CounterTemplateProps): React.JSX.Element {
  return (
    <Container size="sm" padding="lg" className={className}>
      <VStack gap="xl" align="center">
        <Typography
          variant="h2"
          className="text-[var(--color-muted-foreground)]"
        >
          {title}
        </Typography>
        <VStack gap="sm" align="center">
          <Typography
            variant="h1"
            className={cn(
              sizeStyles[size].display,
              "font-bold tabular-nums text-primary-600",
            )}
          >
            {entity.count}
          </Typography>
          {entity.rangeText && (
            <Typography variant="small" color="muted">
              {entity.rangeText}
            </Typography>
          )}
        </VStack>
        <HStack gap="md">
          <Button
            variant="secondary"
            size={sizeStyles[size].button}
            onClick={onDecrement}
            disabled={entity.decrementDisabled}
            icon={Minus}
          >
            {entity.decrementLabel}
          </Button>
          <Button
            variant="primary"
            size={sizeStyles[size].button}
            onClick={onIncrement}
            disabled={entity.incrementDisabled}
            icon={Plus}
          >
            {entity.incrementLabel}
          </Button>
        </HStack>
        {showReset && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            icon={RotateCcw}
          >
            Reset to 0
          </Button>
        )}
      </VStack>
    </Container>
  );
}
CounterFull.displayName = "CounterFull";

export const CounterTemplate: React.FC<CounterTemplateProps> = (props) => {
  switch (props.variant) {
    case "minimal":
      return <CounterMinimal {...props} />;
    case "full":
      return <CounterFull {...props} />;
    default:
      return <CounterStandard {...props} />;
  }
};

CounterTemplate.displayName = "CounterTemplate";

export default CounterTemplate;
