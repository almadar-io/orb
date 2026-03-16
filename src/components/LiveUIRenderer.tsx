/**
 * LiveUIRenderer - Renders Almadar UI patterns from S-expressions
 * 
 * This component evaluates S-expressions and renders actual @almadar/ui components
 * instead of just showing JSON output. It uses mock data (no server required).
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { OrbitalSchema, SExpr } from '@almadar/core';

// Import @almadar/ui components that can be rendered
// These are the patterns supported by render-ui
import {
  Badge,
  ProgressBar,
  Alert,
  Heading,
  Text,
  Button,
  Card,
  VStack,
  HStack,
  Box,
  Input,
  Select,
  Checkbox,
  Spinner,
  Avatar,
  Icon,
  Divider,
} from '@almadar/ui';

// Type for render-ui effect calls
interface RenderUICall {
  slot: string;
  pattern: string;
  props: Record<string, unknown>;
}

// Mock entity storage
interface MockEntityStore {
  [entityName: string]: Array<Record<string, unknown>>;
}

interface LiveUIRendererProps {
  /** S-expression code to evaluate */
  code: string;
  /** Mock entity data for the runtime */
  mockData: MockEntityStore;
  /** Callback when evaluation completes */
  onEvaluated?: (calls: RenderUICall[], error: string | null) => void;
}

// Pattern component registry (typed as any for flexibility)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PATTERN_COMPONENTS: Record<string, React.ComponentType<any>> = {
  'badge': Badge,
  'progress-bar': ProgressBar,
  'alert': Alert,
  'heading': Heading,
  'text': Text,
  'button': Button,
  'card': Card,
  'vstack': VStack,
  'hstack': HStack,
  'box': Box,
  'input': Input,
  'select': Select,
  'checkbox': Checkbox,
  'spinner': Spinner,
  'avatar': Avatar,
  'icon': Icon,
  'divider': Divider,
};

/**
 * Evaluate S-expression and extract render-ui calls
 */
