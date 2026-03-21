'use client';
/**
 * OrbitalHeroBackground (Orb - S Orbital)
 *
 * Spherical shell formed by 6 lobe pairs at 30-degree increments.
 * The sphere breathes (all lobes scale in/out together).
 * Individual lobes have subtle independent opacity cycling (shimmer).
 * Slow unified rotation creating a "living sphere" feel.
 * Path drawing animation: lobes draw themselves completing the sphere.
 * Wireframe aesthetic: thinner strokes, sharper, no blur filters.
 * Color: var(--color-primary) (black/wireframe).
 */

import React from 'react';

const C = 'var(--color-primary)';
const CX = 400;
const CY = 300;

// 6 lobe pairs at 0, 30, 60, 90, 120, 150 degrees
const PAIR_ANGLES = [0, 30, 60, 90, 120, 150];

// Shimmer delays per pair
const SHIMMER_DELAYS = [0, 0.8, 1.6, 2.4, 3.2, 4.0];

export const OrbitalHeroBackground: React.FC = () => {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <svg
        viewBox="0 0 800 600"
        fill="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="sGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={C} stopOpacity="0.4" />
            <stop offset="100%" stopColor={C} stopOpacity="0.08" />
          </linearGradient>
        </defs>
        <style>{`
          @keyframes sSpin { to { transform: rotate(360deg); } }
          @keyframes sBreathe { 0%,100% { transform: scale(1); } 50% { transform: scale(1.06); } }
          @keyframes sShimmer { 0%,100% { opacity: 0.12; } 50% { opacity: 0.06; } }
          @keyframes sDraw {
            0% { stroke-dashoffset: 900; }
            60% { stroke-dashoffset: 0; }
            100% { stroke-dashoffset: 0; }
          }
          @keyframes sNucPulse { 0%,100% { opacity: 0.4; } 50% { opacity: 0.15; } }

          .sSphereWrap {
            animation: sSpin 80s linear infinite, sBreathe 8s ease-in-out infinite;
            transform-origin: 400px 300px;
          }

          .sLobePair { stroke-dasharray: 900; animation: sDraw 6s ease-out forwards, sShimmer 5s ease-in-out infinite; }
          .sLobePairD0 { animation-delay: 0s, 0s; }
          .sLobePairD1 { animation-delay: 0.4s, 0.8s; }
          .sLobePairD2 { animation-delay: 0.8s, 1.6s; }
          .sLobePairD3 { animation-delay: 1.2s, 2.4s; }
          .sLobePairD4 { animation-delay: 1.6s, 3.2s; }
          .sLobePairD5 { animation-delay: 2.0s, 4.0s; }

          .sNucleus { animation: sNucPulse 3s ease-in-out infinite; }
        `}</style>

        {/* Sphere: 6 lobe pairs rotating and breathing together */}
        <g className="sSphereWrap">
          {PAIR_ANGLES.map((angle, i) => (
            <g key={angle} transform={`rotate(${angle} ${CX} ${CY})`}>
              {/* Top lobe */}
              <ellipse
                cx={CX}
                cy={CY - 120}
                rx="65"
                ry="150"
                stroke="url(#sGrad)"
                strokeWidth="0.8"
                className={`sLobePair sLobePairD${i}`}
              />
              {/* Bottom lobe */}
              <ellipse
                cx={CX}
                cy={CY + 120}
                rx="65"
                ry="150"
                stroke="url(#sGrad)"
                strokeWidth="0.8"
                className={`sLobePair sLobePairD${i}`}
                style={{ animationDelay: `${0.2 + i * 0.4}s, ${SHIMMER_DELAYS[i] + 0.5}s` }}
              />
            </g>
          ))}
        </g>

        {/* Nucleus: sharp, no blur (wireframe aesthetic) */}
        <circle cx={CX} cy={CY} r="3" fill={C} opacity="0.4" className="sNucleus" />
        <circle cx={CX} cy={CY} r="1.5" fill={C} opacity="0.6" />
      </svg>
    </div>
  );
};

OrbitalHeroBackground.displayName = 'OrbitalHeroBackground';
