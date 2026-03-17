'use client';

/**
 * StateMachineView - Reusable State Machine Visualizer
 *
 * A hybrid DOM/SVG component for visualizing state machines.
 * Uses SVG for arrow paths, DOM for tooltips.
 *
 * Moved from projects/builder to @almadar/ui for reuse across projects.
 *
 * BUNDLING: When multiple transitions exist between the same states (same direction),
 * they are bundled into a single arrow with a badge showing the count.
 * Hovering shows all events and their effects in a detailed tooltip.
 *
 * Events Emitted:
 * - UI:STATE_CLICK - When a state node is clicked
 * - UI:TRANSITION_CLICK - When a transition bundle is clicked
 */

import React, { useState, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import type {
  DomLayoutData,
  DomStateNode,
  DomTransitionLabel,
  DomEntityBox,
  DomOutputsBox,
  VisualizerConfig,
} from '../../lib/visualizer/index.js';
import { Box } from '../atoms/Box';
import { VStack } from '../atoms/Stack';
import { HStack } from '../atoms/Stack';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';
import { Icon } from '../atoms/Icon';
import { useTranslate } from '../../hooks/useTranslate';
import { useEventListener } from '../../hooks/useEventBus';
import { cn } from '../../lib/cn';
import type { EntityDisplayProps } from './types';
import { X } from 'lucide-react';

// =============================================================================
// Types
// =============================================================================

/** Bundled transitions between same from→to states */
export interface TransitionBundle {
  id: string;
  from: string;
  to: string;
  labels: DomTransitionLabel[];
  isBidirectional: boolean;
  isReverse: boolean;
}

interface TooltipState {
  visible: boolean;
  pinned: boolean;
  x: number;
  y: number;
  bundle: TransitionBundle | null;
}

export interface StateMachineViewProps extends EntityDisplayProps<DomLayoutData> {
  layoutData: DomLayoutData;
  /** Custom state node renderer — when provided, replaces the default circle nodes */
  renderStateNode?: (state: DomStateNode, config: VisualizerConfig) => React.ReactNode;
}

// =============================================================================
// Sub-Components
// =============================================================================

/** Renders a single state node as a positioned div with a circle */
const StateNode: React.FC<{
  state: DomStateNode;
  config: VisualizerConfig;
}> = ({ state, config }) => {
  const { t } = useTranslate();
  void t;

  const size = state.radius * 2;

  let borderColor = config.colors.nodeBorder;
  let borderWidth = 2;

  if (state.isInitial) {
    borderColor = config.colors.initialNode;
    borderWidth = 3;
  } else if (state.isFinal) {
    borderColor = config.colors.finalNode;
    borderWidth = 3;
  }

  return (
    <Box
      className="absolute flex items-center justify-center cursor-pointer transition-all hover:scale-105"
      style={{
        left: state.x - state.radius,
        top: state.y - state.radius,
        width: size,
        height: size,
        zIndex: 5,
      }}
      action="STATE_CLICK"
      actionPayload={{ stateName: state.name }}
      title={state.description}
    >
      {/* Main circle */}
      <Box
        className="absolute inset-0 rounded-full flex items-center justify-center"
        style={{
          backgroundColor: config.colors.node,
          border: `${borderWidth}px solid ${borderColor}`,
        }}
      >
        {/* Inner circle for final states */}
        {state.isFinal && (
          <Box
            className="absolute rounded-full"
            style={{
              width: size - 12,
              height: size - 12,
              border: `2px solid ${borderColor}`,
            }}
          />
        )}
        <Typography
          variant="label"
          weight="semibold"
          align="center"
          className="px-2"
          style={{
            color: config.colors.nodeText,
            fontSize: '18px',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {state.name}
        </Typography>
      </Box>

      {/* Initial state indicator arrow */}
      {state.isInitial && (
        <svg
          className="absolute"
          style={{
            left: -45,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 40,
            height: 20,
          }}
        >
          <defs>
            <marker
              id="initial-arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill={config.colors.initial} />
            </marker>
          </defs>
          <path
            d="M 0 10 L 35 10"
            stroke={config.colors.initial}
            strokeWidth="2"
            fill="none"
            markerEnd="url(#initial-arrow)"
          />
        </svg>
      )}
    </Box>
  );
};

/**
 * Renders a transition bundle (one or more transitions same direction)
 */
const TransitionBundleArrow: React.FC<{
  bundle: TransitionBundle;
  states: DomStateNode[];
  bundleIndex: number;
  totalBundlesForPair: number;
  config: VisualizerConfig;
  onClick?: (bundle: TransitionBundle) => void;
  onHover: (bundle: TransitionBundle | null, x: number, y: number) => void;
}> = ({ bundle, states, bundleIndex, config, onClick, onHover }) => {
  const { t } = useTranslate();
  void t;

  const groupRef = useRef<SVGGElement>(null);

  const fromState = states.find(s => s.name === bundle.from);
  const toState = states.find(s => s.name === bundle.to);

  if (!fromState || !toState) return null;

  const isSelfLoop = bundle.from === bundle.to;

  const dx = toState.x - fromState.x;
  const dy = toState.y - fromState.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (isSelfLoop) {
    const loopRadius = 50 + bundleIndex * 25;
    const loopDirection = bundleIndex % 2 === 0 ? -1 : 1;

    const startAngle = loopDirection === -1 ? -0.5 : 0.5;
    const endAngle = loopDirection === -1 ? 0.5 : -0.5;

    const startX = fromState.x + Math.cos(Math.PI / 2 * loopDirection + startAngle) * fromState.radius;
    const startY = fromState.y + Math.sin(Math.PI / 2 * loopDirection + startAngle) * fromState.radius;
    const endX = fromState.x + Math.cos(Math.PI / 2 * loopDirection + endAngle) * fromState.radius;
    const endY = fromState.y + Math.sin(Math.PI / 2 * loopDirection + endAngle) * fromState.radius;

    const isSingle = bundle.labels.length === 1;
    const labelText = isSingle ? bundle.labels[0].event : `${bundle.labels.length} events`;
    const bundleColor = isSingle ? config.colors.arrow : 'var(--color-accent)';
    const labelWidth = labelText.length * 9 + (isSingle ? 24 : 40);

    const cx = fromState.x;
    const cy = fromState.y + (fromState.radius + loopRadius) * loopDirection;
    const loopPath = `M ${startX} ${startY} A ${loopRadius} ${loopRadius} 0 1 ${loopDirection === -1 ? 1 : 0} ${endX} ${endY}`;
    const labelX = cx;
    const labelY = cy + loopRadius * loopDirection * 0.5;

    const uniqueMarkerId = `arrow-self-${bundle.id}`;

    const handleMouseEnter = () => {
      if (groupRef.current) {
        const rect = groupRef.current.getBoundingClientRect();
        onHover(bundle, rect.left + rect.width / 2, rect.top - 8);
      }
    };

    const handleMouseLeave = () => {
      onHover(null, 0, 0);
    };

    return (
      <g
        ref={groupRef}
        className="transition-bundle cursor-pointer"
        data-bundle-id={bundle.id}
        // eslint-disable-next-line almadar/require-event-bus -- SVG <g> has no action prop
        onClick={() => onClick?.(bundle)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ pointerEvents: 'auto' }}
      >
        <defs>
          <marker
            id={uniqueMarkerId}
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="8"
            markerHeight="8"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={bundleColor} />
          </marker>
        </defs>
        <path
          d={loopPath}
          stroke={bundleColor}
          strokeWidth={isSingle ? 1.5 : 2.5}
          fill="none"
          markerEnd={`url(#${uniqueMarkerId})`}
        />
        <rect
          x={labelX - labelWidth / 2}
          y={labelY - 14}
          width={labelWidth}
          height={28}
          rx={isSingle ? 4 : 14}
          fill={isSingle ? config.colors.background : 'var(--color-accent)'}
          stroke={bundleColor}
          strokeWidth={isSingle ? 1 : 0}
        />
        <text
          x={labelX}
          y={labelY + 5}
          textAnchor="middle"
          fill={isSingle ? config.colors.arrowText : 'var(--color-accent-foreground)'}
          fontFamily="JetBrains Mono, monospace"
          fontSize="13px"
          fontWeight={isSingle ? 600 : 700}
        >
          {labelText}
        </text>
      </g>
    );
  }

  // Non-self-loop: normal transition
  if (dist === 0) return null;

  const nx = dx / dist;
  const ny = dy / dist;

  const startX = fromState.x + nx * fromState.radius;
  const startY = fromState.y + ny * fromState.radius;
  const endX = toState.x - nx * (toState.radius + 8);
  const endY = toState.y - ny * (toState.radius + 8);

  // Find intermediate states for obstacle avoidance
  const intermediateStates = states.filter(s => {
    if (s.name === bundle.from || s.name === bundle.to) return false;
    const t = ((s.x - fromState.x) * dx + (s.y - fromState.y) * dy) / (dist * dist);
    if (t < 0.1 || t > 0.9) return false;
    const projX = fromState.x + t * dx;
    const projY = fromState.y + t * dy;
    const distToLine = Math.sqrt((s.x - projX) ** 2 + (s.y - projY) ** 2);
    return distToLine < s.radius + 80;
  });

  const baseCurveDirection = bundle.isReverse ? 1 : -1;
  const laneOffset = 55 + bundleIndex * 55;

  let avoidanceOffset = 0;
  if (intermediateStates.length > 0) {
    const midXObst = (fromState.x + toState.x) / 2;
    const midYObst = (fromState.y + toState.y) / 2;
    const perpDirX = -ny;
    const perpDirY = nx;

    let obstaclesAbove = 0;
    let obstaclesBelow = 0;
    intermediateStates.forEach(s => {
      const relX = s.x - midXObst;
      const relY = s.y - midYObst;
      const perpDist = relX * perpDirX + relY * perpDirY;
      if (perpDist > 0) obstaclesAbove++;
      else obstaclesBelow++;
    });

    avoidanceOffset = obstaclesAbove > obstaclesBelow ? -100 : 100;
  }

  const baseOffset = bundle.isBidirectional ? 60 : 40;
  const curveAmount = (baseOffset + laneOffset) * baseCurveDirection + avoidanceOffset;

  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;
  const perpX = -ny * curveAmount;
  const perpY = nx * curveAmount;
  const controlX = midX + perpX;
  const controlY = midY + perpY;

  const isSingle = bundle.labels.length === 1;
  const labelText = isSingle ? bundle.labels[0].event : `${bundle.labels.length} events`;
  const labelWidth = labelText.length * 9 + (isSingle ? 24 : 40);
  const bundleColor = isSingle ? config.colors.arrow : 'var(--color-accent)';

  const curveMidpoint = {
    x: 0.25 * startX + 0.5 * controlX + 0.25 * endX,
    y: 0.25 * startY + 0.5 * controlY + 0.25 * endY,
  };
  const labelX = curveMidpoint.x;
  const labelY = curveMidpoint.y;

  const handleMouseEnter = useCallback(() => {
    if (groupRef.current) {
      const rect = groupRef.current.getBoundingClientRect();
      onHover(bundle, rect.left + rect.width / 2, rect.top - 8);
    }
  }, [bundle, onHover]);

  const handleMouseLeave = useCallback(() => {
    onHover(null, 0, 0);
  }, [onHover]);

  const uniqueMarkerId = `arrow-${bundle.id}`;
  const hasDetails = bundle.labels.some(l => l.hasDetails);

  return (
    <g
      ref={groupRef}
      className="transition-bundle cursor-pointer"
      data-bundle-id={bundle.id}
      // eslint-disable-next-line almadar/require-event-bus -- SVG <g> has no action prop
      onClick={() => onClick?.(bundle)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ pointerEvents: 'auto' }}
    >
      <defs>
        <marker
          id={uniqueMarkerId}
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="8"
          markerHeight="8"
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={bundleColor} />
        </marker>
      </defs>

      <path
        d={`M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`}
        stroke={bundleColor}
        strokeWidth={isSingle ? 1.5 : 2.5}
        fill="none"
        markerEnd={`url(#${uniqueMarkerId})`}
      />

      <rect
        x={labelX - labelWidth / 2}
        y={labelY - 14}
        width={labelWidth}
        height={28}
        rx={isSingle ? 4 : 14}
        fill={isSingle ? config.colors.background : 'var(--color-accent)'}
        stroke={bundleColor}
        strokeWidth={isSingle ? 1 : 0}
      />

      <text
        x={labelX}
        y={labelY + 5}
        textAnchor="middle"
        fill={isSingle ? config.colors.arrowText : 'var(--color-accent-foreground)'}
        fontFamily="JetBrains Mono, monospace"
        fontSize="13px"
        fontWeight={isSingle ? 600 : 700}
      >
        {labelText}
      </text>

      {isSingle && hasDetails && (
        <circle
          cx={labelX + labelWidth / 2 - 6}
          cy={labelY - 10}
          r={4}
          fill={config.colors.guardText}
        />
      )}

      {!isSingle && (
        <circle
          cx={labelX + labelWidth / 2 - 4}
          cy={labelY - 10}
          r={8}
          fill="var(--color-error)"
          stroke="var(--color-error-foreground)"
          strokeWidth={1}
        />
      )}
    </g>
  );
};

/** Portaled tooltip for transition bundle details */
const BundleTooltip: React.FC<{
  tooltip: TooltipState;
  config: VisualizerConfig;
}> = ({ tooltip, config }) => {
  const { t } = useTranslate();
  void t;

  if (!tooltip.visible || !tooltip.bundle) return null;

  const { bundle } = tooltip;
  const isSingle = bundle.labels.length === 1;

  const estimatedHeight = isSingle
    ? (bundle.labels[0].guardText || bundle.labels[0].effectTexts.length > 0 ? 120 : 60)
    : Math.min(400, 80 + bundle.labels.length * 60);

  const wouldGoOffTop = tooltip.y - estimatedHeight < 20;
  const safeX = Math.max(200, Math.min(tooltip.x, window.innerWidth - 200));
  const safeY = wouldGoOffTop ? tooltip.y + 40 : tooltip.y;
  const transform = wouldGoOffTop ? 'translateX(-50%)' : 'translate(-50%, -100%)';

  return createPortal(
    <Box
      className={cn(
        'fixed z-50 animate-in fade-in-0 zoom-in-95 duration-150',
        tooltip.pinned ? 'pointer-events-auto' : 'pointer-events-none',
      )}
      style={{
        left: safeX,
        top: safeY,
        transform,
        maxHeight: 'calc(100vh - 40px)',
        overflow: 'auto',
      }}
    >
      <Box
        className="rounded-lg shadow-xl border px-4 py-3 max-w-lg relative bg-card"
        style={{
          borderColor: tooltip.pinned ? 'var(--color-success)' : (isSingle ? config.colors.nodeBorder : 'var(--color-accent)'),
          borderWidth: tooltip.pinned ? 2 : (isSingle ? 1 : 2),
        }}
      >
        {/* Close button when pinned */}
        {tooltip.pinned && (
          <Button
            variant="ghost"
            size="sm"
            action="TOOLTIP_CLOSE"
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
            style={{ backgroundColor: 'var(--color-error)', padding: 0 }}
            title="Close"
          >
            <Icon icon={X} size="xs" style={{ color: 'var(--color-error-foreground)' }} />
          </Button>
        )}

        {/* Pinned indicator */}
        {tooltip.pinned && (
          <Box
            className="absolute -top-2 left-1/2 transform -translate-x-1/2 px-2 py-0.5 rounded-full"
            style={{ backgroundColor: 'var(--color-success)' }}
          >
            <Typography variant="caption" weight="semibold" style={{ color: 'var(--color-success-foreground)' }}>
              Pinned
            </Typography>
          </Box>
        )}

        {/* Header for bundles */}
        {!isSingle && (
          <HStack
            gap="sm"
            align="center"
            className="font-bold mb-3 pb-2 border-b"
            style={{
              color: 'var(--color-accent-foreground)',
              borderColor: 'var(--color-border)',
            }}
          >
            <Typography variant="large" style={{ color: 'var(--color-accent-foreground)' }}>{bundle.from}</Typography>
            <Typography variant="label" style={{ color: 'var(--color-muted-foreground)' }}>→</Typography>
            <Typography variant="large" style={{ color: 'var(--color-accent-foreground)' }}>{bundle.to}</Typography>
            <Box
              className="ml-2 px-2 py-0.5 rounded-full"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              <Typography variant="caption" style={{ color: 'var(--color-accent-foreground)' }}>
                {bundle.labels.length} events
              </Typography>
            </Box>
          </HStack>
        )}

        {/* Events list */}
        <VStack gap="sm">
          {bundle.labels.map((label, idx) => (
            <Box
              key={label.id}
              className={!isSingle && idx > 0 ? 'pt-2 border-t' : ''}
              style={{ borderColor: 'var(--color-border)' }}
            >
              {/* Event name */}
              <Typography
                variant="label"
                weight="semibold"
                className="mb-1"
                style={{
                  color: config.colors.arrowText,
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: isSingle ? '14px' : '13px',
                }}
              >
                {!isSingle && <Typography variant="caption" as="span" style={{ color: 'var(--color-muted-foreground)' }}>• </Typography>}
                {label.event}
              </Typography>

              {/* Guard */}
              {label.guardText && (
                <HStack gap="sm" align="start" className="ml-3 mb-0.5">
                  <Typography
                    variant="caption"
                    weight="semibold"
                    style={{ color: config.colors.guardText }}
                  >
                    if:
                  </Typography>
                  <Typography
                    variant="caption"
                    style={{ color: config.colors.guardText }}
                  >
                    {label.guardText}
                  </Typography>
                </HStack>
              )}

              {/* Effects */}
              {label.effectTexts.length > 0 && (
                <VStack gap="none" className="ml-3">
                  {label.effectTexts.map((effect, effIdx) => (
                    <HStack key={effIdx} gap="sm" align="start">
                      <Typography
                        variant="caption"
                        weight="semibold"
                        style={{ color: config.colors.effectText }}
                      >
                        {effIdx === 0 ? '→' : ' '}
                      </Typography>
                      <Typography
                        variant="caption"
                        style={{ color: config.colors.effectText }}
                      >
                        {effect}
                      </Typography>
                    </HStack>
                  ))}
                </VStack>
              )}
            </Box>
          ))}
        </VStack>
      </Box>
    </Box>,
    document.body,
  );
};

/** Entity input box */
const EntityBox: React.FC<{
  entity: DomEntityBox;
  config: VisualizerConfig;
}> = ({ entity, config }) => {
  const { t } = useTranslate();
  void t;

  return (
    <VStack
      gap="none"
      className="absolute rounded-lg border-2 p-3"
      style={{
        left: entity.x,
        top: entity.y,
        width: entity.width,
        height: entity.height,
        backgroundColor: config.colors.background,
        borderColor: 'var(--color-info)',
        zIndex: 5,
      }}
    >
      <Typography
        variant="label"
        weight="semibold"
        align="center"
        className="mb-2"
        style={{ color: 'var(--color-info)', fontSize: '14px' }}
      >
        {entity.name}
      </Typography>
      {entity.fields.map((field, idx) => (
        <Typography
          key={idx}
          variant="caption"
          style={{ color: 'var(--color-muted-foreground)', fontFamily: 'JetBrains Mono, monospace' }}
        >
          {field}
        </Typography>
      ))}
    </VStack>
  );
};

/** Outputs box */
const OutputsBox: React.FC<{
  outputs: DomOutputsBox;
  config: VisualizerConfig;
}> = ({ outputs, config }) => {
  const { t } = useTranslate();
  void t;

  return (
    <VStack
      gap="none"
      className="absolute rounded-lg border-2 p-3"
      style={{
        left: outputs.x,
        top: outputs.y,
        width: outputs.width,
        height: outputs.height,
        backgroundColor: config.colors.background,
        borderColor: 'var(--color-warning)',
        zIndex: 5,
      }}
    >
      <Typography
        variant="caption"
        weight="semibold"
        align="center"
        className="mb-2"
        style={{ color: 'var(--color-warning)', fontSize: '13px' }}
      >
        External Effects
      </Typography>
      {outputs.outputs.map((output, idx) => (
        <Typography
          key={idx}
          variant="caption"
          className="mb-0.5"
          style={{ color: 'var(--color-foreground)', fontFamily: 'Inter, sans-serif' }}
        >
          {output}
        </Typography>
      ))}
    </VStack>
  );
};

/** Legend component */
const Legend: React.FC<{
  config: VisualizerConfig;
  y: number;
}> = ({ config, y }) => {
  const { t } = useTranslate();
  void t;

  const items = [
    { label: 'Initial', color: config.colors.initialNode },
    { label: 'Final', color: config.colors.finalNode },
    { label: 'State', color: config.colors.nodeBorder },
    { label: 'Multi-event', color: 'var(--color-accent)' },
  ];

  return (
    <HStack
      gap="md"
      align="center"
      className="absolute"
      style={{ left: 20, top: y, zIndex: 15 }}
    >
      {items.map((item) => (
        <HStack key={item.label} gap="xs" align="center">
          <Box
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor: item.label === 'Multi-event' ? item.color : config.colors.node,
              border: item.label !== 'Multi-event' ? `2px solid ${item.color}` : 'none',
            }}
          />
          <Typography
            variant="caption"
            style={{ color: config.colors.arrowText }}
          >
            {item.label}
          </Typography>
        </HStack>
      ))}
    </HStack>
  );
};

