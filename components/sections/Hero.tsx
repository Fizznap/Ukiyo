'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);
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

  /* ── GSAP text reveals & floating images ── */
  useEffect(() => {
    const els = revealEls.current.filter(Boolean);
    if (els.length) {
      gsap.fromTo(
        els,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'expo.out',
          stagger: 0.15,
          delay: 0.2, // Small delay for load
        }
      );
    }

    // Floating animation for right-side overlapping images
    gsap.to('.hero-image-float', {
      y: '15px',
      rotation: '+=1.5',
      duration: 4,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
      stagger: 0.5
    });

    return () => {
      gsap.killTweensOf(els);
      gsap.killTweensOf('.hero-image-float');
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
        minHeight: '100vh',
        backgroundColor: '#F5F5DC', // Warm beige
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Mouse-follow bronze radial gradient light */}
      <div
        ref={lightRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(184,134,11,0.08) 0%, transparent 60%)',
          pointerEvents: 'none',
          transform: 'translate(-50%, -50%)',
          zIndex: 0,
          willChange: 'left, top',
        }}
      />

      <div 
        style={{ 
          display: 'flex', 
          width: '100%', 
          maxWidth: '1600px', 
          margin: '0 auto', 
          padding: '0 clamp(2rem, 5vw, 5rem)',
          zIndex: 1,
          flexWrap: 'wrap',
        }}
      >
        {/* Left side (50% width) */}
        <div 
          style={{ 
            flex: '1 1 50%', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center',
            paddingRight: '4rem',
            minWidth: '320px',
          }}
        >
          {/* Small label top */}
          <p
            ref={addReveal}
            style={{
              fontFamily: 'var(--font-body), "DM Sans", sans-serif',
              fontSize: '10px',
              color: '#B8860B', // Bronze
              textTransform: 'uppercase',
              letterSpacing: '0.3em',
              marginBottom: '2rem',
              fontWeight: 500,
              opacity: 0,
            }}
          >
            MUMBAI · MAHARASHTRA · EST. 2014
          </p>

          {/* Main headline */}
          <h1
            style={{
              fontFamily: 'var(--font-display), "Cormorant Garamond", serif',
              fontSize: 'clamp(48px, 6vw, 88px)',
              fontWeight: 300,
              lineHeight: 1.05,
              color: '#2C1810', // Deep brown
              marginBottom: '2rem',
              letterSpacing: '-0.01em',
            }}
          >
            <span ref={addReveal} style={{ display: 'block', opacity: 0 }}>Space that feels intentional,</span>
            <span ref={addReveal} style={{ display: 'block', opacity: 0 }}>designed for the way you live,</span>
            <span ref={addReveal} style={{ display: 'block', opacity: 0 }}>
              where <em style={{ fontStyle: 'italic', color: '#B8860B' }}>emotion meets interior.</em>
            </span>
          </h1>

          {/* Sub-label founder */}
          <p
            ref={addReveal}
            style={{
              fontFamily: 'var(--font-body), "DM Sans", sans-serif',
              fontSize: '11px',
              color: '#8B7355', // Muted brown
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '3rem',
              opacity: 0,
            }}
          >
            Pratik Soni · Founder &amp; Principal Designer
          </p>

          {/* Two buttons */}
          <div ref={addReveal} style={{ display: 'flex', gap: '1.5rem', opacity: 0, flexWrap: 'wrap' }}>
            <a
              href="#projects"
              style={{
                backgroundColor: '#2C1810',
                color: '#F5F5DC',
                padding: '1.2rem 2.5rem',
                textDecoration: 'none',
                fontFamily: 'var(--font-body), "DM Sans", sans-serif',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontWeight: 500,
                transition: 'background-color 0.3s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#4A3022')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2C1810')}
            >
              View Our Work
            </a>
            <a
              href="#contact"
              style={{
                border: '1px solid #2C1810',
                color: '#2C1810',
                padding: '1.2rem 2.5rem',
                textDecoration: 'none',
                fontFamily: 'var(--font-body), "DM Sans", sans-serif',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontWeight: 500,
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2C1810';
                e.currentTarget.style.color = '#F5F5DC';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#2C1810';
              }}
            >
              Begin Your Space
            </a>
          </div>
        </div>

        {/* Right side (50% width) - Overlapping images */}
        <div 
          className="hero-right-images"
          style={{ 
            flex: '1 1 50%', 
            position: 'relative', 
            minHeight: '600px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Image 1 (Back left) */}
          <div 
            className="hero-image-float"
            style={{ 
              position: 'absolute', 
              width: '300px', 
              height: '420px', 
              transform: 'rotate(-5deg) translate(-80px, -40px)', 
              zIndex: 1,
              boxShadow: '0 20px 40px rgba(44,24,16,0.1)'
            }}
          >
            <Image 
              src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80" 
              alt="Warm luxury interior" 
              fill 
              sizes="(min-width: 1024px) 300px, 50vw"
              style={{ objectFit: 'cover' }} 
              priority
            />
            {/* Warm overlay */}
            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(184,134,11,0.08)', mixBlendMode: 'overlay' }} />
          </div>

          {/* Image 2 (Front right) */}
          <div 
            className="hero-image-float"
            style={{ 
              position: 'absolute', 
              width: '280px', 
              height: '380px', 
              transform: 'rotate(6deg) translate(80px, 60px)', 
              zIndex: 2,
              boxShadow: '0 20px 40px rgba(44,24,16,0.1)'
            }}
          >
            <Image 
              src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80" 
              alt="Minimalist design space" 
              fill 
              sizes="(min-width: 1024px) 280px, 50vw"
              style={{ objectFit: 'cover' }} 
              priority
            />
            {/* Warm overlay */}
            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(184,134,11,0.08)', mixBlendMode: 'overlay' }} />
          </div>

          {/* Image 3 (Bottom center) */}
          <div 
            className="hero-image-float"
            style={{ 
              position: 'absolute', 
              width: '220px', 
              height: '300px', 
              transform: 'rotate(-2deg) translate(10px, 160px)', 
              zIndex: 3,
              boxShadow: '0 20px 40px rgba(44,24,16,0.1)'
            }}
          >
            <Image 
              src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80" 
              alt="Texture and mood" 
              fill 
              sizes="(min-width: 1024px) 220px, 50vw"
              style={{ objectFit: 'cover' }} 
            />
            {/* Warm overlay */}
            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(184,134,11,0.08)', mixBlendMode: 'overlay' }} />
          </div>
        </div>
      </div>

      {/* Scroll indicator bottom center */}
      <div
        ref={addReveal}
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          opacity: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            width: '1px',
            height: '60px',
            backgroundColor: '#B8860B', // Bronze
            animation: 'hero-scroll-pulse 2.5s ease-in-out infinite',
            transformOrigin: 'top',
          }}
        />
      </div>

      <style>{`
        @keyframes hero-scroll-pulse {
          0% { transform: scaleY(0); opacity: 0; }
          50% { transform: scaleY(1); opacity: 1; }
          100% { transform: scaleY(1) translateY(100%); opacity: 0; }
        }

        @media (max-width: 1024px) {
          .hero-right-images {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}
