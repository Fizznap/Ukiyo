'use client';

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

import { PROCESS_STEPS } from '@/data/process';

export default function Process() {
  const sectionRef = useRef<HTMLElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add('(min-width: 901px)', () => {
      // Pin the left column while the right column scrolls
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom bottom',
        pin: leftColRef.current,
        pinSpacing: false,
      });

      // Fade in/out panels on the right
      panelsRef.current.forEach((panel) => {
        gsap.fromTo(panel, 
          { opacity: 0.2, scale: 0.95 },
          { 
            opacity: 1, 
            scale: 1, 
            scrollTrigger: {
              trigger: panel,
              start: 'top 50%',
              end: 'bottom 50%',
              scrub: true,
            }
          }
        );
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="process"
      style={{
        backgroundColor: '#EBE5D9',
        position: 'relative',
        display: 'flex',
      }}
    >
      {/* Left Column (Pinned) */}
      <div
        ref={leftColRef}
        style={{
          width: '50%',
          height: '100vh',
          padding: 'clamp(4rem, 10vh, 8rem) clamp(2rem, 5vw, 5rem)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <p className="text-label" style={{ marginBottom: '2rem' }}>04 — The D3 Process</p>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(3rem, 6vw, 5rem)',
          fontWeight: 300,
          color: 'var(--color-deep-brown)',
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
        }}>
          How we <em style={{ fontStyle: 'italic', color: 'var(--color-bronze)' }}>work</em>.
        </h2>
        <p style={{
          marginTop: '2rem',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-base)',
          color: 'var(--color-muted-brown)',
          maxWidth: '40ch',
          lineHeight: 'var(--lh-relaxed)'
        }}>
          A disciplined three-phase methodology that turns abstract atmosphere into built reality.
        </p>
      </div>

      {/* Right Column (Scrolling) */}
      <div
        ref={rightColRef}
        style={{
          width: '50%',
          padding: '10vh 5vw 10vh 0',
        }}
      >
        {PROCESS_STEPS.map((step, i) => (
          <div
            key={step.id}
            ref={(el) => { if (el) panelsRef.current[i] = el; }}
            style={{
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <div style={{
              backgroundColor: 'var(--color-beige)',
              padding: '4rem',
              borderRadius: '8px',
              border: '1px solid var(--color-glass-border)',
              position: 'relative',
              overflow: 'hidden'
            }}>
               <span style={{
                 position: 'absolute',
                 top: '-2rem',
                 right: '-1rem',
                 fontFamily: 'var(--font-display)',
                 fontSize: '12rem',
                 fontWeight: 300,
                 color: 'rgba(184,134,11,0.04)',
                 lineHeight: 1,
                 pointerEvents: 'none'
               }}>
                 {step.number}
               </span>
               <h3 style={{
                 fontFamily: 'var(--font-display)',
                 fontSize: '2.5rem',
                 fontWeight: 400,
                 color: 'var(--color-deep-brown)',
                 marginBottom: '1.5rem',
                 position: 'relative',
                 zIndex: 1
               }}>
                 {step.title}
               </h3>
               <p style={{
                 fontFamily: 'var(--font-body)',
                 fontSize: '1.1rem',
                 color: 'var(--color-muted-brown)',
                 lineHeight: 1.6,
                 position: 'relative',
                 zIndex: 1
               }}>
                 {step.desc}
               </p>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 900px) {
          #process {
            flex-direction: column !important;
          }
          #process > div:first-child {
            width: 100% !important;
            height: auto !important;
            min-height: 60vh !important;
            position: relative !important;
            padding-bottom: 2rem !important;
          }
          #process > div:last-child {
            width: 100% !important;
            padding: 0 clamp(2rem, 5vw, 5rem) 4rem !important;
          }
          #process > div:last-child > div {
            min-height: auto !important;
            margin-bottom: 2rem !important;
          }
        }
      `}</style>
    </section>
  );
}
