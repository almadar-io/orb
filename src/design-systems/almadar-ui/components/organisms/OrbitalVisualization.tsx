'use client';
/**
 * OrbitalVisualization Component
 *
 * Visualizes KFlow schemas as atomic orbitals based on complexity.
 * Uses CSS 3D transforms for lightweight rendering without Three.js.
 *
 * Orbital Types (based on complexity score):
 * - 1s (1-3): Simple sphere - Red
 * - 2s (4-8): Larger sphere - Orange
 * - 2p (9-15): Dumbbell shape - Yellow
 * - 3s (16-25): Sphere with node - Green
 * - 3p (26-40): Complex dumbbell - Blue
 * - 3d (41-60): Cloverleaf - Indigo
 * - 4f (61+): Multi-lobe - Violet
 */

import React, { useMemo } from "react";
import { Box } from "../atoms/Box";
import { Typography } from "../atoms/Typography";
import { cn } from "../../lib/cn";

// ============ Types ============

export interface OrbitalVisualizationProps {
  /** Full KFlow schema object */
  schema?: {
    dataEntities?: unknown[];
    ui?: { pages?: { sections?: unknown[] }[] };
    traits?: unknown[];
  };
  /** Direct complexity override (1-100+) */
  complexity?: number;
  /** Size of the visualization */
  size?: "sm" | "md" | "lg" | "xl";
  /** Show complexity label */
  showLabel?: boolean;
  /** Animation enabled */
  animated?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
}

interface OrbitalConfig {
  type: string;
  name: string;
  color: string;
  glowColor: string;
  lobes: number;
  hasNode: boolean;
  scale: number;
}

// ============ Constants ============

// Muted emission spectrum colors (softer ROYGBIV)
const ORBITAL_CONFIGS: Record<string, OrbitalConfig> = {
  "1s": {
    type: "1s",
    name: "1s Orbital",
    color: "#C45B5B",
    glowColor: "rgba(196, 91, 91, 0.3)",
    lobes: 1,
    hasNode: false,
    scale: 0.6,
  },
  "2s": {
    type: "2s",
    name: "2s Orbital",
    color: "#D4875B",
    glowColor: "rgba(212, 135, 91, 0.3)",
    lobes: 1,
    hasNode: false,
    scale: 0.8,
  },
  "2p": {
    type: "2p",
    name: "2p Orbital",
    color: "#C9B458",
    glowColor: "rgba(201, 180, 88, 0.3)",
    lobes: 2,
    hasNode: false,
    scale: 1.0,
  },
  "3s": {
    type: "3s",
    name: "3s Orbital",
    color: "#5BA87A",
    glowColor: "rgba(91, 168, 122, 0.3)",
    lobes: 1,
    hasNode: true,
    scale: 1.0,
  },
  "3p": {
    type: "3p",
    name: "3p Orbital",
    color: "#5B8DC4",
    glowColor: "rgba(91, 141, 196, 0.3)",
    lobes: 2,
    hasNode: true,
    scale: 1.1,
  },
  "3d": {
    type: "3d",
    name: "3d Orbital",
    color: "#6B5B8A",
    glowColor: "rgba(107, 91, 138, 0.3)",
    lobes: 4,
    hasNode: true,
    scale: 1.2,
  },
  "4f": {
    type: "4f",
    name: "4f Orbital",
    color: "#8A5B9C",
    glowColor: "rgba(138, 91, 156, 0.3)",
    lobes: 6,
    hasNode: true,
    scale: 1.3,
  },
};

const SIZE_MAP = {
  sm: 120,
  md: 200,
  lg: 300,
  xl: 400,
};

// ============ Utility Functions ============

/**
 * Calculate complexity score from schema
 */
function calculateComplexity(
  schema?: OrbitalVisualizationProps["schema"],
): number {
  if (!schema) return 1;

  const entities = schema.dataEntities?.length || 0;
  const pages = schema.ui?.pages?.length || 0;
  const traits = schema.traits?.length || 0;
  const sections =
    schema.ui?.pages?.reduce(
      (acc, page) => acc + (page.sections?.length || 0),
      0,
    ) || 0;

  // Complexity formula: entities×3 + pages×2 + traits×2 + sections×1
  return entities * 3 + pages * 2 + traits * 2 + sections * 1;
}

/**
 * Get orbital type based on complexity score
 */
