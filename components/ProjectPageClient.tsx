'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import BeforeAfterSlider from '@/components/BeforeAfterSlider'
import type { Project } from '@/data/projects'

// ── Tonal palette ─────────────────────────────────────────────────────────────
const BG = {
  ivory: '#f4f1ea',   // warm ivory
  linen: '#efe9df',   // linen beige
  sand:  '#e8dfd2',   // soft sand
  stone: '#f7f3ed',   // pale stone
}

// ── Soft luxury shadow ─────────────────────────────────────────────────────────
const SHADOW = '0 10px 40px rgba(60,40,20,0.07), 0 2px 10px rgba(60,40,20,0.04)'

// ── Process notes per category ─────────────────────────────────────────────────
const PROCESS_NOTES: Record<string, string[]> = {
  residential: ['Custom millwork & joinery', 'Bespoke furniture placement', 'Layered lighting design'],
  commercial:  ['Acoustic treatment panels', 'Biophilic element integration', 'Ergonomic space planning'],
  hospitality: ['Hand-finished wall treatments', 'Custom lighting fixtures', 'Acoustic room treatment'],
  spa:         ['Natural stone sourcing & curation', 'Sensory material layering', 'Zen spatial sequencing'],
}

// ── Material chips per category ─────────────────────────────────────────────────
const MATERIAL_CHIPS: Record<string, string[]> = {
  Metal:   ['Antique Patina', 'Hand-Forged', 'Heirloom Grade'],
  Wood:    ['Natural Grain', 'Sustainable Source', 'Hand-Rubbed Oil'],
  Stone:   ['Quarry Direct', 'Honed Finish', 'Naturally Veined'],
  Fabric:  ['Natural Fibre', 'Stonewashed', 'Ethically Woven'],
  Floor:   ['Seamless Pour', 'Zero-VOC Seal', 'Thermoregulating'],
}

// ── Reveal hook using IntersectionObserver ──────────────────────────────────────
function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.querySelectorAll<HTMLElement>('[data-reveal]').forEach((child, i) => {
            setTimeout(() => {
              child.style.opacity = '1'
              child.style.transform = 'translateY(0)'
            }, i * 100)
          })
          io.disconnect()
        }
      },
      { threshold: 0.12 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return ref
}

// ── Reveal style helpers ────────────────────────────────────────────────────────
const revealStyle: React.CSSProperties = {
  opacity: 0,
  transform: 'translateY(36px)',
  transition: 'opacity 1.1s cubic-bezier(.22,1,.36,1), transform 1.1s cubic-bezier(.22,1,.36,1)',
}

// ── Grain texture SVG overlay ───────────────────────────────────────────────────
function GrainOverlay() {
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        pointerEvents: 'none',
        opacity: 0.028,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundSize: '200px 200px',
      }}
    />
  )
}

