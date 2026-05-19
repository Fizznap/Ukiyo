'use client';

import { useEffect, useRef } from 'react';
import maplibregl, {
  type Map as MapLibreMap,
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
 *   - Six bronze pins via GeoJSON source + circle/symbol layers
 */

const MUMBAI_CENTER: [number, number] = [72.875, 19.10];
const MUMBAI_ZOOM = 10.6;

const COLOR_BRONZE = '#B8860B';
const COLOR_DEEP_BROWN = '#2C1810';
const COLOR_BEIGE = '#EDEADF';

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
      /* ── GeoJSON source: one feature per Mumbai location ── */
      map.addSource('mumbai-pins', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: locations.map((loc) => ({
            type: 'Feature' as const,
            geometry: {
              type: 'Point' as const,
              /* GeoJSON is always [longitude, latitude] */
              coordinates: [loc.lon, loc.lat],
            },
            properties: {
              name: loc.displayName,
              projectId: loc.projectId,
            },
          })),
        },
      });

      /* ── Circle layer — bronze dot ── */
      map.addLayer({
        id: 'mumbai-pins-circle',
        type: 'circle',
        source: 'mumbai-pins',
        paint: {
          'circle-radius': 8,
          'circle-color': COLOR_BRONZE,
          'circle-stroke-width': 2,
          'circle-stroke-color': COLOR_BEIGE,
          'circle-opacity': 1,
        },
      });

      /* ── Symbol layer — location name below dot ── */
      map.addLayer({
        id: 'mumbai-pins-label',
        type: 'symbol',
        source: 'mumbai-pins',
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Open Sans Regular'],
          'text-size': 11,
          'text-offset': [0, 1.5],
          'text-anchor': 'top',
        },
        paint: {
          'text-color': COLOR_DEEP_BROWN,
          'text-halo-color': COLOR_BEIGE,
          'text-halo-width': 2,
        },
      });

      /* ── Click handler — fires project modal via parent callback ── */
      map.on('click', 'mumbai-pins-circle', (e) => {
        const feature = e.features?.[0];
        if (!feature) return;
        const projectId = feature.properties?.projectId as string | undefined;
        if (!projectId) return;
        const project = projects.find((p) => p.id === projectId);
        if (project) onPinClickRef.current(project);
      });

      /* Pointer cursor on hover */
      map.on('mouseenter', 'mumbai-pins-circle', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'mumbai-pins-circle', () => {
        map.getCanvas().style.cursor = '';
      });
    });

    return () => {
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
        .maplibregl-ctrl-attrib {
          font-family: var(--font-body), system-ui, sans-serif;
          font-size: 9px !important;
          background: rgba(245, 245, 220, 0.7) !important;
          color: var(--color-muted-brown) !important;
          padding: 2px 6px !important;
        }
        .maplibregl-ctrl-attrib a { color: var(--color-bronze) !important; }
      `}</style>
    </div>
  );
}
