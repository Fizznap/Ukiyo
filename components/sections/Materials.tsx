'use client';

import { useRef } from 'react';
import Image from 'next/image';

import { MATERIALS } from '@/data/materials';

export default function Materials() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      id="materials"
      className="section"
      style={{ backgroundColor: 'var(--color-beige)' }}
    >
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 'clamp(3rem, 6vh, 5rem)' }}>
          <p className="text-label" style={{ marginBottom: '1rem' }}>06 — Material Edit</p>
          <h2 className="text-display" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
            The <em style={{ fontStyle: 'italic', color: 'var(--color-bronze)' }}>Vocabulary</em>
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem'
        }}>
          {MATERIALS.map((mat) => (
            <div key={mat.id} className="material-card" style={{ position: 'relative', aspectRatio: '4/5', overflow: 'hidden' }}>
              <Image 
                src={mat.src} 
                alt={mat.name} 
                fill 
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                style={{ objectFit: 'cover', transition: 'transform 700ms var(--ease-luxury)' }} 
                className="mat-img"
              />
              <div 
                className="mat-overlay"
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(44,24,16,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0,
                  transition: 'opacity 500ms var(--ease-luxury)'
                }}
              >
                <span style={{
                  fontFamily: 'var(--font-display)',
                  color: '#fff',
                  fontSize: '1.5rem',
                  letterSpacing: '0.05em'
                }}>
                  {mat.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .material-card:hover .mat-img {
          transform: scale(1.05);
        }
        .material-card:hover .mat-overlay {
          opacity: 1 !important;
        }
      `}</style>
    </section>
  );
}
