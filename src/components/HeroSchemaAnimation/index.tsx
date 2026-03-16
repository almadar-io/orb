import React, { useMemo } from "react";
import { useColorMode } from "@docusaurus/theme-common";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Translate, { translate } from "@docusaurus/Translate";
import { Box, Zap, Layout } from "lucide-react";
import styles from "./styles.module.css";
import type { OrbitalSchema, Orbital, Trait, State, Transition } from "./types";

/**
 * Helper to extract data from a potentially complex Schema/Orbital structure.
 */
function extractVisualizationData(schema?: OrbitalSchema) {
  // Default Data (Order Fulfillment)
  const defaultData = {
    appName: translate({ message: "Order Fulfillment App", id: "hero.viz.appName" }),
    entityName: translate({ message: "Order", id: "hero.viz.entityName" }),
    pageName: translate({ message: "Track Order", id: "hero.viz.pageName" }),
    traitName: translate({ message: "Fulfillment", id: "hero.viz.traitName" }),
    states: [
      { name: "placed", isInitial: true },
      { name: "prep" }, // processing
      { name: "shipped" },
      { name: "done", isTerminal: true }, // delivered
    ] as State[],
    transitions: [
      { from: "placed", to: "prep", event: "verify" },
      { from: "prep", to: "shipped", event: "dispatch" },
      { from: "shipped", to: "done", event: "arrive" },
    ] as Transition[],
  };

  if (!schema || !schema.orbitals || schema.orbitals.length === 0) {
    return defaultData;
  }

  const appName = schema.name || translate({ message: "Application", id: "hero.viz.defaultApp" });
  const orbital = schema.orbitals[0];

  // Extract Entity Name
  let entityName = "Entity";
  if (typeof orbital.entity === "string") {
    entityName = orbital.entity.split(".").pop() || "Entity";
  } else {
    entityName = orbital.entity.name;
  }

  // Extract Page Name
  let pageName = "Page";
  if (orbital.pages && orbital.pages.length > 0) {
    const page = orbital.pages[0];
    if (typeof page === "string") {
      pageName = page.split(".").pop() || "Page";
    } else if ("name" in page) {
      pageName = page.name;
    } else if ("ref" in page) {
      pageName = page.ref.split(".").pop() || "Page";
    }
  }

  // Extract Trait & State Machine
  let traitName = "Trait";
  let states: State[] = [];
  let transitions: Transition[] = [];

  // Find a trait with a state machine
  const statefulTraitRef = orbital.traits.find((t) => {
    if (typeof t === "object" && "stateMachine" in t) return true;
    return false;
  });

  if (statefulTraitRef && typeof statefulTraitRef === "object" && "name" in statefulTraitRef) {
    traitName = statefulTraitRef.name;
    if (statefulTraitRef.stateMachine) {
      states = statefulTraitRef.stateMachine.states;
      transitions = statefulTraitRef.stateMachine.transitions;
    }
  } else if (orbital.traits.length > 0) {
    // Fallback to first trait name if no state machine found
    const t = orbital.traits[0];
    if (typeof t === "string") traitName = t;
    else if ("ref" in t) traitName = t.ref;
    else if ("name" in t) traitName = t.name;
  }

  // If no states found in schema, use default (or empty?)
  if (states.length === 0) {
    return {
      appName,
      entityName,
      pageName,
      traitName,
      states: [],
      transitions: [],
    };
  }

  return { appName, entityName, pageName, traitName, states, transitions };
}

