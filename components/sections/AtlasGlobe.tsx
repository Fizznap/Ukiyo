'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import type {
  Feature,
  FeatureCollection,
  Geometry,
  GeoJsonProperties,
} from 'geojson';
import type { Topology, GeometryCollection } from 'topojson-specification';

import { atlasGlobeProgress } from '@/components/three/AtlasGlobeWebGL';
import ProjectModal from '@/components/ProjectModal';
import { projects, type Project } from '@/data/projects';

gsap.registerPlugin(ScrollTrigger);

/* WebGL globe — dynamically imported, no SSR (Three.js needs window) */
const AtlasGlobeWebGL = dynamic(
  () => import('@/components/three/AtlasGlobeWebGL'),
  { ssr: false }
);

/* ─── External data sources ─── */
const INDIA_STATES_URLS = [
  'https://raw.githubusercontent.com/geohacker/india/master/state/india_state.geojson',
  'https://raw.githubusercontent.com/datameet/india-election-data/master/assembly-constituencies/States.json',
  'https://raw.githubusercontent.com/HindustanTimesLabs/shapefiles/master/state_ut/all_state.json',
];

/* ─── Design-token colours ─── */
const COLOR_LAND = '#D4C4A8';
const COLOR_STATE_BORDER = 'rgba(44, 24, 16, 0.25)';
const COLOR_BRONZE = '#B8860B';
const COLOR_BEIGE = '#F5F0E8';
const COLOR_DEEP_BROWN = '#2C1810';

/* ─── Focal points (lon, lat) ─── */
const MAHARASHTRA_FOCAL: [number, number] = [76.5, 19.7];
const MUMBAI_FOCAL: [number, number] = [72.8777, 19.076];

/* India bounding box [[lon_min, lat_min], [lon_max, lat_max]] */
const INDIA_BOUNDS: [[number, number], [number, number]] = [
  [68, 8],
  [97, 37],
];

/* Mumbai roads + coastline — pre-fetched from OpenStreetMap and shipped
   as static assets in /public/geo/. Avoids runtime Overpass dependency
   and CORS/UA restrictions, and keeps load fast (gzip ~350KB).        */
const MUMBAI_ROADS_BBOX = {
  west: 72.78,
  south: 18.88,
  east: 73.00,
  north: 19.27,
};
const MUMBAI_ROADS_URL = '/geo/mumbai-roads.json';
const MUMBAI_COAST_URL = '/geo/mumbai-coast.json';
/* Highway tier index (matches the build-time export order in
   fetch-mumbai-osm.mjs).                                       */
const HW_WEIGHT = [1.6, 1.4, 1.1, 0.85, 0.65, 0.4, 0.4]; // motorway → unclassified

/* ─── Mumbai project locations — each maps to a project in data/projects.ts ─── */
const MUMBAI_LOCATIONS: { name: string; lon: number; lat: number; projectId: string }[] = [
  { name: 'MALAD',        lon: 72.8479, lat: 19.1874, projectId: 'andheri-wellness-spa' },
  { name: 'BANDRA',       lon: 72.8347, lat: 19.0596, projectId: 'bandra-penthouse' },
  { name: 'POWAI',        lon: 72.9054, lat: 19.1197, projectId: 'powai-tech-office' },
  { name: 'MALABAR HILL', lon: 72.7959, lat: 18.9554, projectId: 'malabar-hill-residence' },
  { name: 'WORLI',        lon: 72.8183, lat: 19.013,  projectId: 'worli-sea-view' },
  { name: 'JUHU',         lon: 72.8296, lat: 19.1075, projectId: 'juhu-boutique-hotel' },
];

/* ─── Utilities ─── */
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

/* ─── Mumbai compact road format — [tier_index, [[lon, lat], ...]] ─── */
type CompactRoad = [number, [number, number][]];
type CompactCoast = [number, number][];

interface MumbaiRoad {
  /** Geographic line (lon, lat pairs) */
  line: [number, number][];
  /** Stroke width tier — major to minor */
  weight: number;
}

