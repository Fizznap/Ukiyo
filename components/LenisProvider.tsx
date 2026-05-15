'use client';

import { useEffect } from 'react';
import { useLenis } from '@/lib/useLenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * LenisProvider
 * Client component that boots Lenis smooth scroll.
 * Rendered as a sibling to {children} inside RootLayout so the
 * Server Component boundary is preserved for the rest of the tree.
 */
export default function LenisProvider() {
  const lenisRef = useLenis();

  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;

    lenis.on('scroll', ScrollTrigger.update);

    const ticker = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off('scroll', ScrollTrigger.update);
      gsap.ticker.remove(ticker);
    };
  }, [lenisRef]);

  return null; // renders nothing — side-effect only
}
