'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import type { Project } from '@/data/projects';

interface Props {
  project: Project;
  onClose: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  residential:  'Residential',
  commercial:   'Commercial',
  hospitality:  'Hospitality',
  spa:          'Spa & Salon',
};

const MATERIAL_PILLS: Record<string, string[]> = {
  'bandra-penthouse':       ['Aged Brass', 'Warm Timber', 'Curated Stone'],
  'malabar-hill-residence': ['Handcrafted Millwork', 'Bespoke Upholstery', 'Heritage Plaster'],
  'worli-sea-view':         ['Fluted Glass', 'Honed Marble', 'Natural Linen'],
  'juhu-boutique-hotel':    ['Handloom Textile', 'Rattan', 'Oxidised Copper'],
  'powai-tech-office':      ['Bamboo Panels', 'Exposed Concrete', 'Living Walls'],
  'andheri-wellness-spa':   ['Raw Stone', 'Teak', 'Wabi-Sabi Plaster'],
};

export default function ProjectModal({ project, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef   = useRef<HTMLDivElement>(null);

  /* ── Mount / unmount animation ── */
  useEffect(() => {
    const overlay = overlayRef.current;
    const panel   = panelRef.current;
    if (!overlay || !panel) return;

    // Animate in
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      panel.style.opacity   = '1';
      panel.style.transform = 'scale(1)';
    });

    // Lock body scroll
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleClose = () => {
    const overlay = overlayRef.current;
    const panel   = panelRef.current;
    if (!overlay || !panel) { onClose(); return; }

    // Animate out
    overlay.style.opacity = '0';
    panel.style.opacity   = '0';
    panel.style.transform = 'scale(0.94)';
    setTimeout(onClose, 380);
  };

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pills = MATERIAL_PILLS[project.id] ?? ['Bespoke Design', 'Premium Materials'];

  return (
    /* ── Overlay ── */
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Project details — ${project.name}`}
      onClick={(e) => { if (e.target === overlayRef.current) handleClose(); }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(237, 232, 223, 0.45)', // Warm frosted tint
        backdropFilter: 'blur(12px) saturate(110%)',
        WebkitBackdropFilter: 'blur(12px) saturate(110%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(1rem, 3vw, 2rem)',
        zIndex: 9000,
        opacity: 0,
        transition: 'opacity 380ms cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      {/* ── Panel ── */}
      <div
        ref={panelRef}
        style={{
          width: '100%',
          maxWidth: '900px',
          maxHeight: '92vh',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          overflow: 'hidden',
          backgroundColor: '#F5F5DC', // Solid beige background to contrast the glass
          borderRadius: '16px', // Rounded corners for premium feel
          border: '1px solid rgba(245, 245, 220, 0.6)',
          boxShadow: '0 32px 80px rgba(44,24,16,0.15)',
          opacity: 0,
          transform: 'scale(0.94)',
          transition: 'opacity 400ms cubic-bezier(0.16,1,0.3,1), transform 400ms cubic-bezier(0.16,1,0.3,1)',
        }}
        className="modal-panel"
      >
        {/* ── Left: Image ── */}
        <div style={{ position: 'relative', minHeight: '480px', overflow: 'hidden', flexShrink: 0 }}>
          <Image
            src={project.image}
            alt={project.name}
            fill
            sizes="450px"
            style={{ objectFit: 'cover' }}
            priority
          />
          {/* Bottom gradient */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(44,24,16,0.35) 0%, transparent 55%)',
            }}
          />
          {/* Category pill */}
          <div
            style={{
              position: 'absolute',
              top: '1.25rem',
              left: '1.25rem',
              padding: '4px 12px',
              border: '1px solid rgba(245,245,220,0.5)',
              backgroundColor: 'rgba(245,245,220,0.15)',
              backdropFilter: 'blur(8px)',
              borderRadius: '99px',
            }}
          >
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.625rem', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#F5F5DC' }}>
              {CATEGORY_LABELS[project.category] ?? project.category}
            </span>
          </div>
        </div>

        {/* ── Right: Content ── */}
        <div
          style={{
            backgroundColor: '#F5F5DC', // Match solid panel background
            padding: 'clamp(1.75rem, 4vw, 2.75rem)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(1rem, 2.5vh, 1.5rem)',
            overflowY: 'auto',
            position: 'relative',
          }}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            aria-label="Close project details"
            id="modal-close-btn"
            style={{
              position: 'absolute',
              top: '1.25rem',
              right: '1.25rem',
              width: '32px',
              height: '32px',
              border: '1px solid var(--color-glass-border)',
              borderRadius: '50%',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-body)',
              fontSize: '1rem',
              color: 'var(--color-muted-brown)',
              transition: 'border-color 200ms, color 200ms',
              flexShrink: 0,
            }}
            className="modal-close"
          >
            ×
          </button>

          {/* City / location */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-bronze)', flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-label)', fontWeight: 500, letterSpacing: 'var(--ls-wider)', textTransform: 'uppercase', color: 'var(--color-bronze)' }}>
              {project.area} · {project.city}
            </span>
          </div>

          {/* Title */}
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)', fontWeight: 300, color: 'var(--color-deep-brown)', lineHeight: 1.1, letterSpacing: '-0.02em', marginTop: '-0.25rem' }}>
            {project.name}
          </h2>

          {/* Hairline */}
          <div style={{ width: '2.5rem', height: '1px', backgroundColor: 'var(--color-bronze)' }} />

          {/* Excerpt */}
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 300, color: 'var(--color-muted-brown)', lineHeight: 'var(--lh-relaxed)' }}>
            {project.excerpt}
          </p>

          {/* 2×2 Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', backgroundColor: 'var(--color-glass-border)', border: '1px solid var(--color-glass-border)', marginTop: '0.25rem' }}>
            {[
              { label: 'Year',       value: String(project.year) },
              { label: 'Area',       value: `${project.sqft.toLocaleString()} sqft` },
              { label: 'Category',   value: CATEGORY_LABELS[project.category] ?? project.category },
              { label: 'Location',   value: project.area },
            ].map(({ label, value }) => (
              <div key={label} style={{ padding: '0.9rem 1rem', backgroundColor: 'rgba(245,245,220,0.8)' }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-muted-brown)', marginBottom: '0.3rem' }}>{label}</p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 400, color: 'var(--color-deep-brown)' }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Material pills */}
          <div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-label)', fontWeight: 500, letterSpacing: 'var(--ls-wider)', textTransform: 'uppercase', color: 'var(--color-muted-brown)', marginBottom: '0.6rem' }}>
              Key Materials
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {pills.map((pill) => (
                <span
                  key={pill}
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.7rem',
                    fontWeight: 400,
                    letterSpacing: '0.06em',
                    color: 'var(--color-deep-brown)',
                    border: '1px solid var(--color-glass-border)',
                    borderRadius: '99px',
                    padding: '3px 10px',
                    backgroundColor: 'rgba(245, 245, 220, 0.4)',
                  }}
                >
                  {pill}
                </span>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: 'auto', paddingTop: '0.5rem' }}>
            <button
              id={`modal-view-${project.id}`}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-label)',
                fontWeight: 500,
                letterSpacing: 'var(--ls-wider)',
                textTransform: 'uppercase',
                color: 'var(--color-beige)',
                backgroundColor: 'var(--color-deep-brown)',
                border: 'none',
                padding: '0.75rem 1.5rem',
                cursor: 'pointer',
                transition: 'background 250ms var(--ease-luxury)',
                flexShrink: 0,
              }}
              className="modal-cta-primary"
            >
              View Full Project
            </button>
            <button
              id={`modal-explore-${project.id}`}
              onClick={handleClose}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-label)',
                fontWeight: 500,
                letterSpacing: 'var(--ls-wider)',
                textTransform: 'uppercase',
                color: 'var(--color-bronze)',
                backgroundColor: 'transparent',
                border: '1px solid var(--color-bronze)',
                padding: '0.75rem 1.5rem',
                cursor: 'pointer',
                transition: 'background 250ms var(--ease-luxury), color 250ms var(--ease-luxury)',
                flexShrink: 0,
              }}
              className="modal-cta-ghost"
            >
              Keep Exploring
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .modal-close:hover { border-color: var(--color-bronze); color: var(--color-bronze); }
        .modal-cta-primary:hover { background: var(--color-bronze) !important; }
        .modal-cta-ghost:hover { background: var(--color-bronze) !important; color: var(--color-beige) !important; }
        @media (max-width: 700px) {
          .modal-panel { grid-template-columns: 1fr !important; }
          .modal-panel > div:first-child { min-height: 260px !important; }
        }
      `}</style>
    </div>
  );
}
