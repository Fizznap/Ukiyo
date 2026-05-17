'use client';

import { useEffect, useRef } from 'react';

/**
 * CustomCursor
 * - 8px bronze filled dot at rest
 * - Scales to 28px outlined circle on hover targets
 * - Smooth lag via lerp (linear interpolation)
 * - z-index: var(--z-cursor) = 9998
 * - Hidden on touch devices
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: -100, y: -100 });
  const pos = useRef({ x: -100, y: -100 });
  const rafId = useRef<number>(0);
  const isHovering = useRef(false);

  useEffect(() => {
    // Hide on touch
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    const HOVER_SELECTORS =
      'a, button, [role="button"], input, textarea, select, label, .cursor-hover, [data-cursor]';

    const onEnter = (e: MouseEvent) => {
      if ((e.target as Element).closest(HOVER_SELECTORS)) {
        isHovering.current = true;
        ring.style.width = 'var(--cursor-size-hover)';
        ring.style.height = 'var(--cursor-size-hover)';
        ring.style.opacity = '1';
        dot.style.opacity = '0.4';
      }
    };

    const onLeave = (e: MouseEvent) => {
      if ((e.target as Element).closest(HOVER_SELECTORS)) {
        isHovering.current = false;
        ring.style.width = '0px';
        ring.style.height = '0px';
        ring.style.opacity = '0';
        dot.style.opacity = '1';
      }
    };

    document.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseover', onEnter, { passive: true });
    document.addEventListener('mouseout', onLeave, { passive: true });

    // Lerp animation loop
    function lerp(a: number, b: number, n: number) {
      return a + (b - a) * n;
    }

    function animate() {
      pos.current.x = lerp(pos.current.x, mouse.current.x, 0.12);
      pos.current.y = lerp(pos.current.y, mouse.current.y, 0.12);

      if (dot) {
        dot.style.transform = `translate3d(${mouse.current.x}px, ${mouse.current.y}px, 0) translate(-50%, -50%)`;
      }

      if (ring) {
        ring.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) translate(-50%, -50%)`;
      }

      rafId.current = requestAnimationFrame(animate);
    }

    rafId.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId.current);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onEnter);
      document.removeEventListener('mouseout', onLeave);
    };
  }, []);

  return (
    <>
      {/* Dot — snaps to exact cursor position */}
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 'var(--cursor-size)',
          height: 'var(--cursor-size)',
          borderRadius: '50%',
          backgroundColor: 'var(--color-bronze)',
          /* Beige outline keeps the cursor visible on bronze-saturated areas
             (Maharashtra fill, India fill, etc.) where the dot would
             otherwise blend into the background.                           */
          boxShadow: '0 0 0 1.5px rgba(245, 245, 220, 0.95)',
          zIndex: 'var(--z-cursor)' as unknown as number,
          pointerEvents: 'none',
          willChange: 'transform',
          transition: 'opacity 200ms var(--ease-luxury)',
        }}
      />

      {/* Ring — lags slightly behind, appears on hover */}
      <div
        ref={ringRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 0,
          height: 0,
          borderRadius: '50%',
          border: '1px solid var(--color-bronze)',
          zIndex: 'var(--z-cursor)' as unknown as number,
          pointerEvents: 'none',
          willChange: 'transform',
          opacity: 0,
          transition:
            'width 250ms var(--ease-luxury), height 250ms var(--ease-luxury), opacity 200ms var(--ease-luxury)',
        }}
      />
    </>
  );
}
