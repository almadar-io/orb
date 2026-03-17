/**
 * ConditionalWrapper Atom Component
 *
 * A wrapper component that conditionally renders its children based on
 * S-expression evaluation. Used for dynamic field visibility in inspection forms.
 */

import React from 'react';
import { Box } from './Box';
import {
  evaluate,
  createMinimalContext,
  type SExpr,
  type EvaluationContext as SharedEvaluationContext,
} from '@almadar/evaluator';

/**
 * Context for conditional evaluation
 */
export interface ConditionalContext {
  formValues: Record<string, unknown>;
  globalVariables: Record<string, unknown>;
  localVariables?: Record<string, unknown>;
  entity?: Record<string, unknown>;
}

export interface ConditionalWrapperProps {
  /** The S-expression condition to evaluate */
  condition?: SExpr;
  /** Context for evaluating the condition */
  context: ConditionalContext;
  /** Children to render when condition is true (or when no condition is provided) */
  children: React.ReactNode;
  /** Optional fallback to render when condition is false */
  fallback?: React.ReactNode;
  /** Whether to animate the transition (uses CSS transitions) */
  animate?: boolean;
}

/**
 * Convert wrapper context to shared evaluator context.
 *
 * The entity object is structured as:
 * {
 *   formValues: { fieldId: value, ... },
 *   globalVariables: { HG_VAR: value, ... },
 *   localVariables: { H_VAR: value, ... },
 *   ...additionalEntityFields
 * }
 *
 * Bindings use: @entity.formValues.fieldId, @entity.globalVariables.HG_VAR
 */
function toSharedContext(ctx: ConditionalContext): SharedEvaluationContext {
  return createMinimalContext(
    {
      formValues: ctx.formValues,
      globalVariables: ctx.globalVariables,
      localVariables: ctx.localVariables ?? {},
      ...ctx.entity,
    },
    {},
    'active'
  );
}

/**
 * ConditionalWrapper conditionally renders children based on S-expression evaluation.
 *
 * Supported bindings:
 * - @entity.formValues.fieldId - Access form field values
 * - @entity.globalVariables.HG_VAR - Access global inspection variables
 * - @entity.localVariables.H_VAR - Access document-local variables
 * - @state - Current state machine state
 * - @now - Current timestamp
 *
 * @example
 * // Simple condition - show field when another field equals a value
 * <ConditionalWrapper
 *   condition={["=", "@entity.formValues.vehicleType", "commercial"]}
 *   context={{ formValues: { vehicleType: "commercial" }, globalVariables: {} }}
 * >
 *   <Input name="commercialLicenseNumber" />
 * </ConditionalWrapper>
 *
 * @example
 * // With fallback - show message when condition not met
 * <ConditionalWrapper
 *   condition={[">=", "@entity.formValues.loadWeight", 3500]}
 *   context={formContext}
 *   fallback={<Typography variant="small">Load weight must be at least 3500kg</Typography>}
 * >
 *   <HeavyVehicleFields />
 * </ConditionalWrapper>
 *
 * @example
 * // Using global variables for cross-form conditions
 * <ConditionalWrapper
 *   condition={["=", "@entity.globalVariables.HG_POTROSNIKI", "DA"]}
 *   context={{ formValues: {}, globalVariables: { HG_POTROSNIKI: "DA" } }}
 * >
 *   <PriceMarkingSection />
 * </ConditionalWrapper>
 */
export const ConditionalWrapper: React.FC<ConditionalWrapperProps> = ({
  condition,
  context,
  children,
  fallback = null,
  animate = false,
}) => {
  // If no condition is provided, always render children
  if (!condition) {
    return <>{children}</>;
  }

  // Evaluate the condition
  const sharedContext = toSharedContext(context);
  const result = evaluate(condition, sharedContext);
  const isVisible = Boolean(result);

  // Animate transitions if requested
  if (animate) {
    return (
      <Box
        overflow="hidden"
        className={`transition-all duration-200 ${
          isVisible ? 'opacity-100 max-h-[1000px]' : 'opacity-0 max-h-0'
        }`}
      >
        {isVisible ? children : fallback}
      </Box>
    );
  }

  // Simple conditional rendering
  return isVisible ? <>{children}</> : <>{fallback}</>;
};

ConditionalWrapper.displayName = 'ConditionalWrapper';
