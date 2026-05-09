import Link from 'next/link';

const NAV_LINKS = [
  { label: 'Projects', href: '#projects' },
  { label: 'Services', href: '#services' },
  { label: 'Philosophy', href: '#philosophy' },
  { label: 'Studio', href: '#studio' },
  { label: 'Journal', href: '#journal' },
  { label: 'Contact', href: '#contact' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      id="footer"
      aria-label="Site footer"
      style={{
        backgroundColor: 'var(--color-beige)',
        borderTop: '1px solid var(--color-glass-border)',
        paddingTop: 'clamp(2.5rem, 5vh, 4rem)',
        paddingBottom: 'clamp(1.5rem, 3vh, 2.5rem)',
      }}
    >
      <div className="container">
        {/* ── Top row: wordmark + nav + CTA ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            gap: 'var(--space-8)',
            marginBottom: 'clamp(2rem, 4vh, 3rem)',
          }}
          className="footer-top"
        >
          {/* Wordmark */}
          <Link
            href="/"
            aria-label="Ukiyo Interior — home"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.1rem',
              fontWeight: 300,
              letterSpacing: '0.22em',
              color: 'var(--color-deep-brown)',
            }}
          >
            UKIYO
          </Link>

          {/* Center nav */}
          <nav aria-label="Footer navigation">
            <ul
              style={{
                display: 'flex',
                gap: 'clamp(1rem, 3vw, 2.5rem)',
                listStyle: 'none',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-label)',
                      fontWeight: 400,
                      letterSpacing: 'var(--ls-wider)',
                      textTransform: 'uppercase',
                      color: 'var(--color-muted-brown)',
                      transition: 'color 250ms var(--ease-luxury)',
                    }}
                    className="footer-link"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right: CTA */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <a
              href="#contact"
              className="btn btn--ghost"
              aria-label="Begin your space with Ukiyo Interior"
              style={{ fontSize: 'var(--text-label)' }}
            >
              Begin Your Space
            </a>
          </div>
        </div>

        {/* ── Hairline ── */}
        <div
          style={{
            width: '100%',
            height: '1px',
            backgroundColor: 'var(--color-glass-border)',
            marginBottom: 'clamp(1.5rem, 3vh, 2rem)',
          }}
        />

        {/* ── Bottom row: copyright + location + credits ── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--space-4)',
          }}
        >
          <p
            className="text-caption"
            style={{ color: 'var(--color-muted-brown)' }}
          >
            © {year} Ukiyo Interior. All rights reserved.
          </p>

          <p
            className="text-caption"
            style={{ color: 'var(--color-muted-brown)', textAlign: 'center' }}
          >
            Mumbai · Maharashtra · India
          </p>

          <p
            className="text-caption"
            style={{ color: 'var(--color-muted-brown)' }}
          >
            Designed With Intent.
          </p>
        </div>
      </div>

      <style>{`
        .footer-link:hover {
          color: var(--color-bronze);
        }

        @media (max-width: 860px) {
          .footer-top {
            grid-template-columns: 1fr !important;
            text-align: center;
            gap: var(--space-6) !important;
          }
          .footer-top > div:last-child {
            justify-content: center !important;
          }
        }
      `}</style>
    </footer>
  );
}
