'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
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
 * AtlasGlobeWebGL
 *
 * Pure Three.js (no R3F) WebGL globe for AtlasGlobe stages 1-2.
 * Scroll progress (0..1) is read every frame from the exported
 * `atlasGlobeProgress` ref. The scene reacts only by:
 *   - rotating the globe group on its Y axis (idle drift)
 *   - rotating to face India as Stage 2 progresses
 *   - moving the camera z (zoom) — this is the only cinematic motion
 *
 * Per-frame cost: a few uniform updates and one draw call. GPU does the rest.
 */

export const atlasGlobeProgress = { value: 0 };

const WORLD_TOPO_URL =
  'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const COLOR_OCEAN = '#C4B49A';
const COLOR_LAND = '#D4C4A8';
const COLOR_BRONZE = '#B8860B';
const COLOR_BORDER = 'rgba(44, 24, 16, 0.3)';

/* India focal lat/lon (deg) — same as the D3 version */
const INDIA_LON = 78.9629;
const INDIA_LAT = 22.5937;

/* Texture dimensions — equirectangular */
const TEX_W = 2048;
const TEX_H = 1024;

/** Build a warm-toned Earth texture from real country features.
    `worldFeatures` may be null on the first paint — we draw a fallback
    (ocean + simplified continents) and re-render once data arrives.   */