async function evaluateAndExtractRenders(
  code: string,
  mockData: MockEntityStore
): Promise<{ calls: RenderUICall[]; error: string | null }> {
  try {
    const input = code.trim();
    if (!input) {
      return { calls: [], error: null };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(input);
    } catch {
      return {
        calls: [],
        error: 'JSON parse error: not a valid s-expression. Expressions must be JSON arrays like ["op", arg1, arg2]',
      };
    }

    // Dynamic import of evaluator (browser-only)
    const { SExpressionEvaluator, createMinimalContext, createEffectContext } = await import('@almadar/evaluator');
    
    const evaluator = new SExpressionEvaluator();
    
    // Create context with mock entity data
    const entityState: Record<string, Record<string, unknown>> = {};
    
    // Initialize entity state from mockData
    Object.entries(mockData).forEach(([entityName, records]) => {
      if (records.length > 0) {
        // Use first record as the default entity state
        entityState[entityName] = { ...records[0] };
      }
    });
    
    const ctx = createMinimalContext({}, entityState, 'initial');
    
    // Collect render-ui calls
    const calls: RenderUICall[] = [];
    const effectCtx = createEffectContext(ctx, {
      renderUI: (slot: string, pattern: unknown, props?: Record<string, unknown>) => {
        calls.push({ 
          slot: String(slot), 
          pattern: String(pattern), 
          props: props ?? {} 
        });
      },
    });

    evaluator.evaluate(parsed as SExpr, effectCtx);
    
    return { calls, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { calls: [], error: message };
  }
}

/**
 * Render a pattern component with props
 */
function PatternComponent({ 
  pattern, 
  props 
}: { 
  pattern: string; 
  props: Record<string, unknown> 
}): React.ReactElement {
  const Component = PATTERN_COMPONENTS[pattern];
  
  if (!Component) {
    return (
      <Box 
        style={{ 
          padding: '1rem', 
          background: '#fef2f2', 
          border: '1px solid #fecaca',
          borderRadius: '8px',
          color: '#dc2626'
        }}
      >
        <Text>Unknown pattern: "{pattern}"</Text>
        <Text variant="body2">Available: {Object.keys(PATTERN_COMPONENTS).join(', ')}</Text>
      </Box>
    );
  }

  // Process props - handle children array specially
  const processedProps = { ...props };
  
  // Handle nested children (for layout patterns like vstack/hstack)
  if (props.children && Array.isArray(props.children)) {
    processedProps.children = props.children.map((child: unknown, index: number) => {
      if (typeof child === 'object' && child !== null) {
        const childObj = child as { type?: string; props?: Record<string, unknown> };
        if (childObj.type) {
          return (
            <PatternComponent 
              key={index}
              pattern={childObj.type} 
              props={childObj.props ?? {}} 
            />
          );
        }
      }
      return child;
    });
  }

  // Convert string numbers to actual numbers for certain props
  const numberProps = ['value', 'max', 'level', 'gap', 'size'];
  numberProps.forEach(prop => {
    if (typeof processedProps[prop] === 'string') {
      const num = Number(processedProps[prop]);
      if (!isNaN(num)) {
        processedProps[prop] = num;
      }
    }
  });

  return <Component {...processedProps} />;
}

/**
 * Main LiveUIRenderer component
 */
export function LiveUIRenderer({ 
  code, 
  mockData, 
  onEvaluated 
}: LiveUIRendererProps): React.ReactElement {
  const [calls, setCalls] = useState<RenderUICall[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const evaluate = useCallback(async () => {
    setIsLoading(true);
    const result = await evaluateAndExtractRenders(code, mockData);
    setCalls(result.calls);
    setError(result.error);
    setIsLoading(false);
    onEvaluated?.(result.calls, result.error);
  }, [code, mockData, onEvaluated]);

  // Evaluate when code or mockData changes
  useEffect(() => {
    evaluate();
  }, [evaluate]);

  if (isLoading) {
    return (
      <Box 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '100%',
          gap: '0.75rem',
          color: '#64748b'
        }}
      >
        <Spinner size="md" />
        <Text>Evaluating...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        style={{ 
          padding: '1rem', 
          background: '#fef2f2', 
          border: '1px solid #fecaca',
          borderRadius: '8px'
        }}
      >
        <Heading level={4} style={{ color: '#dc2626', marginBottom: '0.5rem' }}>
          Evaluation Error
        </Heading>
        <Text style={{ color: '#7f1d1d' }}>{error}</Text>
      </Box>
    );
  }

  if (calls.length === 0) {
    return (
      <Box 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '100%',
          color: '#64748b',
          textAlign: 'center',
          padding: '2rem'
        }}
      >
        <Text>
          No render-ui calls produced. Try an expression like:<br />
          <code style={{ color: '#14b8a6' }}>
            {JSON.stringify(['render-ui', 'main', 'badge', { label: 'Hello' }], null, 2)}
          </code>
        </Text>
      </Box>
    );
  }

  // Render all captured UI calls
  return (
    <VStack 
      gap="lg" 
      style={{ 
        padding: '1.5rem',
        minHeight: '100%',
        background: '#0f172a'
      }}
    >
      {calls.map((call, index) => (
        <Box 
          key={index}
          style={{
            border: '1px solid #334155',
            borderRadius: '12px',
            overflow: 'hidden',
            background: '#1e293b'
          }}
        >
          {/* Header showing slot and pattern */}
          <Box 
            style={{
              padding: '0.5rem 1rem',
              background: 'rgba(20, 184, 166, 0.1)',
              borderBottom: '1px solid #334155'
            }}
          >
            <HStack justify="between">
              <Text 
                variant="body2" 
                style={{ 
                  color: '#14b8a6',
                  fontFamily: 'IBM Plex Mono, monospace',
                  fontWeight: 600
                }}
              >
                Slot: "{call.slot}"
              </Text>
              <Text 
                variant="body2" 
                style={{ 
                  color: '#94a3b8',
                  fontFamily: 'IBM Plex Mono, monospace'
                }}
              >
                Pattern: "{call.pattern}"
              </Text>
            </HStack>
          </Box>
          
          {/* Rendered component */}
          <Box style={{ padding: '1.5rem' }}>
            <PatternComponent pattern={call.pattern} props={call.props} />
          </Box>
          
          {/* Props display (collapsible in future) */}
          <Box 
            style={{
              padding: '0.75rem 1rem',
              background: '#0f172a',
              borderTop: '1px solid #334155'
            }}
          >
            <Text 
              variant="caption" 
              style={{ 
                color: '#64748b',
                fontFamily: 'IBM Plex Mono, monospace',
                fontSize: '11px'
              }}
            >
              Props: {JSON.stringify(call.props)}
            </Text>
          </Box>
        </Box>
      ))}
    </VStack>
  );
}

// Export types for external use
export type { RenderUICall, MockEntityStore };
