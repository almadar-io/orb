'use client';
/**
 * WizardContainer Component
 *
 * Multi-step wizard pattern with progress indicator.
 * Composes Box, Typography, and Button atoms.
 *
 * Uses wireframe theme styling (high contrast, sharp edges).
 */
import React, { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Button } from "../atoms/Button";
import { Typography } from "../atoms/Typography";
import { Box } from "../atoms/Box";
import { HStack } from "../atoms/Stack";
import { Icon } from "../atoms/Icon";
import { cn } from "../../lib/cn";
import { useTranslate } from "../../hooks/useTranslate";

/** Form field definition for wizard sections */
export interface WizardField {
  id: string;
  type: string;
  label?: string;
  required?: boolean;
  repeatable?: boolean;
  options?: Array<{ value: string; label: string; isDefault?: boolean }>;
  defaultValue?: unknown;
  condition?: unknown[];
  placeholder?: string;
  entityField?: string;
  minLength?: number;
  maxLength?: number;
  dataSource?: Record<string, unknown>;
  displayFields?: string[];
  searchConfig?: Record<string, unknown>;
  hiddenCalculations?: Array<{
    variable: string;
    expression: unknown;
    scope?: string;
  }>;
  signatureConfig?: Record<string, unknown>;
  displayTemplate?: Record<string, unknown>;
  lawReference?: Record<string, unknown>;
  contextMenu?: string[];
  calculated?: Record<string, unknown>;
  readOnly?: boolean;
  minDate?: unknown;
  stats?: Array<{ label: string; value: unknown; icon?: string }>;
  items?: Array<{ id: string; label: string; autoCheck?: unknown }>;
  [key: string]: unknown;
}

/** Section within a wizard step */
export interface WizardSection {
  id: string;
  title?: string;
  description?: string;
  fields?: WizardField[];
  subsections?: WizardSection[];
  condition?: unknown[];
  repeatable?: boolean;
  minItems?: number;
  addButtonLabel?: string;
  hiddenCalculations?: Array<{
    variable: string;
    expression: unknown;
    scope?: string;
  }>;
  dataSource?: Record<string, unknown>;
  readOnly?: boolean;
  [key: string]: unknown;
}

/** Entity mapping configuration */
export interface WizardEntityMapping {
  entity: string;
  mode:
    | "search_or_create"
    | "create_multiple"
    | "select_one"
    | "update"
    | string;
  parentField?: string;
  idField?: string;
  [key: string]: unknown;
}

/** Validation rule for wizard steps */
export interface WizardValidationRule {
  condition: unknown[];
  message: string;
}

/** Law reference for compliance */
export interface WizardLawReference {
  law: string;
  article: string;
  description?: string;
}

export interface WizardStep {
  /** Step identifier */
  id?: string;
  /** Tab identifier (schema-driven) */
  tabId?: string;
  /** Step title */
  title?: string;
  /** Step name (schema-driven, used as title if title not provided) */
  name?: string;
  /** Step description (optional) */
  description?: string;
  /** Step content (React component mode) */
  content?: React.ReactNode;
  /** Whether this step can be skipped */
  optional?: boolean;
  /** Custom validation for this step */
  isValid?: () => boolean;

  // Schema-driven wizard properties
  /** Form sections within this step */
  sections?: WizardSection[];
  /** Global variables required before entering this step */
  globalVariablesRequired?: string[];
  /** Global variables set by this step */
  globalVariablesSet?: string[];
  /** Local variables scoped to this step */
  localVariables?: string[];
  /** Entity mapping configuration */
  entityMapping?: WizardEntityMapping;
  /** Validation rules for this step */
  validationRules?: WizardValidationRule[];
  /** Law references for compliance */
  lawReferences?: WizardLawReference[];
  /** Phase of the inspection process */
  phase?: string;
  /** Context menu actions */
  contextMenu?: string[];

  /** Allow additional properties from schema */
  [key: string]: unknown;
}

export interface WizardContainerProps {
  /** Wizard steps */
  steps: WizardStep[];
  /** Current step index (controlled) - accepts unknown for generated code compatibility */
  currentStep?: number | string | unknown;
  /** Callback when step changes */
  onStepChange?: (stepIndex: number) => void;
  /** Callback when wizard is completed */
  onComplete?: () => void;
  /** Show progress indicator */
  showProgress?: boolean;
  /** Allow navigation to previous steps */
  allowBack?: boolean;
  /** Modal mode (compact header, no padding) */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity type name (schema-driven) */
  entity?: string;
}

/**
 * WizardContainer - Multi-step wizard
 */
