'use client';

import { useEffect, useRef } from 'react';
import maplibregl, {
  type Map as MapLibreMap,
  type Marker,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Project } from '@/data/projects';

/**
 * MumbaiMap
 *
 * MapLibre + OpenFreeMap vector tiles. Vector source lets us recolour
 * every layer directly (water → page beige so it visually disappears,
 * roads → bronze, buildings → muted parchment) — no CSS sepia hacks.
 *
 *   - Free vector tiles (no API key)
 *   - Single map instance, mounted lazily by the parent
 *   - interactive: false → wheel events bubble, scroll keeps working
 *   - Six bronze DOM markers, click → project modal
 */

const MUMBAI_CENTER: [number, number] = [72.875, 19.10];
const MUMBAI_ZOOM = 10.6;

const COLOR_BRONZE = '#B8860B';
const COLOR_DEEP_BROWN = '#2C1810';
const COLOR_BEIGE = '#F5F0E8';

/* OpenFreeMap positron style — vector tiles, free, no token */
const STYLE_URL = 'https://tiles.openfreemap.org/styles/positron';

interface MumbaiLocation {
  name: string;
  displayName: string;
  lon: number;
  lat: number;
  projectId: string;
}

interface Props {
  locations: MumbaiLocation[];
  projects: Project[];
  onPinClick: (project: Project) => void;
}

/** Push every layer in a vector style into the warm beige palette.
    Water becomes the page beige so it visually disappears.           */
function applyBeigePalette(map: MapLibreMap) {
  const layers = map.getStyle().layers ?? [];
  for (const layer of layers) {
    const id = layer.id.toLowerCase();
    const type = layer.type;

    /* WATER → page beige (effectively invisible against the page bg) */
    if (
      id.includes('water') ||
      id.includes('ocean') ||
      id.includes('sea') ||
      id.includes('river') ||
      id.includes('lake') ||
      id.includes('pond') ||
      id.includes('reservoir') ||
      id.includes('waterway') ||
      id.includes('coastline')
    ) {
      try {
        if (type === 'fill') {
          map.setPaintProperty(id, 'fill-color', COLOR_BEIGE);
          map.setPaintProperty(id, 'fill-opacity', 1);
        } else if (type === 'line') {
          map.setPaintProperty(id, 'line-color', COLOR_BEIGE);
        }
      } catch { /* skip */ }
      continue;
    }

    /* BUILDINGS → slightly deeper parchment */
    if (id.includes('building')) {
      try {
        if (type === 'fill') {
          map.setPaintProperty(id, 'fill-color', '#C9B89C');
          map.setPaintProperty(id, 'fill-outline-color', 'rgba(44,24,16,0.15)');
        }
      } catch { /* skip */ }
      continue;
    }

    /* ROADS → bronze hairlines (priority over land checks below) */
    if (
      id.includes('road') ||
      id.includes('highway') ||
      id.includes('street') ||
      id.includes('motorway') ||
      id.includes('trunk') ||
      id.includes('primary') ||
      id.includes('secondary') ||
      id.includes('tertiary') ||
      id.includes('bridge') ||
      id.includes('tunnel') ||
      id.includes('rail') ||
      id.includes('transit') ||
      id.includes('aero') ||
      id.includes('path') ||
      id.includes('track')
    ) {
      try {
        if (type === 'line') {
          const isMajor =
            id.includes('motorway') ||
            id.includes('trunk') ||
            id.includes('primary');
          map.setPaintProperty(
            id,
            'line-color',
            isMajor ? '#8B6914' : 'rgba(139, 101, 8, 0.55)'
          );
        } else if (type === 'fill') {
          /* Some road shields render as fills */
          map.setPaintProperty(id, 'fill-color', 'rgba(139, 101, 8, 0.4)');
        }
      } catch { /* skip */ }
      continue;
    }

    /* PLACE / LABEL TEXT → muted brown, warm halo */
    if (type === 'symbol') {
      try {
        map.setPaintProperty(id, 'text-color', COLOR_DEEP_BROWN);
        map.setPaintProperty(id, 'text-halo-color', COLOR_BEIGE);
        map.setPaintProperty(id, 'text-halo-width', 1.5);
      } catch { /* skip */ }
      continue;
    }

    /* BACKGROUND → deep parchment so the entire viewport reads as land */
    if (type === 'background') {
      try {
        map.setPaintProperty(id, 'background-color', '#D4C4A8');
      } catch { /* skip */ }
      continue;
    }

    /* EVERYTHING ELSE that's a fill (landcover, landuse, urban_area,
       industrial, cemetery, farmland, hospital, school, etc.) →
       parchment. Catch-all so no white pockets remain.                */
    if (type === 'fill') {
      try {
        map.setPaintProperty(id, 'fill-color', '#D4C4A8');
        map.setPaintProperty(id, 'fill-opacity', 1);
      } catch { /* skip */ }
      continue;
    }

    /* Any non-road LINE we didn't catch (boundaries, admin) → soft brown */
    if (type === 'line') {
      try {
        map.setPaintProperty(id, 'line-color', 'rgba(44, 24, 16, 0.18)');
      } catch { /* skip */ }
    }
  }
}

