'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

/**
 * LoadingScreen
 * - Full-screen #EDEADF beige
 * - UKIYO wordmark: Cormorant Garamond 80px, tracking 0.35em
 * - Bronze hairline: animates 0 → 180px over 1.8s
 * - "Designed With Intent." sub-label fades in at 0.6s
 * - Exit: entire panel slides yPercent(-100) expo.inOut 1.2s
 * - z-index: var(--z-loading) = 9997
 */
export default function LoadingScreen() {
  const panelRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const panel = panelRef.current;
    const line = lineRef.current;
    const wordmark = wordmarkRef.current;
    const sub = subRef.current;

    if (!panel || !line || !wordmark || !sub) return;

    const tl = gsap.timeline({
      onComplete: () => {
        // Exit after content loaded (min 2.4s)
        const exitDelay = setTimeout(() => {
          gsap.to(panel, {
            yPercent: -100,
            duration: 1.2,
            ease: 'expo.inOut',
            onComplete: () => setDone(true),
          });
        }, 300);

        return () => clearTimeout(exitDelay);
      },
    });

    // Wordmark reveal
    tl.fromTo(
      wordmark,
      { opacity: 0, letterSpacing: '0.5em' },
      { opacity: 1, letterSpacing: '0.35em', duration: 1.0, ease: 'expo.out' },
      0
    );

    // Bronze line grows
    tl.fromTo(
      line,
      { width: 0 },
      { width: '180px', duration: 1.8, ease: 'expo.inOut' },
      0.2
    );

    // Sub-label fades in
    tl.fromTo(
      sub,
      { opacity: 0, y: 6 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out' },
      0.6
    );
  }, []);

  if (done) return null;

  return (
    <div
      ref={panelRef}
      role="status"
      aria-label="Loading Ukiyo Interior"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 'var(--z-loading)' as unknown as number,
        backgroundColor: 'var(--color-beige)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
      }}
    >
      {/* UKIYO wordmark */}
      <h1
        ref={wordmarkRef}
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(48px, 7vw, 80px)',
          fontWeight: 300,
          color: 'var(--color-deep-brown)',
          letterSpacing: '0.35em',
          opacity: 0,
          lineHeight: 1,
          textIndent: '0.35em', /* compensate for letter-spacing on last char */
        }}
      >
        UKIYO
      </h1>

      {/* Bronze progress line */}
      <div
        style={{
          height: '1px',
          backgroundColor: 'var(--color-bronze)',
          width: 0,
        }}
        ref={lineRef}
      />

      {/* Sub-label */}
      <p
        ref={subRef}
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-label)',
          fontWeight: 500,
          letterSpacing: 'var(--ls-widest)',
          textTransform: 'uppercase',
          color: 'var(--color-muted-brown)',
          opacity: 0,
        }}
      >
        Designed With Intent.
      </p>
    </div>
  );
}