export const WizardContainer: React.FC<WizardContainerProps> = ({
  steps,
  currentStep: controlledStep,
  onStepChange,
  onComplete,
  showProgress = true,
  allowBack = true,
  compact = false,
  className,
  entity: _entity, // Accept but don't use directly yet
}) => {
  const { t } = useTranslate();
  const [internalStep, setInternalStep] = useState(0);

  // Normalize controlledStep to number (handles string/unknown from generated code)
  const normalizedControlledStep = (() => {
    if (controlledStep === undefined || controlledStep === null)
      return undefined;
    if (typeof controlledStep === "number") return controlledStep;
    if (typeof controlledStep === "string") return parseInt(controlledStep, 10);
    // Handle unknown - try to convert to number
    const num = Number(controlledStep);
    return isNaN(num) ? undefined : num;
  })();
  const currentStep =
    normalizedControlledStep !== undefined
      ? normalizedControlledStep
      : internalStep;
  const totalSteps = steps.length;
  const currentStepData = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  const goToStep = useCallback(
    (stepIndex: number) => {
      if (stepIndex < 0 || stepIndex >= totalSteps) return;

      if (controlledStep === undefined) {
        setInternalStep(stepIndex);
      }
      onStepChange?.(stepIndex);
    },
    [controlledStep, totalSteps, onStepChange],
  );

  const handleNext = () => {
    // Validate current step if validator exists
    if (currentStepData.isValid && !currentStepData.isValid()) {
      return;
    }

    if (isLastStep) {
      onComplete?.();
    } else {
      goToStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstStep && allowBack) {
      goToStep(currentStep - 1);
    }
  };

  return (
    <Box className={cn("flex flex-col h-full", className)}>
      {/* Progress indicator */}
      {showProgress && (
        <Box
          border
          className={cn(
            "border-b-2 border-x-0 border-t-0 border-[var(--color-border)]",
            compact ? "px-4 py-2" : "px-6 py-4",
          )}
        >
          <HStack gap="sm" align="center" className="flex-wrap">
            {steps.map((step, index) => {
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              // Use id, tabId, or index as key; use title or name for display
              const stepKey = step.id ?? step.tabId ?? `step-${index}`;
              const stepTitle = step.title ?? step.name ?? `Step ${index + 1}`;

              return (
                <React.Fragment key={stepKey}>
                  {/* Step indicator */}
                  <Button
                    onClick={() => isCompleted && allowBack && goToStep(index)}
                    disabled={!isCompleted || !allowBack}
                    className={cn(
                      "w-8 h-8 flex items-center justify-center text-sm font-bold transition-colors",
                      "border-2 border-[var(--color-border)]",
                      isActive &&
                        "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]",
                      isCompleted &&
                        "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] cursor-pointer hover:bg-[var(--color-primary-hover)]",
                      !isActive &&
                        !isCompleted &&
                        "bg-[var(--color-card)] text-[var(--color-foreground)]",
                    )}
                  >
                    {isCompleted ? <Icon icon={Check} size="sm" /> : index + 1}
                  </Button>

                  {/* Step title (on desktop) */}
                  <Box
                    className={cn(
                      "hidden md:block",
                      isActive
                        ? "text-[var(--color-foreground)] font-bold"
                        : "text-[var(--color-muted-foreground)]",
                    )}
                  >
                    <Typography
                      variant="small"
                      weight={isActive ? "bold" : "normal"}
                    >
                      {stepTitle}
                    </Typography>
                  </Box>

                  {/* Connector line */}
                  {index < totalSteps - 1 && (
                    <Box
                      className={cn(
                        "flex-1 h-0.5",
                        index < currentStep
                          ? "bg-[var(--color-primary)]"
                          : "bg-[var(--color-border)]",
                      )}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </HStack>
        </Box>
      )}

      {/* Step header */}
      {!compact && currentStepData && (
        <Box
          paddingX="lg"
          paddingY="md"
          border
          className="border-b-2 border-x-0 border-t-0 border-[var(--color-border)]"
        >
          <Typography variant="h4" as="h2">
            {currentStepData.title ??
              currentStepData.name ??
              `Step ${currentStep + 1}`}
          </Typography>
          {currentStepData.description && (
            <Typography
              variant="body2"
              className="text-[var(--color-muted-foreground)] mt-1"
            >
              {currentStepData.description}
            </Typography>
          )}
        </Box>
      )}

      {/* Step content */}
      <Box className={cn("flex-1 overflow-auto", compact ? "p-4" : "p-6")}>
        {currentStepData?.content}
      </Box>

      {/* Navigation buttons */}
      <Box
        border
        className={cn(
          "border-t-2 border-x-0 border-b-0 border-[var(--color-border)] flex justify-between",
          compact ? "px-4 py-2" : "px-6 py-4",
        )}
      >
        <Button
          variant="secondary"
          onClick={handleBack}
          disabled={isFirstStep || !allowBack}
        >
          <Icon icon={ChevronLeft} size="sm" />
          {t('wizard.back')}
        </Button>

        <HStack gap="sm" align="center">
          <Typography
            variant="caption"
            className="text-[var(--color-muted-foreground)]"
          >
            {t('wizard.stepOf', { current: String(currentStep + 1), total: String(steps.length) })}
          </Typography>
        </HStack>

        <Button variant="primary" onClick={handleNext}>
          {isLastStep ? t('wizard.complete') : t('wizard.next')}
          {!isLastStep && <Icon icon={ChevronRight} size="sm" />}
        </Button>
      </Box>
    </Box>
  );
};

WizardContainer.displayName = "WizardContainer";

export default WizardContainer;