function getOrbitalType(complexity: number): string {
  if (complexity <= 3) return "1s";
  if (complexity <= 8) return "2s";
  if (complexity <= 15) return "2p";
  if (complexity <= 25) return "3s";
  if (complexity <= 40) return "3p";
  if (complexity <= 60) return "3d";
  return "4f";
}

// ============ Sub-Components ============

interface OrbitalSphereProps {
  config: OrbitalConfig;
  size: number;
  animated: boolean;
  className?: string;
  isLoading?: boolean;
  error?: Error | null;
  entity?: string;
}

/** Renders a single sphere lobe */
const OrbitalSphere: React.FC<OrbitalSphereProps> = ({
  config,
  size,
  animated,
}) => {
  const sphereSize = size * config.scale * 0.4;

  return (
    <Box
      className="absolute rounded-full"
      style={{
        width: sphereSize,
        height: sphereSize,
        background: `radial-gradient(circle at 30% 30%, ${config.color}dd, ${config.color}88 50%, ${config.color}44 100%)`,
        boxShadow: `
          inset -10px -10px 20px rgba(0,0,0,0.3),
          inset 5px 5px 15px rgba(255,255,255,0.2),
          0 0 ${size * 0.15}px ${config.glowColor},
          0 0 ${size * 0.3}px ${config.glowColor}
        `,
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        animation: animated
          ? "orbital-pulse 3s ease-in-out infinite"
          : undefined,
      }}
    />
  );
};

interface DumbbellOrbitalProps {
  config: OrbitalConfig;
  size: number;
  animated: boolean;
  rotation?: number;
  className?: string;
  isLoading?: boolean;
  error?: Error | null;
  entity?: string;
}

/** Renders a p-orbital dumbbell shape */
const DumbbellOrbital: React.FC<DumbbellOrbitalProps> = ({
  config,
  size,
  animated,
  rotation = 0,
}) => {
  const lobeSize = size * config.scale * 0.25;
  const offset = size * 0.18;

  return (
    <Box
      className="absolute"
      style={{
        width: size,
        height: size,
        left: "50%",
        top: "50%",
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        animation: animated ? "orbital-rotate 8s linear infinite" : undefined,
      }}
    >
      {/* Top lobe */}
      <Box
        className="absolute rounded-full"
        style={{
          width: lobeSize,
          height: lobeSize * 1.4,
          background: `radial-gradient(ellipse at 50% 30%, ${config.color}dd, ${config.color}66 70%, transparent 100%)`,
          boxShadow: `0 0 ${size * 0.1}px ${config.glowColor}`,
          left: "50%",
          top: `calc(50% - ${offset}px)`,
          transform: "translate(-50%, -100%)",
          borderRadius: "50% 50% 40% 40%",
        }}
      />
      {/* Bottom lobe */}
      <Box
        className="absolute rounded-full"
        style={{
          width: lobeSize,
          height: lobeSize * 1.4,
          background: `radial-gradient(ellipse at 50% 70%, ${config.color}dd, ${config.color}66 70%, transparent 100%)`,
          boxShadow: `0 0 ${size * 0.1}px ${config.glowColor}`,
          left: "50%",
          bottom: `calc(50% - ${offset}px)`,
          transform: "translate(-50%, 100%)",
          borderRadius: "40% 40% 50% 50%",
        }}
      />
      {/* Node (nucleus) */}
      {config.hasNode && (
        <Box
          className="absolute rounded-[var(--radius-full)] bg-[var(--color-foreground)]"
          style={{
            width: size * 0.06,
            height: size * 0.06,
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            boxShadow: `0 0 ${size * 0.05}px rgba(255,255,255,0.8)`,
          }}
        />
      )}
    </Box>
  );
};

interface CloverleafOrbitalProps {
  config: OrbitalConfig;
  size: number;
  animated: boolean;
  className?: string;
  isLoading?: boolean;
  error?: Error | null;
  entity?: string;
}

