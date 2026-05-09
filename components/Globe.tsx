'use client';

import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
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

function topoMesh(topology: Topo, objectName: string): GeoJSON.MultiLineString {
  const decoded = decodeArcs(topology);
  const obj = topology.objects[objectName];
  const seen = new Set<number>();
  const coords: number[][][] = [];

  for (const geom of obj.geometries as Topo[]) {
    const allRings: number[][] =
      geom.type === 'Polygon'      ? geom.arcs :
      geom.type === 'MultiPolygon' ? (geom.arcs as number[][][]).flat() : [];

    for (const ring of allRings) {
      for (const i of ring) {
        const key = i < 0 ? ~i : i;
        if (!seen.has(key)) { seen.add(key); coords.push(decoded[key]); }
      }
    }
  }

  return { type: 'MultiLineString', coordinates: coords };
}
/* ─────────────────────────────────────────────────────────────────────────── */

const MUMBAI: [number, number] = [72.8777, 19.076];

export interface GlobeRef {
  getGlobeParams: () => {
    rotX: number;
    rotY: number;
    scale: number;
    autoRotate: number;
    indiaHighlight: number;
  };
}

const Globe = forwardRef<GlobeRef, {}>((props, ref) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const rafId = useRef(0);
  
  const globeParams = useRef({
    rotX: 20,
    rotY: -20,
    scale: 240,
    autoRotate: 1, // 1 is fully auto-rotating, 0 is stopped (zoom mode)
    indiaHighlight: 0,
  });

  useImperativeHandle(ref, () => ({
    getGlobeParams: () => globeParams.current
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeData = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const d3 = await import('d3');
      const res  = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
      const data = await res.json();
      if (cancelled) return;

      const countries = topoFeature(data, 'countries');
      const border    = topoMesh(data, 'countries');
      globeData.current = { countries, border };

      const render = () => {
        if (cancelled) return;
        draw(d3);
        rafId.current = requestAnimationFrame(render);
      };
      rafId.current = requestAnimationFrame(render);
    }

    init().catch(console.error);

    return () => { 
      cancelled = true; 
      cancelAnimationFrame(rafId.current); 
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const draw = useCallback((d3: typeof import('d3')) => {
    const svg = svgRef.current;
    const gd  = globeData.current;
    if (!svg || !gd) return;

    const W = svg.clientWidth  || 480;
    const H = svg.clientHeight || 480;

    if (globeParams.current.autoRotate > 0) {
      globeParams.current.rotX += 0.3 * globeParams.current.autoRotate;
    }

    const { rotX, rotY, scale, indiaHighlight } = globeParams.current;

    const proj = d3.geoOrthographic().scale(scale).rotate([rotX, rotY, 0]).translate([W/2, H/2]).clipAngle(90);
    const path = d3.geoPath(proj);
    const graticule = d3.geoGraticule()();
    const sphere = { type: 'Sphere' } as unknown as GeoJSON.GeoJsonObject;

    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const ns = 'http://www.w3.org/2000/svg';
    
    const mk = (d: string | null, fill: string, stroke?: string, sw?: string) => {
      if (!d) return;
      const el = document.createElementNS(ns, 'path');
      el.setAttribute('d', d);
      el.setAttribute('fill', fill);
      if (stroke) { el.setAttribute('stroke', stroke); el.setAttribute('stroke-width', sw ?? '0.5'); }
      svg.appendChild(el);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mk(path(sphere as any), '#C4B49A');
    mk(path(graticule), 'none', 'rgba(184,134,11,0.08)', '0.5');

    const indiaColor = d3.interpolateRgb('#D4C4A8', '#B8860B')(indiaHighlight || 0);

    gd.countries.features.forEach((f: GeoJSON.Feature) => {
      const d = path(f);
      const isIndia = Number(f.id) === 356;
      if (isIndia) {
        mk(d, indiaColor, 'rgba(44,24,16,0.15)', '0.4');
      } else {
        mk(d, '#D4C4A8', 'rgba(44,24,16,0.15)', '0.4');
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mk(path(gd.border as any), 'none', 'rgba(44,24,16,0.15)', '0.5');
  }, []);

  return (
    <div
      style={{
        width: '480px',
        height: '480px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        ref={svgRef}
        aria-hidden="true"
        style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible' }}
      />
    </div>
  );
});

Globe.displayName = 'Globe';
export default Globe;
