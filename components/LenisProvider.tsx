'use client';

import { useLenis } from '@/lib/useLenis';

/**
 * LenisProvider
 * Client component that boots Lenis smooth scroll.
 * Rendered as a sibling to {children} inside RootLayout so the
 * Server Component boundary is preserved for the rest of the tree.
 */
export default function LenisProvider() {
  useLenis();
  return null; // renders nothing — side-effect only
}
