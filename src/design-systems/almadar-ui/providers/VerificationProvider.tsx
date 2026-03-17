'use client';
/**
 * VerificationProvider
 *
 * Wires the verification registry to both compiled and runtime execution paths.
 *
 * **Compiled apps**: Intercepts event bus lifecycle events
 *   (`{traitName}:DISPATCH`, `{traitName}:{event}:SUCCESS`, `{traitName}:{event}:ERROR`)
 *   emitted by `useOrbitalBridge` and records transitions via `recordTransition()`.
 *
 * **Runtime apps**: Accepts an optional `StateMachineManager` and wires its
 *   `TransitionObserver` to `recordTransition()`.
 *
 * **Both**: Calls `bindEventBus()` and `bindTraitStateGetter()` to populate
 *   `window.__orbitalVerification` for Playwright/automation.
 *
 * @packageDocumentation
 */

import React, { useEffect, useRef, type ReactNode } from 'react';
import { useEventBus } from '../hooks/useEventBus';
import {
  recordTransition,
  bindEventBus,
  bindTraitStateGetter,
  registerCheck,
  type EffectTrace,
} from '../lib/verificationRegistry';

// ============================================================================
// Types
// ============================================================================

/**
 * Observer interface compatible with `StateMachineManager.setObserver()`.
 * Defined locally to avoid hard dependency on `@almadar/runtime`.
 */
interface TransitionObserver {
  onTransition(trace: {
    traitName: string;
    from: string;
    to: string;
    event: string;
    guardResult?: boolean;
    effects: Array<{
      type: string;
      args: unknown[];
      status: 'executed' | 'failed' | 'skipped';
      error?: string;
      durationMs?: number;
    }>;
  }): void;
}

/**
 * Minimal interface for StateMachineManager — avoids importing the full runtime.
 */
interface StateMachineManagerLike {
  setObserver(observer: TransitionObserver): void;
  getState?(traitName: string): string | undefined;
}

export interface VerificationProviderProps {
  children: ReactNode;
  /** Enable verification wiring (default: true in dev, false in prod) */
  enabled?: boolean;
  /** Optional runtime StateMachineManager for interpreted mode */
  runtimeManager?: StateMachineManagerLike;
  /** Optional trait state getter for compiled apps (maps traitName → currentState) */
  traitStateGetter?: (traitName: string) => string | undefined;
}

// ============================================================================
// Pending dispatch tracker
// ============================================================================

interface PendingDispatch {
  traitName: string;
  event: string;
  from: string | undefined;
  timestamp: number;
}

// ============================================================================
// Event type pattern matchers
// ============================================================================

const DISPATCH_SUFFIX = ':DISPATCH';
const SUCCESS_SUFFIX = ':SUCCESS';
const ERROR_SUFFIX = ':ERROR';

/**
 * Parse a lifecycle event type into its components.
 *
 * - `"{traitName}:DISPATCH"` → { kind: 'dispatch', traitName }
 * - `"{traitName}:{event}:SUCCESS"` → { kind: 'success', traitName, event }
 * - `"{traitName}:{event}:ERROR"` → { kind: 'error', traitName, event }
 */
function parseLifecycleEvent(type: string): {
  kind: 'dispatch' | 'success' | 'error';
  traitName: string;
  event?: string;
} | null {
  if (type.endsWith(DISPATCH_SUFFIX)) {
    const traitName = type.slice(0, -DISPATCH_SUFFIX.length);
    if (traitName) return { kind: 'dispatch', traitName };
  } else if (type.endsWith(SUCCESS_SUFFIX)) {
    const rest = type.slice(0, -SUCCESS_SUFFIX.length);
    const colonIdx = rest.indexOf(':');
    if (colonIdx > 0) {
      return {
        kind: 'success',
        traitName: rest.slice(0, colonIdx),
        event: rest.slice(colonIdx + 1),
      };
    }
  } else if (type.endsWith(ERROR_SUFFIX)) {
    const rest = type.slice(0, -ERROR_SUFFIX.length);
    const colonIdx = rest.indexOf(':');
    if (colonIdx > 0) {
      return {
        kind: 'error',
        traitName: rest.slice(0, colonIdx),
        event: rest.slice(colonIdx + 1),
      };
    }
  }
  return null;
}

