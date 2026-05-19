'use client';

import { useRef, useEffect } from 'react';
import { services } from '@/data/services';

export default function Services() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            section
              .querySelectorAll<HTMLElement>('.svc-reveal')
              .forEach((el, i) => {
                setTimeout(() => {
                  el.style.opacity = '1';
                  el.style.transform = 'translateY(0)';
                }, i * 90);
              });
            io.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    io.observe(section);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="services"
      aria-labelledby="services-heading"
      className="section"
      style={{ backgroundColor: '#EDEADF' }}
    >
      <div className="container">
        {/* ── Header ── */}
        <div
          style={{
            marginBottom: 'clamp(3rem, 6vh, 5rem)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-6)',
          }}
        >
          <p
            className="text-label svc-reveal"
            style={{
              opacity: 0,
              transform: 'translateY(20px)',
              transition: 'opacity 700ms var(--ease-luxury), transform 700ms var(--ease-luxury)',
            }}
          >
            05 — Services
          </p>

          <h2
            id="services-heading"
            className="text-display svc-reveal"
            style={{
              opacity: 0,
              transform: 'translateY(20px)',
              transition: 'opacity 700ms var(--ease-luxury), transform 700ms var(--ease-luxury)',
              maxWidth: '18ch',
            }}
          >
            A practice of{' '}
            <em
              style={{
                fontStyle: 'italic',
                color: 'var(--color-bronze)',
                fontWeight: 300,
              }}
            >
              six
            </em>{' '}
            disciplines.
          </h2>

          <p
            className="text-body svc-reveal"
            style={{
              opacity: 0,
              transform: 'translateY(20px)',
              transition: 'opacity 700ms var(--ease-luxury), transform 700ms var(--ease-luxury)',
              color: 'var(--color-muted-brown)',
              maxWidth: '52ch',
            }}
          >
            Each service is a focused expertise, not a catch-all offering.
            We work across scale and typology with the same rigour.
          </p>
        </div>

        {/* ── 3 × 2 Card Grid ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'clamp(1px, 0.5vw, 1px)',
          }}
          className="services-grid"
        >
          {services.map((service, i) => (
            <article
              key={service.id}
              aria-label={service.name}
              className="svc-card svc-reveal"
              style={{
                opacity: 0,
                transform: 'translateY(24px)',
                transition: `opacity 700ms var(--ease-luxury), transform 700ms var(--ease-luxury),
                             border-left-width 300ms var(--ease-luxury),
                             transform 300ms var(--ease-luxury),
                             box-shadow 300ms var(--ease-luxury)`,
                transitionDelay: `${i * 90}ms`,
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--color-glass-border)',
                borderLeft: '0px solid var(--color-bronze)',
                padding: 'clamp(1.75rem, 3vw, 2.5rem)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-6)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Number */}
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: 'clamp(1.25rem, 2vw, 1.75rem)',
                  right: 'clamp(1.25rem, 2vw, 1.75rem)',
                  fontFamily: 'var(--font-display)',
                  fontSize: '4rem',
                  fontWeight: 300,
                  color: 'rgba(44,24,16,0.05)',
                  lineHeight: 1,
                  userSelect: 'none',
                }}
              >
                {service.number}
              </span>

              {/* Content */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(1.2rem, 2vw, 1.55rem)',
                    fontWeight: 400,
                    color: 'var(--color-deep-brown)',
                    lineHeight: 'var(--lh-snug)',
                  }}
                >
                  {service.name}
                </h3>

                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 300,
                    fontStyle: 'italic',
                    color: 'var(--color-bronze)',
                    letterSpacing: '0.01em',
                  }}
                >
                  {service.tagline}
                </p>
              </div>

              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 300,
                  color: 'var(--color-muted-brown)',
                  lineHeight: 'var(--lh-relaxed)',
                  flexGrow: 1,
                }}
              >
                {service.description}
              </p>

              {/* Deliverables */}
              <ul
                aria-label={`${service.name} deliverables`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-2)',
                  borderTop: '1px solid var(--color-glass-border)',
                  paddingTop: 'var(--space-4)',
                }}
              >
                {service.deliverables.map((item) => (
                  <li
                    key={item}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-3)',
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 300,
                      color: 'var(--color-muted-brown)',
                      letterSpacing: '0.01em',
                    }}
                  >
                    {/* Bronze dot */}
                    <span
                      aria-hidden="true"
                      style={{
                        width: '4px',
                        height: '4px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-bronze)',
                        flexShrink: 0,
                      }}
                    />
                    {item}
                  </li>
                ))}
              </ul>

              {/* Hover CTA */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  marginTop: 'auto',
                }}
              >
                <a
                  href="#contact"
                  aria-label={`Enquire about ${service.name}`}
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-label)',
                    fontWeight: 500,
                    letterSpacing: 'var(--ls-wider)',
                    textTransform: 'uppercase',
                    color: 'var(--color-bronze)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    opacity: 0,
                    transform: 'translateX(-8px)',
                    transition: 'opacity 250ms var(--ease-luxury), transform 250ms var(--ease-luxury)',
                  }}
                  className="svc-card-cta"
                >
                  Enquire
                  <span aria-hidden="true" style={{ fontSize: '0.9rem' }}>→</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>

      <style>{`
        /* Hover: lift + left bronze border + show CTA */
        .svc-card:hover {
          transform: translateY(-6px) !important;
          box-shadow: var(--shadow-card);
          border-left-width: 2px !important;
          border-left-color: var(--color-bronze) !important;
        }
        .svc-card:hover .svc-card-cta {
          opacity: 1 !important;
          transform: translateX(0) !important;
        }

        /* Responsive grid */
        @media (max-width: 900px) {
          .services-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 580px) {
          .services-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
