'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { projects } from '@/data/projects'
import BeforeAfterSlider from '@/components/BeforeAfterSlider'

const PROCESS_LABELS = ['SITE VISIT', 'IN EXECUTION', 'FINAL REVEAL']

export default function ProjectDetailPage() {
  const params = useParams()
  const slug = params?.slug as string
  const project = projects.find((p) => p.slug === slug)
  const [compareMode, setCompareMode] = useState(false)

  if (!project) {
    return (
      <div style={{ background:'#EDEADF', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'1.5rem' }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:'48px', color:'#2C1810' }}>Project not found</h1>
        <Link href="/" style={{ color:'#B8860B', fontFamily:'var(--font-body)', fontSize:'11px', letterSpacing:'0.2em', textTransform:'uppercase' }}>← Back to Ukiyo</Link>
      </div>
    )
  }

  return (
    <div style={{ background:'#EDEADF', minHeight:'100vh' }}>

      {/* Section 1 — Hero */}
      <section style={{ position:'relative', width:'100%', height:'70vh', overflow:'hidden' }}>
        <Image src={project.heroImage} alt={project.name} fill sizes="100vw" style={{ objectFit:'cover' }} priority />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(44,24,16,0.55) 0%, rgba(44,24,16,0.1) 50%, transparent 100%)' }} />
        <div style={{ position:'absolute', top:'clamp(24px,4vw,40px)', left:'clamp(24px,4vw,60px)', zIndex:2 }}>
          <Link href="/" style={{ color:'#EDEADF', fontFamily:'var(--font-body)', fontSize:'11px', letterSpacing:'0.2em', textTransform:'uppercase', textDecoration:'none', opacity:0.85, transition:'opacity 200ms' }}>
            ← Back to Ukiyo
          </Link>
        </div>
      </section>

      {/* Section 2 — Project Header */}
      <section style={{ background:'#EDEADF', padding:'80px 0' }}>
        <div style={{ maxWidth:'1400px', margin:'0 auto', padding:'0 60px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'80px', alignItems:'start' }}>
          <div>
            <p style={{ fontFamily:'var(--font-body)', fontSize:'11px', letterSpacing:'0.2em', textTransform:'uppercase', color:'#B8860B', marginBottom:'16px' }}>
              {project.location}
            </p>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(40px, 5vw, 72px)', fontWeight:300, color:'#2C1810', lineHeight:1.05, letterSpacing:'-0.02em', margin:0 }}>
              {project.name}
            </h1>
            <div style={{ width:'40px', height:'1px', background:'#B8860B', margin:'24px 0' }} />
            <p style={{ fontFamily:'var(--font-body)', fontSize:'15px', fontWeight:300, color:'#8B7355', lineHeight:1.7, maxWidth:'520px' }}>
              {project.description}
            </p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1px', background:'rgba(44,24,16,0.12)', border:'1px solid rgba(44,24,16,0.12)' }}>
            {[
              { label:'Style', value:project.style },
              { label:'Area', value:project.area },
              { label:'Year', value:String(project.year) },
              { label:'Location', value:project.location.split(',')[0] },
            ].map(({ label, value }) => (
              <div key={label} style={{ padding:'24px', background:'#EDEADF' }}>
                <p style={{ fontFamily:'var(--font-body)', fontSize:'9px', fontWeight:500, letterSpacing:'0.2em', textTransform:'uppercase', color:'#8B7355', marginBottom:'8px' }}>{label}</p>
                <p style={{ fontFamily:'var(--font-display)', fontSize:'20px', fontWeight:400, color:'#2C1810' }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3 — Before/After Slider */}
      <section style={{ padding:'0 60px 20px', maxWidth:'1400px', margin:'0 auto' }}>
        <div style={{ transition:'opacity 400ms ease, transform 400ms ease', opacity: compareMode ? 0 : 1, transform: compareMode ? 'scale(0.98)' : 'scale(1)', pointerEvents: compareMode ? 'none' : 'auto', position: compareMode ? 'absolute' : 'relative', width: compareMode ? '0' : '100%', height: compareMode ? '0' : 'auto', overflow: compareMode ? 'hidden' : 'visible' }}>
          <BeforeAfterSlider beforeImage={project.beforeImage} afterImage={project.afterImage} />
          <p style={{ fontFamily:'var(--font-body)', fontSize:'11px', color:'#8B7355', textAlign:'center', marginTop:'16px', letterSpacing:'0.1em' }}>
            Drag to compare
          </p>
        </div>

        {/* Section 4 — Compare Mode */}
        <div style={{ transition:'opacity 400ms ease, transform 400ms ease', opacity: compareMode ? 1 : 0, transform: compareMode ? 'scale(1)' : 'scale(0.98)', pointerEvents: compareMode ? 'auto' : 'none', position: compareMode ? 'relative' : 'absolute', width: compareMode ? '100%' : '0', height: compareMode ? 'auto' : '0', overflow: compareMode ? 'visible' : 'hidden' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4px', height:'70vh', borderRadius:'4px', overflow:'hidden' }}>
            <div style={{ position:'relative', overflow:'hidden' }}>
              <Image src={project.beforeImage} alt="Before" fill sizes="50vw" style={{ objectFit:'cover' }} />
              <div style={{ position:'absolute', top:'20px', left:'20px', background:'rgba(237,234,223,0.9)', color:'#2C1810', fontFamily:'var(--font-body)', fontSize:'10px', letterSpacing:'0.2em', textTransform:'uppercase', padding:'6px 12px', borderRadius:'2px' }}>Before</div>
            </div>
            <div style={{ position:'relative', overflow:'hidden' }}>
              <Image src={project.afterImage} alt="After" fill sizes="50vw" style={{ objectFit:'cover' }} />
              <div style={{ position:'absolute', top:'20px', right:'20px', background:'rgba(184,134,11,0.9)', color:'#EDEADF', fontFamily:'var(--font-body)', fontSize:'10px', letterSpacing:'0.2em', textTransform:'uppercase', padding:'6px 12px', borderRadius:'2px' }}>After</div>
            </div>
          </div>
        </div>

        <div style={{ textAlign:'center', marginTop:'24px' }}>
          <button
            onClick={() => setCompareMode(!compareMode)}
            style={{ fontFamily:'var(--font-body)', fontSize:'11px', fontWeight:500, letterSpacing:'0.2em', textTransform:'uppercase', background:'#2C1810', color:'#EDEADF', border:'none', padding:'14px 32px', cursor:'pointer', transition:'background 250ms cubic-bezier(0.16,1,0.3,1)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#B8860B' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#2C1810' }}
          >
            {compareMode ? 'EXIT COMPARE' : 'COMPARE SPACES'}
          </button>
        </div>
      </section>

      {/* Section 5 — Materials Used */}
      {!compareMode && (
        <section style={{ padding:'80px 60px', maxWidth:'1400px', margin:'0 auto' }}>
          <p style={{ fontFamily:'var(--font-body)', fontSize:'11px', letterSpacing:'0.2em', textTransform:'uppercase', color:'#B8860B', marginBottom:'16px' }}>Materials Used</p>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(32px,4vw,48px)', fontWeight:300, color:'#2C1810', lineHeight:1.1, marginBottom:'48px' }}>
            The palette that defines this space
          </h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'24px' }}>
            {project.materials.map((mat) => (
              <div
                key={mat.name}
                style={{ background:'#E5E2D7', transition:'transform 300ms cubic-bezier(0.16,1,0.3,1), border-color 300ms ease, box-shadow 300ms ease', border:'1px solid transparent', cursor:'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = '#B8860B'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(44,24,16,0.12)' }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div style={{ position:'relative', height:'200px', overflow:'hidden' }}>
                  <Image src={mat.image} alt={mat.name} fill sizes="350px" style={{ objectFit:'cover' }} />
                </div>
                <div style={{ padding:'20px' }}>
                  <p style={{ fontFamily:'var(--font-display)', fontSize:'20px', color:'#2C1810', marginBottom:'6px' }}>{mat.name}</p>
                  <p style={{ fontFamily:'var(--font-body)', fontSize:'9px', letterSpacing:'0.2em', textTransform:'uppercase', color:'#B8860B' }}>{mat.type}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Section 6 — Process */}
      {!compareMode && (
        <section style={{ padding:'80px 60px', maxWidth:'1400px', margin:'0 auto' }}>
          <p style={{ fontFamily:'var(--font-body)', fontSize:'11px', letterSpacing:'0.2em', textTransform:'uppercase', color:'#B8860B', marginBottom:'16px' }}>Behind The Build</p>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(32px,4vw,48px)', fontWeight:300, color:'#2C1810', lineHeight:1.1, marginBottom:'48px' }}>
            From concept to completion
          </h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'24px' }}>
            {project.processImages.map((img, i) => (
              <div key={i} style={{ position:'relative', height:'380px', overflow:'hidden', borderRadius:'4px' }}>
                <Image src={img} alt={PROCESS_LABELS[i] || `Process ${i+1}`} fill sizes="450px" style={{ objectFit:'cover' }} />
                <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(44,24,16,0.45) 0%, transparent 50%)' }} />
                <div style={{ position:'absolute', bottom:'20px', left:'20px', fontFamily:'var(--font-body)', fontSize:'10px', letterSpacing:'0.2em', textTransform:'uppercase', color:'#EDEADF' }}>
                  {PROCESS_LABELS[i] || `Step ${i+1}`}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Section 7 — CTA */}
      <section style={{ background:'#E5E2D7', padding:'100px 60px', textAlign:'center' }}>
        <div style={{ maxWidth:'700px', margin:'0 auto' }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(36px,4.5vw,56px)', fontWeight:300, color:'#2C1810', lineHeight:1.1, marginBottom:'20px' }}>
            Ready to transform your space?
          </h2>
          <p style={{ fontFamily:'var(--font-body)', fontSize:'15px', color:'#8B7355', marginBottom:'40px', lineHeight:1.7 }}>
            Let&apos;s create something extraordinary together.
          </p>
          <Link
            href="/#contact"
            style={{ display:'inline-block', fontFamily:'var(--font-body)', fontSize:'11px', fontWeight:500, letterSpacing:'0.2em', textTransform:'uppercase', background:'#2C1810', color:'#EDEADF', padding:'16px 40px', textDecoration:'none', transition:'background 250ms cubic-bezier(0.16,1,0.3,1)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#B8860B' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#2C1810' }}
          >
            Begin Your Space
          </Link>
        </div>
      </section>

      {/* Responsive overrides */}
      <style>{`
        @media (max-width: 900px) {
          section > div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 768px) {
          section { padding-left: 24px !important; padding-right: 24px !important; }
          div[style*="grid-template-columns: repeat(4"] { grid-template-columns: repeat(2, 1fr) !important; }
          div[style*="grid-template-columns: repeat(3"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
