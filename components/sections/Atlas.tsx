'use client';

import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ─── Inline Topojson Decoder ───────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Topo = any;

function decodeArcs(topology: Topo): number[][][] {
  const { arcs, transform } = topology;
  const sx = transform?.scale[0]     ?? 1;
  const sy = transform?.scale[1]     ?? 1;
  const tx = transform?.translate[0] ?? 0;
  const ty = transform?.translate[1] ?? 0;
  return (arcs as number[][][]).map((arc) => {
    let x = 0, y = 0;
    return arc.map(([dx, dy]) => {
      x += dx; y += dy;
      return [x * sx + tx, y * sy + ty];
    });
  });
}

function stitchArcs(decoded: number[][][], indices: number[]): number[][] {
  const out: number[][] = [];
  for (const i of indices) {
    const arc = i >= 0 ? decoded[i] : [...decoded[~i]].reverse();
    out.push(...(out.length === 0 ? arc : arc.slice(1)));
  }
  return out;
}

function topoFeature(topology: Topo, objectName: string): GeoJSON.FeatureCollection {
  const decoded = decodeArcs(topology);
  const obj = topology.objects[objectName];

  const features = (obj.geometries as Topo[]).map((geom): GeoJSON.Feature => {
    let geometry: GeoJSON.Geometry | null = null;

    if (geom.type === 'Polygon') {
      geometry = { type: 'Polygon', coordinates: (geom.arcs as number[][]).map((r) => stitchArcs(decoded, r)) };
    } else if (geom.type === 'MultiPolygon') {
      geometry = { type: 'MultiPolygon', coordinates: (geom.arcs as number[][][]).map((poly) => poly.map((r) => stitchArcs(decoded, r))) };
    } else if (geom.type === 'Point') {
      geometry = { type: 'Point', coordinates: geom.coordinates };
    }

    return { type: 'Feature', id: geom.id, properties: geom.properties ?? {}, geometry: geometry! };
  });

  return { type: 'FeatureCollection', features };
}
/* ─────────────────────────────────────────────────────────────────────────── */

const MAHARASHTRA_APPROX = {
  type: 'Feature',
  geometry: {
    type: 'Polygon',
    coordinates: [[[72.6, 22.0], [74.0, 22.1], [76.5, 21.8], [80.0, 20.5], [80.5, 18.0], [77.0, 15.8], [74.0, 16.5], [72.8, 17.5], [72.5, 19.0], [72.6, 22.0]]]
  }
};

const MUMBAI_PENINSULA = {
  type: 'Feature',
  geometry: {
    type: 'Polygon',
    coordinates: [[[72.77, 18.89], [72.78, 18.96], [72.79, 19.05], [72.81, 19.12], [72.83, 19.22], [72.85, 19.32], [72.88, 19.42], [72.92, 19.52], [72.98, 19.62], [73.05, 19.68], [73.02, 19.55], [72.98, 19.45], [72.95, 19.35], [72.93, 19.25], [72.91, 19.15], [72.89, 19.05], [72.87, 18.95], [72.83, 18.89], [72.77, 18.89]]]
  }
};