// ============================================================================
// Component
// ============================================================================

/**
 * VerificationProvider — wires the verification registry to the event bus
 * and optional runtime manager. Renders children unchanged.
 */
export function VerificationProvider({
  children,
  enabled,
  runtimeManager,
  traitStateGetter,
}: VerificationProviderProps): React.ReactElement {
  const isEnabled = enabled ?? (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production');
  const eventBus = useEventBus();
  const pendingRef = useRef<Map<string, PendingDispatch>>(new Map());

  // ── Compiled app path: intercept lifecycle events via onAny ──
  useEffect(() => {
    if (!isEnabled) return;
    if (!eventBus.onAny) return;

    const unsub = eventBus.onAny((evt) => {
      const parsed = parseLifecycleEvent(evt.type);
      if (!parsed) return;

      const payload = evt.payload ?? {};

      if (parsed.kind === 'dispatch') {
        // Store pending dispatch to correlate with SUCCESS/ERROR
        const key = `${parsed.traitName}:${String(payload['event'] ?? '')}`;
        pendingRef.current.set(key, {
          traitName: parsed.traitName,
          event: String(payload['event'] ?? ''),
          from: payload['currentState'] as string | undefined,
          timestamp: evt.timestamp,
        });
      } else if (parsed.kind === 'success' && parsed.event) {
        const key = `${parsed.traitName}:${parsed.event}`;
        const pending = pendingRef.current.get(key);
        pendingRef.current.delete(key);

        const newState = (payload['newState'] ?? payload['state'] ?? 'unknown') as string;
        const effects: EffectTrace[] = Array.isArray(payload['clientEffects'])
          ? (payload['clientEffects'] as Array<Record<string, unknown>>).map((e) => ({
              type: String(e['type'] ?? 'unknown'),
              args: Array.isArray(e['args']) ? e['args'] : [],
              status: 'executed' as const,
            }))
          : [];

        recordTransition({
          traitName: parsed.traitName,
          from: pending?.from ?? 'unknown',
          to: newState,
          event: parsed.event,
          effects,
          timestamp: Date.now(),
        });
      } else if (parsed.kind === 'error' && parsed.event) {
        const key = `${parsed.traitName}:${parsed.event}`;
        const pending = pendingRef.current.get(key);
        pendingRef.current.delete(key);

        const errorMsg = (payload['error'] ?? 'Unknown error') as string;

        recordTransition({
          traitName: parsed.traitName,
          from: pending?.from ?? 'unknown',
          to: pending?.from ?? 'unknown', // state didn't change on error
          event: parsed.event,
          effects: [{
            type: 'server-call',
            args: [],
            status: 'failed',
            error: errorMsg,
          }],
          timestamp: Date.now(),
        });
      }
    });

    registerCheck(
      'verification-provider',
      'VerificationProvider active (compiled path)',
      'pass',
    );

    return unsub;
  }, [isEnabled, eventBus]);

  // ── Runtime path: wire StateMachineManager observer ──
  useEffect(() => {
    if (!isEnabled) return;
    if (!runtimeManager) return;

    runtimeManager.setObserver({
      onTransition(trace) {
        recordTransition({
          traitName: trace.traitName,
          from: trace.from,
          to: trace.to,
          event: trace.event,
          guardResult: trace.guardResult,
          effects: trace.effects,
          timestamp: Date.now(),
        });
      },
    });

    registerCheck(
      'verification-provider',
      'VerificationProvider active (runtime path)',
      'pass',
    );
  }, [isEnabled, runtimeManager]);

  // ── Bind event bus for Playwright sendEvent() ──
  useEffect(() => {
    if (!isEnabled) return;
    bindEventBus(eventBus);
  }, [isEnabled, eventBus]);

  // ── Bind trait state getter for Playwright getTraitState() ──
  useEffect(() => {
    if (!isEnabled) return;

    if (traitStateGetter) {
      bindTraitStateGetter(traitStateGetter);
    } else if (runtimeManager?.getState) {
      const mgr = runtimeManager;
      bindTraitStateGetter((traitName) => mgr.getState!(traitName));
    }
  }, [isEnabled, traitStateGetter, runtimeManager]);

  return <>{children}</>;
}

VerificationProvider.displayName = 'VerificationProvider';