/* Hardcoded Maharashtra fallback polygon */
const MAHARASHTRA_FALLBACK: Feature<Geometry, GeoJsonProperties> = {
  type: 'Feature',
  properties: { name: 'Maharashtra' },
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [72.66, 20.19], [73.03, 20.56], [73.47, 20.67],
        [74.19, 20.66], [74.57, 20.35], [75.07, 20.56],
        [75.68, 20.43], [76.21, 20.65], [76.71, 20.40],
        [77.30, 20.67], [77.75, 20.45], [78.12, 20.66],
        [78.57, 20.41], [79.10, 20.57], [79.66, 20.46],
        [80.19, 20.20], [80.47, 19.68], [80.28, 19.22],
        [79.96, 18.84], [79.58, 18.47], [79.20, 18.10],
        [78.82, 17.73], [78.28, 17.38], [77.74, 17.15],
        [77.20, 16.92], [76.66, 16.55], [76.12, 16.18],
        [75.58, 15.91], [75.04, 15.64], [74.50, 15.51],
        [74.06, 15.68], [73.72, 15.92], [73.48, 16.25],
        [73.04, 16.58], [72.84, 16.91], [72.66, 17.34],
        [72.58, 17.77], [72.50, 18.20], [72.66, 18.53],
        [72.78, 18.96], [72.66, 19.39], [72.58, 19.82],
        [72.66, 20.19],
      ],
    ],
  },
};