/** Renders a d-orbital cloverleaf shape */
const CloverleafOrbital: React.FC<CloverleafOrbitalProps> = ({
  config,
  size,
  animated,
}) => {
  const lobes = config.lobes;
  const angleStep = 360 / lobes;
  const lobeSize = size * 0.18;
  const lobeDistance = size * 0.22;

  return (
    <Box
      className="absolute"
      style={{
        width: size,
        height: size,
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        animation: animated ? "orbital-rotate 12s linear infinite" : undefined,
      }}
    >
      {Array.from({ length: lobes }).map((_, i) => {
        const angle = i * angleStep * (Math.PI / 180);
        const x = Math.cos(angle) * lobeDistance;
        const y = Math.sin(angle) * lobeDistance;

        return (
          <Box
            key={i}
            className="absolute rounded-full"
            style={{
              width: lobeSize,
              height: lobeSize * 1.3,
              background: `radial-gradient(ellipse at 50% 40%, ${config.color}dd, ${config.color}55 80%, transparent 100%)`,
              boxShadow: `0 0 ${size * 0.08}px ${config.glowColor}`,
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`,
              transform: `translate(-50%, -50%) rotate(${i * angleStep + 90}deg)`,
            }}
          />
        );
      })}
      {/* Central node */}
      <Box
        className="absolute rounded-[var(--radius-full)] bg-[var(--color-foreground)]"
        style={{
          width: size * 0.08,
          height: size * 0.08,
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          boxShadow: `0 0 ${size * 0.06}px rgba(255,255,255,0.9)`,
        }}
      />
    </Box>
  );
};

// ============ Main Component ============

export const OrbitalVisualization: React.FC<OrbitalVisualizationProps> = ({
  schema,
  complexity: overrideComplexity,
  size = "md",
  showLabel = true,
  animated = true,
  onClick,
  className = "",
}) => {
  // Calculate complexity and orbital type
  const complexity = useMemo(() => {
    if (overrideComplexity !== undefined) return overrideComplexity;
    return calculateComplexity(schema);
  }, [schema, overrideComplexity]);

  const orbitalType = useMemo(() => getOrbitalType(complexity), [complexity]);
  const config = ORBITAL_CONFIGS[orbitalType];
  const pixelSize = SIZE_MAP[size];

  // Render appropriate orbital shape
  const renderOrbital = () => {
    switch (config.lobes) {
      case 1:
        return (
          <OrbitalSphere config={config} size={pixelSize} animated={animated} />
        );
      case 2:
        return (
          <>
            <DumbbellOrbital
              config={config}
              size={pixelSize}
              animated={animated}
              rotation={0}
            />
            {config.hasNode && (
              <>
                <DumbbellOrbital
                  config={config}
                  size={pixelSize * 0.7}
                  animated={animated}
                  rotation={60}
                />
                <DumbbellOrbital
                  config={config}
                  size={pixelSize * 0.7}
                  animated={animated}
                  rotation={120}
                />
              </>
            )}
          </>
        );
      case 4:
      case 6:
        return (
          <CloverleafOrbital
            config={config}
            size={pixelSize}
            animated={animated}
          />
        );
      default:
        return (
          <OrbitalSphere config={config} size={pixelSize} animated={animated} />
        );
    }
  };

  return (
    <Box
      className={cn("relative flex flex-col items-center justify-center", className)}
      style={{ width: pixelSize, height: pixelSize + (showLabel ? 60 : 0) }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Orbital container */}
      <Box
        className="relative"
        style={{
          width: pixelSize,
          height: pixelSize,
          perspective: pixelSize * 2,
          cursor: onClick ? "pointer" : "default",
        }}
      >
        {/* Background glow */}
        <Box
          className="absolute rounded-full opacity-30"
          style={{
            width: pixelSize * 0.8,
            height: pixelSize * 0.8,
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            background: `radial-gradient(circle, ${config.glowColor} 0%, transparent 70%)`,
            filter: "blur(20px)",
          }}
        />

        {/* Orbital shape */}
        {renderOrbital()}
      </Box>

      {/* Label */}
      {showLabel && (
        <Box className="mt-4 text-center">
          <Typography variant="body" className="text-lg font-semibold text-[var(--color-foreground)]">
            {config.name}
          </Typography>
          <Typography variant="small" color="muted">
            Complexity: {complexity} units
          </Typography>
        </Box>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes orbital-pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          50% { transform: translate(-50%, -50%) scale(1.05); opacity: 0.9; }
        }

        @keyframes orbital-rotate {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
      `}</style>
    </Box>
  );
};

OrbitalVisualization.displayName = "OrbitalVisualization";

export default OrbitalVisualization;
