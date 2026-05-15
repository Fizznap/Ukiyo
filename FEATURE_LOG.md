# FEATURE_LOG.md

> Append-only log of every feature, change, fix, and architectural decision.
> Newest entry on top. One entry per logical change (not per commit).

---

## 2026-05-12 — AtlasGlobe: rotating globe → satellite arrival (India · Maharashtra · Mumbai)
**Type:** change
**Area:** components, infra
**Files:** components/sections/AtlasGlobe.tsx, next.config.ts

### What
Sequenced the journey so the globe does its zoom into India *first*, and only then crossfades to the satellite medium for the Maharashtra and Mumbai arrivals.

- Stages 1–2 (progress 0 → 0.48): warm D3 orthographic globe. Scale 240 → 900 → 1800. **Continuously rotating** via rAF at 0.1°/frame, drift dampens to ~5% by the time India fills the frame so the target stays framed.
- Crossfade (0.48 → 0.55): globe opacity 1 → 0, satellite opacity 0 → 1. Both are *already framed on India* at this moment, so the handoff reads as "same place, different medium."
- Stage 3 (0.55 → 0.65): satellite holds on India; subtle zoom 5.0 → 5.75.
- Stage 4 (0.65 → 0.82): satellite pans to Maharashtra focal (76, 19), scale 5.75 → 9.0. Bronze Maharashtra SVG path overlays, coregistered via equirectangular projection on 2048×1024 image coords. Mumbai pulse dot appears inside the SVG.
- Stage 5 (0.82 → 1.0): satellite pans to Mumbai focal, scale 9.0 → 18.0. Maharashtra overlay fades out. Six cluster pins (Malad, Bandra, Powai, Malabar Hill, Worli, Juhu) appear as DOM nodes positioned every frame in viewport coords — constant 8px size regardless of layer scale.
- Warm beige radial vignette rises through stage 5.
- Added `eoimages.gsfc.nasa.gov` back to `next.config.ts` `images.remotePatterns`, but the satellite img is rendered via plain `<img>` (not `next/image`) to avoid optimizer quirks with NASA's CDN headers.

### Why
- User: "after zooming into india it will show proper india map then we zoom into the maharashtra after it will zoom into mumbai the location must be displayed like satelite view after succesfully zooming into india from globe."
- Earlier single-globe version couldn't deliver satellite-style Maharashtra and Mumbai views — zoom just enlarged the stylised D3 land polygons. Bringing the satellite back gives real geography at city scale.
- Earlier "no other globe" feedback was because the previous crossfade happened too early and looked like two disconnected objects. This version holds both on India at the moment of transition.

### How — details worth knowing
- **Globe drift dampens toward India.** `dampen = lerp(1.0, 0.05, smoothstep(0.1, 0.4, progress))`. Fully-rotating in stage 1, near-stationary by the India zoom, so the crossfade target is stable.
- **Satellite focal → center math.** Layer is 200vh × 100vh (2:1 matching equirect). Focal (lon, lat) → image percent → offset from layer centre → negative-scaled translate keeps focal locked to viewport centre at any scale.
- **Maharashtra + Mumbai dots share the satellite projection.** Equirectangular projection fitted to 2048×1024 for the SVG path; same math (focal-percent → layer-local coord → transformed viewport coord) for DOM pins. Stay coregistered through the whole pan/zoom.
- **Satellite image is plain `<img>`** with `fetchPriority="high"` + `decoding="async"`. `next/image` was mis-optimising this specific CDN.
- **Color treatment** on the satellite: warm `rgba(184,134,11,0.18)` multiply + `rgba(245,240,232,0.12)` overlay + `saturate(0.85) contrast(0.95)` filter → stays inside the warm-beige page palette, no "sci-fi Google Earth" look.

### Verification
- `npm run build` — clean. TypeScript + prerender both pass.
- No diagnostics.
- Satellite hostname allowlisted for `next/image` even though we're using plain `<img>` — keeps the optimiser happy if we switch later.

### Follow-ups
- [ ] Mirror satellite to `public/geo/earth.jpg` so the section doesn't depend on an external CDN at runtime.
- [ ] Pin local copies of world-atlas and india-states topojson under `public/geo/` for production reliability.
- [ ] If drift at stage 1 feels too visible, drop the 0.1°/frame to 0.06°/frame.

---

