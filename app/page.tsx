import Navigation from '@/components/Navigation';
import Hero from '@/components/sections/Hero';
import AtlasGlobe from '@/components/sections/AtlasGlobe';
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

      {/* 02 — AtlasGlobe: 600vh D3 orthographic → NASA satellite → Mumbai pins */}
      <AtlasGlobe />

      {/* 03 — Featured Projects */}
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
