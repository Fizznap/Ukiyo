'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const revealEls = useRef<HTMLElement[]>([]);

  /* ── Mouse-follow radial light ── */
  useEffect(() => {
    const light = lightRef.current;
    if (!light) return;

    const onMove = (e: MouseEvent) => {
      light.style.left = `${e.clientX}px`;
      light.style.top = `${e.clientY}px`;
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  /* ── GSAP text reveals + parallax ── */
  useEffect(() => {
    const els = revealEls.current.filter(Boolean);
    if (!els.length) return;

    // Stagger reveal on load (after loading screen exits ~2.4s)
    const tl = gsap.timeline({ delay: 2.6 });
    tl.fromTo(
      els,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 1.1,
        ease: 'expo.out',
        stagger: 0.12,
      }
    );

    // Parallax — headline moves at 0.4× scroll speed
    const headline = headlineRef.current;
    if (headline) {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
          const y = self.progress * window.innerHeight * 0.4;
          gsap.set(headline, { y });
        },
      });
    }

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  const addReveal = (el: HTMLElement | null) => {
    if (el && !revealEls.current.includes(el)) revealEls.current.push(el);
  };

  return (
    <section
      ref={sectionRef}
      id="hero"
      aria-label="Hero — Ukiyo Interior"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100svh',
        backgroundColor: 'var(--color-beige)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 'calc(var(--nav-height) + 4rem) clamp(1.5rem, 5vw, 5rem) 5rem',
        overflow: 'hidden',
      }}
    >
      {/* Mouse-follow bronze radial gradient */}
      <div
        ref={lightRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(184,134,11,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
          transform: 'translate(-50%, -50%)',
          zIndex: 0,
          transition: 'left 80ms linear, top 80ms linear',
          willChange: 'left, top',
        }}
      />

      {/* Faint background serif watermark */}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          right: 'clamp(-2rem, -2vw, -4rem)',
          top: '50%',
          transform: 'translateY(-50%) rotate(90deg)',
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(10rem, 18vw, 22rem)',
          fontWeight: 700,
          color: 'rgba(44,24,16,0.03)',
          letterSpacing: '-0.04em',
          lineHeight: 1,
          userSelect: 'none',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        UKIYO
      </span>

      {/* Main content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 'var(--max-w-content)',
          width: '100%',
        }}
      >
        {/* Location label */}
        <p
          ref={addReveal}
          className="text-label"
          style={{ marginBottom: 'clamp(1.5rem, 3vh, 2.5rem)', opacity: 0 }}
        >
          Mumbai &nbsp;·&nbsp; Maharashtra &nbsp;·&nbsp; Est. 2014
        </p>

        {/* Headline block with parallax wrapper */}
        <div ref={headlineRef} style={{ willChange: 'transform' }}>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-hero)',
              fontWeight: 300,
              lineHeight: 'var(--lh-tight)',
              letterSpacing: 'var(--ls-tight)',
              color: 'var(--color-deep-brown)',
              maxWidth: '14ch',
            }}
          >
            <span
              ref={addReveal}
              style={{ display: 'block', opacity: 0 }}
            >
              Where
            </span>
            <span
              ref={addReveal}
              style={{ display: 'block', opacity: 0 }}
            >
              <em
                style={{
                  fontStyle: 'italic',
                  color: 'var(--color-bronze)',
                  fontWeight: 300,
                }}
              >
                emotion
              </em>{' '}
              meets
            </span>
            <span
              ref={addReveal}
              style={{ display: 'block', opacity: 0 }}
            >
              interior.
            </span>
          </h1>
        </div>

        {/* Sub-row: founder + descriptor */}
        <div
          ref={addReveal}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 'clamp(2rem, 6vw, 5rem)',
            marginTop: 'clamp(2rem, 4vh, 3.5rem)',
            opacity: 0,
            flexWrap: 'wrap',
          }}
        >
          {/* Founder label */}
          <div>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                fontWeight: 300,
                color: 'var(--color-muted-brown)',
                letterSpacing: 'var(--ls-wide)',
                marginBottom: '0.25rem',
              }}
            >
              Led by
            </p>
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.1rem, 2vw, 1.4rem)',
                fontWeight: 400,
                color: 'var(--color-deep-brown)',
                letterSpacing: '0.02em',
              }}
            >
              Pratik Soni
            </p>
          </div>

          {/* Hairline separator */}
          <div
            style={{
              width: '1px',
              height: '48px',
              backgroundColor: 'var(--color-glass-border)',
              flexShrink: 0,
              alignSelf: 'center',
            }}
          />

          {/* Descriptor */}
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              fontWeight: 300,
              color: 'var(--color-muted-brown)',
              lineHeight: 'var(--lh-relaxed)',
              maxWidth: '34ch',
            }}
          >
            Designing thoughtful spaces for discerning homes and
            hospitality across Mumbai since 2014.
          </p>
        </div>

        {/* CTA row */}
        <div
          ref={addReveal}
          style={{
            display: 'flex',
            gap: 'var(--space-6)',
            marginTop: 'clamp(2.5rem, 5vh, 4rem)',
            opacity: 0,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <a
            href="#projects"
            className="btn btn--primary"
            id="hero-view-work"
            aria-label="View Ukiyo Interior projects"
          >
            View Our Work
          </a>
          <a
            href="#contact"
            className="btn btn--ghost"
            id="hero-begin-space"
            aria-label="Begin your space with Ukiyo Interior"
          >
            Begin Your Space
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        ref={addReveal}
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: 'clamp(2rem, 4vh, 3rem)',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
          opacity: 0,
          zIndex: 1,
        }}
      >
        <span
          className="text-label"
          style={{ color: 'var(--color-muted-brown)' }}
        >
          Scroll
        </span>
        <div
          style={{
            width: '1px',
            height: '48px',
            backgroundColor: 'var(--color-bronze)',
            animation: 'pulse-fade 2s ease-in-out infinite',
          }}
        />
      </div>
      {/* Editorial Image Collage (Right Side) */}
      <div
        ref={addReveal}
        style={{
          position: 'absolute',
          right: 'clamp(2rem, 5vw, 8rem)',
          top: '50%',
          marginTop: 'calc(var(--nav-height) / 2)',
          transform: 'translateY(-50%)',
          width: 'clamp(300px, 35vw, 500px)',
          height: 'clamp(400px, 60vh, 650px)',
          zIndex: 2,
          opacity: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
        className="hero-collage"
      >
        <div
          style={{
            position: 'relative',
            width: '80%',
            height: '65%',
            alignSelf: 'flex-end',
            overflow: 'hidden',
          }}
        >
          <Image
            src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=900&q=80&auto=format&fit=crop"
            alt="Ukiyo Interior Residential"
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
        </div>
        <div
          style={{
            position: 'relative',
            width: '65%',
            height: '45%',
            alignSelf: 'flex-start',
            marginTop: '-15%',
            overflow: 'hidden',
            zIndex: 3,
            border: '8px solid var(--color-beige)',
          }}
        >
          <Image
            src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=900&q=80&auto=format&fit=crop"
            alt="Ukiyo Interior Detail"
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .hero-collage {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}
