'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface Props {
  beforeImage: string
  afterImage: string
  beforeLabel?: string
  afterLabel?: string
}

export default function BeforeAfterSlider({
  beforeImage, afterImage,
  beforeLabel = 'BEFORE', afterLabel = 'AFTER'
}: Props) {
  const [sliderPos, setSliderPos] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const [cw, setCw] = useState<number>(0)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) setCw(entry.contentRect.width)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const update = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setSliderPos(Math.min(Math.max(((clientX - rect.left) / rect.width) * 100, 0), 100))
  }, [])

  return (
    <div
      ref={containerRef}
      onMouseMove={(e) => { if (isDragging.current) update(e.clientX) }}
      onMouseUp={() => { isDragging.current = false }}
      onMouseLeave={() => { isDragging.current = false }}
      onTouchMove={(e) => update(e.touches[0].clientX)}
      onTouchStart={(e) => { isDragging.current = true; update(e.touches[0].clientX) }}
      onTouchEnd={() => { isDragging.current = false }}
      style={{ position:'relative', width:'100%', height:'70vh', overflow:'hidden', cursor:'ew-resize', borderRadius:'4px', userSelect:'none' }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={afterImage} alt="After" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />
      <div style={{ position:'absolute', inset:0, width:`${sliderPos}%`, overflow:'hidden' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={beforeImage} alt="Before" style={{ width: cw || '100vw', maxWidth:'none', height:'100%', objectFit:'cover' }} />
      </div>
      <div style={{ position:'absolute', top:0, bottom:0, left:`${sliderPos}%`, width:'2px', background:'#B8860B', transform:'translateX(-50%)', zIndex:10 }} />
      <div
        onMouseDown={() => { isDragging.current = true }}
        style={{ position:'absolute', top:'50%', left:`${sliderPos}%`, transform:'translate(-50%,-50%)', width:'48px', height:'48px', borderRadius:'50%', background:'#B8860B', border:'3px solid #EDEADF', display:'flex', alignItems:'center', justifyContent:'center', cursor:'ew-resize', zIndex:20, boxShadow:'0 4px 20px rgba(44,24,16,0.3)', color:'#EDEADF', fontSize:'16px', fontWeight:'bold' }}
      >⟨ ⟩</div>
      <div style={{ position:'absolute', top:'20px', left:'20px', background:'rgba(237,234,223,0.9)', color:'#2C1810', fontFamily:'var(--font-body)', fontSize:'10px', letterSpacing:'0.2em', textTransform:'uppercase', padding:'6px 12px', borderRadius:'2px', zIndex:15 }}>{beforeLabel}</div>
      <div style={{ position:'absolute', top:'20px', right:'20px', background:'rgba(184,134,11,0.9)', color:'#EDEADF', fontFamily:'var(--font-body)', fontSize:'10px', letterSpacing:'0.2em', textTransform:'uppercase', padding:'6px 12px', borderRadius:'2px', zIndex:15 }}>{afterLabel}</div>
    </div>
  )
}