// =============================================================================
// Main Component
// =============================================================================

export const StateMachineView: React.FC<StateMachineViewProps> = ({
  layoutData,
  renderStateNode,
  className = '',
  isLoading: _isLoading,
  error: _error,
}) => {
  const { t } = useTranslate();
  void t;

  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    pinned: false,
    x: 0,
    y: 0,
    bundle: null,
  });

  const handleBundleHover = useCallback((bundle: TransitionBundle | null, x: number, y: number) => {
    if (tooltip.pinned) return;

    if (bundle) {
      setTooltip({ visible: true, pinned: false, x, y, bundle });
    } else {
      setTooltip(prev => ({ ...prev, visible: false }));
    }
  }, [tooltip.pinned]);

  const handleBundleClick = useCallback((bundle: TransitionBundle) => {
    if (tooltip.pinned && tooltip.bundle?.id === bundle.id) {
      setTooltip(prev => ({ ...prev, pinned: false, visible: false }));
    } else {
      const el = document.querySelector(`[data-bundle-id="${bundle.id}"]`);
      if (el) {
        const rect = el.getBoundingClientRect();
        setTooltip({
          visible: true,
          pinned: true,
          x: rect.left + rect.width / 2,
          y: rect.top - 8,
          bundle,
        });
      }
    }
  }, [tooltip.pinned, tooltip.bundle?.id]);

  const handleCloseTooltip = useCallback(() => {
    setTooltip(prev => ({ ...prev, pinned: false, visible: false }));
  }, []);

  // Listen for tooltip close from the Button action
  useEventListener('UI:TOOLTIP_CLOSE', handleCloseTooltip);

  const { width, height, title, states, labels, entity, outputs, config } = layoutData;

  // Bundle transitions by from→to pair
  const bundles = useMemo((): TransitionBundle[] => {
    const bundleMap: Record<string, DomTransitionLabel[]> = {};

    labels.forEach(label => {
      const key = `${label.from}->${label.to}`;
      if (!bundleMap[key]) bundleMap[key] = [];
      bundleMap[key].push(label);
    });

    const allPairs = new Set(Object.keys(bundleMap));

    return Object.entries(bundleMap).map(([key, bundleLabels]) => {
      const [from, to] = key.split('->');
      const reverseKey = `${to}->${from}`;
      const isBidirectional = allPairs.has(reverseKey);
      const isReverse = from > to;

      return {
        id: `bundle-${from}-${to}`,
        from,
        to,
        labels: bundleLabels,
        isBidirectional,
        isReverse,
      };
    });
  }, [labels]);

  return (
    <Box
      className={cn('relative', className)}
      style={{
        width,
        height,
        backgroundColor: config.colors.background,
        borderRadius: '8px',
      }}
    >
      {/* Title */}
      {title && (
        <Typography
          variant="label"
          weight="semibold"
          align="center"
          className="absolute"
          style={{
            left: 0,
            right: 0,
            top: 10,
            color: config.colors.nodeText,
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            zIndex: 15,
          }}
        >
          {title}
        </Typography>
      )}

      {/* Content offset for title */}
      <Box
        className="absolute inset-0"
        style={{ top: title ? 30 : 0 }}
      >
        {/* Entity Box */}
        {entity && <EntityBox entity={entity} config={config} />}

        {/* States Layer */}
        {states.map((state) => (
          renderStateNode
            ? <React.Fragment key={state.id}>{renderStateNode(state, config)}</React.Fragment>
            : (
              <StateNode
                key={state.id}
                state={state}
                config={config}
              />
            )
        ))}

        {/* SVG Layer - Transition bundles */}
        <svg
          className="absolute inset-0"
          width={width}
          height={height - (title ? 30 : 0)}
          style={{ overflow: 'visible', zIndex: 20, pointerEvents: 'none' }}
        >
          {bundles.map((bundle, idx) => (
            <TransitionBundleArrow
              key={bundle.id}
              bundle={bundle}
              states={states}
              bundleIndex={idx}
              totalBundlesForPair={bundles.length}
              config={config}
              onClick={handleBundleClick}
              onHover={handleBundleHover}
            />
          ))}
        </svg>

        {/* Outputs Box */}
        {outputs && <OutputsBox outputs={outputs} config={config} />}
      </Box>

      {/* Legend */}
      <Legend config={config} y={height - 25} />

      {/* Portaled Tooltip */}
      <BundleTooltip tooltip={tooltip} config={config} />
    </Box>
  );
};

// Compat aliases
export { StateMachineView as DomStateMachineVisualizer };
export { StateMachineView as OrbitalStateMachineView };

StateMachineView.displayName = 'StateMachineView';
