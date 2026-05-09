'use client';

import { useRef, useEffect } from 'react';

const STATEMENTS = [
  {
    id: 'presence',
    number: '01',
    statement: (
      <>
        A room should make you feel{' '}
        <em style={{ color: 'var(--color-bronze)', fontStyle: 'italic' }}>
          present
        </em>
        , not just housed.
      </>
    ),
    sub: 'We design for the body before the eye — for how a space makes you breathe, move, and settle.',
  },
  {
    id: 'memory',
    number: '02',
    statement: (
      <>
        The best interiors become{' '}
        <em style={{ color: 'var(--color-bronze)', fontStyle: 'italic' }}>
          memories
        </em>
        , not just backdrops.
      </>
    ),
    sub: 'Great design is felt long after you leave the room. We chase that feeling in every project we take on.',
  },
  {
    id: 'intention',
    number: '03',
    statement: (
      <>
        Nothing here exists without{' '}
        <em style={{ color: 'var(--color-bronze)', fontStyle: 'italic' }}>
          intention
        </em>
        .
      </>
    ),
    sub: 'Every material, joint, proportion, and shadow is a decision. There is no decoration for decoration\'s sake.',
  },
];

export default function EmotionalJourney() {
  const sectionRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const items = itemRefs.current.filter(Boolean);
    if (!items.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.25, rootMargin: '0px 0px -60px 0px' }
    );

    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="experience"
      aria-labelledby="experience-heading"
      className="section"
      style={{ backgroundColor: 'var(--color-beige)' }}
    >
      <div className="container">
        {/* Section label */}
        <p
          className="text-label"
          style={{
            marginBottom: 'clamp(3rem, 7vh, 5.5rem)',
            color: 'var(--color-muted-brown)',
          }}
        >
          03 — The Experience
        </p>

        {/* Eyebrow heading — visually hidden but in DOM for SEO */}
        <h2
          id="experience-heading"
          className="sr-only"
        >
          The Ukiyo Experience
        </h2>

        {/* Editorial statements */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 0,
          }}
        >
          {STATEMENTS.map((item, i) => (
            <div
              key={item.id}
              ref={(el) => { if (el) itemRefs.current[i] = el; }}
              style={{
                opacity: 0,
                transform: 'translateY(36px)',
                transition: `opacity 900ms var(--ease-luxury) ${i * 150}ms, transform 900ms var(--ease-luxury) ${i * 150}ms`,
                display: 'grid',
                gridTemplateColumns: '80px 1fr',
                gap: 'clamp(1.5rem, 4vw, 4rem)',
                alignItems: 'start',
                padding: 'clamp(2.5rem, 5vh, 4rem) 0',
                borderBottom: i < STATEMENTS.length - 1
                  ? '1px solid var(--color-glass-border)'
                  : 'none',
                position: 'relative',
              }}
              className="ej-item"
            >
              {/* Faint index number */}
              <span
                aria-hidden="true"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(3.5rem, 6vw, 5rem)',
                  fontWeight: 300,
                  color: 'rgba(184,134,11,0.12)',
                  lineHeight: 1,
                  letterSpacing: '-0.03em',
                  userSelect: 'none',
                  paddingTop: '0.1em',
                  flexShrink: 0,
                }}
              >
                {item.number}
              </span>

              {/* Statement + sub */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'clamp(1rem, 2.5vh, 1.75rem)',
                }}
              >
                <blockquote
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
                    fontWeight: 300,
                    lineHeight: 1.2,
                    letterSpacing: '-0.01em',
                    color: 'var(--color-deep-brown)',
                    margin: 0,
                    maxWidth: '22ch',
                  }}
                >
                  {item.statement}
                </blockquote>

                {/* Bronze hairline */}
                <div
                  aria-hidden="true"
                  style={{
                    width: 'clamp(2.5rem, 5vw, 4rem)',
                    height: '1px',
                    backgroundColor: 'var(--color-bronze)',
                  }}
                />

                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 300,
                    color: 'var(--color-muted-brown)',
                    lineHeight: 'var(--lh-relaxed)',
                    maxWidth: '48ch',
                  }}
                >
                  {item.sub}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Closing editorial line */}
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1rem, 1.8vw, 1.3rem)',
            fontWeight: 300,
            fontStyle: 'italic',
            color: 'var(--color-muted-brown)',
            marginTop: 'clamp(3rem, 6vh, 5rem)',
            letterSpacing: '0.02em',
            textAlign: 'right',
          }}
        >
          — Designed With Intent. Built Around You.
        </p>
      </div>

      <style>{`
        @media (max-width: 560px) {
          .ej-item {
            grid-template-columns: 1fr !important;
            gap: var(--space-4) !important;
          }
        }
      `}</style>
    </section>
  );
}
