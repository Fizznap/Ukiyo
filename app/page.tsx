import Navigation from '@/components/Navigation';
import Hero from '@/components/sections/Hero';
import Atlas from '@/components/sections/Atlas';
import Projects from '@/components/sections/Projects';
import EmotionalJourney from '@/components/sections/EmotionalJourney';
import Process from '@/components/sections/Process';
import Services from '@/components/sections/Services';
import Materials from '@/components/sections/Materials';
import Philosophy from '@/components/sections/Philosophy';
import Founder from '@/components/sections/Founder';
import Journal from '@/components/sections/Journal';
import Contact from '@/components/sections/Contact';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <Navigation />

      {/* 01 — Hero */}
      <Hero />

      {/* 01 — Atlas: Signature Map Experience (400vh pinned) */}
      <Atlas />

      {/* 02 — Featured Projects */}
      <Projects />

      {/* 03 — The Experience (Emotional Journey) */}
      <EmotionalJourney />

      {/* 04 — The D3 Process */}
      <Process />

      {/* 05 — Services */}
      <Services />

      {/* 06 — Material Edit */}
      <Materials />

      {/* 09 — Design Philosophy */}
      <Philosophy />

      {/* 08 — Studio / Founder */}
      <Founder />

      {/* 10 — Journal */}
      <Journal />

      {/* 13 — Contact */}
      <Contact />

      <Footer />
    </>
  );
}