function buildEarthTexture(
  worldFeatures: Feature<Geometry, GeoJsonProperties>[] | null
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = TEX_W;
  canvas.height = TEX_H;
  const ctx = canvas.getContext('2d')!;

  /* Ocean */
  ctx.fillStyle = COLOR_OCEAN;
  ctx.fillRect(0, 0, TEX_W, TEX_H);

  if (worldFeatures) {
    /* Real countries via D3 equirectangular projection fitted to the
       texture canvas (full sphere → 2048×1024).                       */
    const proj = d3
      .geoEquirectangular()
      .fitSize([TEX_W, TEX_H], { type: 'Sphere' });
    const path = d3.geoPath(proj, ctx);

    /* All countries — parchment fill */
    ctx.fillStyle = COLOR_LAND;
    worldFeatures.forEach((f) => {
      ctx.beginPath();
      path(f);
      ctx.fill();
    });

    /* India — bronze fill */
    const india = worldFeatures.find((f) => {
      const id = (f as unknown as { id?: string | number }).id;
      return id === 356 || String(id) === '356' || id === 'IND';
    });
    if (india) {
      ctx.save();
      ctx.shadowColor = COLOR_BRONZE;
      ctx.shadowBlur = 24;
      ctx.fillStyle = COLOR_BRONZE;
      ctx.beginPath();
      path(india);
      ctx.fill();
      ctx.restore();
    }

    /* Country borders */
    ctx.strokeStyle = COLOR_BORDER;
    ctx.lineWidth = 1;
    worldFeatures.forEach((f) => {
      ctx.beginPath();
      path(f);
      ctx.stroke();
    });
  } else {
    /* First-paint fallback — coarse continent ellipses, replaced when
       the topojson fetch resolves.                                    */
    ctx.fillStyle = COLOR_LAND;
    const continents: { cx: number; cy: number; rx: number; ry: number }[] = [
      { cx: 1100, cy: 580, rx: 130, ry: 220 },
      { cx: 1320, cy: 360, rx: 360, ry: 170 },
      { cx: 480,  cy: 380, rx: 180, ry: 200 },
      { cx: 600,  cy: 700, rx: 90,  ry: 180 },
      { cx: 1670, cy: 720, rx: 110, ry: 70  },
      { cx: 1024, cy: 1000, rx: 1024, ry: 60 },
      { cx: 920, cy: 230, rx: 70, ry: 60 },
    ];
    continents.forEach(({ cx, cy, rx, ry }) => {
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

interface Props {
  /** When false, frameloop pauses (offscreen / Stage 3+ where mercator dominates) */
  active: boolean;
  /** Globe opacity 0..1 — driven by parent (crossfade to mercator at stage 3) */
  opacity: number;
}

export default function AtlasGlobeWebGL({ active, opacity }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const rafRef = useRef<number | null>(null);
  const idleAngleRef = useRef(0);

  /* Mount Three.js once */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    /* Globe is a 75vmin circle — renderer matches the square crop */
    const computeGlobeSize = () =>
      Math.min(window.innerWidth, window.innerHeight) * 0.75;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    const initialSize = computeGlobeSize();
    renderer.setSize(initialSize, initialSize);
    renderer.setClearColor(0x000000, 0); // transparent — beige page shows through
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      34,
      1, // square aspect — globe canvas is always square
      0.05,
      40
    );
    camera.position.set(0, 0, 2.5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    /* Lights — kept lightweight, but MeshBasicMaterial ignores them.
       Left in place harmlessly in case material is changed back later.   */
    scene.add(new THREE.AmbientLight(0xf3e4c8, 0.6));
    const key = new THREE.DirectionalLight(0xf5e0b8, 1.0);
    key.position.set(-3, 3, 4);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xb8860b, 0.32);
    rim.position.set(2, -1, -3);
    scene.add(rim);

    /* Globe */
    const group = new THREE.Group();
    group.rotation.order = 'YXZ';
    /* Initial pose — India centred on the front of the globe */
    group.rotation.y = -1.35;
    group.rotation.x = 0.25;
    scene.add(group);
    globeGroupRef.current = group;

    const geometry = new THREE.SphereGeometry(1, 64, 64);
    const texture = buildEarthTexture(null); // fallback until world data loads
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.FrontSide,
      transparent: true,
      opacity: 1,
    });
    materialRef.current = material;
    const mesh = new THREE.Mesh(geometry, material);
    group.add(mesh);

    /* Track current texture so we can dispose it when swapping */
    let currentTexture: THREE.CanvasTexture = texture;
    let cancelled = false;

    /* Fetch world topojson and swap in a high-detail texture */
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
        const newTexture = buildEarthTexture(collection.features);
        if (cancelled) {
          newTexture.dispose();
          return;
        }
        material.map = newTexture;
        material.needsUpdate = true;
        currentTexture.dispose();
        currentTexture = newTexture;
      } catch {
        /* keep fallback */
      }
    })();

    /* Bronze rim ring — sculptural detail */
    const rimGeom = new THREE.TorusGeometry(1.005, 0.0025, 8, 128);
    const rimMat = new THREE.MeshBasicMaterial({
      color: COLOR_BRONZE,
      transparent: true,
      opacity: 0.25,
    });
    const rimMesh = new THREE.Mesh(rimGeom, rimMat);
    rimMesh.rotation.x = Math.PI / 2;
    group.add(rimMesh);

    /* Resize — keeps the renderer square at 75vmin */
    const onResize = () => {
      const size = computeGlobeSize();
      renderer.setSize(size, size);
      /* aspect stays at 1 — no need to update projection matrix */
    };
    window.addEventListener('resize', onResize);

    /* Debug click handler — logs current rotation when globe is clicked */
    const onClick = () => {
      if (group) {
        console.log(
          'CLICKED - rotation.y:',
          group.rotation.y.toFixed(3),
          'rotation.x:',
          group.rotation.x.toFixed(3)
        );
      }
    };
    container.addEventListener('click', onClick);

    return () => {
      cancelled = true;
      window.removeEventListener('resize', onResize);
      container.removeEventListener('click', onClick);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      geometry.dispose();
      currentTexture.dispose();
      material.dispose();
      rimGeom.dispose();
      rimMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      rendererRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
      globeGroupRef.current = null;
      materialRef.current = null;
    };
  }, []);

  /* Animation loop — runs only when `active` */
  useEffect(() => {
    if (!active) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    const tick = () => {
      const renderer = rendererRef.current;
      const scene = sceneRef.current;
      const camera = cameraRef.current;
      const group = globeGroupRef.current;
      const material = materialRef.current;
      if (!renderer || !scene || !camera || !group) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const p = THREE.MathUtils.clamp(atlasGlobeProgress.value, 0, 1);

      /* Auto-rotation on Y axis — slow drift so user can spot India */
      group.rotation.y += 0.002;

      console.log('globe.rotation.y:', group.rotation.y.toFixed(3));

      /* Camera dolly: 2.5 (Stage 1) → 1.4 (end Stage 2) → 1.15 (start Stage 3) */
      let z = 2.5;
      if (p < 0.25) z = 2.5;
      else if (p < 0.55) z = lerp(2.5, 1.4, (p - 0.25) / 0.3);
      else if (p < 0.7) z = lerp(1.4, 1.15, (p - 0.55) / 0.15);
      else z = 1.15;
      camera.position.z = z;

      /* Material opacity from prop */
      if (material) material.opacity = opacity;

      renderer.render(scene, camera);
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
      }}
    />
  );
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
