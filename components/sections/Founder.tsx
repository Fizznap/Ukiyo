'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';

export default function Founder() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          section.querySelectorAll<HTMLElement>('.founder-reveal').forEach((el, i) => {
            setTimeout(() => {
              el.style.opacity = '1';
              el.style.transform = 'translateY(0)';
            }, i * 120);
          });
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(section);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="studio"
      aria-labelledby="founder-heading"
      className="section"
      style={{ backgroundColor: 'var(--color-beige)' }}
    >
      <div className="container">
        <p className="text-label founder-reveal" style={{ opacity: 0, transform: 'translateY(20px)', transition: 'opacity 700ms var(--ease-luxury), transform 700ms var(--ease-luxury)', marginBottom: 'clamp(3rem, 6vh, 5rem)' }}>
          08 — Studio
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'clamp(3rem, 8vw, 8rem)',
            alignItems: 'start',
          }}
          className="founder-grid"
        >
          {/* ── Left: Portrait ── */}
          <div
            className="founder-reveal"
            style={{
              opacity: 0,
              transform: 'translateY(24px)',
              transition: 'opacity 900ms var(--ease-luxury), transform 900ms var(--ease-luxury)',
            }}
          >
            <div
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '3/4',
                overflow: 'hidden',
                backgroundColor: 'var(--color-card)',
              }}
            >
              <Image
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80&auto=format&fit=crop&crop=face"
                alt="Pratik Soni — Founder & Principal Designer, Ukiyo Interior"
                fill
                sizes="(max-width: 768px) 100vw, 45vw"
                style={{ objectFit: 'cover', objectPosition: 'center top' }}
              />
              {/* Subtle warm overlay */}
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to bottom, transparent 60%, rgba(44,24,16,0.25) 100%)',
                }}
              />
            </div>

            {/* Caption below portrait */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: 'var(--space-4)',
                borderTop: '1px solid var(--color-glass-border)',
                marginTop: 'var(--space-4)',
              }}
            >
              <div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 400, color: 'var(--color-deep-brown)' }}>
                  Pratik Soni
                </p>
                <p className="text-caption" style={{ marginTop: '2px' }}>
                  Founder &amp; Principal Designer
                </p>
              </div>
              <p className="text-caption">Est. 2014</p>
            </div>
          </div>

          {/* ── Right: Bio ── */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'clamp(1.5rem, 3vh, 2.5rem)',
              paddingTop: 'clamp(1rem, 3vh, 2rem)',
            }}
          >
            <h2
              id="founder-heading"
              className="text-title founder-reveal"
              style={{
                opacity: 0,
                transform: 'translateY(20px)',
                transition: 'opacity 800ms var(--ease-luxury), transform 800ms var(--ease-luxury)',
                maxWidth: '16ch',
              }}
            >
              Design is a{' '}
              <em style={{ fontStyle: 'italic', color: 'var(--color-bronze)', fontWeight: 300 }}>
                conversation
              </em>{' '}
              with how you live.
            </h2>

            <div
              style={{ width: '3rem', height: '1px', backgroundColor: 'var(--color-bronze)' }}
              className="founder-reveal"
            />

            <p
              className="text-body founder-reveal"
              style={{
                opacity: 0,
                transform: 'translateY(20px)',
                transition: 'opacity 700ms var(--ease-luxury), transform 700ms var(--ease-luxury)',
                color: 'var(--color-muted-brown)',
              }}
            >
              Raised in Mumbai, Pratik brings an international design perspective
              shaped by years of experience in hospitality and luxury interiors.
              His journey into interior design began while working alongside
              renowned Japanese designer Mariko Yuki on a premium restaurant
              project in Dubai Marina.
            </p>

            <p
              className="text-body founder-reveal"
              style={{
                opacity: 0,
                transform: 'translateY(20px)',
                transition: 'opacity 700ms var(--ease-luxury), transform 700ms var(--ease-luxury)',
                color: 'var(--color-muted-brown)',
              }}
            >
              With a strong eye for detail, trend awareness, and a
              problem-solving mindset, Pratik leads Ukiyo with a vision
              focused on thoughtful design, quality execution, and meaningful
              client relationships. Every project begins with a single question:
              how do you want to feel when you walk through this door?
            </p>

            {/* Stats row */}
            <div
              className="founder-reveal"
              style={{
                opacity: 0,
                transform: 'translateY(20px)',
                transition: 'opacity 700ms var(--ease-luxury), transform 700ms var(--ease-luxury)',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 'var(--space-4)',
                paddingTop: 'var(--space-6)',
                borderTop: '1px solid var(--color-glass-border)',
                marginTop: 'var(--space-4)',
              }}
            >
              {[
                { value: '10+', label: 'Years of Practice' },
                { value: '85+', label: 'Projects Completed' },
                { value: '6', label: 'Design Disciplines' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)',
                      fontWeight: 300,
                      color: 'var(--color-deep-brown)',
                      lineHeight: 1,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {stat.value}
                  </p>
                  <p
                    className="text-caption"
                    style={{ marginTop: 'var(--space-2)', color: 'var(--color-muted-brown)' }}
                  >
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Location footer */}
            <div
              className="founder-reveal"
              style={{
                opacity: 0,
                transform: 'translateY(20px)',
                transition: 'opacity 700ms var(--ease-luxury), transform 700ms var(--ease-luxury)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                paddingTop: 'var(--space-4)',
              }}
            >
              <div
                style={{ width: '2rem', height: '1px', backgroundColor: 'var(--color-bronze)', flexShrink: 0 }}
              />
              <p className="text-label" style={{ color: 'var(--color-muted-brown)' }}>
                Mumbai, Maharashtra, India
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .founder-grid {
            grid-template-columns: 1fr !important;
            gap: clamp(2rem, 5vw, 3rem) !important;
          }
        }
      `}</style>
    </section>
  );
}
