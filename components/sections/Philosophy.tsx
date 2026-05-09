'use client';

import { useRef, useEffect } from 'react';

const PILLARS = [
  {
    number: '01',
    name: 'Restraint',
    description:
      'We resist the impulse to fill. Every subtraction is a decision. The empty wall, the bare stone, the undecorated corner — these are not oversights. They are the composition.',
  },
  {
    number: '02',
    name: 'Material Honesty',
    description:
      'We do not disguise. Wood looks like wood. Stone reads as stone. Plaster shows its hand. Authenticity of material produces authenticity of atmosphere — and atmosphere is what people remember.',
  },
  {
    number: '03',
    name: 'Light First',
    description:
      'Before the first furniture decision, we map the light. How it enters, where it lands, how it moves through the day. Natural light is the most powerful material we work with, and it costs nothing.',
  },
  {
    number: '04',
    name: 'Human Scale',
    description:
      'Grand does not mean tall ceilings and vast rooms. It means a space that makes the person inside it feel exactly the right size — not small, not cramped. Calibrated to the body and the life lived within.',
  },
  {
    number: '05',
    name: 'Time Well Spent',
    description:
      'Our projects are not designed for the shoot. They are designed for ten years of living. Patina, wear, the slight darkening of a handrail — these are signs of a life well inhabited, not failures of design.',
  },
];

export default function Philosophy() {
  const pillarsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const items = pillarsRef.current.filter(Boolean);
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
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section
      id="philosophy"
      aria-labelledby="philosophy-heading"
      className="section"
      style={{ backgroundColor: 'var(--color-beige)' }}
    >
      <div className="container">
        {/* ── Header row ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'clamp(2rem, 6vw, 6rem)',
            alignItems: 'end',
            marginBottom: 'clamp(3.5rem, 7vh, 6rem)',
          }}
          className="phil-header"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <p className="text-label">09 — Philosophy</p>
            <h2
              id="philosophy-heading"
              className="text-display"
              style={{ maxWidth: '14ch' }}
            >
              Five principles.{' '}
              <em style={{ fontStyle: 'italic', color: 'var(--color-bronze)', fontWeight: 300 }}>
                One intent.
              </em>
            </h2>
          </div>

          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-base)',
              fontWeight: 300,
              color: 'var(--color-muted-brown)',
              lineHeight: 'var(--lh-relaxed)',
              maxWidth: '44ch',
              alignSelf: 'end',
              paddingBottom: '0.25rem',
            }}
          >
            These are not rules we inherited. They are conclusions we arrived at
            after fifteen years of building spaces for people who care deeply
            about how they live.
          </p>
        </div>

        {/* ── Pillars ── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            borderTop: '1px solid var(--color-glass-border)',
          }}
        >
          {PILLARS.map((pillar, i) => (
            <div
              key={pillar.number}
              ref={(el) => { if (el) pillarsRef.current[i] = el; }}
              style={{
                opacity: 0,
                transform: 'translateY(28px)',
                transition: `opacity 800ms var(--ease-luxury) ${i * 100}ms,
                             transform 800ms var(--ease-luxury) ${i * 100}ms`,
                display: 'grid',
                gridTemplateColumns: '120px 1fr',
                gap: 'clamp(2rem, 5vw, 5rem)',
                alignItems: 'start',
                padding: 'clamp(2rem, 4vh, 3rem) 0',
                borderBottom: '1px solid var(--color-glass-border)',
                position: 'relative',
              }}
              className="pillar-row"
            >
              {/* Large faint number */}
              <div style={{ position: 'relative', height: '100%' }}>
                <span
                  aria-hidden="true"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(5rem, 9vw, 8rem)',
                    fontWeight: 300,
                    color: 'rgba(44,24,16,0.05)',
                    lineHeight: 1,
                    letterSpacing: '-0.04em',
                    userSelect: 'none',
                    display: 'block',
                  }}
                >
                  {pillar.number}
                </span>
              </div>

              {/* Name + description */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-4)',
                  paddingTop: '0.6rem',
                }}
              >
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(1.5rem, 2.5vw, 2.25rem)',
                    fontWeight: 400,
                    color: 'var(--color-deep-brown)',
                    letterSpacing: '-0.01em',
                    lineHeight: 1.1,
                  }}
                >
                  {pillar.name}
                </h3>

                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 300,
                    color: 'var(--color-muted-brown)',
                    lineHeight: 'var(--lh-relaxed)',
                    maxWidth: '52ch',
                  }}
                >
                  {pillar.description}
                </p>
              </div>

              {/* Hover: bronze left accent */}
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: '2px',
                  backgroundColor: 'var(--color-bronze)',
                  transform: 'scaleY(0)',
                  transformOrigin: 'top',
                  transition: 'transform 400ms var(--ease-luxury)',
                }}
                className="pillar-accent"
              />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .pillar-row:hover .pillar-accent {
          transform: scaleY(1);
        }
        .pillar-row:hover h3 {
          color: var(--color-bronze);
          transition: color 300ms var(--ease-luxury);
        }

        @media (max-width: 700px) {
          .phil-header {
            grid-template-columns: 1fr !important;
          }
          .pillar-row {
            grid-template-columns: 56px 1fr !important;
            gap: var(--space-4) !important;
          }
        }
      `}</style>
    </section>
  );
}