export default function MumbaiMap({ locations, projects, onPinClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const onPinClickRef = useRef(onPinClick);
  useEffect(() => {
    onPinClickRef.current = onPinClick;
  }, [onPinClick]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const map = new maplibregl.Map({
      container,
      style: STYLE_URL,
      center: MUMBAI_CENTER,
      zoom: MUMBAI_ZOOM,
      bearing: 0,
      pitch: 0,
      attributionControl: false,
      interactive: false,
      maxTileCacheSize: 64,
    });
    mapRef.current = map;

    map.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      'bottom-right'
    );

    map.on('style.load', () => {
      /* Recolour every layer to the brand palette before the first paint */
      applyBeigePalette(map);
    });

    map.on('load', () => {
      locations.forEach((loc) => {
        const project = projects.find((p) => p.id === loc.projectId);

        /* Marker root — sized exactly to the visible dot+ring (24×24).
           The label is appended OUTSIDE this element so it can never
           influence the button's bounding box, which is what MapLibre
           uses to anchor the marker at the geographic point.           */
        const el = document.createElement('div');
        el.className = 'mumbai-pin-wrapper';
        el.style.cssText = `
          position: relative;
          width: 24px;
          height: 24px;
          margin: 0;
          padding: 0;
        `;

        const button = document.createElement('button');
        button.type = 'button';
        button.setAttribute(
          'aria-label',
          `View project: ${project?.name ?? loc.displayName}`
        );
        button.title = loc.displayName;
        button.className = 'mumbai-pin';
        button.style.cssText = `
          position: absolute;
          top: 0;
          left: 0;
          width: 24px;
          height: 24px;
          min-width: 0;
          min-height: 0;
          margin: 0;
          padding: 0;
          background: transparent;
          border: none;
          cursor: pointer;
          box-sizing: border-box;
        `;
        el.appendChild(button);

        /* Outer bronze ring — absolutely centred at button geometric centre */
        const ring = document.createElement('span');
        ring.style.cssText = `
          position: absolute;
          top: 50%;
          left: 50%;
          width: 20px;
          height: 20px;
          margin-left: -10px;
          margin-top: -10px;
          border-radius: 50%;
          border: 1.5px solid ${COLOR_BRONZE};
          background: rgba(245, 240, 232, 0.92);
          box-sizing: border-box;
          pointer-events: none;
        `;
        button.appendChild(ring);

        /* Inner bronze dot — absolutely centred over the ring */
        const dot = document.createElement('span');
        dot.style.cssText = `
          position: absolute;
          top: 50%;
          left: 50%;
          width: 8px;
          height: 8px;
          margin-left: -4px;
          margin-top: -4px;
          border-radius: 50%;
          background: ${COLOR_BRONZE};
          pointer-events: none;
        `;
        button.appendChild(dot);

        /* Label sits OUTSIDE the button — appended to the wrapper so the
           button's box stays exactly 24×24 and MapLibre's centre anchor
           lands the dot precisely on the geographic coordinate.         */
        const label = document.createElement('span');
        label.textContent = loc.displayName;
        label.style.cssText = `
          position: absolute;
          left: calc(50% + 14px);
          top: 50%;
          transform: translateY(-50%);
          white-space: nowrap;
          font-family: var(--font-body), 'DM Sans', system-ui, sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: ${COLOR_DEEP_BROWN};
          text-shadow: 0 0 6px rgba(245, 240, 232, 0.95);
          pointer-events: none;
        `;
        el.appendChild(label);

        if (project) {
          button.addEventListener('click', (e) => {
            e.stopPropagation();
            onPinClickRef.current(project);
          });
        }

        const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat([loc.lon, loc.lat])
          .addTo(map);
        markersRef.current.push(marker);
      });
    });

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        /* Deep parchment behind the map so any transparent layer reads
           as land, not as the page beige showing through.              */
        backgroundColor: '#D4C4A8',
      }}
    >
      <div
        ref={containerRef}
        style={{ position: 'absolute', inset: 0 }}
      />

      <style>{`
        .mumbai-pin:hover { transform: scale(1.12); transition: transform 220ms cubic-bezier(0.16,1,0.3,1); }
        .maplibregl-ctrl-attrib {
          font-family: var(--font-body), system-ui, sans-serif;
          font-size: 9px !important;
          background: rgba(245, 240, 232, 0.7) !important;
          color: var(--color-muted-brown) !important;
          padding: 2px 6px !important;
        }
        .maplibregl-ctrl-attrib a { color: var(--color-bronze) !important; }
      `}</style>
    </div>
  );
}