export default function Atlas() {
  const containerRef = useRef<HTMLElement>(null);
  const globeCanvasRef = useRef<HTMLCanvasElement>(null);
  const mapCanvasRef = useRef<HTMLCanvasElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const pinsRef = useRef<HTMLDivElement>(null);
  
  const [activeLabel, setActiveLabel] = useState('DESIGN TERRITORIES');

  useEffect(() => {
    let cancelled = false;
    let d3: typeof import('d3') | null = null;
    let countriesData: GeoJSON.FeatureCollection | null = null;
    let indiaFeature: GeoJSON.Feature | null = null;
    let southAsiaFeatures: GeoJSON.Feature[] = [];
    
    // Mutable animation state driven by GSAP
    const tlParams = {
      globeEased: 0,
      mhZoom: 0,
      mumZoom: 0
    };

    let W = window.innerWidth;
    let H = window.innerHeight;

    let tIndia: { scale: number, translate: [number, number] } | null = null;
    let tMh: { scale: number, translate: [number, number] } | null = null;
    let tMum: { scale: number, translate: [number, number] } | null = null;

    const updateTransforms = (W: number, H: number) => {
      if (!d3) return;
      const p = d3.geoMercator().scale(1).translate([0,0]);
      const path = d3.geoPath(p);
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const getT = (feature: any) => {
        if (!feature) return null;
        const bounds = path.bounds(feature);
        const dx = bounds[1][0] - bounds[0][0];
        const dy = bounds[1][1] - bounds[0][1];
        const x = (bounds[0][0] + bounds[1][0]) / 2;
        const y = (bounds[0][1] + bounds[1][1]) / 2;
        const scale = 0.85 / Math.max(dx / W, dy / H);
        return { scale, translate: [W / 2 - scale * x, H / 2 - scale * y] as [number, number] };
      };
      
      const indiaBoundsFeature = {
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: [[68, 8], [97, 37]] }
      };
      
      tIndia = getT(indiaBoundsFeature);
      tMh = getT(MAHARASHTRA_APPROX);
      tMum = getT(MUMBAI_PENINSULA);
    };

    const drawGlobe = () => {
      const canvas = globeCanvasRef.current;
      if (!canvas || !d3) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.clearRect(0, 0, W, H);
      if (!countriesData) return;
      
      const globeScale = d3.interpolate(220, 600)(tlParams.globeEased);
      const globeRotX = d3.interpolate(0, -78)(tlParams.globeEased);
      const globeRotY = d3.interpolate(-20, -22)(tlParams.globeEased);
      const indiaHighlight = Math.max(0, (tlParams.globeEased - 0.5) * 2);
      
      const projGlobe = d3.geoOrthographic()
        .scale(globeScale)
        .rotate([globeRotX, globeRotY, 0])
        .translate([W / 2, H / 2])
        .clipAngle(90);
        
      const pathGlobe = d3.geoPath(projGlobe, ctx);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sphere = { type: 'Sphere' } as any;

      ctx.beginPath();
      pathGlobe(sphere);
      ctx.fillStyle = '#C4B49A';
      ctx.fill();

      ctx.beginPath();
      pathGlobe(countriesData);
      ctx.fillStyle = '#D4C4A8';
      ctx.fill();
      ctx.strokeStyle = 'rgba(44,24,16,0.3)';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      if (indiaFeature && indiaHighlight > 0) {
        const indColor = d3.interpolateRgb('#D4C4A8', '#B8860B')(indiaHighlight);
        ctx.beginPath();
        pathGlobe(indiaFeature);
        ctx.fillStyle = indColor;
        ctx.fill();
        ctx.strokeStyle = 'rgba(44,24,16,0.3)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    };

    const drawMap = () => {
      const canvas = mapCanvasRef.current;
      if (!canvas || !d3 || !countriesData || !tIndia) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.clearRect(0, 0, W, H);

      let currentTx = tIndia.translate[0];
      let currentTy = tIndia.translate[1];
      let currentScale = tIndia.scale;
      
      if (tlParams.mhZoom > 0 && tMh) {
        currentTx = d3.interpolate(currentTx, tMh.translate[0])(tlParams.mhZoom);
        currentTy = d3.interpolate(currentTy, tMh.translate[1])(tlParams.mhZoom);
        currentScale = d3.interpolate(currentScale, tMh.scale)(tlParams.mhZoom);
      }
      
      if (tlParams.mumZoom > 0 && tMum) {
        currentTx = d3.interpolate(currentTx, tMum.translate[0])(tlParams.mumZoom);
        currentTy = d3.interpolate(currentTy, tMum.translate[1])(tlParams.mumZoom);
        currentScale = d3.interpolate(currentScale, tMum.scale)(tlParams.mumZoom);
      }
      
      const projMap = d3.geoMercator().scale(currentScale).translate([currentTx, currentTy]);
      const pathMap = d3.geoPath(projMap, ctx);
      
      // Ocean Background
      ctx.fillStyle = '#C4B49A';
      ctx.fillRect(0, 0, W, H);
      
      // South Asia Countries
      if (tlParams.mumZoom < 1) {
        southAsiaFeatures.forEach(f => {
          if (f === indiaFeature) return; // Draw separately
          ctx.beginPath(); pathMap(f as any);
          ctx.fillStyle = '#D4C4A8'; 
          ctx.fill();
          ctx.strokeStyle = 'rgba(44,24,16,0.25)'; 
          ctx.lineWidth = 0.5; 
          ctx.stroke();
        });
        
        if (indiaFeature) {
          const indiaColor = d3.interpolateRgb('#B8860B', '#D4C4A8')(tlParams.mhZoom);
          ctx.beginPath(); pathMap(indiaFeature as any);
          ctx.fillStyle = indiaColor; 
          ctx.fill();
          ctx.strokeStyle = 'rgba(44,24,16,0.3)'; 
          ctx.lineWidth = 0.5; 
          ctx.stroke();
          
          if (tlParams.mhZoom > 0) {
            ctx.globalAlpha = tlParams.mhZoom;
            ctx.beginPath(); pathMap(MAHARASHTRA_APPROX as any);
            ctx.fillStyle = '#B8860B'; 
            ctx.fill();
            ctx.strokeStyle = 'rgba(44,24,16,0.3)'; 
            ctx.lineWidth = 0.5; 
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }
      
      // Mumbai Detail
      if (tlParams.mumZoom > 0) {
        ctx.globalAlpha = tlParams.mumZoom;
        ctx.fillStyle = '#C4B49A';
        ctx.fillRect(0, 0, W, H);

        ctx.beginPath(); pathMap(MUMBAI_PENINSULA as any);
        ctx.fillStyle = '#D4C4A8'; 
        ctx.fill();
        ctx.strokeStyle = 'rgba(44,24,16,0.3)'; 
        ctx.lineWidth = 0.5; 
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      
      let dotOpacity = 0;
      let pinsOpacity = 0;

      // Stage 4 Mumbai Dot
      const showDot = tlParams.mhZoom > 0.5 && tlParams.mumZoom < 0.5;
      if (showDot) {
        dotOpacity = 1;
        const mp = projMap([72.87, 19.07]);
        if (mp && dotRef.current) dotRef.current.style.transform = `translate(-50%, -50%) translate(${mp[0]}px, ${mp[1]}px)`;
      }

      // Stage 5 Markers
      if (tlParams.mumZoom > 0.5) {
        pinsOpacity = 1;
        if (pinsRef.current) {
          const pins = Array.from(pinsRef.current.children) as HTMLElement[];
          pins.forEach(pin => {
            const lon = parseFloat(pin.dataset.lon!);
            const lat = parseFloat(pin.dataset.lat!);
            const mp = projMap([lon, lat]);
            if (mp) pin.style.transform = `translate(-50%, -50%) translate(${mp[0]}px, ${mp[1]}px)`;
          });
        }
      }

      if (dotRef.current) dotRef.current.style.opacity = dotOpacity.toString();
      if (pinsRef.current) pinsRef.current.style.opacity = pinsOpacity.toString();
    };

    const draw = () => {
      if (globeCanvasRef.current && Number(globeCanvasRef.current.style.opacity || 1) > 0) {
        drawGlobe();
      }
      if (mapCanvasRef.current && Number(mapCanvasRef.current.style.opacity || 0) > 0) {
        drawMap();
      }
    };

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      
      const canvases = [globeCanvasRef.current, mapCanvasRef.current];
      canvases.forEach(canvas => {
        if (canvas) {
          canvas.width = W * dpr;
          canvas.height = H * dpr;
          canvas.getContext('2d')?.scale(dpr, dpr);
          canvas.style.width = `${W}px`;
          canvas.style.height = `${H}px`;
        }
      });
      
      updateTransforms(W, H);
      draw();
    };

    window.addEventListener('resize', resize);
    resize();

    const gsapCtx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=400%',
          pin: true,
          scrub: true,
          onUpdate: (self) => {
            const p = self.progress;
            if (p < 0.25) setActiveLabel('DESIGN TERRITORIES');
            else if (p < 0.45) setActiveLabel('INDIA');
            else if (p < 0.65) setActiveLabel('MAHARASHTRA');
            else if (p < 0.82) setActiveLabel('MAHARASHTRA · MUMBAI');
            else setActiveLabel('MUMBAI · INDIA');
            
            // Opacity crossover between 0.4 and 0.5
            if (globeCanvasRef.current) {
              const globeOp = p < 0.4 ? 1 : p > 0.5 ? 0 : 1 - ((p - 0.4) / 0.1);
              globeCanvasRef.current.style.opacity = globeOp.toString();
            }
            if (mapCanvasRef.current) {
              const mapOp = p < 0.4 ? 0 : p > 0.5 ? 1 : ((p - 0.4) / 0.1);
              mapCanvasRef.current.style.opacity = mapOp.toString();
            }
            
            draw();
          }
        }
      });

      tl.to(tlParams, { globeEased: 1, duration: 0.45, ease: 'power1.inOut' }, 0);
      tl.to(tlParams, { mhZoom: 1, duration: 0.17, ease: 'power2.inOut' }, 0.65);
      tl.to(tlParams, { mumZoom: 1, duration: 0.18, ease: 'power2.inOut' }, 0.82);

    }, containerRef);

    Promise.all([
      import('d3'),
      fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
        .then(res => res.json())
        .catch(err => {
          console.error("Atlas Error: Failed to fetch world atlas data", err);
          return null;
        })
    ]).then(([d3Module, data]) => {
      if (cancelled) return;
      d3 = d3Module;
      if (data) {
        countriesData = topoFeature(data, 'countries');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        indiaFeature = countriesData.features.find((f: any) => String(f.id) === '356' || f.properties?.name === 'India') || null;
        
        southAsiaFeatures = countriesData.features.filter((f: any) => {
          const bounds = d3Module.geoBounds(f as any);
          const [minLon, minLat] = bounds[0];
          const [maxLon, maxLat] = bounds[1];
          return !(maxLon < 60 || minLon > 100 || maxLat < 0 || minLat > 40);
        });
      }
      
      resize(); 
      ScrollTrigger.refresh();
    }).catch(err => {
      console.error("Atlas Error: Promise.all failed", err);
    });

    return () => {
      cancelled = true;
      window.removeEventListener('resize', resize);
      gsapCtx.revert();
    };
  }, []);

  return (
    <section id="atlas" style={{ width: '100%', backgroundColor: '#F5F0E8' }}>
      <div ref={containerRef as any} style={{ width: '100%', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      
      {/* Label overlay */}
      <div style={{ position: 'absolute', top: '15vh', left: 0, width: '100%', textAlign: 'center', zIndex: 10, pointerEvents: 'none' }}>
        <div style={{ opacity: activeLabel === 'DESIGN TERRITORIES' ? 1 : 0, transition: 'opacity 0.3s', position: 'absolute', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: '1.5rem', height: '1px', backgroundColor: 'var(--color-bronze)' }} />
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-bronze)' }}>01 — Atlas</p>
            <div style={{ width: '1.5rem', height: '1px', backgroundColor: 'var(--color-bronze)' }} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 300, color: 'var(--color-deep-brown)', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            Design <em style={{ fontStyle: 'italic', color: 'var(--color-bronze)' }}>Territories</em>
          </h2>
        </div>

        <div style={{ opacity: (activeLabel !== 'DESIGN TERRITORIES' && activeLabel !== 'MUMBAI · INDIA') ? 1 : 0, transition: 'opacity 0.3s', position: 'absolute', width: '100%' }}>
           <h2 style={{ fontFamily: 'var(--font-body)', fontSize: '1.5rem', fontWeight: 500, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--color-bronze)' }}>
             {activeLabel !== 'DESIGN TERRITORIES' && activeLabel !== 'MUMBAI · INDIA' ? activeLabel : ''}
           </h2>
        </div>

        <div style={{ opacity: activeLabel === 'MUMBAI · INDIA' ? 1 : 0, transition: 'opacity 0.3s', position: 'absolute', width: '100%' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem,5vw,3rem)', fontWeight: 400, color: 'var(--color-deep-brown)', lineHeight: 1.1 }}>
              MUMBAI · INDIA
            </h2>
        </div>
      </div>
      
      {/* Canvases */}
      <canvas ref={globeCanvasRef} style={{ display: 'block', pointerEvents: 'none', position: 'absolute', top: 0, left: 0, zIndex: 1, opacity: 1 }} />
      <canvas ref={mapCanvasRef} style={{ display: 'block', pointerEvents: 'none', position: 'absolute', top: 0, left: 0, zIndex: 2, opacity: 0 }} />

      {/* Mumbai Pins Detail Layer (Stage 5) */}
      <div
        ref={pinsRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0,
          pointerEvents: 'none',
          zIndex: 25,
          transition: 'opacity 0.3s'
        }}
      >
        {[
          { name: 'Malad', lon: 72.8479, lat: 19.1874 },
          { name: 'Bandra', lon: 72.8347, lat: 19.0596 },
          { name: 'Powai', lon: 72.9054, lat: 19.1197 },
          { name: 'Malabar Hill', lon: 72.7959, lat: 18.9554 },
          { name: 'Worli', lon: 72.8183, lat: 19.0130 },
          { name: 'Juhu', lon: 72.8296, lat: 19.1075 }
        ].map(m => (
          <div key={m.name} className="mumbai-pin" data-lon={m.lon} data-lat={m.lat}>
            <div className="mumbai-pin-dot-container">
              <div className="mumbai-pin-ring"></div>
              <div className="mumbai-pin-dot"></div>
            </div>
            <span>{m.name}</span>
          </div>
        ))}
      </div>

      {/* Mumbai Dot (Stage 4) */}
      <div 
        ref={dotRef}
        className="mumbai-pulse-dot"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          transform: 'translate(-50%, -50%) translate(-9999px, -9999px)',
          pointerEvents: 'none',
          zIndex: 20,
          opacity: 0,
          transition: 'opacity 0.3s ease'
        }}
      >
        <div className="am-ring am-ring-1"></div>
        <div className="am-ring am-ring-2"></div>
        <div className="am-dot"></div>
      </div>

      <style>{`
        .mumbai-pulse-dot {
          position: absolute;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .mumbai-pin {
          position: absolute;
          left: 0;
          top: 0;
          transform: translate(-50%, -50%) translate(-9999px, -9999px);
          font-family: var(--font-body);
          font-size: 9px;
          color: #B8860B;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        .mumbai-pin-dot-container {
          position: relative;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .mumbai-pin-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #B8860B;
          position: relative;
          z-index: 2;
        }
        .mumbai-pin-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 1px solid #B8860B;
          animation: pin-pulse 2s cubic-bezier(0.16,1,0.3,1) infinite;
        }
        @keyframes pin-pulse {
          0% { transform: scale(0.5); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        
        .am-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #B8860B;
          position: relative;
          z-index: 3;
          box-shadow: 0 0 10px rgba(184,134,11,0.8);
        }
        .am-ring {
          position: absolute;
          border-radius: 50%;
          border: 1.5px solid #B8860B;
          animation: amp 2.2s cubic-bezier(.4,0,.6,1) infinite;
          pointer-events: none;
        }
        .am-ring-1 { width: 32px; height: 32px; animation-delay: 0s; }
        .am-ring-2 { width: 52px; height: 52px; animation-delay: 0.7s; opacity: 0.45; }
        
        @keyframes amp {
          0%   { transform: scale(1);   opacity: 0.85; }
          50%  { transform: scale(1.5); opacity: 0.2; }
          100% { transform: scale(1);   opacity: 0.85; }
        }
      `}</style>
      </div>
    </section>
  );
}
