# ARCHITECTURE.md

> Layers, services, data flow, and module structure for Ukiyo Interior.
> Update after any change that moves a responsibility between layers.

---

## 1. Layered Model

```
┌──────────────────────────────────────────────────────────────┐
│  Presentation                                                │
│    app/ (route segments)  ·  components/ (UI)                │
│    - Server Components by default                            │
│    - Client Components only where interactivity/DOM needed   │
├──────────────────────────────────────────────────────────────┤
│  Application / Domain Logic                                  │
│    lib/ (pure utils + hooks)                                 │
│    - Framework-agnostic where possible                       │
│    - No DOM, no fetch, no env reads (unless clearly marked)  │
├──────────────────────────────────────────────────────────────┤
│  Data                                                        │
│    data/ (static typed content)                              │
│    - TS modules exporting typed arrays/records               │
│    - Will be replaced by CMS/DB when Phase 2+ lands          │
├──────────────────────────────────────────────────────────────┤
│  API / Services                                              │
│    app/api/*/route.ts  (Route Handlers — Next 16)            │
│    - Owns validation, external I/O, error envelope           │
│    - Never imported by client bundles directly               │
└──────────────────────────────────────────────────────────────┘
```

**Strict rules:**
- **UI never talks to external services directly.** Always go through `/app/api/*` or a `lib/` service module.
- **Business logic never lives inside a component.** Extract to `lib/`. The existing `lib/quiz.ts` is the canonical example.
- **No cross-layer skips.** `components/` may import from `lib/` and `data/`. `lib/` may import from `data/`. `data/` imports from nothing except types.

---

## 2. Module Map

### 2.1 `app/` — routes

| Path | Kind | Purpose |
|---|---|---|
| `app/layout.tsx` | RSC | Fonts, metadata, viewport, mounts global chrome + Lenis |
| `app/page.tsx` | RSC | Composes the landing section stack |
| `app/globals.css` | CSS | Tailwind v4 import + design tokens |
| `app/api/contact/route.ts` | Route Handler | `POST` — lead capture (stub) |

### 2.2 `components/` — presentation

| File | `'use client'` | Role |
|---|---|---|
| `Navigation.tsx` | ✓ | Fixed nav + mobile overlay (GSAP clip-path) |
| `Footer.tsx` | ✗ | Static RSC footer |
| `LoadingScreen.tsx` | ✓ | Intro panel, exits via GSAP |
| `GrainOverlay.tsx` | ✓ | SVG noise layer |
| `CustomCursor.tsx` | ✓ | Bronze cursor following pointer |
| `LenisProvider.tsx` | ✓ | Boots Lenis + bridges to GSAP ScrollTrigger |
| `Globe.tsx` / `IndiaMap.tsx` | *(removed)* | Deleted with Atlas section on 2026-05-12 |
| `ProjectModal.tsx` | ✓ | Project detail overlay |
| `sections/*.tsx` | ✓ (all) | One file per landing section. Current: `Hero`, `AtlasGlobe`, `Projects`, `EmotionalJourney`, `Process`, `Services`, `Materials`, `Philosophy`, `Founder`, `Journal`, `Contact`. |

### 2.3 `lib/` — logic

| File | Purpose | Client-safe? |
|---|---|---|
| `lib/quiz.ts` | Design-match quiz types + scoring | Yes (pure) |
| `lib/useLenis.ts` | React hook that initialises + disposes Lenis | Client-only (`'use client'`) |

### 2.4 `data/` — typed content

| File | Exports | Consumed by |
|---|---|---|
| `data/projects.ts` | `projects`, `FILTER_LABELS`, `Project`, `ProjectCategory` | `sections/Projects.tsx`, `ProjectModal` |
| `data/services.ts` | `services`, `Service` | `sections/Services.tsx`, quiz results |
| `data/materials.ts` | `MATERIALS` | `sections/Materials.tsx` |
| `data/process.ts` | `PROCESS_STEPS` | `sections/Process.tsx` |
| `data/journal.ts` | `journal`, `JournalEntry` | `sections/Journal.tsx` |
| `data/areas.ts` | `areas`, `Area` | `sections/Atlas.tsx` (+ Phase 3 `/projects/[area]`) |

---

## 3. Server / Client Boundary

Default: **Server Component.** Opt in to client only when the file needs:
- DOM refs, `useEffect`, `useState`, `useRef`
- Event handlers on interactive elements
- Browser-only libraries (GSAP, Lenis, MapLibre, Framer Motion runtime)

