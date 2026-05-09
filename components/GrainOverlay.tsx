'use client';

/**
 * GrainOverlay
 * Fixed full-screen SVG feTurbulence grain texture.
 * z-index: var(--z-grain) = 9999
 * Pointer-events: none — never blocks clicks.
 * Opacity: 0.042 — barely perceptible, adds tactile depth.
 */
export default function GrainOverlay() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 'var(--z-grain)' as unknown as number,
        pointerEvents: 'none',
        opacity: 0.042,
        mixBlendMode: 'multiply',
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        style={{
          width: '100%',
          height: '100%',
          animation: 'grain-shift 0.8s steps(1) infinite',
        }}
      >
        <filter id="ukiyo-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.72"
            numOctaves="4"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#ukiyo-grain)" />
      </svg>
    </div>
  );
}
