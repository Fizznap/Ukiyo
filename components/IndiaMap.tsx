'use client';

import { useRef, useEffect, useCallback, useState } from 'react';

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

const MUMBAI: [number, number] = [72.8777, 19.076];

export default function IndiaMap() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [error, setError] = useState(false);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapData = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      const d3 = await import('d3');
      const res = await fetch('https://code.highcharts.com/mapdata/countries/in/in-all.topo.json');
      if (!res.ok) throw new Error('Failed to fetch map data');
      const data = await res.json();
      if (cancelled) return;
      
      const objName = Object.keys(data.objects)[0];
      const states = topoFeature(data, objName);
      const border = topoMesh(data, objName);
      mapData.current = { states, border };
      draw(d3);
    }
    init().catch((err) => {
      console.error('Error loading India map:', err);
      if (!cancelled) setError(true);
    });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const draw = useCallback((d3: typeof import('d3')) => {
    const svg = svgRef.current;
    const gd = mapData.current;
    if (!svg || !gd) return;

    const W = svg.clientWidth || 600;
    const H = svg.clientHeight || 600;

    const proj = d3.geoMercator().fitSize([W, H], gd.states);
    const path = d3.geoPath(proj);

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

    gd.states.features.forEach((f: GeoJSON.Feature) => {
      const d = path(f);
      let isMaha = false;
      if (f.properties) {
         isMaha = f.properties.name === 'Maharashtra' || f.properties['hc-key'] === 'in-mh';
      }
      
      if (isMaha) {
        mk(d, '#B8860B', 'rgba(44,24,16,0.2)', '0.5');
      } else {
        mk(d, '#D4C4A8', 'rgba(44,24,16,0.2)', '0.5');
      }
    });

    const mp = proj(MUMBAI);
    if (mp) {
      const fo = document.createElementNS(ns, 'foreignObject');
      fo.setAttribute('x', String(mp[0] - 24)); 
      fo.setAttribute('y', String(mp[1] - 24));
      fo.setAttribute('width', '48'); 
      fo.setAttribute('height', '48');
      fo.style.overflow = 'visible';
      
      const el = document.createElement('div');
      el.className = 'atlas-marker';
      el.style.width = '48px';
      el.style.height = '48px';
      el.innerHTML = `
        <div class="am-ring am-ring-1"></div>
        <div class="am-ring am-ring-2"></div>
        <div class="am-dot"></div>
      `;
      fo.appendChild(el);
      svg.appendChild(fo);
    }
  }, []);

  if (error) {
    return (
      <div style={{ width: '600px', height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-bronze)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Map Data Unavailable
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        width: '600px',
        height: '600px',
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
}
