'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';
import { journal } from '@/data/journal';

export default function Journal() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          section.querySelectorAll<HTMLElement>('.jnl-reveal').forEach((el, i) => {
            setTimeout(() => {
              el.style.opacity = '1';
              el.style.transform = 'translateY(0)';
            }, i * 110);
          });
          io.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    io.observe(section);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="journal"
      aria-labelledby="journal-heading"
      className="section"
      style={{ backgroundColor: '#EDEADF' }}
    >
      <div className="container">
        {/* ── Header ── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: 'clamp(3rem, 6vh, 5rem)',
            gap: 'var(--space-8)',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <p
              className="text-label jnl-reveal"
              style={{
                opacity: 0,
                transform: 'translateY(20px)',
                transition: 'opacity 700ms var(--ease-luxury), transform 700ms var(--ease-luxury)',
              }}
            >
              10 — Journal
            </p>
            <h2
              id="journal-heading"
              className="text-display jnl-reveal"
              style={{
                opacity: 0,
                transform: 'translateY(20px)',
                transition: 'opacity 700ms var(--ease-luxury), transform 700ms var(--ease-luxury)',
                maxWidth: '16ch',
              }}
            >
              Ideas worth{' '}
              <em style={{ fontStyle: 'italic', color: 'var(--color-bronze)', fontWeight: 300 }}>
                sitting with.
              </em>
            </h2>
          </div>

          <a
            href="/journal"
            className="btn btn--ghost jnl-reveal"
            aria-label="View all journal entries"
            style={{
              opacity: 0,
              transform: 'translateY(20px)',
              transition: 'opacity 700ms var(--ease-luxury), transform 700ms var(--ease-luxury)',
              alignSelf: 'flex-end',
            }}
          >
            All Entries →
          </a>
        </div>

        {/* ── Cards ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'clamp(1.25rem, 2.5vw, 2rem)',
          }}
          className="journal-grid"
        >
          {journal.map((entry, i) => (
            <article
              key={entry.id}
              className="jnl-card jnl-reveal"
              aria-label={entry.title}
              style={{
                opacity: 0,
                transform: 'translateY(28px)',
                transition: `opacity 700ms var(--ease-luxury) ${i * 120}ms, transform 700ms var(--ease-luxury) ${i * 120}ms`,
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--color-glass-border)',
                overflow: 'hidden',
              }}
            >
              {/* Image */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '16/10',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                <Image
                  src={entry.image}
                  alt={entry.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  style={{
                    objectFit: 'cover',
                    transition: 'transform 700ms var(--ease-luxury)',
                  }}
                  className="jnl-img"
                />
              </div>

              {/* Content */}
              <div
                style={{
                  padding: 'clamp(1.25rem, 2.5vw, 1.75rem)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-4)',
                  flexGrow: 1,
                }}
              >
                {/* Tag + read time */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 500,
                      letterSpacing: 'var(--ls-wider)',
                      textTransform: 'uppercase',
                      color: 'var(--color-bronze)',
                    }}
                  >
                    {entry.tag}
                  </span>
                  <span className="text-caption">{entry.readTime}</span>
                </div>

                {/* Title */}
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(1.1rem, 1.8vw, 1.4rem)',
                    fontWeight: 400,
                    color: 'var(--color-deep-brown)',
                    lineHeight: 'var(--lh-snug)',
                  }}
                >
                  {entry.title}
                </h3>

                {/* Excerpt */}
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 300,
                    color: 'var(--color-muted-brown)',
                    lineHeight: 'var(--lh-relaxed)',
                    flexGrow: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {entry.excerpt}
                </p>

                {/* Footer: date + arrow */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: 'var(--space-4)',
                    borderTop: '1px solid var(--color-glass-border)',
                    marginTop: 'auto',
                  }}
                >
                  <span className="text-caption">{entry.date}</span>
                  <a
                    href={`/journal/${entry.slug}`}
                    aria-label={`Read ${entry.title}`}
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 500,
                      letterSpacing: 'var(--ls-wide)',
                      color: 'var(--color-bronze)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                      transition: 'gap 250ms var(--ease-luxury)',
                    }}
                    className="jnl-read"
                  >
                    Read <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <style>{`
        .jnl-card:hover .jnl-img {
          transform: scale(1.05);
        }
        .jnl-card:hover {
          box-shadow: var(--shadow-card);
        }
        .jnl-card:hover .jnl-read {
          gap: var(--space-3);
        }

        @media (max-width: 900px) {
          .journal-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 560px) {
          .journal-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