## 2026-05-12 — AtlasGlobe: single-globe rewrite, continuous rotation, no satellite
**Type:** change
**Area:** components, infra
**Files:** components/sections/AtlasGlobe.tsx, next.config.ts

### What
- Collapsed the two-globe architecture (D3 orthographic → NASA satellite crossfade) into a **single D3 orthographic globe** that carries all five stages.
- Globe now **rotates continuously** via `requestAnimationFrame` at 0.1 deg/frame (spec's original rate). Drift rotation is *additive* to the scroll-driven target rotation and **dampens smoothly as zoom increases** (1.0 → 0.03 across progress 0.1 → 0.55) so the target focal stays framed but the globe never looks frozen.
- Camera/target rotation now tracks focal smoothly: India (stages 1-2) → Maharashtra (stage 4) → Mumbai (stage 5). D3 `rotate` uses `[-targetLon + driftAngle * dampen, -targetLat]`.
- Zoom range expanded to cover the full journey on one globe: scale 240 → 900 → 1800 → 3200 → 5200 across the five stages.
- Maharashtra topojson is now drawn **directly on the canvas** as a bronze path after India renders, with a fade-in/fade-out opacity envelope through stages 4-5.
- The Mumbai pulse dot during stage 4 is drawn on the canvas as well (at the Mumbai `projection([lon, lat])` coords), so it lives on the globe surface.
- Stage 5 Mumbai cluster still uses DOM dots for sharp labels + stable 8px size, positioned each frame via the same `projection()` so the six pins sit accurately over Bandra/Worli/etc. as the globe keeps drifting.
- Dropped the NASA satellite entirely. Removed `eoimages.gsfc.nasa.gov` from `next.config.ts` `remotePatterns`.
- rAF pauses when the section is offscreen (`IntersectionObserver`-equivalent via ScrollTrigger) — zero idle cost.

### Why
- User feedback: "make globe rotating and also during zoom dont open other globe i want the same warm globe."
- The satellite crossfade was the architectural reason the rotation stopped and a "second globe" appeared. Removing the crossfade lets us keep the warm land/ocean palette through the whole journey and keep the sphere spinning.

### How — details worth knowing
- **Continuous rotation that still zooms correctly.** The trick is two-part: (a) `driftAngle` accumulates in the rAF loop, (b) it's multiplied by a `dampen` factor that drops to ~3% by the time India fills most of the viewport. Users still see motion at the close-up, just very slow, so the globe feels alive without drifting out of frame.
- **Single projection everywhere.** Both canvas geometry and DOM Mumbai pin positions come from the same `d3.geoOrthographic()` instance with identical scale/rotation/translate. Pins stay locked to their geographic coords through rotation, zoom, and scale changes.
- **Maharashtra lives on the globe, not a second layer.** Drawn right after India in the canvas render, under the outer globe rim. Scale of the path is automatic (it's a GeoJSON feature projected by the same d3 path generator).
- **Performance.** India `shadowBlur` shrinks with zoom (`* (1 - zoom * 0.7)`) so the expensive canvas shadow pass doesn't run large at scale=5200. DPR capped at 1.75.

### Verification
- `npm run build` — clean. TypeScript + static prerender both pass.
- No diagnostics.
- Single-pass render, single canvas, single projection source of truth.

### Follow-ups
- [ ] If the drift is too visible at close-up (stage 4/5), bump the dampen floor from 0.03 → 0.015.
- [ ] If the Maharashtra overlay feels abrupt at the rotation transition, widen its rise window (0.55 → 0.72 instead of 0.55 → 0.7).
- [ ] Consider caching the projection between renderGlobe / renderDOM in the same frame — currently built twice.

---

## 2026-05-12 — AtlasGlobe: D3 orthographic → NASA satellite → Mumbai pins (600vh pinned)
**Type:** change
**Area:** components, infra
**Files:** components/sections/AtlasGlobe.tsx (new), components/sections/HeroGlobe.tsx (deleted), components/three/HeroGlobeCanvas.tsx (deleted), app/page.tsx, next.config.ts, package.json

### What
- Replaced the Three.js/R3F HeroGlobe stack with a single self-contained `AtlasGlobe.tsx` component matching the explicit 5-stage spec.
- Dep swap: uninstalled `three`, `@react-three/fiber`, `@react-three/drei`, `@types/three`. Installed `d3`, `topojson-client`, `@types/d3`, `@types/topojson-client`. GSAP stays.
- Section is 600vh pinned (sticky) with `scrub: 1.5`. A single ScrollTrigger drives all five stages from progress.
- Stage 1 (0–0.2): D3 orthographic globe on canvas. Scale 240, rotation `[-78,-22]`, India pre-highlighted bronze. Auto-rotates on Y at 0.1 deg/frame via rAF, stops the moment scroll begins. Ocean `#C4B49A`, land `#D4C4A8`, borders `rgba(44,24,16,0.2)`.
- Stage 2 (0.2–0.45): scale interpolates 240 → 900, rotation stays. India glow intensifies via canvas `shadowColor: '#B8860B'` + `shadowBlur` ramp. Other countries fade to 0.6 opacity.
- Crossfade (0.45–0.5): canvas opacity 1 → 0, satellite layer 0 → 1.
- Stage 3 (0.45–0.65): NASA `land_shallow_topo_2048.jpg` via `next/image` inside a transformed layer. Layer is 200vh × 100vh (2:1 match for the equirectangular image) with `clipPath: circle(45vmin at 50% 50%)` and an 80px beige box-shadow for the "atlas lens" feel. Warm bronze tint at 0.15 multiply. Scale 1.0 → 1.8, focal held on India.
- Stage 4 (0.65–0.82): scale 1.8 → 2.8, focal shifts India → Maharashtra (`[76, 19]`). Maharashtra SVG path overlays the satellite using `d3.geoEquirectangular()` fitted to the image's 2048×1024 native coords — so the path registers *exactly* as you zoom. Fill `rgba(184,134,11,0.25)`, stroke `#B8860B` 2px `vectorEffect="non-scaling-stroke"`. A pulsing bronze dot sits at Mumbai coords inside the SVG (fades with Maharashtra overlay).
- Stage 5 (0.82–1.0): scale 2.8 → 5.0, focal shifts to Mumbai (`[72.87, 19.07]`). Maharashtra overlay fades out. Six DOM cluster dots (Malad, Bandra, Powai, Malabar Hill, Worli, Juhu) positioned every frame in absolute viewport coords — so the dots stay 8px regardless of the underlying layer scale. Warm beige radial vignette appears. Final label is Cormorant Garamond 48px deep brown.
- Labels all positioned `top: 80px; left: 50%`, soft envelope crossfades with 0.05-progress overlap, DM Sans 11px bronze uppercase tracking 0.34em for the first four; Cormorant display for the last.
- `next.config.ts`: added `eoimages.gsfc.nasa.gov` to `images.remotePatterns`.
- Cleaned up now-empty `components/three/` directory.

### Why
- Direct request spec'd the D3-orthographic-to-satellite architecture after the Three.js sculptural approach wasn't landing emotionally. Explicit, complete spec with exact stage boundaries, colours, image URL, focal coords, and scroll mechanics.
- The prior decisions to *remove* the D3/MapLibre atlas and *not reintroduce heavy geo* have been consciously reversed in this conversation. This is the third atlas architecture; the spec is explicit, so executed without negotiation.

### Implementation decisions worth noting
- **Single geo-layer coordinate system.** The satellite image and Maharashtra SVG share the 2048×1024 equirectangular coordinate space. Scale + translate apply to both together, so the Maharashtra path stays perfectly registered on the satellite image through every zoom state. No drift.
- **Mumbai dots stay 8px at any layer scale.** Positioned every frame in viewport coords by math'ing the layer transform (focal offset + scale) rather than living inside the scaled layer.
- **Auto-rotate pauses the instant scroll moves.** `autoRotate` flips to `false` on the first `onUpdate` tick, and `baseRotationY` snaps back to `-78` so stage 2 starts from the spec'd rotation. This honours the "stops when scroll begins" rule without a visible jump.
- **Device pixel ratio capped at 2** for the canvas.
- **Graceful degradation.** Both topojson fetches have try/catch + console.warn. If the world file fails, the canvas still renders the sphere + ocean. If Maharashtra fails, the stage-4 overlay simply doesn't appear. No runtime crash.

### Verification
- `npm run build` — clean. TypeScript + static prerender both pass.
- No diagnostics on `AtlasGlobe.tsx`.
- Removed empty `components/three/` directory.

### Follow-ups
- [ ] The NASA satellite image is ~1.3MB and loaded via `next/image` with `unoptimized` (domain has stale headers that sometimes confuse Next's loader). Consider mirroring to the same origin for reliability.
- [ ] If the Maharashtra topojson URL ever goes stale, swap to a pinned local copy under `public/geo/india-states.json`.
- [ ] The ScrollTrigger rebuilds when `maharashtraPath` resolves (network-bound). If that feels janky on slow connections, preload or gate the scroll start on `maharashtraPath` state.

---

## 2026-05-12 — HeroGlobe refinement pass: silhouette, haze, Maharashtra beat
**Type:** change
**Area:** components
**Files:** components/three/HeroGlobeCanvas.tsx, components/sections/HeroGlobe.tsx

### What
Second refinement of the cinematic globe after reviewer feedback ("closer to the direction, still too digital / empty / abrupt"). Ten targeted moves:

1. **India is now an actual silhouette.** Replaced the bronze disc with a filled fan-triangulated `BufferGeometry` built from a ~45-point lat/lon boundary, plus a deeper-bronze `LineSegments` outline slightly offset outward. Reads as "India" within a beat, no labels required.
2. **Heavier camera.** Scrub ramped from `1.2` → `1.6`. Tiny lateral orbital drift `sin/cos(t * 0.11–0.14)` adds floating-mass inertia. Drift scale damps to ~0 by stage 4 so Mumbai arrival is intimate.
3. **Softer ease into Maharashtra.** Stage 3 (0.5→0.82) uses a hand-rolled `t² (3−2t)` smoothstep on the camera for a visible pause, and a `stage3Peak` window (0.55→0.68, decay 0.76→0.85) drives a Maharashtra-only regional glow with an inner warm patch under the surface.
4. **Atmospheric layers.**
   - Inside the Canvas: a backside "atmosphere" sphere at 1.18× radius with warm-haze colour at ~0.07–0.11 opacity.
   - Outside the Canvas: three DOM layers — a radial warm haze (peaks at Maharashtra, multiply blend), a bronze focal glow (screen blend, triangular peak), and an edge vignette.
5. **Mumbai linework redesigned.** Replaced the symmetric star+grid with 15 asymmetric drafting strokes: offset axes, displaced inner square, distant solitary ticks, and a small L-corner. Coordinates shrunk to ±0.025 so they fit the stage-4 close-up frame. Opacity has a rise/linger/decay curve instead of a straight ramp — feels like drafting unfolding, not a HUD appearing.
6. **Surface material.** Sphere upgraded to `80×56` segments; `MeshStandardMaterial` now carries a procedurally-generated paper-noise `CanvasTexture` as a `bumpMap` at `bumpScale: 0.012`. Roughness raised to `0.96`. Subtle, paper-like, warm — not synthetic.
7. **Handoff to Projects.** The single edge vignette became a three-stage dissolve:
   - Edge fade (stage 3+)
   - Bronze residual glow (triangular peak through journey)
   - Full beige takeover (only rises in the final 12%)
   Plus an italic "Welcome to Ukiyo." caption that emerges through the haze in the last 8%. Nothing is a hard cut.
8. **Motion discipline.** Idle rotation reduced to `delta * 0.045`. Label windows extended (ease-in quad, pow-1.6 ease-out). Stage 4 rise/linger/decay on linework. Removed any straight-line ramps.
9. **Mobile.** Unchanged from prior pass — static SVG fallback (now with an India-shaped path instead of a bronze disc, matching the desktop silhouette intent).
10. **Performance.** Single added texture is 512² generated once client-side; cleaned up on unmount alongside the three line/surface geometries. Sphere poly count is ~9K triangles (still within budget). No postprocessing, no particles, no shaders.

### Why
- Previous pass: India read as a hovering coin, not a landmass. Fixed by using real boundary geometry.
- Previous camera felt "digital" because transitions were smoothstep ramps with no inertia. Added lateral drift + heavier scrub.
- Maharashtra had no dedicated moment. Now it has its own glow peak, surface warm patch, and a deliberate cinematic pause in the camera curve.
- Mumbai linework read as UI. Redesigned as drafting — asymmetric, rise/linger/decay, correct physical scale for the final camera distance.
- Handoff was a single vignette. Now it's three DOM layers stacking in sequence plus an emerging caption — atmosphere, not a cut.

### Verification
- `npm run build` — clean. Types pass.
- No diagnostics on either file.
- R3F scene still under ~10K triangles. No shader work, one generated 512² texture. frameloop still pauses offscreen.

### Follow-ups
- [ ] Eyeball the Maharashtra pause duration. If it reads too long, shorten the `stage3Peak` window (tighten the 0.55→0.68 / 0.76→0.85 gates).
- [ ] Bronze focal glow peak multiplier is at 0.38 — can drop to 0.28 if it registers as a hotspot.
- [ ] If the India outline feels over-drawn at stage 1, drop `opacity` floor from 0.35 → 0.22.
- [ ] Consider a matching reveal for `Projects` section's first label to complete the "emerging through haze" handoff.

---

## 2026-05-12 — HeroGlobe rewrite: globe becomes the storytelling motion
**Type:** fix
**Area:** components
**Files:** components/three/HeroGlobeCanvas.tsx, components/sections/HeroGlobe.tsx

### What
Rewrote both files. The previous pass animated stage copy four times while the globe barely moved — user correctly flagged it as "static wireframe + scrolling text replacement." This pass puts camera + globe motion in the driver's seat.

### Why
- Rotation math was wrong: `rotY` used `-lonRad - π/2` with the default Euler order `XYZ`. India ended up off-camera, so the "face India" target was a no-op — globe only showed its idle drift.
- Per-frame camera lerp (`* min(1, delta * 6)`) was stacking smoothing on top of GSAP's `scrub: 1.2`. Result: camera trailed scroll so softly it read as stuck.
- Camera dolly range (4.5 → 1.6) was too conservative for a "zoom into the world" brief.
- Stage copy was four full headlines — typography competed with the globe for attention instead of supporting it.

### How
1. **Fixed facing rotation:** `facingRotation(lat, lon) = { x: latRad, y: lonRad - π/2 }` combined with `group.rotation.order = 'YXZ'`. India and Mumbai now actually face the camera when targeted.
2. **Killed the camera micro-lerp:** `camera.position.z = z` directly. GSAP's `scrub: 1.2` provides the damping; stacking another one was the "laggy" feel.
3. **Real cinematic dolly range:** 5.0 → 3.2 → 2.0 → 1.3 → 1.08. Globe fills the viewport in stage 3; camera sits just above the surface at p=1.
4. **Blended rotation correctly:** idle rotation runs always; target (India, lerped toward Mumbai in stage 4) blends in via `stage2Progress`. No more "snap to target" artefacts.
5. **Added bronze architectural linework** — a `LineSegments` cross-and-grid pattern anchored tangent to the sphere at Mumbai. Geometry built once, fades in only in stage 4 as the camera arrives. This is the "abstract spatial linework" the brief asked for.
6. **Armillary rings fade out** as camera closes in — they're a far-view element.
7. **Typography reduced to three restrained floating labels:** `INDIA`, `MAHARASHTRA`, `MUMBAI · EST. 2014`. Triangular-window opacity so each appears only at its stage. Bronze, DM Sans, 0.32em tracking. Sits 32vh above centre so it never sits on top of the focal point.
8. **Cinematic dissolve into Projects:** edge vignette rises to full beige by p=1, so the Projects section emerges from the zoom.
9. **Surface dials down in stage 4** (land opacity 1.0→0.75, ocean 1.0→0.85, wireframe 0.09→0.027) so the bronze linework reads clearly.

### Verification
- `npm run build` — clean. TypeScript + static prerender both pass.
- No diagnostics on either touched file.

### Follow-ups
- [ ] Eyeball on a real laptop. If stage 4 feels abrupt, stretch the vignette ramp earlier (start at p=0.75 instead of 0.85) and lengthen the linework fade window.
- [ ] If the handoff to Projects feels "hard cut," add a matching fade-up on Projects' opening label using the existing `.reveal-up` utility.
- [ ] If `@react-three/drei` remains unused elsewhere, drop the dep to shed a few KB.

---

## 2026-05-12 — Cinematic HeroGlobe (Three.js + R3F) — replaces SpatialPhilosophy
**Type:** feature
**Area:** components, infra
**Files:** components/sections/HeroGlobe.tsx (new), components/three/HeroGlobeCanvas.tsx (new), components/sections/SpatialPhilosophy.tsx (deleted), app/page.tsx, package.json

### What
- Installed `three`, `@react-three/fiber`, `@react-three/drei`, `@types/three`.
- Deleted `components/sections/SpatialPhilosophy.tsx`; its role is replaced by the cinematic globe.
- Added `components/three/HeroGlobeCanvas.tsx` — a sculptural low-poly R3F scene (warm sphere, sub-surface ocean, meridian wireframe, three armillary torus rings, India bronze disc + halo, Mumbai pinpoint + halo). Scene animates only rotation, camera z, scale, and material opacity. Imperative scroll progress is piped via an exported `heroGlobeProgress` ref so re-renders never trigger.
- Added `components/sections/HeroGlobe.tsx` — 300vh pinned section with four crossfading stage copy blocks (World → India → Maharashtra → Mumbai), a bronze grid overlay (stage 3+), and an edge vignette (stage 4). Dynamic-imports the canvas with `ssr: false`.
- Mobile / coarse-pointer / reduced-motion / no-WebGL users get a lightweight inline SVG editorial fallback instead of Canvas.
- Master ScrollTrigger uses `scrub: 1.2` for luxury damping. A second trigger toggles R3F's `frameloop` between `'always'` and `'never'` based on viewport intersection — zero GPU cost when offscreen.
- Wired in `app/page.tsx` between Hero and Projects.

### Why
- Explicit reversal of the prior "no globe" decision, confirmed in chat. The previous D3 + MapLibre architecture was the performance problem — this implementation is controlled: no GIS, no map tiles, no topojson, no postprocessing, no particles, no shader work. Target is sculptural architectural object in space, not Earth simulation.
- Hero stays calm and typography-led at 100vh; the globe becomes the cinematic arrival beat into Projects.

### How — restraint decisions worth noting
- Geometry budget: one 64×48 sphere + one 32×24 ocean undercoat + one 20×14 wireframe + five small marker meshes + three tiny torus rings. Roughly 10K tris total.
- Lighting is exactly three sources (warm ambient + warm key + bronze rim). No shadows, no environment maps, no HDRI.
- `dpr={[1, 1.5]}` caps pixel density on Retina to keep fill-rate honest.
- `powerPreference: 'high-performance'`, `stencil: false` — smaller framebuffer, high-perf GPU selection.
- No `OrbitControls`, no drei Effects pipeline. Drei is installed but reserved; feel free to drop if nothing else adopts it.
- Canvas mounts behind the DOM (`z-index: 0`) with typography and fallback vignette in front (`z-index: 3`). Typography always stays the hero.
- Fallback SVG is ~40 lines of inline markup — no network cost, renders instantly.

### Verification
- `npm run build` — clean. TypeScript and static prerender both pass on Next 16.2.6 / Turbopack.
- Scene pauses (`frameloop: 'never'`) when section is offscreen, verified by toggling via scroll trigger callbacks.
- No diagnostics on any of the three touched TS files.

### Follow-ups
- [ ] Eyeball on a real laptop — if motion reads "tech-demo" in any stage, reduce the armillary ring count or opacity further and lower idle rotation speed.
- [ ] Consider adding a very faint CSS grain layer inside HeroGlobe's pin container (`GrainOverlay` is global but may need local reinforcement at the globe stage).
- [ ] Remove `@react-three/drei` if no further component adopts it.

---

## 2026-05-12 — Remove Atlas globe/map system; add SpatialPhilosophy pacer
**Type:** change
**Area:** components, data, infra
**Files:** app/page.tsx, components/sections/SpatialPhilosophy.tsx (new), components/sections/Atlas.tsx (deleted), components/Globe.tsx (deleted), components/IndiaMap.tsx (deleted), components/sections/Hero.tsx, components/sections/Materials.tsx, data/materials.ts, package.json

### What
- Deleted the entire Atlas globe/map experience: `components/sections/Atlas.tsx`, `components/Globe.tsx`, `components/IndiaMap.tsx` (600vh pinned section, D3 orthographic globe, MapLibre Maharashtra/Mumbai zoom, GeoJSON fetches, markers, pulses).
- Uninstalled dependencies: `d3`, `@types/d3`, `maplibre-gl` (95 transitive packages removed).
- Added `components/sections/SpatialPhilosophy.tsx` (client) — editorial pacer between Hero and Projects. Oversized Cormorant headline with bronze italic emphasis, bronze hairline, subtext, and four floating Unsplash images drifting via subtle scroll parallax (transform/opacity only, ≤ 80px drift, matchMedia-gated, reduced-motion safe).
- Updated `app/page.tsx` section list — swapped `<Atlas />` for `<SpatialPhilosophy />`.
- Fixed three dead Unsplash URLs in `data/materials.ts` and typed the export as `Material[]`.
- Added missing `sizes` prop on every `<Image fill>` in `Hero.tsx` and `Materials.tsx` to silence Next's image performance warnings.

### Why
- Brief: globe/map caused major performance/rendering issues; remove completely, do not replace with another heavy interactive system. Prioritise smooth scroll, cinematic motion, editorial layout.
- Keeps the section rhythm between Hero and Projects intact with a calm editorial beat instead of a visual spectacle.
- Matches brand rules: Cormorant Garamond oversized display, bronze-only accent, Japanese-minimal + modern-luxury tone.

### How
- Motion discipline: only `transform` and `opacity`. Parallax is a single `ScrollTrigger` per image with `scrub: 1`, gated via `gsap.matchMedia()` on `(min-width: 768px) and (prefers-reduced-motion: no-preference)`.
- Reveal timeline uses `expo.out` + 0.12s stagger per the luxury motion spec.
- Image overlay uses a warm-beige tint at 28% multiply to bind imagery to the `#F5F0E8` ground.
- Cleanup: every ScrollTrigger is tracked in a `triggers[]` array and `.kill()`'d in the effect cleanup; `gsap.matchMedia` reverted.
- `next/font/google` + tokens consumed via `var(--*)` — no hard-coded colours or fonts.
- Typed floating images as `FloatingImage[]` (not `as const`) so `left`/`right` can be optional per item — this resolved the TS 2339 build error on `img.right`.

### Deviation flagged
- The brief says "Next.js 14," but `package.json` locks Next **16.2.6** and `AGENTS.md` warns the codebase is newer than typical training data. Downgrading would ripple through the flat ESLint config (subpath exports), async `params`/`cookies`/`headers`, Turbopack build, and Tailwind v4 CSS-first config. Kept Next 16.2.6 to avoid a destructive, unrequested rewrite. Raise if a downgrade is actually desired.

### Verification
- `npm run build` — clean compile and TypeScript pass on Next 16.2.6 / Turbopack.
- `npm uninstall d3 @types/d3 maplibre-gl` removed 95 packages total.
- No runtime consumers of the deleted files exist (`grep` on `@/components/Globe` and `@/components/IndiaMap` returned 0 matches).

### Follow-ups
- [ ] Replace `console.log` in `/api/contact` with Resend / CRM integration.
- [ ] Wire Phase-3 dynamic route `app/projects/[area]/page.tsx` using `data/areas.ts`.
- [ ] Build Design Match quiz UI consuming `lib/quiz.ts`.
- [ ] Audit other sections for missing `sizes` on `<Image fill>` if new images are added.
- [ ] `@studio-freight/lenis@^1.0.42` still declared but unused (only `lenis@^1.3.23` is imported) — safe to uninstall later.

---

## 2026-05-12 — Bootstrap engineering docs
**Type:** docs
**Area:** docs
**Files:** PROJECT_CONTEXT.md, ARCHITECTURE.md, CODING_RULES.md, FEATURE_LOG.md

### What
Created the four core engineering documents at the repo root: project context, architecture, coding rules, and this feature log.

### Why
Establish a single source of truth for stack, layers, and conventions so future changes stay consistent and AI-assisted edits follow the existing architecture instead of drifting.

### How
- Grounded every statement in actual repo contents (read `package.json`, `app/`, `components/`, `lib/`, `data/`, configs) rather than assumed defaults.
- Called out Next.js 16 + React 19 + Tailwind v4 specifics so older patterns aren't reintroduced.
- Documented the current Server/Client boundary, the global Lenis + GSAP ScrollTrigger wiring, and the `/api/contact` stub.

### Follow-ups
- [ ] Backfill log entries for prior features (Hero, Atlas, Projects, Quiz logic, Contact stub) when history is reviewed.
- [ ] Replace `/api/contact` console.log with real email/CRM integration (add `RESEND_API_KEY` env var and document here).
- [ ] Wire Phase-3 dynamic route `app/projects/[area]/page.tsx` using `data/areas.ts`.
- [ ] Build quiz UI consuming `lib/quiz.ts`.

---

<!-- New entries go ABOVE this line, newest first. -->
