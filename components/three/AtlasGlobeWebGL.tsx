'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import type {
  Feature,
  FeatureCollection,
  Geometry,
  GeoJsonProperties,
} from 'geojson';
import type { Topology, GeometryCollection } from 'topojson-specification';

/**
 * AtlasGlobeWebGL (D3 orthographic — file kept under /three/ for now)
 *
 * D3 orthographic projection on a 2D canvas — produces the "Earth seen
 * from space" look in the reference. Continents are flat polygons but
 * orthographic projection gives them the spherical curve.
 *
 *   - Globe diameter: 75vmin
 *   - Rotated so India centred at all times
 *   - Slow Y-axis idle drift in Stage 1, dampens to zero by Stage 2
 *   - Atmospheric edge fade (radial gradient overlay) for depth
 *   - All-beige palette: ocean #C4B49A, land #D4C4A8, India bronze #B8860B
 */

export const atlasGlobeProgress = { value: 0 };

const WORLD_TOPO_URL =
  'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const COLOR_OCEAN = '#C4B49A';
const COLOR_LAND = '#D4C4A8';
const COLOR_BRONZE = '#B8860B';
const COLOR_BORDER = 'rgba(44, 24, 16, 0.18)';

/* India centroid — the rotation target so India sits at the front */
const INDIA_LON = 78.9629;
const INDIA_LAT = 22.5937;

interface Props {
  /** rAF pauses when section is offscreen */
  active: boolean;
  /** 0..1 — driven by parent during stage-3 crossfade to mercator */
  opacity: number;
}

export default function AtlasGlobeWebGL({ active, opacity }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const worldRef = useRef<Feature<Geometry, GeoJsonProperties>[] | null>(null);
  const rafRef = useRef<number | null>(null);
  const idleAngleRef = useRef(0);

  /* Mount canvas + fetch world topojson once */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.appendChild(canvas);
    canvasRef.current = canvas;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    const computeSize = () =>
      Math.min(window.innerWidth, window.innerHeight) * 0.75;

    const onResize = () => {
      const size = computeSize();
      canvas.width = Math.round(size * dpr);
      canvas.height = Math.round(size * dpr);
    };
    onResize();
    window.addEventListener('resize', onResize);

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(WORLD_TOPO_URL);
        if (!res.ok) return;
        const topology = (await res.json()) as Topology<{
          countries: GeometryCollection;
        }>;
        if (cancelled) return;
        const collection = feature(
          topology,
          topology.objects.countries
        ) as unknown as FeatureCollection<Geometry, GeoJsonProperties>;
        worldRef.current = collection.features;
      } catch {
        /* keep canvas blank — fallback ocean fill still draws */
      }
    })();

    return () => {
      cancelled = true;
      window.removeEventListener('resize', onResize);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (canvas.parentNode === container) container.removeChild(canvas);
      canvasRef.current = null;
    };
  }, []);

  /* Render loop */
  useEffect(() => {
    if (!active) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    const tick = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const p = clamp(atlasGlobeProgress.value, 0, 1);

      /* Idle drift in Stage 1; in Stage 2 the angle eases back toward 0
         no matter how far the globe has spun, so India always returns
         to the camera-facing front before the zoom begins.              */
      const dampen = 1 - smoothstep(0.15, 0.4, p);
      if (dampen > 0.5) {
        /* Stage 1: free idle drift */
        idleAngleRef.current += 0.12 * dampen;
      } else {
        /* Stage 2: ease angle back toward 0 (taking the shortest path) */
        const a = idleAngleRef.current;
        /* Wrap to ±180° so the rotation always picks the short way home */
        const wrapped = ((a + 180) % 360 + 360) % 360 - 180;
        const ease = 0.06 + 0.18 * (1 - dampen); // faster as p approaches Stage 3
        idleAngleRef.current = a - wrapped * ease;
      }

      const W = canvas.width;
      const H = canvas.height;

      /* Orthographic projection — globe centred on India,
         rotated by the current idle angle around the Y axis (lon).         */
      const radius = Math.min(W, H) / 2 - 4;
      const projection = d3
        .geoOrthographic()
        .scale(radius)
        .translate([W / 2, H / 2])
        .rotate([-(INDIA_LON + idleAngleRef.current), -INDIA_LAT, 0])
        .clipAngle(90)
        .precision(0.5);

      const path = d3.geoPath(projection, ctx);

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, W, H);

      /* Ocean sphere — also serves as the globe outline */
      ctx.beginPath();
      path({ type: 'Sphere' });
      ctx.fillStyle = COLOR_OCEAN;
      ctx.fill();

      const features = worldRef.current;
      if (features) {
        /* All countries — parchment fill */
        ctx.fillStyle = COLOR_LAND;
        features.forEach((f) => {
          ctx.beginPath();
          path(f);
          ctx.fill();
        });

        /* Country borders */
        ctx.strokeStyle = COLOR_BORDER;
        ctx.lineWidth = 0.6;
        features.forEach((f) => {
          ctx.beginPath();
          path(f);
          ctx.stroke();
        });

        /* India — bronze with soft glow */
        const india = features.find((f) => {
          const id = (f as unknown as { id?: string | number }).id;
          return id === 356 || String(id) === '356' || id === 'IND';
        });
        if (india) {
          /* India — bronze fill (no shadow blur; the orthographic globe
             stays at base scale so the bronze edge alone reads cleanly) */
          ctx.fillStyle = COLOR_BRONZE;
          ctx.beginPath();
          path(india);
          ctx.fill();

          /* Bronze edge on India */
          ctx.beginPath();
          path(india);
          ctx.strokeStyle = 'rgba(139, 101, 8, 0.7)';
          ctx.lineWidth = 0.9;
          ctx.stroke();
        }
      }

      /* Globe rim — thin bronze hairline */
      ctx.beginPath();
      path({ type: 'Sphere' });
      ctx.strokeStyle = 'rgba(184, 134, 11, 0.28)';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      /* Apply parent-driven opacity to the CONTAINER (not the canvas)
         so the atmospheric box-shadow fades out together with the globe. */
      const container = containerRef.current;
      if (container) container.style.opacity = String(opacity);

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [active, opacity]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '75vmin',
        height: '75vmin',
        borderRadius: '50%',
        overflow: 'hidden',
        pointerEvents: 'none',
        /* Atmospheric edge fade — soft warm vignette into the beige page */
        boxShadow:
          'inset 0 0 60px 10px rgba(245, 240, 232, 0.55), 0 30px 80px rgba(44, 24, 16, 0.08)',
      }}
    />
  );
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
