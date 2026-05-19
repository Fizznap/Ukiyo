'use client'
import { useCallback, useEffect, useRef, useState } from 'react'

export interface ProjectMaterial {
  name: string
  type: string       // acts as "brand" / category label
  image: string
  description?: string
  price?: number
}

interface Props {
  beforeImage: string
  afterImage: string
  beforeLabel?: string
  afterLabel?: string
  materials?: ProjectMaterial[]
}

// Hotspot positions per index – placed on the "After" side
const HOTSPOT_POSITIONS = [
  { x: 62, y: 70 },
  { x: 90, y: 55 },
  { x: 47, y: 32 },
  { x: 25, y: 50 },
  { x: 43, y: 78 },
]

// ── Icons (inline SVG, no external dep) ──────────────────────────────────────
function CompareIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3"/><path d="m15 9 6-6"/>
      <path d="M8 21H3v-5"/>
      <path d="m16 16 5 5"/>
    </svg>
  )
}

function XIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12"/>
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5"/>
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14"/>
    </svg>
  )
}

function BagIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" x2="21" y1="6" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  )
}

function ArrowsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m7 16-4-4 4-4"/><path d="M3 12h18"/><path d="m17 8 4 4-4 4"/>
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = 'Before',
  afterLabel = 'After',
  materials = [],
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState(50)
  const [dragging, setDragging] = useState(false)
  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const [saved, setSaved] = useState<number[]>([])      // indices added to "cart"
  const [compareMode, setCompareMode] = useState(true)

  // ── Drag ──────────────────────────────────────────────────────────────────
  const setFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setPos(Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)))
  }, [])

  useEffect(() => {
    if (!dragging) return
    const move = (e: PointerEvent) => setFromClientX(e.clientX)
    const up = () => setDragging(false)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
  }, [dragging, setFromClientX])

  // ── Auto-sweep on mount / compare mode toggle ─────────────────────────────
  useEffect(() => {
    if (!compareMode) return
    let raf = 0
    const start = performance.now()
    const tick = (t: number) => {
      const dt = t - start
      if (dt > 1800) return
      const eased = 0.5 - Math.cos((dt / 1800) * Math.PI) / 2
      setPos(15 + eased * 70)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [compareMode])

  const toggleSaved = (idx: number) =>
    setSaved((s) => (s.includes(idx) ? s.filter((x) => x !== idx) : [...s, idx]))

  const activeMaterial = activeIdx !== null ? materials[activeIdx] : null
  const activeHotspot = activeIdx !== null ? HOTSPOT_POSITIONS[activeIdx % HOTSPOT_POSITIONS.length] : null
  const effectivePos = compareMode ? pos : 0

  return (
    <div className="relative w-full">
      {/* ── Image Container ────────────────────────────────────────────────── */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-2xl select-none"
        style={{ aspectRatio: '3/2', boxShadow: '0 8px 40px rgba(0,0,0,0.18)', touchAction: 'none' }}
      >
        {/* AFTER — base layer */}
        <img
          src={afterImage}
          alt="After redesign"
          className="absolute inset-0 h-full w-full object-cover pointer-events-none"
          draggable={false}
          loading="eager"
        />

        {/* BEFORE — clipped */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            clipPath: `inset(0 ${100 - effectivePos}% 0 0)`,
            willChange: 'clip-path',
            transition: dragging ? 'none' : 'clip-path 0.3s ease-out',
          }}
        >
          <img
            src={beforeImage}
            alt="Before redesign"
            className="absolute inset-0 h-full w-full object-cover pointer-events-none"
            draggable={false}
            loading="eager"
          />
        </div>

        {/* ── Pill Labels ─────────────────────────────────────────────────── */}
        {compareMode && (
          <span
            className="absolute left-4 top-4 z-10 pointer-events-none"
            style={{
              background: 'rgba(255,255,255,0.88)',
              backdropFilter: 'blur(8px)',
              borderRadius: '999px',
              padding: '4px 14px',
              fontSize: '12px',
              fontWeight: 500,
              color: '#1a1a1a',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            }}
          >
            {beforeLabel}
          </span>
        )}
        <span
          className="absolute right-4 top-4 z-10 pointer-events-none"
          style={{
            background: 'rgba(255,255,255,0.88)',
            backdropFilter: 'blur(8px)',
            borderRadius: '999px',
            padding: '4px 14px',
            fontSize: '12px',
            fontWeight: 500,
            color: '#1a1a1a',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          }}
        >
          {compareMode ? afterLabel : 'Design view'}
        </span>

        {/* ── Hotspots ────────────────────────────────────────────────────── */}
        {materials.map((_, idx) => {
          const p = HOTSPOT_POSITIONS[idx % HOTSPOT_POSITIONS.length]
          const visible = p.x >= effectivePos
          return (
            <button
              key={idx}
              onClick={(e) => { e.stopPropagation(); setActiveIdx((id) => (id === idx ? null : idx)) }}
              aria-label={materials[idx]?.name}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300"
              style={{ left: `${p.x}%`, top: `${p.y}%`, opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none' }}
            >
              <span className="relative flex h-5 w-5 items-center justify-center">
                <span className="absolute inset-0 animate-ping rounded-full opacity-60" style={{ background: '#22c55e' }} />
                <span className="relative h-3.5 w-3.5 rounded-full" style={{ background: '#22c55e', boxShadow: '0 0 0 3px rgba(34,197,94,0.3)' }} />
              </span>
            </button>
          )
        })}

        {/* ── Divider + Handle ────────────────────────────────────────────── */}
        {compareMode && (
          <div
            className="absolute top-0 bottom-0 z-10"
            style={{
              left: `${pos}%`,
              width: '2px',
              background: 'rgba(255,255,255,0.9)',
              willChange: 'left',
              transition: dragging ? 'none' : 'left 0.3s ease-out',
            }}
          >
            <button
              onPointerDown={(e) => { e.preventDefault(); setDragging(true) }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 grid place-items-center rounded-full cursor-ew-resize"
              style={{
                width: 44,
                height: 44,
                background: '#fff',
                color: '#1a1a1a',
                boxShadow: '0 4px 16px rgba(0,0,0,0.22)',
              }}
              aria-label="Drag to compare"
            >
              <ArrowsIcon />
            </button>
          </div>
        )}

        {/* ── Product Popover ─────────────────────────────────────────────── */}
        {activeMaterial && activeHotspot && (
          <div
            className="absolute z-30 rounded-xl"
            style={{
              width: 288,
              ...(activeHotspot.x < 50
                ? { left: `calc(${activeHotspot.x}% + 20px)` }
                : { right: `calc(${100 - activeHotspot.x}% + 20px)` }
              ),
              ...(activeHotspot.y < 55
                ? { top: `calc(${activeHotspot.y}% + 16px)` }
                : { bottom: `calc(${100 - activeHotspot.y}% + 16px)` }
              ),
              background: '#fff',
              border: '1px solid rgba(0,0,0,0.08)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.16)',
              padding: 16,
              animation: 'baPopIn 0.18s ease-out both',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#888', fontWeight: 500 }}>
                  {activeMaterial.type}
                </p>
                <h3 style={{ marginTop: 2, fontSize: 14, fontWeight: 600, lineHeight: 1.3, color: '#111' }}>
                  {activeMaterial.name}
                </h3>
              </div>
              <button
                onClick={() => setActiveIdx(null)}
                style={{ padding: 4, borderRadius: 6, color: '#888', background: 'transparent', border: 'none', cursor: 'pointer', flexShrink: 0 }}
                aria-label="Close"
              >
                <XIcon />
              </button>
            </div>

            {/* Image */}
            <div style={{ marginTop: 12, borderRadius: 8, overflow: 'hidden', aspectRatio: '16/9', background: '#f5f5f0' }}>
              <img
                src={activeMaterial.image}
                alt={activeMaterial.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Description */}
            {activeMaterial.description && (
              <p style={{ marginTop: 10, fontSize: 12, lineHeight: 1.6, color: '#666' }}>
                {activeMaterial.description}
              </p>
            )}

            {/* Footer */}
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {activeMaterial.price != null ? (
                <span style={{ fontSize: 15, fontWeight: 600, color: '#111' }}>
                  ₹{activeMaterial.price.toLocaleString()}
                </span>
              ) : (
                <span />
              )}
              <button
                onClick={() => { if (activeIdx !== null) toggleSaved(activeIdx) }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  borderRadius: 999,
                  padding: '6px 14px',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: 'none',
                  background: saved.includes(activeIdx!) ? '#B8860B' : '#B8860B',
                  color: '#fff',
                  transition: 'opacity 0.15s',
                }}
              >
                {saved.includes(activeIdx!) ? <><CheckIcon /> Saved</> : <><PlusIcon /> Save</>}
              </button>
            </div>
          </div>
        )}

        {/* ── Bottom-left: saved pill ──────────────────────────────────────── */}
        <div
          className="absolute bottom-4 left-4 z-10 inline-flex items-center gap-2"
          style={{
            background: 'rgba(255,255,255,0.88)',
            backdropFilter: 'blur(8px)',
            borderRadius: 999,
            padding: '7px 14px',
            fontSize: 12,
            fontWeight: 500,
            color: '#1a1a1a',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          }}
        >
          <BagIcon />
          {saved.length === 0
            ? 'No materials saved'
            : `${saved.length} material${saved.length > 1 ? 's' : ''} saved`}
        </div>

        {/* ── Bottom-right: compare toggle ─────────────────────────────────── */}
        <button
          onClick={() => setCompareMode((v) => !v)}
          className="absolute bottom-4 right-4 z-10 inline-flex items-center gap-2 transition-all"
          style={{
            background: 'rgba(255,255,255,0.88)',
            backdropFilter: 'blur(8px)',
            borderRadius: 999,
            padding: '7px 14px',
            fontSize: 12,
            fontWeight: 500,
            color: '#1a1a1a',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            border: 'none',
            cursor: 'pointer',
          }}
          aria-pressed={compareMode}
        >
          {compareMode ? (
            <><XIcon size={14} /> Quit compare view</>
          ) : (
            <><CompareIcon /> Compare view</>
          )}
        </button>
      </div>

      {/* ── Material List (below image) ────────────────────────────────────── */}
      {materials.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.02em', color: '#2C1810' }}>
              Material palette
            </h2>
            <p style={{ fontSize: 12, color: '#888' }}>
              Tap the green dots on the After view to inspect each material.
            </p>
          </div>
          <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {materials.map((m, idx) => {
              const inSaved = saved.includes(idx)
              return (
                <li
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    borderRadius: 14,
                    border: `1px solid ${activeIdx === idx ? '#B8860B' : 'rgba(0,0,0,0.08)'}`,
                    background: '#fff',
                    padding: 12,
                    cursor: 'pointer',
                    transition: 'border-color 0.2s',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  }}
                  onMouseEnter={() => setActiveIdx(idx)}
                  onMouseLeave={() => setActiveIdx(null)}
                  onClick={() => setActiveIdx((id) => id === idx ? null : idx)}
                >
                  {/* Thumbnail */}
                  <div style={{ position: 'relative', width: 64, height: 64, flexShrink: 0, borderRadius: 10, overflow: 'hidden', background: '#f0ede6' }}>
                    <img src={m.image} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <span style={{
                      position: 'absolute', top: -4, left: -4,
                      width: 20, height: 20, borderRadius: '50%',
                      background: '#B8860B', color: '#fff',
                      display: 'grid', placeItems: 'center',
                      fontSize: 10, fontWeight: 700,
                    }}>
                      {idx + 1}
                    </span>
                  </div>
                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#B8860B', fontWeight: 500 }}>
                      {m.type}
                    </p>
                    <p style={{ fontSize: 14, fontWeight: 500, color: '#2C1810', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {m.name}
                    </p>
                    {m.price != null && (
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#2C1810', marginTop: 2 }}>
                        ₹{m.price.toLocaleString()}
                      </p>
                    )}
                  </div>
                  {/* Save button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleSaved(idx) }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      borderRadius: 999,
                      border: '1px solid rgba(0,0,0,0.12)',
                      background: inSaved ? '#B8860B' : 'transparent',
                      color: inSaved ? '#fff' : '#555',
                      padding: '4px 10px',
                      fontSize: 12,
                      cursor: 'pointer',
                      flexShrink: 0,
                      transition: 'all 0.15s',
                    }}
                  >
                    {inSaved ? <><CheckIcon /> Saved</> : <><PlusIcon /> Save</>}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes baPopIn {
          from { opacity: 0; transform: scale(0.94); }
          to   { opacity: 1; transform: scale(1); }
        }
      ` }} />
    </div>
  )
}