Today, every file under `components/sections/` and every animated chrome component is a client component. `app/layout.tsx`, `app/page.tsx`, and `components/Footer.tsx` are RSCs.

**Do not add `'use client'` to a file that doesn't need it.** It pushes the whole subtree into the client bundle.

---

## 4. Data Flow

### 4.1 Read path (landing page)
```
data/*.ts  ──import──▶  components/sections/*.tsx  ──render──▶  HTML
                                    │
                                    └── runtime: GSAP ScrollTrigger animates on scroll
                                                 Lenis drives scroll position
```

### 4.2 Write path (contact)
```
<form onSubmit>  ──fetch──▶  POST /api/contact
                                      │
                                      ├── validate → 400 on missing fields
                                      └── side-effect (currently console.log)
                                                     → will be Resend/CRM
                                      ▼
                                  { success: true }
```

### 4.3 Quiz path (planned UI)
```
Quiz component state: Record<questionId, optionValue>
  → scoreQuiz(answers)                   (lib/quiz.ts — pure)
  → QuizResult (profile, palette, service)
  → Render result card, CTA linking to relevant service
```

---

## 5. Styling Architecture

```
app/globals.css
├── @import "tailwindcss";          Tailwind v4 runtime
├── :root { --token: … }            Design tokens (colors, type, spacing, z, ease)
├── @theme inline { … }             Surface tokens to Tailwind utilities
├── Resets + base                   Box-sizing, body, focus, selection
├── Typography utilities            .text-hero, .text-label, …
├── Layout utilities                .container, .section, .hairline
├── Component tokens                .card-base, .btn, .pill, .input-base
└── Motion + a11y helpers           .reveal-up, prefers-reduced-motion, .sr-only
```

**Rules:**
- Never hard-code hex colours, font stacks, or spacing pixels in TSX — use `var(--token)`.
- If a token doesn't exist, add it to `globals.css` first, then consume it.
- New utility classes belong in `globals.css`, not inline-scoped `<style>` blocks — except for component-scoped responsive rules (see `Navigation.tsx` as the accepted pattern).

---

## 6. Animation Architecture

- **One global Lenis instance.** Do not instantiate another.
- **GSAP `ScrollTrigger` is globally registered** in `LenisProvider.tsx` and ticks through `gsap.ticker` (Lenis-synced). New ScrollTriggers in section components will work without extra wiring.
- **Cleanup is mandatory.** Every `useEffect` that creates timelines, triggers, or listeners must return a cleanup that kills them — otherwise `StrictMode` double-mount and route transitions leak memory.
- **Respect `prefers-reduced-motion`.** `globals.css` already neutralises `.reveal-up` / `.reveal-fade`; new motion must either reuse these classes or add equivalent guards.

---

## 7. API / Route Handler Conventions (Next 16)

- Location: `app/api/<resource>/route.ts`.
- Export `async function POST`, `GET`, etc. — standard Web `Request`/`Response`.
- Parse JSON with `await req.json()` inside `try/catch`.
- Return `NextResponse.json(payload, { status })` — consistent envelope:
  - Success: `{ success: true, data?: ... }`
  - Error: `{ success: false, error: string }`
- `params` / `searchParams` / `cookies()` / `headers()` are **async** in Next 16 — `await` them.

Existing reference implementation: `app/api/contact/route.ts`.

---

## 8. Extension Points (what to add vs what to touch)

| Adding this… | …goes here | Don't touch |
|---|---|---|
| A new landing section | `components/sections/Foo.tsx` (client) + mount in `app/page.tsx` | Global chrome in `layout.tsx` |
| A new data set | `data/foo.ts` with exported types | Existing data files' shapes |
| A new API resource | `app/api/foo/route.ts` | `app/api/contact/route.ts` |
| A pure utility / hook | `lib/foo.ts` | UI files (extract logic out) |
| A new design token | `:root` in `globals.css`, then `@theme inline` if Tailwind-facing | Hard-coded values in TSX |
| A dynamic route (Phase 3) | `app/projects/[area]/page.tsx`, read `data/areas.ts` | `app/page.tsx` composition |

---

## 9. Non-Goals (currently)

- No state management library. React state + props + data modules are enough.
- No auth, no DB, no CMS. Don't scaffold them speculatively.
- No test framework. Don't add one without agreeing on the choice first.
- No i18n. Content is English, single locale (`en_IN`).
