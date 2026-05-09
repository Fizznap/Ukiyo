'use client';

import { useRef, useEffect, useState } from 'react';

const FLOATING_CARDS = [
  {
    id: 'call',
    label: 'Call',
    icon: '↗',
    title: 'Call Us',
    value: '+91 98765 43210',
    sub: 'Mon – Sat, 10am – 7pm IST',
    href: 'tel:+919876543210',
  },
  {
    id: 'write',
    label: 'Write',
    icon: '✉',
    title: 'Write to Us',
    value: 'studio@ukiyointerior.com',
    sub: 'We respond within 24 hours',
    href: 'mailto:studio@ukiyointerior.com',
  },
  {
    id: 'find',
    label: 'Find',
    icon: '◎',
    title: 'Find Us',
    value: 'Bandra West, Mumbai',
    sub: 'By appointment only',
    href: 'https://maps.google.com/?q=Bandra+West+Mumbai',
  },
];

type FormState = 'idle' | 'submitting' | 'success';

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const [formState, setFormState] = useState<FormState>('idle');
  const [form, setForm] = useState({ name: '', email: '', project: '', message: '' });

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          section.querySelectorAll<HTMLElement>('.ct-reveal').forEach((el, i) => {
            setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; }, i * 100);
          });
          io.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    io.observe(section);
    return () => io.disconnect();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('submitting');
    console.log('[Ukiyo Contact Form]', form);
    // Simulate network delay — replace with POST /api/contact
    await new Promise((r) => setTimeout(r, 1200));
    setFormState('success');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <section
      ref={sectionRef}
      id="contact"
      aria-labelledby="contact-heading"
      className="section"
      style={{ backgroundColor: 'var(--color-beige)' }}
    >
      <div className="container">
        {/* ── Header ── */}
        <div style={{ marginBottom: 'clamp(3rem, 6vh, 5rem)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <p className="text-label ct-reveal" style={{ opacity: 0, transform: 'translateY(20px)', transition: 'opacity 700ms var(--ease-luxury), transform 700ms var(--ease-luxury)' }}>
            13 — Contact
          </p>
          <h2
            id="contact-heading"
            className="text-display ct-reveal"
            style={{ opacity: 0, transform: 'translateY(20px)', transition: 'opacity 700ms var(--ease-luxury), transform 700ms var(--ease-luxury)', maxWidth: '16ch' }}
          >
            Let's begin{' '}
            <em style={{ fontStyle: 'italic', color: 'var(--color-bronze)', fontWeight: 300 }}>
              Your Space.
            </em>
          </h2>
          <p className="text-body ct-reveal" style={{ opacity: 0, transform: 'translateY(20px)', transition: 'opacity 700ms var(--ease-luxury), transform 700ms var(--ease-luxury)', color: 'var(--color-muted-brown)', maxWidth: '48ch' }}>
            Every great space starts with a conversation. Tell us about your project
            and we'll get back to you within 24 hours.
          </p>
        </div>

        {/* ── Floating Info Cards ── */}
        <div
          className="ct-reveal"
          style={{ opacity: 0, transform: 'translateY(24px)', transition: 'opacity 700ms var(--ease-luxury), transform 700ms var(--ease-luxury)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'clamp(1rem, 2vw, 1.5rem)', marginBottom: 'clamp(3rem, 6vh, 5rem)' }}
        >
          {FLOATING_CARDS.map((card) => (
            <a
              key={card.id}
              href={card.href}
              target={card.id === 'find' ? '_blank' : undefined}
              rel={card.id === 'find' ? 'noopener noreferrer' : undefined}
              aria-label={card.title}
              className="ct-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)',
                padding: 'clamp(1.5rem, 3vw, 2.25rem)',
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--color-glass-border)',
                transition: 'transform 300ms var(--ease-luxury), box-shadow 300ms var(--ease-luxury)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className="text-label" style={{ color: 'var(--color-muted-brown)' }}>{card.label}</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--color-bronze)' }} aria-hidden="true">{card.icon}</span>
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1rem, 1.6vw, 1.25rem)', fontWeight: 400, color: 'var(--color-deep-brown)', lineHeight: 1.3, marginBottom: 'var(--space-2)' }}>
                  {card.value}
                </p>
                <p className="text-caption">{card.sub}</p>
              </div>
            </a>
          ))}
        </div>

        {/* ── Form + Social ── */}
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(3rem, 8vw, 8rem)', alignItems: 'start' }}
          className="contact-grid"
        >
          {/* Form */}
          <div
            className="ct-reveal"
            style={{ opacity: 0, transform: 'translateY(24px)', transition: 'opacity 800ms var(--ease-luxury), transform 800ms var(--ease-luxury)' }}
          >
            {formState === 'success' ? (
              /* Thank-you state */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', padding: 'clamp(2rem, 4vw, 3rem)', backgroundColor: 'var(--color-card)', border: '1px solid var(--color-glass-border)' }}>
                <div style={{ width: '2rem', height: '1px', backgroundColor: 'var(--color-bronze)' }} />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 300, color: 'var(--color-deep-brown)', lineHeight: 1.2 }}>
                  Thank you,{' '}
                  <em style={{ fontStyle: 'italic', color: 'var(--color-bronze)' }}>
                    {form.name.split(' ')[0]}.
                  </em>
                </h3>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-muted-brown)', lineHeight: 'var(--lh-relaxed)' }}>
                  We've received your message and will be in touch within 24 hours.
                  In the meantime, explore our journal for design inspiration.
                </p>
                <a href="#journal" className="btn btn--ghost" style={{ alignSelf: 'flex-start' }}>
                  Read the Journal
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(1.5rem, 3vh, 2rem)' }} aria-label="Contact form">
                {/* Name */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <label htmlFor="contact-name" className="text-label" style={{ color: 'var(--color-muted-brown)' }}>Full Name</label>
                  <input id="contact-name" name="name" type="text" required autoComplete="name" placeholder="Your name" value={form.name} onChange={handleChange} className="input-base" />
                </div>

                {/* Email */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <label htmlFor="contact-email" className="text-label" style={{ color: 'var(--color-muted-brown)' }}>Email Address</label>
                  <input id="contact-email" name="email" type="email" required autoComplete="email" placeholder="your@email.com" value={form.email} onChange={handleChange} className="input-base" />
                </div>

                {/* Project type */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <label htmlFor="contact-project" className="text-label" style={{ color: 'var(--color-muted-brown)' }}>Project Type</label>
                  <select id="contact-project" name="project" value={form.project} onChange={handleChange} className="input-base" style={{ appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238B7355' strokeWidth='1.5' fill='none'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0 center' }}>
                    <option value="" disabled>Select a service</option>
                    <option value="residential">Residential Design</option>
                    <option value="commercial">Commercial Interiors</option>
                    <option value="hospitality">Hospitality Design</option>
                    <option value="spa">Spa & Salon Design</option>
                    <option value="turnkey">Turnkey Execution</option>
                    <option value="consultation">Design Consultation</option>
                  </select>
                </div>

                {/* Message */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <label htmlFor="contact-message" className="text-label" style={{ color: 'var(--color-muted-brown)' }}>Tell Us About Your Project</label>
                  <textarea id="contact-message" name="message" rows={4} placeholder="Share a little about the space, your timeline, and what feeling you're after..." value={form.message} onChange={handleChange} className="input-base" style={{ resize: 'vertical', minHeight: '120px' }} />
                </div>

                <button
                  id="contact-submit"
                  type="submit"
                  disabled={formState === 'submitting'}
                  className="btn btn--primary"
                  style={{ alignSelf: 'flex-start', opacity: formState === 'submitting' ? 0.6 : 1 }}
                >
                  {formState === 'submitting' ? 'Sending…' : 'Begin Your Space'}
                </button>
              </form>
            )}
          </div>

          {/* Right: social + quote */}
          <div
            className="ct-reveal"
            style={{ opacity: 0, transform: 'translateY(24px)', transition: 'opacity 800ms var(--ease-luxury) 100ms, transform 800ms var(--ease-luxury) 100ms', display: 'flex', flexDirection: 'column', gap: 'clamp(2rem, 4vh, 3rem)' }}
          >
            <blockquote style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', fontWeight: 300, fontStyle: 'italic', color: 'var(--color-deep-brown)', lineHeight: 1.3, maxWidth: '20ch', margin: 0 }}>
              "The room is not finished when nothing can be added — it's finished when nothing can be removed."
            </blockquote>
            <p className="text-caption" style={{ color: 'var(--color-muted-brown)' }}>— Pratik Soni, Ukiyo Interior</p>

            <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--color-glass-border)' }} />

            {/* Social links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <p className="text-label" style={{ color: 'var(--color-muted-brown)' }}>Follow Our Work</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {[
                  { label: 'Instagram', href: 'https://instagram.com/ukiyointerior' },
                  { label: 'LinkedIn', href: 'https://linkedin.com/company/ukiyointerior' },
                  { label: 'Facebook', href: 'https://facebook.com/ukiyointerior' },
                  { label: 'Google Business', href: 'https://maps.google.com/?q=Ukiyo+Interior+Mumbai' },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Ukiyo Interior on ${s.label}`}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3) 0', borderBottom: '1px solid var(--color-glass-border)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 300, color: 'var(--color-deep-brown)', transition: 'color 250ms var(--ease-luxury)' }}
                    className="social-link"
                  >
                    {s.label}
                    <span aria-hidden="true" style={{ color: 'var(--color-bronze)', fontSize: '0.8rem' }}>↗</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .ct-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-card);
        }
        .social-link:hover {
          color: var(--color-bronze);
        }
        @media (max-width: 768px) {
          .contact-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 700px) {
          [style*="repeat(3, 1fr)"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