// ══════════════════════════════════════════════════════════════════════════════
export default function ProjectPageClient({ project }: { project: Project }) {
  const statsRef     = useReveal()
  const transformRef = useReveal()
  const materialsRef = useReveal()
  const buildRef     = useReveal()

  const processNotes = PROCESS_NOTES[project.category] ?? PROCESS_NOTES.residential
  const storyBlurb   = project.excerpt

  return (
    <main style={{ background: BG.ivory, minHeight: '100vh', color: '#2C1810', position: 'relative' }}>
      <GrainOverlay />

      {/* ── NAV ─────────────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 50,
        padding: '2rem clamp(1.5rem, 5vw, 5rem)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <Link
          href="/"
          style={{
            color: '#B8860B', fontSize: 10, letterSpacing: '0.28em',
            textTransform: 'uppercase', fontFamily: 'var(--font-body)',
            fontWeight: 500, textDecoration: 'none',
          }}
        >
          ← Back to Home
        </Link>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', width: '100%', height: '88vh', overflow: 'hidden' }}>
        {project.heroImage && (
          <Image
            src={project.heroImage}
            alt={project.name}
            fill
            priority
            style={{ objectFit: 'cover', transform: 'scale(1.04)', transition: 'transform 8s ease-out' }}
          />
        )}
        {/* Dark scrim */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.5) 100%)' }} />

        {/* Hero text — bottom left, offset */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, width: '100%',
          padding: 'clamp(2rem,5vw,5rem) clamp(1.5rem,5vw,5rem)',
          zIndex: 10,
        }}>
          <p style={{
            fontSize: 10, letterSpacing: '0.32em', textTransform: 'uppercase',
            color: 'rgba(237,234,223,0.6)', fontFamily: 'var(--font-body)',
            marginBottom: 'clamp(0.75rem,2vh,1.25rem)',
          }}>
            {project.category} · {project.city}
          </p>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(3.2rem, 7vw, 7.5rem)',
            lineHeight: 0.92,
            fontWeight: 300,
            color: '#EDEADF',
            letterSpacing: '-0.02em',
            maxWidth: '14ch',
          }}>
            {project.name}
          </h1>
          <p style={{
            marginTop: 'clamp(1rem,2.5vh,1.75rem)',
            color: 'rgba(237,234,223,0.75)',
            fontSize: 'clamp(0.95rem,1.2vw,1.1rem)',
            maxWidth: '52ch',
            lineHeight: 1.65,
            fontFamily: 'var(--font-body)',
          }}>
            {project.excerpt}
          </p>
        </div>
      </section>

      {/* ── STATS — warm ivory ──────────────────────────────────────────────── */}
      <section ref={statsRef} style={{ background: BG.ivory, padding: 'clamp(4rem,8vh,7rem) clamp(1.5rem,5vw,5rem)' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 'clamp(2rem,4vw,4rem)',
          maxWidth: 1200,
          margin: '0 auto',
        }}>
          {[
            { label: 'Location', value: `${project.area}, ${project.city}` },
            { label: 'Category', value: project.category.charAt(0).toUpperCase() + project.category.slice(1) },
            { label: 'Year',     value: String(project.year) },
            { label: 'Area',     value: `${project.sqft.toLocaleString()} sqft` },
          ].map((stat, i) => (
            <div
              key={stat.label}
              data-reveal
              style={{ ...revealStyle, transitionDelay: `${i * 80}ms` }}
            >
              <p style={{
                fontSize: 9, letterSpacing: '0.32em', textTransform: 'uppercase',
                color: '#B8860B', fontFamily: 'var(--font-body)', fontWeight: 500,
                marginBottom: '0.6rem',
              }}>
                {stat.label}
              </p>
              <p style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.1rem,1.5vw,1.4rem)',
                fontWeight: 400,
                color: '#2C1810',
              }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TRANSFORMATION — linen beige, full-bleed ────────────────────────── */}
      {project.beforeImage && project.afterImage && (
        <section
          ref={transformRef}
          style={{
            background: BG.linen,
            padding: 'clamp(5rem,10vh,9rem) 0',
            overflow: 'hidden',
          }}
        >
          {/* Editorial heading — offset right */}
          <div style={{
            display: 'flex', justifyContent: 'flex-end',
            padding: '0 clamp(1.5rem,5vw,5rem)',
            marginBottom: 'clamp(3rem,5vh,5rem)',
          }}>
            <div data-reveal style={{ ...revealStyle, textAlign: 'right' }}>
              <p style={{
                fontSize: 9, letterSpacing: '0.32em', textTransform: 'uppercase',
                color: '#B8860B', fontFamily: 'var(--font-body)', fontWeight: 500,
                marginBottom: '0.75rem',
              }}>
                Before & After
              </p>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(3.5rem, 6vw, 6.5rem)',
                lineHeight: 0.95,
                fontWeight: 300,
                color: '#2C1810',
                letterSpacing: '-0.02em',
              }}>
                Transformation
              </h2>
            </div>
          </div>

          {/* Slider — constrained to viewport */}
          <div data-reveal style={{
            ...revealStyle,
            width: '100%',
            maxWidth: '100vw',
            padding: '0 clamp(1.5rem,5vw,5rem)',
            boxSizing: 'border-box',
            margin: '0 auto',
          }}>
            <BeforeAfterSlider
              beforeImage={project.beforeImage}
              afterImage={project.afterImage}
              materials={project.materials ?? []}
            />
          </div>
        </section>
      )}

      {/* ── CURATED MATERIALS — soft sand ───────────────────────────────────── */}
      {project.materials && project.materials.length > 0 && (
        <section
          ref={materialsRef}
          style={{
            background: BG.sand,
            padding: 'clamp(5rem,10vh,9rem) clamp(1.5rem,5vw,5rem)',
          }}
        >
          {/* Asymmetric heading — left offset */}
          <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            <div data-reveal style={{ ...revealStyle, marginBottom: 'clamp(4rem,7vh,7rem)', paddingLeft: '6%' }}>
              <p style={{
                fontSize: 9, letterSpacing: '0.32em', textTransform: 'uppercase',
                color: '#B8860B', fontFamily: 'var(--font-body)', fontWeight: 500,
                marginBottom: '0.75rem',
              }}>
                Material Palette
              </p>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(3.5rem, 6vw, 6.5rem)',
                lineHeight: 0.95,
                fontWeight: 300,
                color: '#2C1810',
                letterSpacing: '-0.02em',
              }}>
                Curated<br />Materials
              </h2>
            </div>

            {/* Editorial card grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
              gap: 'clamp(1.5rem,3vw,3rem)',
            }}>
              {project.materials.map((mat, idx) => {
                const chips = MATERIAL_CHIPS[mat.type] ?? ['Premium Quality', 'Artisan Made', 'Curated']
                return (
                  <div
                    key={idx}
                    data-reveal
                    style={{
                      ...revealStyle,
                      transitionDelay: `${idx * 120}ms`,
                      borderRadius: 4,
                      overflow: 'hidden',
                      background: BG.ivory,
                      boxShadow: SHADOW,
                      cursor: 'pointer',
                      transform: 'translateY(36px)',
                      transition: [
                        'opacity 1.1s cubic-bezier(.22,1,.36,1)',
                        'transform 1.1s cubic-bezier(.22,1,.36,1)',
                      ].join(', '),
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLDivElement
                      el.style.transform = 'translateY(-6px)'
                      el.style.boxShadow = '0 20px 60px rgba(60,40,20,0.12), 0 4px 16px rgba(60,40,20,0.06)'
                      const img = el.querySelector<HTMLImageElement>('.mat-img')
                      if (img) img.style.transform = 'scale(1.06)'
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLDivElement
                      el.style.transform = 'translateY(0)'
                      el.style.boxShadow = SHADOW
                      const img = el.querySelector<HTMLImageElement>('.mat-img')
                      if (img) img.style.transform = 'scale(1)'
                    }}
                  >
                    {/* Large image */}
                    <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', overflow: 'hidden' }}>
                      <img
                        src={mat.image}
                        alt={mat.name}
                        className="mat-img"
                        style={{
                          width: '100%', height: '100%', objectFit: 'cover',
                          transition: 'transform 0.7s cubic-bezier(.22,1,.36,1)',
                        }}
                      />
                      {/* Index badge */}
                      <span style={{
                        position: 'absolute', top: 16, left: 16,
                        width: 28, height: 28, borderRadius: '50%',
                        background: '#B8860B', color: '#fff',
                        display: 'grid', placeItems: 'center',
                        fontSize: 11, fontWeight: 700,
                        fontFamily: 'var(--font-body)',
                      }}>
                        {idx + 1}
                      </span>
                      {/* Gradient scrim */}
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(to top, rgba(44,24,16,0.35) 0%, transparent 55%)',
                        pointerEvents: 'none',
                      }} />
                    </div>

                    {/* Card content */}
                    <div style={{ padding: 'clamp(1.25rem,2.5vw,1.75rem)' }}>
                      <p style={{
                        fontSize: 9, letterSpacing: '0.32em', textTransform: 'uppercase',
                        color: '#B8860B', fontFamily: 'var(--font-body)', fontWeight: 500,
                        marginBottom: '0.4rem',
                      }}>
                        {mat.type}
                      </p>
                      <h3 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(1.3rem,2vw,1.6rem)',
                        fontWeight: 400,
                        color: '#2C1810',
                        lineHeight: 1.2,
                        marginBottom: '0.6rem',
                      }}>
                        {mat.name}
                      </h3>
                      {mat.description && (
                        <p style={{
                          fontSize: 13, lineHeight: 1.65,
                          color: 'rgba(40,30,20,0.62)',
                          fontFamily: 'var(--font-body)',
                          marginBottom: '1rem',
                        }}>
                          {mat.description}
                        </p>
                      )}

                      {/* Floating chips */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {chips.map(chip => (
                          <span key={chip} style={{
                            display: 'inline-block',
                            borderRadius: 999,
                            background: BG.linen,
                            border: '1px solid rgba(44,24,16,0.1)',
                            padding: '3px 10px',
                            fontSize: 10,
                            letterSpacing: '0.06em',
                            color: 'rgba(40,30,20,0.7)',
                            fontFamily: 'var(--font-body)',
                            fontWeight: 500,
                          }}>
                            {chip}
                          </span>
                        ))}
                      </div>

                      {mat.price != null && (
                        <p style={{
                          marginTop: '1.25rem',
                          fontFamily: 'var(--font-display)',
                          fontSize: '1.15rem',
                          fontWeight: 400,
                          color: '#2C1810',
                        }}>
                          ₹{mat.price.toLocaleString()}
                          <span style={{ fontSize: 11, color: 'rgba(40,30,20,0.45)', marginLeft: 6, fontFamily: 'var(--font-body)' }}>
                            per unit
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── BEHIND THE BUILD — pale stone ────────────────────────────────────── */}
      {project.processImages && project.processImages.length > 0 && (
        <section
          ref={buildRef}
          style={{
            background: BG.stone,
            padding: 'clamp(5rem,10vh,9rem) 0',
            overflow: 'hidden',
          }}
        >
          <div style={{
            maxWidth: 1400,
            margin: '0 auto',
            padding: '0 clamp(1.5rem,5vw,5rem)',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'clamp(4rem,8vw,9rem)',
            alignItems: 'center',
          }}>
            {/* ── Left: Storytelling text ── */}
            <div>
              <div data-reveal style={{ ...revealStyle }}>
                <p style={{
                  fontSize: 9, letterSpacing: '0.32em', textTransform: 'uppercase',
                  color: '#B8860B', fontFamily: 'var(--font-body)', fontWeight: 500,
                  marginBottom: '1.25rem',
                }}>
                  Process
                </p>
                <h2 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(3rem,5vw,5.5rem)',
                  lineHeight: 0.95,
                  fontWeight: 300,
                  color: '#2C1810',
                  letterSpacing: '-0.02em',
                  marginBottom: 'clamp(2rem,4vh,3rem)',
                }}>
                  Behind<br />The Build
                </h2>
              </div>

              <div data-reveal style={{ ...revealStyle, transitionDelay: '100ms' }}>
                <p style={{
                  fontSize: 'clamp(0.95rem,1.2vw,1.1rem)',
                  lineHeight: 1.75,
                  color: 'rgba(40,30,20,0.72)',
                  fontFamily: 'var(--font-body)',
                  maxWidth: '46ch',
                  marginBottom: 'clamp(2rem,4vh,3rem)',
                }}>
                  {storyBlurb} Every material, every joint, every shadow was
                  considered as part of a living, breathing experience.
                </p>
              </div>

              {/* Process notes */}
              <div data-reveal style={{ ...revealStyle, transitionDelay: '200ms' }}>
                <div style={{
                  borderTop: '1px solid rgba(44,24,16,0.1)',
                  paddingTop: 'clamp(1.5rem,3vh,2rem)',
                }}>
                  <p style={{
                    fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase',
                    color: 'rgba(40,30,20,0.45)', fontFamily: 'var(--font-body)', fontWeight: 500,
                    marginBottom: '1rem',
                  }}>
                    Craft notes
                  </p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {processNotes.map((note, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{
                          width: 4, height: 4, borderRadius: '50%',
                          background: '#B8860B', flexShrink: 0, marginTop: 1,
                        }} />
                        <span style={{
                          fontSize: 13, color: 'rgba(40,30,20,0.72)',
                          fontFamily: 'var(--font-body)', lineHeight: 1.5,
                        }}>
                          {note}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Project tags */}
              {project.tags && project.tags.length > 0 && (
                <div data-reveal style={{ ...revealStyle, transitionDelay: '300ms', marginTop: 'clamp(2rem,4vh,3rem)' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {project.tags.map(tag => (
                      <span key={tag} style={{
                        borderRadius: 999,
                        border: '1px solid rgba(44,24,16,0.15)',
                        padding: '5px 14px',
                        fontSize: 10, letterSpacing: '0.08em',
                        color: 'rgba(40,30,20,0.65)',
                        fontFamily: 'var(--font-body)',
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Right: Images — overflow edge ── */}
            <div
              data-reveal
              style={{
                ...revealStyle,
                transitionDelay: '150ms',
                display: 'flex',
                flexDirection: 'column',
                gap: 'clamp(1rem,2vw,1.5rem)',
                // Bleed past the grid on the right
                marginRight: 'calc(-1 * clamp(1.5rem,5vw,5rem))',
              }}
            >
              {project.processImages.slice(0, 2).map((img, i) => (
                <div
                  key={i}
                  style={{
                    position: 'relative',
                    height: i === 0 ? 'clamp(260px,38vh,480px)' : 'clamp(160px,22vh,280px)',
                    borderRadius: i === 0 ? '4px 0 0 4px' : '4px 0 0 4px',
                    overflow: 'hidden',
                    boxShadow: SHADOW,
                  }}
                >
                  <Image
                    src={img}
                    alt={`Process ${i + 1}`}
                    fill
                    style={{
                      objectFit: 'cover',
                      transition: 'transform 8s ease-out',
                    }}
                    className="build-img"
                  />
                  {/* Subtle scrim */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(135deg, transparent 60%, rgba(44,24,16,0.15) 100%)',
                    pointerEvents: 'none',
                  }} />
                </div>
              ))}
            </div>
          </div>

          {/* Mobile: stack vertically */}
          <style>{`
            @media (max-width: 768px) {
              .build-grid { grid-template-columns: 1fr !important; }
              .build-overflow { margin-right: 0 !important; border-radius: 4px !important; }
            }
          `}</style>
        </section>
      )}

      {/* ── FOOTER — warm ivory ──────────────────────────────────────────────── */}
      <footer style={{
        background: BG.ivory,
        padding: 'clamp(5rem,10vh,8rem) clamp(1.5rem,5vw,5rem)',
        borderTop: '1px solid rgba(44,24,16,0.08)',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: 9, letterSpacing: '0.32em', textTransform: 'uppercase',
          color: 'rgba(40,30,20,0.4)', fontFamily: 'var(--font-body)', fontWeight: 500,
          marginBottom: '2.5rem',
        }}>
          Ukiyo Interior · {project.city}
        </p>
        <Link
          href="/#projects"
          style={{
            display: 'inline-block',
            borderRadius: 2,
            border: '1px solid rgba(44,24,16,0.25)',
            padding: '14px 40px',
            fontSize: 10,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: '#2C1810',
            fontFamily: 'var(--font-body)',
            fontWeight: 500,
            textDecoration: 'none',
            transition: 'all 0.3s ease',
            background: 'transparent',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLAnchorElement
            el.style.background = '#2C1810'
            el.style.color = '#EDEADF'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLAnchorElement
            el.style.background = 'transparent'
            el.style.color = '#2C1810'
          }}
        >
          Return to All Projects
        </Link>
      </footer>
    </main>
  )
}