export default function AtlasGlobe() {
  const sectionRef = useRef<HTMLElement>(null);
  const mercatorCanvasRef = useRef<HTMLCanvasElement>(null);
  const mumbaiCanvasRef = useRef<HTMLCanvasElement>(null);
  const dotsLayerRef = useRef<HTMLDivElement>(null);
  const vignetteRef = useRef<HTMLDivElement>(null);
  const globeContainerRef = useRef<HTMLDivElement>(null);

  const labelRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const setLabelRef =
    (id: string) => (el: HTMLDivElement | null) => {
      labelRefs.current[id] = el;
    };

  const indiaStatesRef = useRef<Feature<Geometry, GeoJsonProperties>[] | null>(null);
  const maharashtraRef = useRef<Feature<Geometry, GeoJsonProperties> | null>(null);
  /* Mumbai OSM road network + coastline — drawn on the mercator canvas */
  const mumbaiRoadsRef = useRef<MumbaiRoad[] | null>(null);
  const mumbaiCoastRef = useRef<[number, number][][] | null>(null);

  const stateRef = useRef({ progress: 0 });
  const rafRef = useRef<number | null>(null);
  const [active, setActive] = useState(true);
  const [globeOpacity, setGlobeOpacity] = useState(1);
  /* Selected project for the modal — null when no pin clicked */
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  /* Mercator — rendered ONCE at base zoom centred on India.
     Stages 4-5 zoom in via CSS transform (no re-render).      */
  const mercatorRenderedRef = useRef(false);
  /* Mumbai canvas — rendered ONCE at high resolution, native to Mumbai bbox.
     Avoids the blur from CSS-scaling the India mercator 22×.              */
  const mumbaiRenderedRef = useRef(false);
  const INDIA_CENTER: [number, number] = [82.5, 22.5]; // approx geographic centre of India

  /* ─── Load India states ─── */
  useEffect(() => {
    let cancelled = false;

    async function loadIndiaStates() {
      for (const url of INDIA_STATES_URLS) {
        try {
          const res = await fetch(url);
          if (!res.ok) continue;
          const data = (await res.json()) as
            | Topology
            | FeatureCollection<Geometry, GeoJsonProperties>;
          if (cancelled) return;

          let features: Feature<Geometry, GeoJsonProperties>[] = [];
          if ((data as Topology).type === 'Topology') {
            const topology = data as Topology;
            const objKey = Object.keys(topology.objects)[0];
            const geoObj = topology.objects[objKey] as GeometryCollection;
            const collection = feature(
              topology,
              geoObj
            ) as unknown as FeatureCollection<Geometry, GeoJsonProperties>;
            features = collection.features;
          } else if ((data as FeatureCollection).type === 'FeatureCollection') {
            features = (data as FeatureCollection<Geometry, GeoJsonProperties>).features;
          }

          if (features.length > 0) {
            indiaStatesRef.current = features;
            const mh = features.find((f) => {
              const p = (f.properties ?? {}) as Record<string, unknown>;
              return (
                p.NAME_1 === 'Maharashtra' ||
                p.name === 'Maharashtra' ||
                p.NAME === 'Maharashtra' ||
                p.st_nm === 'Maharashtra' ||
                p.State === 'Maharashtra'
              );
            });
            maharashtraRef.current = mh ?? MAHARASHTRA_FALLBACK;
            return;
          }
        } catch {
          continue;
        }
      }

      if (!cancelled) {
        indiaStatesRef.current = [MAHARASHTRA_FALLBACK];
        maharashtraRef.current = MAHARASHTRA_FALLBACK;
      }
    }

    loadIndiaStates();

    /* Mumbai roads + coastline — fetched in parallel; once loaded,
       invalidate the mercator cache so it re-renders with roads.   */
    /* Mumbai roads + coastline — load static JSON shipped in /public/geo/.
       No runtime Overpass dependency.                                       */
    (async () => {
      try {
        const res = await fetch(MUMBAI_ROADS_URL);
        if (!res.ok) {
          console.warn('[AtlasGlobe] Mumbai roads not found:', res.status);
          return;
        }
        const data = (await res.json()) as CompactRoad[];
        if (cancelled) return;
        const roads: MumbaiRoad[] = data.map(([tier, line]) => ({
          line,
          weight: HW_WEIGHT[tier] ?? 0.5,
        }));
        mumbaiRoadsRef.current = roads;
        mumbaiRenderedRef.current = false;
      } catch (e) {
        console.warn('[AtlasGlobe] Mumbai roads load error:', e);
      }
    })();

    (async () => {
      try {
        const res = await fetch(MUMBAI_COAST_URL);
        if (!res.ok) return;
        const data = (await res.json()) as CompactCoast[];
        if (cancelled) return;
        mumbaiCoastRef.current = data;
        mumbaiRenderedRef.current = false;
      } catch (e) {
        console.warn('[AtlasGlobe] Mumbai coast load error:', e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ─── Render the mercator India map ONCE on its own canvas ─── */
  function renderMercatorOnce() {
    if (mercatorRenderedRef.current) return;
    const mc = mercatorCanvasRef.current;
    const states = indiaStatesRef.current;
    if (!mc || !states || states.length === 0) return;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;

    mc.width = Math.round(w * dpr);
    mc.height = Math.round(h * dpr);
    mc.style.width = w + 'px';
    mc.style.height = h + 'px';

    const ctx = mc.getContext('2d');
    if (!ctx) return;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, mc.width, mc.height);
    ctx.scale(dpr, dpr);

    /* Mercator projection at base zoom centred on India — fits all of
       India in the viewport. Stages 4-5 zoom in via CSS transform.    */
    const projection = makeIndiaBaseMercator(w, h);
    const path = d3.geoPath(projection.precision(0.5), ctx);

    /* Beige background */
    ctx.fillStyle = COLOR_BEIGE;
    ctx.fillRect(0, 0, w, h);

    /* All states in parchment */
    states.forEach((f) => {
      ctx.beginPath();
      path(f);
      ctx.fillStyle = COLOR_LAND;
      ctx.fill();
      ctx.strokeStyle = COLOR_STATE_BORDER;
      ctx.lineWidth = 0.9;
      ctx.stroke();
    });

    /* Maharashtra — bronze with thin border (no shadow blur — would
       balloon to a huge halo when CSS-scaled up to 22× for Mumbai).   */
    const mh = maharashtraRef.current;
    if (mh) {
      ctx.beginPath();
      path(mh);
      ctx.fillStyle = COLOR_BRONZE;
      ctx.fill();

      ctx.beginPath();
      path(mh);
      ctx.strokeStyle = 'rgba(139, 101, 8, 0.75)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    mercatorRenderedRef.current = true;
  }

  /** Render the high-resolution Mumbai canvas — sharp roads + coastline,
      native pixels matched to MUMBAI_ROADS_BBOX so it never blurs.       */
  function renderMumbaiOnce() {
    if (mumbaiRenderedRef.current) return;
    const mc = mumbaiCanvasRef.current;
    if (!mc) return;

    const roads = mumbaiRoadsRef.current;
    const coasts = mumbaiCoastRef.current;
    if ((!roads || roads.length === 0) && (!coasts || coasts.length === 0)) {
      return; // nothing to draw yet
    }

    const dpr = window.devicePixelRatio || 1;
    /* Native render resolution — high enough that even at full-screen
       display the roads stay sharp. Aspect matches the bbox.            */
    const lonSpan = MUMBAI_ROADS_BBOX.east - MUMBAI_ROADS_BBOX.west;
    const latSpan = MUMBAI_ROADS_BBOX.north - MUMBAI_ROADS_BBOX.south;
    const RENDER_W = 1600;
    const RENDER_H = Math.round((RENDER_W * latSpan) / lonSpan);

    mc.width = RENDER_W * dpr;
    mc.height = RENDER_H * dpr;
    /* CSS dimensions are set by the per-frame layout in renderDOM */

    const ctx = mc.getContext('2d');
    if (!ctx) return;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, mc.width, mc.height);
    ctx.scale(dpr, dpr);

    /* Mercator projection fitted exactly to the Mumbai canvas.
       Roads + coastline both drawn through this projection.    */
    const projection = d3
      .geoMercator()
      .fitExtent(
        [[10, 10], [RENDER_W - 10, RENDER_H - 10]],
        {
          type: 'Polygon',
          coordinates: [
            [
              [MUMBAI_ROADS_BBOX.west, MUMBAI_ROADS_BBOX.south],
              [MUMBAI_ROADS_BBOX.east, MUMBAI_ROADS_BBOX.south],
              [MUMBAI_ROADS_BBOX.east, MUMBAI_ROADS_BBOX.north],
              [MUMBAI_ROADS_BBOX.west, MUMBAI_ROADS_BBOX.north],
              [MUMBAI_ROADS_BBOX.west, MUMBAI_ROADS_BBOX.south],
            ],
          ],
        } as Feature<Geometry, GeoJsonProperties>['geometry']
      )
      .precision(0.1);

    /* Parchment ground */
    ctx.fillStyle = COLOR_LAND;
    ctx.fillRect(0, 0, RENDER_W, RENDER_H);

    /* Coastline — bronze hairline */
    if (coasts && coasts.length > 0) {
      ctx.strokeStyle = 'rgba(139, 101, 8, 0.55)';
      ctx.lineWidth = 1.1;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      coasts.forEach((line) => {
        ctx.beginPath();
        line.forEach(([lon, lat], i) => {
          const pt = projection([lon, lat]);
          if (!pt) return;
          if (i === 0) ctx.moveTo(pt[0], pt[1]);
          else ctx.lineTo(pt[0], pt[1]);
        });
        ctx.stroke();
      });
    }

    /* Roads — two passes for visual hierarchy.
       Major roads thicker, minor roads thinner.                */
    if (roads && roads.length > 0) {
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      /* Underglow pass — slightly wider, lower opacity */
      roads.forEach((road) => {
        ctx.beginPath();
        road.line.forEach(([lon, lat], i) => {
          const pt = projection([lon, lat]);
          if (!pt) return;
          if (i === 0) ctx.moveTo(pt[0], pt[1]);
          else ctx.lineTo(pt[0], pt[1]);
        });
        ctx.lineWidth = road.weight * 2.4;
        ctx.strokeStyle = 'rgba(184, 134, 11, 0.18)';
        ctx.stroke();
      });

      /* Top stroke — sharp bronze */
      roads.forEach((road) => {
        ctx.beginPath();
        road.line.forEach(([lon, lat], i) => {
          const pt = projection([lon, lat]);
          if (!pt) return;
          if (i === 0) ctx.moveTo(pt[0], pt[1]);
          else ctx.lineTo(pt[0], pt[1]);
        });
        ctx.lineWidth = road.weight * 1.4;
        ctx.strokeStyle = 'rgba(139, 101, 8, 0.65)';
        ctx.stroke();
      });
    }

    mumbaiRenderedRef.current = true;
  }

  /** Mercator projection fitting all of India to the viewport, centred. */
  function makeIndiaBaseMercator(w: number, h: number) {
    /* India 29° span → fills 85% of viewport */
    const indiaSpan = 29;
    const scaleByWidth = (w * 0.85) / ((indiaSpan * Math.PI) / 180) / 6371;
    const scaleByHeight = (h * 0.85) / ((indiaSpan * Math.PI) / 180) / 6371;
    const baseScale = Math.min(scaleByWidth, scaleByHeight) * 6371 * 1.8;

    return d3
      .geoMercator()
      .scale(baseScale)
      .center([INDIA_CENTER[0], INDIA_CENTER[1]])
      .translate([w / 2, h / 2]);
  }

  /* ─── Compute scene state from progress ─── */
  function computeParams(p: number) {
    const globeOpacityVal = 1 - smoothstep(0.55, 0.7, p);
    /* Mercator fades in stages 3-4, fades back out for stage 5 so the
       sharp Mumbai canvas can take over without overlap blur.         */
    const mercatorOpacity =
      smoothstep(0.55, 0.7, p) * (1 - smoothstep(0.85, 0.93, p));
    /* Mumbai canvas — fades in during stage 5 */
    const mumbaiOpacity = smoothstep(0.85, 0.95, p);

    /* Mercator focal + zoom */
    let focal: [number, number];
    let zoomFactor: number;
    if (p < 0.7) {
      focal = [
        (INDIA_BOUNDS[0][0] + INDIA_BOUNDS[1][0]) / 2,
        (INDIA_BOUNDS[0][1] + INDIA_BOUNDS[1][1]) / 2,
      ];
      zoomFactor = 1;
    } else if (p < 0.85) {
      const t = smoothstep(0.7, 0.85, p);
      focal = [
        lerp(
          (INDIA_BOUNDS[0][0] + INDIA_BOUNDS[1][0]) / 2,
          MAHARASHTRA_FOCAL[0],
          t
        ),
        lerp(
          (INDIA_BOUNDS[0][1] + INDIA_BOUNDS[1][1]) / 2,
          MAHARASHTRA_FOCAL[1],
          t
        ),
      ];
      zoomFactor = lerp(1, 3, t);
    } else {
      const t = smoothstep(0.85, 1, p);
      focal = [
        lerp(MAHARASHTRA_FOCAL[0], MUMBAI_FOCAL[0], t),
        lerp(MAHARASHTRA_FOCAL[1], MUMBAI_FOCAL[1], t),
      ];
      zoomFactor = lerp(3, 22, t);
    }

    const mumbaiDotsOpacity = smoothstep(0.93, 1, p);

    return {
      globeOpacity: globeOpacityVal,
      mercatorOpacity,
      mumbaiOpacity,
      focal,
      zoomFactor,
      mumbaiDotsOpacity,
    };
  }

  /* ─── Apply CSS transform to mercator canvas — zero D3 work per frame ─── */
  function applyMercatorTransform(params: ReturnType<typeof computeParams>) {
    const mc = mercatorCanvasRef.current;
    if (!mc) return;

    if (params.mercatorOpacity <= 0.001) {
      mc.style.opacity = '0';
      return;
    }

    if (!mercatorRenderedRef.current) {
      renderMercatorOnce();
      if (!mercatorRenderedRef.current) return;
    }

    const w = window.innerWidth;
    const h = window.innerHeight;

    /* Project the focal point at base zoom (matches the rendered canvas).
       Then CSS-scale up by zoomFactor and translate so focal stays centred. */
    const baseProjection = makeIndiaBaseMercator(w, h);
    const focalAtBase = baseProjection(params.focal);
    if (!focalAtBase) return;

    const cssScale = params.zoomFactor;
    const tx = w / 2 - focalAtBase[0] * cssScale;
    const ty = h / 2 - focalAtBase[1] * cssScale;

    mc.style.opacity = String(params.mercatorOpacity);
    mc.style.transform = `translate(${tx}px, ${ty}px) scale(${cssScale})`;
    mc.style.transformOrigin = '0 0';
  }

  /* ─── Per-frame DOM updates (mercator transform, Mumbai cluster, vignette, labels) ─── */
  function renderDOM() {
    const p = stateRef.current.progress;
    const params = computeParams(p);
    const w = window.innerWidth;
    const h = window.innerHeight;

    /* Pipe progress to Three.js scene */
    atlasGlobeProgress.value = p;

    /* Globe container CSS zoom — Stage 1 holds at 1.0, Stage 2 ramps to 2.5 */
    const globeContainer = globeContainerRef.current;
    if (globeContainer) {
      let scale = 1.0;
      if (p >= 0.25 && p < 0.55) {
        scale = lerp(1.0, 2.5, (p - 0.25) / 0.30);
      } else if (p >= 0.55) {
        scale = 2.5;
      }
      globeContainer.style.transform = `scale(${scale})`;
      globeContainer.style.transformOrigin = 'center center';
    }

    /* Globe opacity — pushed via state so React re-renders the WebGL component */
    if (Math.abs(globeOpacity - params.globeOpacity) > 0.01) {
      setGlobeOpacity(params.globeOpacity);
    }

    applyMercatorTransform(params);

    /* Mumbai canvas — high-res road network. Positioned via the same
       projection math as the pins so it stays geographically correct.
       Sized to the projected bbox at the current zoom factor.           */
    const mumbaiCanvas = mumbaiCanvasRef.current;
    if (mumbaiCanvas) {
      const mumbaiOpacity = params.mumbaiOpacity;
      mumbaiCanvas.style.opacity = String(mumbaiOpacity);
      if (mumbaiOpacity > 0.001) {
        if (!mumbaiRenderedRef.current) renderMumbaiOnce();
        const projection = makeIndiaBaseMercator(w, h);
        const cssScale = params.zoomFactor;
        const focalAtBase = projection(params.focal);
        if (focalAtBase) {
          const tx = w / 2 - focalAtBase[0] * cssScale;
          const ty = h / 2 - focalAtBase[1] * cssScale;
          const nw = projection([MUMBAI_ROADS_BBOX.west, MUMBAI_ROADS_BBOX.north]);
          const se = projection([MUMBAI_ROADS_BBOX.east, MUMBAI_ROADS_BBOX.south]);
          if (nw && se) {
            mumbaiCanvas.style.left = `${nw[0] * cssScale + tx}px`;
            mumbaiCanvas.style.top = `${nw[1] * cssScale + ty}px`;
            mumbaiCanvas.style.width = `${(se[0] - nw[0]) * cssScale}px`;
            mumbaiCanvas.style.height = `${(se[1] - nw[1]) * cssScale}px`;
            mumbaiCanvas.style.visibility = 'visible';
          }
        }
      } else {
        mumbaiCanvas.style.visibility = 'hidden';
      }
    }

    /* Mumbai cluster — projected through India-base mercator, then CSS-transformed */
    const dotsLayer = dotsLayerRef.current;
    if (dotsLayer) {
      dotsLayer.style.opacity = String(params.mumbaiDotsOpacity);
      if (params.mumbaiDotsOpacity > 0.001) {
        const projection = makeIndiaBaseMercator(w, h);
        const cssScale = params.zoomFactor;
        const focalAtBase = projection(params.focal);
        if (focalAtBase) {
          const tx = w / 2 - focalAtBase[0] * cssScale;
          const ty = h / 2 - focalAtBase[1] * cssScale;
          const children = dotsLayer.children;
          MUMBAI_LOCATIONS.forEach((loc, i) => {
            const el = children[i] as HTMLDivElement | undefined;
            if (!el) return;
            const pt = projection([loc.lon, loc.lat]);
            if (pt) {
              const fx = pt[0] * cssScale + tx;
              const fy = pt[1] * cssScale + ty;
              el.style.left = `${fx}px`;
              el.style.top = `${fy}px`;
              el.style.visibility = 'visible';
            } else {
              el.style.visibility = 'hidden';
            }
          });
        }
      }
    }

    const vignette = vignetteRef.current;
    if (vignette) {
      vignette.style.opacity = String(smoothstep(0.85, 1, p));
    }

    /* Labels */
    const labelStates: Record<string, number> = {
      'design-territories': crossfade(p, -0.1, 0.0, 0.25, 0.3),
      india: crossfade(p, 0.25, 0.3, 0.7, 0.75),
      maharashtra: crossfade(p, 0.7, 0.75, 0.85, 0.9),
      'mumbai-india': crossfade(p, 0.85, 0.9, 1.01, 1.02),
    };
    Object.entries(labelStates).forEach(([id, opacity]) => {
      const el = labelRefs.current[id];
      if (el) {
        el.style.opacity = String(opacity);
        el.style.transform = `translate(-50%, ${(1 - opacity) * 6}px)`;
      }
    });
  }

  function crossfade(
    p: number,
    fadeInStart: number,
    fadeInEnd: number,
    fadeOutStart: number,
    fadeOutEnd: number
  ) {
    if (p < fadeInStart) return 0;
    if (p > fadeOutEnd) return 0;
    if (p < fadeInEnd) return smoothstep(fadeInStart, fadeInEnd, p);
    if (p < fadeOutStart) return 1;
    return 1 - smoothstep(fadeOutStart, fadeOutEnd, p);
  }

  /* ─── DOM rAF loop (lightweight — no canvas work) ─── */
  useEffect(() => {
    if (!active) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    const tick = () => {
      renderDOM();
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  /* ─── ScrollTrigger ─── */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const visibility = ScrollTrigger.create({
      trigger: section,
      start: 'top bottom',
      end: 'bottom top',
      onEnter: () => setActive(true),
      onEnterBack: () => setActive(true),
      onLeave: () => setActive(false),
      onLeaveBack: () => setActive(false),
    });

    const master = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.5,
      onUpdate: (self) => {
        stateRef.current.progress = self.progress;
      },
    });

    return () => {
      visibility.kill();
      master.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="atlas"
      aria-label="Design territories — from the world to Ukiyo"
      style={{
        position: 'relative',
        width: '100%',
        height: '600vh',
        backgroundColor: COLOR_BEIGE,
      }}
    >
      <div
        style={{
          position: 'sticky',
          top: 0,
          width: '100%',
          height: '100vh',
          overflow: 'hidden',
          backgroundColor: COLOR_BEIGE,
        }}
      >
        {/* WebGL globe — Stages 1-2 */}
        <div
          ref={globeContainerRef}
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            pointerEvents: 'none',
            transformOrigin: 'center center',
            willChange: 'transform',
          }}
        >
          <AtlasGlobeWebGL active={active} opacity={globeOpacity} />
        </div>

        {/* Mercator India canvas — rendered once, zoomed/panned via CSS transform */}
        <canvas
          ref={mercatorCanvasRef}
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1,
            pointerEvents: 'none',
            opacity: 0,
            willChange: 'transform, opacity',
            transformOrigin: '0 0',
          }}
        />

        {/* Mumbai canvas — sharp road network at native resolution.
           Sized to the bbox in CSS, so its render-pixel-density stays
           constant regardless of zoom — no blur.                       */}
        <canvas
          ref={mumbaiCanvasRef}
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 2,
            pointerEvents: 'none',
            opacity: 0,
            visibility: 'hidden',
            willChange: 'opacity, left, top, width, height',
          }}
        />

        {/* Mumbai cluster — DOM, projected through max-zoom mercator */}
        <div
          ref={dotsLayerRef}
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 4,
            /* Pins themselves enable pointer events; the layer is pass-through
               so scroll continues to work normally outside pin hit areas.    */
            pointerEvents: 'none',
            opacity: 0,
          }}
        >
          {MUMBAI_LOCATIONS.map((loc) => {
            const project = projects.find((p) => p.id === loc.projectId);
            return (
              <button
                key={loc.name}
                type="button"
                aria-label={`View project: ${project?.name ?? loc.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (project) setSelectedProject(project);
                }}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  transform: 'translate(-50%, -50%)',
                  visibility: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  /* Pin gets pointer events when visible */
                  pointerEvents: 'auto',
                  cursor: 'pointer',
                  background: 'transparent',
                  border: 'none',
                  padding: 8, // hit-target padding around the visible dot
                  willChange: 'left, top',
                }}
                className="atlas-pin"
              >
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 10,
                    fontWeight: 500,
                    letterSpacing: '0.2em',
                    color: COLOR_DEEP_BROWN,
                    textShadow: '0 0 8px rgba(245,240,232,0.95)',
                    marginBottom: 4,
                    pointerEvents: 'none',
                  }}
                >
                  {loc.name}
                </span>
                <div
                  style={{
                    position: 'relative',
                    width: 10,
                    height: 10,
                    pointerEvents: 'none',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '50%',
                      backgroundColor: COLOR_BRONZE,
                      zIndex: 2,
                      boxShadow: '0 0 0 2px rgba(245,240,232,0.95)',
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '50%',
                      border: `1px solid ${COLOR_BRONZE}`,
                      animation: 'atlas-pulse 1.5s ease-out infinite',
                    }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Warm vignette — final stage */}
        <div
          ref={vignetteRef}
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 4,
            opacity: 0,
            pointerEvents: 'none',
            background:
              'radial-gradient(ellipse at center, transparent 40%, rgba(245,240,232,0.4) 70%, rgba(245,240,232,0.85) 100%)',
          }}
        />

        {/* Labels */}
        <div
          style={{
            position: 'absolute',
            top: 80,
            left: 0,
            right: 0,
            zIndex: 5,
            display: 'flex',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <div
            ref={setLabelRef('design-territories')}
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              opacity: 0,
              willChange: 'opacity, transform',
            }}
          >
            <AtlasLabelText>DESIGN TERRITORIES</AtlasLabelText>
          </div>
          <div
            ref={setLabelRef('india')}
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              opacity: 0,
              willChange: 'opacity, transform',
            }}
          >
            <AtlasLabelText>INDIA</AtlasLabelText>
          </div>
          <div
            ref={setLabelRef('maharashtra')}
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              opacity: 0,
              willChange: 'opacity, transform',
            }}
          >
            <AtlasLabelText>MAHARASHTRA</AtlasLabelText>
          </div>
          <div
            ref={setLabelRef('mumbai-india')}
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              opacity: 0,
              willChange: 'opacity, transform',
              whiteSpace: 'nowrap',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 48,
                fontWeight: 300,
                color: COLOR_DEEP_BROWN,
                letterSpacing: '0.02em',
                lineHeight: 1.1,
                textAlign: 'center',
                margin: 0,
              }}
            >
              MUMBAI ·{' '}
              <em style={{ fontStyle: 'italic', color: COLOR_BRONZE }}>INDIA</em>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes atlas-pulse {
          0%   { transform: scale(1);   opacity: 1; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        .atlas-pin:hover { transform: translate(-50%, -50%) scale(1.15) !important; }
        .atlas-pin { transition: transform 220ms cubic-bezier(0.16,1,0.3,1); }
      `}</style>

      {/* Project showcase modal — mounts only when a pin is clicked */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </section>
  );
}

function AtlasLabelText({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: 'var(--font-body)',
        fontSize: 11,
        fontWeight: 500,
        color: COLOR_BRONZE,
        letterSpacing: '0.34em',
        textTransform: 'uppercase',
        textAlign: 'center',
        whiteSpace: 'nowrap',
        margin: 0,
      }}
    >
      {children}
    </p>
  );
}
