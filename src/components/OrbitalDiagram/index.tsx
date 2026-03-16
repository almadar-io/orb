import React from "react";
import { useColorMode } from "@docusaurus/theme-common";
import styles from "./styles.module.css";

/**
 * OrbitalDiagram — Inline visualization of the Orbital architecture.
 *
 * Shows Entity (Matter) → Trait (Energy) ← Page (Space) with state nodes.
 * Designed to be embedded in docs and blog posts via MDX.
 *
 * Usage in MDX: <OrbitalDiagram />
 */
export default function OrbitalDiagram() {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  const teal = isDark ? "#2dd4bf" : "#0d9488";
  const gold = isDark ? "#e8c547" : "#b8941f";
  const muted = isDark ? "#475569" : "#94a3b8";
  const textColor = isDark ? "#cbd5e1" : "#475569";
  const nodeText = isDark ? "#f1f5f9" : "#0f172a";
  const tealFill = isDark ? "rgba(20, 184, 166, 0.15)" : "rgba(20, 184, 166, 0.1)";
  const goldFill = isDark ? "rgba(201, 162, 39, 0.15)" : "rgba(201, 162, 39, 0.1)";
  const mutedFill = isDark ? "rgba(71, 85, 105, 0.3)" : "rgba(148, 163, 184, 0.25)";

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <svg
          viewBox="0 0 400 340"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={styles.svg}
        >
          {/* === Connection Lines === */}

          {/* Entity -> Trait */}
          <path
            d="M130 110 L190 170"
            stroke={gold}
            strokeWidth="1.5"
            className={styles.connectionLine}
            style={{ animationDelay: "1.2s" }}
          />

          {/* Page -> Trait */}
          <path
            d="M270 110 L210 170"
            stroke={gold}
            strokeWidth="1.5"
            className={styles.connectionLine}
            style={{ animationDelay: "1.4s" }}
          />

          {/* Trait -> State nodes */}
          <path
            d="M190 210 L135 260"
            stroke={teal}
            strokeWidth="1.5"
            className={styles.connectionLine}
            style={{ animationDelay: "2.0s" }}
          />
          <path
            d="M210 210 L265 260"
            stroke={teal}
            strokeWidth="1.5"
            className={styles.connectionLine}
            style={{ animationDelay: "2.2s" }}
          />

          {/* State transition arch */}
          <path
            d="M155 265 C175 230 225 230 245 265"
            stroke={gold}
            strokeWidth="1.5"
            fill="none"
            className={styles.connectionLine}
            style={{ animationDelay: "2.8s" }}
          />
          {/* Arrow head */}
          <path
            d="M240 258 L245 265 L237 263"
            stroke={gold}
            strokeWidth="1.5"
            fill="none"
            className={styles.connectionLine}
            style={{ animationDelay: "2.8s" }}
          />

          {/* === Entity Node (Matter) — Diamond === */}
          <g className={styles.nodeGroup} style={{ animationDelay: "0.3s" }}>
            <path
              d="M130 60 L168 98 L130 136 L92 98 Z"
              stroke={teal}
              strokeWidth="2"
              fill={tealFill}
              className={styles.nodeShape}
            />
            <text
              x="130" y="95" textAnchor="middle"
              fontSize="12" fontWeight="700"
              fontFamily="'Source Serif 4', Georgia, serif"
              fill={nodeText} className={styles.nodeLabel}
            >
              Entity
            </text>
            <text
              x="130" y="110" textAnchor="middle"
              fontSize="8" fill={textColor}
              fontFamily="'IBM Plex Mono', monospace"
              className={styles.nodeLabel}
            >
              (Matter)
            </text>
          </g>

          {/* === Page Node (Space) — Rounded rect === */}
          <g className={styles.nodeGroup} style={{ animationDelay: "0.6s" }}>
            <rect
              x="230" y="68" width="80" height="60" rx="8"
              stroke={teal} strokeWidth="2" fill={tealFill}
              className={styles.nodeShape}
            />
            <text
              x="270" y="95" textAnchor="middle"
              fontSize="12" fontWeight="700"
              fontFamily="'Source Serif 4', Georgia, serif"
              fill={nodeText} className={styles.nodeLabel}
            >
              Page
            </text>
            <text
              x="270" y="110" textAnchor="middle"
              fontSize="8" fill={textColor}
              fontFamily="'IBM Plex Mono', monospace"
              className={styles.nodeLabel}
            >
              (Space)
            </text>
          </g>

          {/* === Trait Node (Energy) — Central circle === */}
          <g className={styles.nodeGroup} style={{ animationDelay: "0.9s" }}>
            <circle
              cx="200" cy="185" r="36"
              stroke={gold} strokeWidth="2" fill={goldFill}
              className={styles.nodeShape}
            />
            <circle
              cx="200" cy="185" r="36"
              stroke={gold} strokeWidth="1.5" fill="none"
              opacity="0.4" className={styles.pulseRing}
            />
            <text
              x="200" y="182" textAnchor="middle"
              fontSize="12" fontWeight="700"
              fontFamily="'Source Serif 4', Georgia, serif"
              fill={nodeText} className={styles.nodeLabel}
            >
              Trait
            </text>
            <text
              x="200" y="197" textAnchor="middle"
              fontSize="8" fill={textColor}
              fontFamily="'IBM Plex Mono', monospace"
              className={styles.nodeLabel}
            >
              (Energy)
            </text>
          </g>

          {/* === State Nodes === */}
          <g className={styles.nodeGroup} style={{ animationDelay: "1.8s" }}>
            <circle
              cx="130" cy="275" r="22"
              stroke={muted} strokeWidth="1.5" fill={mutedFill}
              className={styles.nodeShape}
            />
            <text
              x="130" y="279" textAnchor="middle"
              fontSize="9" fontWeight="500" fill={textColor}
              fontFamily="'IBM Plex Mono', monospace"
              className={styles.nodeLabel}
            >
              idle
            </text>
          </g>

          <g className={styles.nodeGroup} style={{ animationDelay: "2.0s" }}>
            <circle
              cx="270" cy="275" r="22"
              stroke={teal} strokeWidth="1.5" fill={tealFill}
              className={styles.nodeShape}
            />
            <text
              x="270" y="279" textAnchor="middle"
              fontSize="9" fill={teal}
              fontFamily="'IBM Plex Mono', monospace"
              fontWeight="600" className={styles.nodeLabel}
            >
              active
            </text>
          </g>

          {/* === Edge labels === */}
          <text
            x="138" y="148" textAnchor="end" fontSize="7" fill={gold}
            fontFamily="'IBM Plex Mono', monospace" fontWeight="500"
            className={styles.edgeLabel} style={{ animationDelay: "1.6s" }}
          >
            has_trait
          </text>

          <text
            x="262" y="148" textAnchor="start" fontSize="7" fill={gold}
            fontFamily="'IBM Plex Mono', monospace" fontWeight="500"
            className={styles.edgeLabel} style={{ animationDelay: "1.8s" }}
          >
            renders
          </text>

          <text
            x="200" y="238" textAnchor="middle"
            fontSize="7" fill={gold}
            fontFamily="'IBM Plex Mono', monospace" fontWeight="500"
            className={styles.edgeLabel} style={{ animationDelay: "3.0s" }}
          >
            transition
          </text>
        </svg>
        <div className={styles.caption}>
          Orbital Unit = Entity + Traits + Pages
        </div>
      </div>
    </div>
  );
}
