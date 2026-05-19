import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, DM_Sans } from 'next/font/google';
import './globals.css';
import GrainOverlay from '@/components/GrainOverlay';
import CustomCursor from '@/components/CustomCursor';
import LoadingScreen from '@/components/LoadingScreen';
import LenisProvider from '@/components/LenisProvider';

/* ─── Google Fonts via next/font ───────────────────────────── */

const cormorant = Cormorant_Garamond({
  variable: '--font-display-loaded',
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  preload: true,
});

const dmSans = DM_Sans({
  variable: '--font-body-loaded',
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  display: 'swap',
  preload: true,
});

/* ─── SEO Metadata ─────────────────────────────────────────── */

export const metadata: Metadata = {
  title: {
    default: 'Ukiyo Interior — Designed With Intent. Built Around You.',
    template: '%s | Ukiyo Interior',
  },
  description:
    'Ukiyo Interior is a Mumbai-based luxury interior design studio founded by Pratik Soni. Residential, commercial, and hospitality interiors designed with intent and built around you.',
  keywords: [
    'luxury interior design Mumbai',
    'interior designer Mumbai',
    'Pratik Soni interior',
    'Ukiyo Interior',
    'residential interior design',
    'hospitality interior design',
    'high-end interior Mumbai',
  ],
  authors: [{ name: 'Pratik Soni', url: 'https://ukiyointerior.com' }],
  creator: 'Ukiyo Interior',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'Ukiyo Interior',
    title: 'Ukiyo Interior — Designed With Intent. Built Around You.',
    description:
      'Mumbai-based luxury interior design studio by Pratik Soni. Crafting spaces where emotion meets architecture.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ukiyo Interior — Designed With Intent. Built Around You.',
    description:
      'Mumbai-based luxury interior design studio by Pratik Soni.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#EDEADF',
};

/* ─── Root Layout ──────────────────────────────────────────── */

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${dmSans.variable}`}
    >
      <head>
        {/* Preconnect to Unsplash CDN used for project images */}
        <link rel="preconnect" href="https://images.unsplash.com" />
        {/* DNS prefetch for Google Fonts (next/font handles loading) */}
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
      </head>

      <body>
        {/* ── Global chrome ── */}
        <LoadingScreen />
        <GrainOverlay />
        <CustomCursor />

        {/* ── Lenis smooth scroll (client-only, no wrapping) ── */}
        <LenisProvider />

        {/* ── Page content ── */}
        <main id="main-content">
          {children}
        </main>
      </body>
    </html>
  );
}
