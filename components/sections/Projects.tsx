'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { projects, FILTER_LABELS, type ProjectCategory } from '@/data/projects';

type Filter = 'all' | ProjectCategory;
const FILTERS = Object.keys(FILTER_LABELS) as Filter[];

export default function Projects() {
  const [active, setActive] = useState<Filter>('all');
  const sectionRef = useRef<HTMLElement>(null);
  const router = useRouter();

  const filtered =
    active === 'all'
      ? projects
      : projects.filter((p) => p.category === active);

  /* ── Scroll reveal for section header ── */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || typeof window === 'undefined') return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          section
            .querySelectorAll<HTMLElement>('.proj-reveal')
            .forEach((el, i) => {
              el.style.transitionDelay = `${i * 80}ms`;
              el.classList.add('proj-revealed');
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
      id="projects"
      aria-labelledby="projects-heading"
      className="section"
      style={{ backgroundColor: '#EDEADF' }}
    >
      <div className="container">
        {/* ── Header ── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-6)',
            marginBottom: 'clamp(3rem, 6vh, 5rem)',
          }}
        >
          <p className="text-label proj-reveal" style={{ opacity: 0, transform: 'translateY(20px)', transition: 'opacity 700ms var(--ease-luxury), transform 700ms var(--ease-luxury)' }}>
            02 — Projects
          </p>

          <h2
            id="projects-heading"
            className="text-display proj-reveal"
            style={{
              opacity: 0,
              transform: 'translateY(20px)',
              transition: 'opacity 700ms var(--ease-luxury), transform 700ms var(--ease-luxury)',
              maxWidth: '16ch',
            }}
          >
            Every project,{' '}
            <em style={{ fontStyle: 'italic', color: 'var(--color-bronze)', fontWeight: 300 }}>
              a place
            </em>{' '}
            with a soul.
          </h2>

          {/* Filter pills */}
          <div
            role="group"
            aria-label="Filter projects by category"
            className="proj-reveal"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--space-3)',
              opacity: 0,
              transform: 'translateY(20px)',
              transition: 'opacity 700ms var(--ease-luxury), transform 700ms var(--ease-luxury)',
            }}
          >
            {FILTERS.map((f) => (
              <button
                key={f}
                id={`filter-${f}`}
                onClick={() => setActive(f)}
                aria-pressed={active === f}
                className={`pill ${active === f ? 'pill--active' : ''}`}
              >
                {FILTER_LABELS[f]}
              </button>
            ))}
          </div>
        </div>

        {/* ── Grid ── */}
        <LayoutGroup>
          <motion.div
            layout
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(12, 1fr)',
              gap: 'clamp(1rem, 2vw, 1.5rem)',
            }}
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((project, i) => {
                /* Asymmetric layout: cards alternate wide/narrow */
                const isWide = i % 3 === 0;
                return (
                  <motion.article
                    key={project.id}
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: i * 0.05 }}
                    aria-label={project.name}
                    onClick={() => router.push(`/projects/${project.id}`)}
                    style={{
                      gridColumn: isWide ? 'span 7' : 'span 5',
                      position: 'relative',
                      overflow: 'hidden',
                      backgroundColor: 'var(--color-card)',
                      cursor: 'pointer',
                    }}
                    className="project-card"
                  >
                    {/* Image */}
                    <div
                      style={{
                        position: 'relative',
                        width: '100%',
                        aspectRatio: isWide ? '4/3' : '3/4',
                        overflow: 'hidden',
                      }}
                    >
                      <Image
                        src={project.image}
                        alt={project.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 55vw"
                        style={{ objectFit: 'cover', transition: 'transform 700ms var(--ease-luxury)' }}
                        className="project-card-img"
                      />
                      {/* Hover gradient overlay */}
                      <div
                        aria-hidden="true"
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background:
                            'linear-gradient(to top, rgba(44,24,16,0.75) 0%, transparent 55%)',
                          opacity: 0,
                          transition: 'opacity 400ms var(--ease-luxury)',
                        }}
                        className="project-card-overlay"
                      />
                      {/* Slide-up info */}
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          padding: 'var(--space-6)',
                          transform: 'translateY(100%)',
                          transition: 'transform 450ms var(--ease-luxury)',
                          zIndex: 2,
                        }}
                        className="project-card-info"
                      >
                        <p
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: 'var(--text-xs)',
                            letterSpacing: 'var(--ls-wider)',
                            textTransform: 'uppercase',
                            color: 'rgba(245,245,220,0.7)',
                            marginBottom: 'var(--space-2)',
                          }}
                        >
                          {project.area}
                        </p>
                        <h3
                          style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'clamp(1.1rem, 2vw, 1.5rem)',
                            fontWeight: 400,
                            color: 'var(--color-beige)',
                            lineHeight: 1.2,
                          }}
                        >
                          {project.name}
                        </h3>
                        <p
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: 'var(--text-xs)',
                            color: 'rgba(245,245,220,0.6)',
                            marginTop: 'var(--space-2)',
                          }}
                        >
                          {project.sqft.toLocaleString()} sq ft &nbsp;·&nbsp; {project.year}
                        </p>
                      </div>
                    </div>

                    {/* Below-image label (visible at rest) */}
                    <div
                      style={{
                        padding: 'var(--space-4) var(--space-4) var(--space-6)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: 'var(--space-4)',
                      }}
                    >
                      <div>
                        <p
                          className="text-label"
                          style={{ color: 'var(--color-muted-brown)', marginBottom: 'var(--space-1)' }}
                        >
                          {FILTER_LABELS[project.category]}
                        </p>
                        <h3
                          style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'clamp(1rem, 1.8vw, 1.3rem)',
                            fontWeight: 400,
                            color: 'var(--color-deep-brown)',
                            lineHeight: 1.2,
                          }}
                        >
                          {project.name}
                        </h3>
                      </div>
                      <span
                        aria-hidden="true"
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '1.2rem',
                          color: 'var(--color-bronze)',
                          flexShrink: 0,
                          transform: 'rotate(-45deg)',
                          display: 'inline-block',
                          transition: 'transform 300ms var(--ease-luxury)',
                        }}
                        className="project-arrow"
                      >
                        →
                      </span>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </LayoutGroup>
      </div>

      {/* ── Hover interaction styles ── */}
      <style>{`
        .proj-revealed {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }

        .project-card:hover .project-card-img {
          transform: scale(1.06);
        }
        .project-card:hover .project-card-overlay {
          opacity: 1;
        }
        .project-card:hover .project-card-info {
          transform: translateY(0);
        }
        .project-card:hover .project-arrow {
          transform: rotate(0deg);
        }

        /* Mobile: all cards full width */
        @media (max-width: 768px) {
          .project-card {
            grid-column: span 12 !important;
          }
        }

        /* Tablet: alternate 7/5 */
        @media (min-width: 769px) and (max-width: 1100px) {
          .project-card {
            grid-column: span 6 !important;
          }
        }
      `}</style>
    </section>
  );
}