export default function HeroSchemaAnimation({ schema }: { schema?: OrbitalSchema }) {
  const { colorMode } = useColorMode();
  const { i18n } = useDocusaurusContext();
  const isDark = colorMode === "dark";
  const isRTL = i18n.currentLocale === 'ar';

  const teal = isDark ? "#2dd4bf" : "#0d9488";
  const gold = isDark ? "#e8c547" : "#b8941f";
  const muted = isDark ? "#475569" : "#94a3b8";
  const textColor = isDark ? "#cbd5e1" : "#475569";
  const nodeText = isDark ? "#f1f5f9" : "#0f172a";
  const tealFill = isDark ? "rgba(20, 184, 166, 0.15)" : "rgba(20, 184, 166, 0.1)";
  const goldFill = isDark ? "rgba(201, 162, 39, 0.15)" : "rgba(201, 162, 39, 0.1)";
  const mutedFill = isDark ? "rgba(71, 85, 105, 0.3)" : "rgba(148, 163, 184, 0.25)";
  const traitBg = isDark ? "rgba(20, 20, 25, 0.8)" : "rgba(255, 255, 255, 0.9)";

  // Layout Constants
  const viewBoxW = 600;
  const viewBoxH = 720; // Increased height for spacing
  const centerX = viewBoxW / 2;
  const centerY = viewBoxH / 2;

  // RTL Adjustments:
  // If RTL, label goes to the LEFT of the icon (centerX - 55) and aligns END (which is right-to-left start)
  const labelX = isRTL ? centerX - 55 : centerX + 55;
  const labelAnchor = isRTL ? "end" : "start";

  // Use a SINGLE uniform radius for a perfect circle
  const radius = 180;

  const { appName, entityName, pageName, traitName, states, transitions } = useMemo(
    () => extractVisualizationData(schema),
    [schema, i18n.currentLocale]
  );

  // Calculate State Positions with explicit Angles
  const statePositions = useMemo(() => {
    const count = states.length;
    if (count === 0) return {};

    const positions: Record<string, { x: number; y: number; angle: number }> = {};
    // Start from Left (180 degrees)
    const startAngle = Math.PI;

    states.forEach((state, i) => {
      // Calculate angle for this state (Clockwise)
      const angle = startAngle + (i * (2 * Math.PI)) / count;

      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      positions[state.name] = { x, y, angle };
    });

    return positions;
  }, [states]);

  // Helper to get definition for marker
  const markerId = "arrowhead";
  const maskId = "hero-animation-mask";

  // Helper to calculate control point based on angles for perfect symmetry
  const getControlPoint = (angle1: number, angle2: number) => {
    // Determine the mid-angle.
    // We need to handle the wrap-around case (e.g. 350 -> 10 deg). 
    // Assuming transitions are generally "forward" in the list order or close neighbors.
    let diff = angle2 - angle1;
    // Normalize diff to -PI to +PI
    while (diff <= -Math.PI) diff += 2 * Math.PI;
    while (diff > Math.PI) diff -= 2 * Math.PI;

    const midAngle = angle1 + diff / 2;

    // For the control point dist, we push OUT significantly to create the arc effect.
    // Use a slightly larger radius for the control point.
    // If diff is large (cross-circle), this ensures it bows "out" correctly.
    const controlDist = radius * 1.35; // 35% larger than node radius

    return {
      x: centerX + controlDist * Math.cos(midAngle),
      y: centerY + controlDist * Math.sin(midAngle)
    };
  }

  // Helper to shorten the end of a curve
  const getShortenedEnd = (start: { x: number, y: number }, cp: { x: number, y: number }, end: { x: number, y: number }, shortenBy: number) => {
    const dx = end.x - cp.x;
    const dy = end.y - cp.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return end;
    const t = Math.max(0, len - shortenBy) / len;
    return {
      x: cp.x + dx * t,
      y: cp.y + dy * t
    };
  };

  return (
    <div className={styles.container} style={{ direction: 'ltr' }}> {/* Force LTR for SVG container to keep coords sane */}
      <svg
        viewBox={`0 0 ${viewBoxW} ${viewBoxH}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.svg}
      >
        <defs>
          <marker
            id={markerId}
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill={gold} />
          </marker>

          <mask id={maskId} maskUnits="userSpaceOnUse">
            <rect x="0" y="0" width={viewBoxW} height={viewBoxH} fill="white" />
            {/* Mask out State Nodes */}
            {states.map((state) => {
              const pos = statePositions[state.name];
              if (!pos) return null;
              return (
                <rect
                  key={`mask-${state.name}`}
                  x={pos.x - 42}
                  y={pos.y - 20}
                  width="84"
                  height="40"
                  rx="18"
                  fill="black"
                />
              );
            })}
          </mask>
        </defs>

        {/* === Application Frame === */}
        <rect
          x="10"
          y="10"
          width={viewBoxW - 20}
          height={viewBoxH - 20}
          rx="16"
          stroke={muted}
          strokeWidth="1"
          strokeDasharray="4 4"
          fill="none"
          opacity="0.5"
        />
        <text
          x={30}
          y={40}
          textAnchor="start"
          fontSize="12"
          fontWeight="600"
          fill={muted}
          fontFamily="'IBM Plex Mono', monospace"
          className={styles.edgeLabel}
        >
          <Translate id="hero.viz.appPrefix">APP:</Translate> {appName.toUpperCase()}
        </text>

        {/* === Vertical Connections (Entity-Trait-Page) === */}
        <g mask={`url(#${maskId})`}>
          <path
            d={`M${centerX} ${centerY + 280} L${centerX} ${centerY + 40}`}
            stroke={gold}
            strokeWidth="2"
            className={styles.connectionLine}
            style={{ animationDelay: "1.0s" }}
          />
          <path
            d={`M${centerX} ${centerY - 40} L${centerX} ${centerY - 270}`}
            stroke={gold}
            strokeWidth="2"
            className={styles.connectionLine}
            style={{ animationDelay: "1.2s" }}
          />
        </g>

        {/* === Lines Layer (Rendered First so they are underneath labels) === */}
        {transitions.map((t, i) => {
          const start = statePositions[t.from];
          const end = statePositions[t.to];
          if (!start || !end) return null;

          // Symmetrical Control Point
          const cp = getControlPoint(start.angle, end.angle);

          // Shorten Start Logic (Move start point towards CP)
          // State pill is approx 40px wide (80px total). 45px ensures clear gap.
          const dxS = cp.x - start.x;
          const dyS = cp.y - start.y;
          const lenS = Math.sqrt(dxS * dxS + dyS * dyS);
          const tS = Math.min(1, 45 / lenS);
          const shortStart = {
            x: start.x + dxS * tS,
            y: start.y + dyS * tS
          };

          // Shorten End Logic (Move end point back towards CP)
          const shortEnd = getShortenedEnd(start, cp, end, 48); // Slightly more for arrow tip clearance

          // Path Logic
          const pathD = `M${shortStart.x} ${shortStart.y} Q${cp.x} ${cp.y} ${shortEnd.x} ${shortEnd.y}`;

          return (
            <path
              key={`line-${i}`}
              d={pathD}
              stroke={gold}
              strokeWidth="1.5"
              fill="none"
              markerEnd={`url(#${markerId})`}
              className={styles.fadeIn}
              style={{ animationDelay: `${2.4 + i * 0.2}s` }}
            />
          );
        })}

        {/* === Entity Node (Bottom) === */}
        <g className={styles.nodeGroup} style={{ animationDelay: "0.3s" }}>
          <Box
            x={centerX - 30}
            y={centerY + 280}
            width="60"
            height="60"
            stroke={teal}
            strokeWidth="2"
            fill={tealFill}
            strokeDasharray="1000" strokeDashoffset="1000"
            className={styles.nodeShape}
          />
          <text
            x={labelX}
            y={centerY + 310}
            textAnchor={labelAnchor}
            fontSize="14"
            fontWeight="700"
            fontFamily="'Source Serif 4', Georgia, serif"
            fill={nodeText}
            className={styles.nodeLabel}
          >
            {entityName}
          </text>
          <text
            x={labelX}
            y={centerY + 325}
            textAnchor={labelAnchor}
            fontSize="11"
            fill={textColor}
            fontFamily="'IBM Plex Mono', monospace"
            className={styles.nodeLabel}
          >
            <Translate id="hero.viz.entityLabel">(Entity)</Translate>
          </text>
        </g>

        {/* === Trait Node (Center) === */}
        <g className={styles.nodeGroup} style={{ animationDelay: "0.6s" }}>
          <circle cx={centerX} cy={centerY} r="45" fill={traitBg} className={styles.fadeIn} />
          <circle cx={centerX} cy={centerY} r="50" stroke={gold} strokeWidth="1.5" fill="none" opacity="0.3" className={styles.pulseRing} />
          <Zap
            x={centerX - 30}
            y={centerY - 30}
            width="60"
            height="60"
            stroke={gold}
            strokeWidth="3"
            fill={goldFill}
            strokeDasharray="1000" strokeDashoffset="1000"
            className={styles.nodeShape}
          />
          <text
            x={labelX}
            y={centerY}
            textAnchor={labelAnchor}
            fontSize="14"
            fontWeight="700"
            fontFamily="'Source Serif 4', Georgia, serif"
            fill={nodeText}
            className={styles.nodeLabel}
          >
            {traitName}
          </text>
          <text
            x={labelX}
            y={centerY + 15}
            textAnchor={labelAnchor}
            fontSize="11"
            fill={textColor}
            fontFamily="'IBM Plex Mono', monospace"
            className={styles.nodeLabel}
          >
            <Translate id="hero.viz.traitLabel">(Trait)</Translate>
          </text>
        </g>

        {/* === Page Node (Top) === */}
        <g className={styles.nodeGroup} style={{ animationDelay: "0.9s" }}>
          <Layout
            x={centerX - 30}
            y={centerY - 330}
            width="60"
            height="60"
            stroke={teal}
            strokeWidth="2"
            fill={tealFill}
            strokeDasharray="1000" strokeDashoffset="1000"
            className={styles.nodeShape}
          />
          <text
            x={labelX}
            y={centerY - 300}
            textAnchor={labelAnchor}
            fontSize="14"
            fontWeight="700"
            fontFamily="'Source Serif 4', Georgia, serif"
            fill={nodeText}
            className={styles.nodeLabel}
          >
            {pageName}
          </text>
          <text
            x={labelX}
            y={centerY - 285}
            textAnchor={labelAnchor}
            fontSize="11"
            fill={textColor}
            fontFamily="'IBM Plex Mono', monospace"
            className={styles.nodeLabel}
          >
            <Translate id="hero.viz.pageLabel">(Page)</Translate>
          </text>
        </g>

        {/* === State Nodes === */}
        {states.map((state, i) => {
          const pos = statePositions[state.name];
          if (!pos) return null;

          const isTerminal = state.isTerminal || state.isFinal;
          const strokeColor = isTerminal ? gold : (state.name === 'placed' ? muted : teal);
          const fillColor = isTerminal ? goldFill : (state.name === 'placed' ? mutedFill : tealFill);

          return (
            <g key={state.name} className={styles.nodeGroup} style={{ animationDelay: `${1.4 + i * 0.1}s` }}>
              <rect
                x={pos.x - 40}
                y={pos.y - 18}
                width="80"
                height="36"
                rx="18"
                stroke={strokeColor}
                strokeWidth="2"
                fill={fillColor}
                className={styles.nodeShape}
              />
              <text
                x={pos.x}
                y={pos.y + 4}
                textAnchor="middle"
                fontSize="11"
                fontWeight={isTerminal ? "700" : "500"}
                fill={isTerminal ? gold : (state.name === 'placed' ? textColor : teal)}
                fontFamily="'IBM Plex Mono', monospace"
                className={styles.nodeLabel}
              >
                {state.name}
              </text>
            </g>
          );
        })}

        {/* === Labels Layer (Rendered Last so they are on top) === */}
        {transitions.map((t, i) => {
          const start = statePositions[t.from];
          const end = statePositions[t.to];
          if (!start || !end) return null;

          // Recalculate CP for label pos (same logic as lines)
          const cp = getControlPoint(start.angle, end.angle);

          // Label Position: Midpoint of Curve (t=0.5)
          // B(0.5) = 0.25*P0 + 0.5*P1 + 0.25*P2
          const lx = 0.25 * start.x + 0.5 * cp.x + 0.25 * end.x;
          const ly = 0.25 * start.y + 0.5 * cp.y + 0.25 * end.y;

          return (
            <g key={`label-${i}`} className={styles.fadeIn} style={{ animationDelay: `${2.4 + i * 0.2}s` }}>
              {/* Opaque Background for Label */}
              <rect
                x={lx - 35} y={ly - 10}
                width="70" height="20" rx="4"
                fill={isDark ? "#0f172a" : "#ffffff"}
                stroke={isDark ? "#334155" : "#e2e8f0"}
                strokeWidth="1"
                opacity="1"
              />
              <text x={lx} y={ly + 4} textAnchor="middle" fontSize="10" fill={gold} fontFamily="'IBM Plex Mono', monospace" fontWeight="600">
                {t.event}
              </text>
            </g>
          );
        })}

        {/* === Key Labels === */}
        <text
          x={24}
          y={viewBoxH - 24}
          textAnchor="start"
          fontSize="11"
          fill={muted}
          opacity="0.7"
          fontFamily="'IBM Plex Mono', monospace"
          className={styles.edgeLabel}
          style={{ animationDelay: "3.2s" }}
        >
          <Translate id="hero.viz.orbitalUnit">Orbital Unit = Entity + Traits + Pages</Translate>
        </text>

      </svg>
    </div>
  );
}
