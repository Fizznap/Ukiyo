'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';

const NAV_LINKS = [
  { label: 'Projects', href: '#projects' },
  { label: 'Services', href: '#services' },
  { label: 'Philosophy', href: '#philosophy' },
  { label: 'Studio', href: '#studio' },
  { label: 'Journal', href: '#journal' },
  { label: 'Contact', href: '#contact' },
];

export default function Navigation() {
  const navRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const menuLinksRef = useRef<HTMLLIElement[]>([]);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const bar1Ref = useRef<HTMLSpanElement>(null);
  const bar2Ref = useRef<HTMLSpanElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  /* ── Scroll listener → toggle beige bg ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── GSAP hamburger bars morph ── */
  useEffect(() => {
    const b1 = bar1Ref.current;
    const b2 = bar2Ref.current;
    if (!b1 || !b2) return;

    if (menuOpen) {
      gsap.to(b1, { rotate: 45, y: 5, duration: 0.35, ease: 'expo.out' });
      gsap.to(b2, { rotate: -45, y: -5, duration: 0.35, ease: 'expo.out' });
    } else {
      gsap.to(b1, { rotate: 0, y: 0, duration: 0.35, ease: 'expo.out' });
      gsap.to(b2, { rotate: 0, y: 0, duration: 0.35, ease: 'expo.out' });
    }
  }, [menuOpen]);

  /* ── GSAP overlay open / close ── */
  useEffect(() => {
    const overlay = overlayRef.current;
    const links = menuLinksRef.current;
    if (!overlay) return;

    if (menuOpen) {
      gsap.set(overlay, { display: 'flex' });
      gsap.fromTo(
        overlay,
        { clipPath: 'inset(0 0 100% 0)' },
        { clipPath: 'inset(0 0 0% 0)', duration: 0.7, ease: 'expo.inOut' }
      );
      gsap.fromTo(
        links,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out', stagger: 0.07, delay: 0.3 }
      );
    } else {
      gsap.to(overlay, {
        clipPath: 'inset(0 0 100% 0)',
        duration: 0.55,
        ease: 'expo.inOut',
        onComplete: () => gsap.set(overlay, { display: 'none' }),
      });
    }
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      {/* ── Desktop / Mobile Nav Bar ── */}
      <nav
        ref={navRef}
        id="main-nav"
        aria-label="Main navigation"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 'var(--nav-height)',
          zIndex: 'var(--z-nav)' as unknown as number,
          display: 'flex',
          alignItems: 'center',
          padding: '0 clamp(1.5rem, 5vw, 5rem)',
          backgroundColor: scrolled ? 'var(--color-beige)' : 'transparent',
          boxShadow: scrolled ? 'var(--shadow-nav)' : 'none',
          transition: 'background-color 500ms var(--ease-luxury), box-shadow 500ms var(--ease-luxury)',
        }}
      >
        {/* Wordmark */}
        <Link
          href="/"
          aria-label="Ukiyo Interior — Home"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.25rem',
            fontWeight: 300,
            letterSpacing: '0.25em',
            color: 'var(--color-deep-brown)',
            flexShrink: 0,
          }}
        >
          UKIYO
        </Link>

        {/* Center links — desktop only */}
        <ul
          aria-label="Site sections"
          style={{
            display: 'flex',
            gap: 'clamp(1.5rem, 3vw, 2.5rem)',
            listStyle: 'none',
            margin: '0 auto',
          }}
          className="nav-links-desktop"
        >
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-label)',
                  fontWeight: 500,
                  letterSpacing: 'var(--ls-wider)',
                  textTransform: 'uppercase',
                  color: 'var(--color-muted-brown)',
                  position: 'relative',
                  paddingBottom: '2px',
                }}
                className="nav-link"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA button — desktop */}
        <a
          href="#contact"
          className="btn btn--primary nav-cta"
          style={{ flexShrink: 0 }}
          aria-label="Begin your space — contact Ukiyo Interior"
        >
          Begin Your Space
        </a>

        {/* Hamburger — mobile only */}
        <button
          ref={hamburgerRef}
          id="mobile-menu-toggle"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-overlay"
          onClick={() => setMenuOpen((v) => !v)}
          style={{
            display: 'none',
            flexDirection: 'column',
            gap: '6px',
            padding: '4px',
            marginLeft: 'auto',
            background: 'none',
            border: 'none',
          }}
          className="hamburger"
        >
          <span
            ref={bar1Ref}
            style={{
              display: 'block',
              width: '22px',
              height: '1px',
              backgroundColor: 'var(--color-deep-brown)',
              transformOrigin: 'center',
            }}
          />
          <span
            ref={bar2Ref}
            style={{
              display: 'block',
              width: '22px',
              height: '1px',
              backgroundColor: 'var(--color-deep-brown)',
              transformOrigin: 'center',
            }}
          />
        </button>
      </nav>

      {/* ── Mobile Overlay ── */}
      <div
        ref={overlayRef}
        id="mobile-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        style={{
          display: 'none',
          position: 'fixed',
          inset: 0,
          zIndex: 99,
          backgroundColor: 'var(--color-beige)',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'clamp(1.5rem, 5vh, 2.5rem)',
          clipPath: 'inset(0 0 100% 0)',
        }}
      >
        <ul
          style={{ listStyle: 'none', textAlign: 'center' }}
          aria-label="Mobile site sections"
        >
          {NAV_LINKS.map((link, i) => (
            <li
              key={link.href}
              ref={(el) => {
                if (el) menuLinksRef.current[i] = el;
              }}
              style={{ opacity: 0 }}
            >
              <a
                href={link.href}
                onClick={closeMenu}
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(2rem, 8vw, 3.5rem)',
                  fontWeight: 300,
                  letterSpacing: '0.05em',
                  color: 'var(--color-deep-brown)',
                  padding: '0.35em 0',
                  lineHeight: 1.1,
                  transition: 'color 200ms var(--ease-luxury)',
                }}
                className="mobile-nav-link"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA inside overlay */}
        <a
          href="#contact"
          onClick={closeMenu}
          className="btn btn--primary"
          style={{ marginTop: '1rem' }}
        >
          Begin Your Space
        </a>

        {/* Location stamp */}
        <p
          style={{
            position: 'absolute',
            bottom: 'clamp(1.5rem, 4vh, 2.5rem)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-label)',
            letterSpacing: 'var(--ls-widest)',
            textTransform: 'uppercase',
            color: 'var(--color-muted-brown)',
          }}
        >
          Mumbai · Maharashtra · Est. 2014
        </p>
      </div>

      {/* ── Scoped styles ── */}
      <style>{`
        /* Desktop: show center links + CTA, hide hamburger */
        @media (min-width: 900px) {
          .nav-links-desktop { display: flex !important; }
          .nav-cta           { display: inline-flex !important; }
          .hamburger         { display: none !important; }
        }

        /* Mobile: hide center links + CTA, show hamburger */
        @media (max-width: 899px) {
          .nav-links-desktop { display: none !important; }
          .nav-cta           { display: none !important; }
          .hamburger         { display: flex !important; }
        }

        /* Nav link underline on hover */
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 1px;
          background-color: var(--color-bronze);
          transition: width 300ms var(--ease-luxury);
        }
        .nav-link:hover {
          color: var(--color-deep-brown);
        }
        .nav-link:hover::after {
          width: 100%;
        }

        /* Mobile link hover */
        .mobile-nav-link:hover {
          color: var(--color-bronze);
        }
      `}</style>
    </>
  );
}
