# PROJECT_CONTEXT.md

> Single source of truth for project memory, stack, flows, and dependencies.
> Update this file after any major feature, dependency change, or architectural decision.

---

## 1. Project Identity

- **Name:** Ukiyo Interior
- **Type:** Marketing / portfolio site for a Mumbai-based luxury interior design studio
- **Founder:** Pratik Soni
- **Primary goal of the codebase:** Deliver a single long-scroll landing experience + a `/api/contact` lead endpoint, with Phase-2/Phase-3 groundwork already present (quiz logic, per-area dynamic routes planned).
- **Deployment target:** Vercel (inferred from `create-next-app` defaults and `.vercel` gitignore).

---

## 2. Stack

### Runtime
| Layer | Version | Notes |
|---|---|---|
| Next.js | **16.2.6** | App Router only. **Breaking changes vs older Next.** Read `node_modules/next/dist/docs/` before writing code. |
| React | **19.2.4** | Full React 19 — Server Components, `use()`, Actions available. |
| TypeScript | ^5 | `strict: true`, `moduleResolution: "bundler"`, path alias `@/*` → repo root. |
| Node | Whatever Next 16 requires (see `node_modules/next/package.json` `engines`). |

### Styling
- **Tailwind CSS v4** via `@tailwindcss/postcss` (PostCSS plugin, not the classic CLI).
- `app/globals.css` uses the v4 syntax: `@import "tailwindcss";` and `@theme inline { ... }` — no `tailwind.config.js`.
- Design tokens live as CSS custom properties on `:root` (colours, fonts, spacing, z-index, easings, transitions). All component styling must reference these tokens.

### Animation / Interaction
- **GSAP 3.15** with `ScrollTrigger` — registered inside client components (e.g. `LenisProvider.tsx`).
- **Lenis 1.3.23** — smooth scroll, booted once in `LenisProvider` and synced with `ScrollTrigger` via `gsap.ticker`.
- **Framer Motion 12** — available; use for component-level transitions where GSAP timelines are overkill.
- **@studio-freight/lenis 1.0.42** — legacy package still installed; prefer the newer `lenis` package (used in `lib/useLenis.ts`).

### Data / Viz
- **d3 + topojson-client** — drive `AtlasGlobe.tsx` only. Canvas-based D3 orthographic globe (stages 1–2) and an equirectangular SVG projection fitted to the NASA satellite image (stages 4–5). All logic lives inside `AtlasGlobe.tsx`. Do not add a second D3 scene without consolidating this one first.

### Linting
- **ESLint 9** flat config (`eslint.config.mjs`) — pulls from `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript` **subpath exports** (Next 16 style, not the old single-export).

---

## 3. Flows

### 3.1 Request flow (current)
```
Browser → app/layout.tsx (RSC)
  ├── <head>  — preconnects to Unsplash + Google Fonts
  ├── next/font/google → Cormorant_Garamond + DM_Sans (self-hosted, CSS vars)
  └── <body>
       ├── <LoadingScreen />    (client, GSAP intro, exits after ~2.4s)
       ├── <GrainOverlay />     (client, fixed SVG noise)
       ├── <CustomCursor />     (client, bronze cursor, replaces OS cursor)
       ├── <LenisProvider />    (client, boots Lenis + wires gsap.ticker)
       └── <main>{children}</main>
            └── app/page.tsx (RSC) composes section client components
```

### 3.2 Landing page section order (`app/page.tsx`)
`Navigation → Hero → AtlasGlobe → Projects → EmotionalJourney → Process → Services → Materials → Philosophy → Founder → Journal → Contact → Footer`

`AtlasGlobe` is a 600vh pinned section: D3 orthographic globe on canvas (stages 1–2), crossfading into a transformed NASA satellite image layer with a coregistered Maharashtra SVG overlay (stages 3–4), ending in six Mumbai project-location pins (stage 5). All driven by a single GSAP ScrollTrigger.

Every section is a `'use client'` component *except* `Footer` (RSC). Keep that boundary — do not bump sections to the server tree unless you strip their animations.

### 3.3 Contact submission flow
```
Contact section <form>
  → POST /api/contact  (app/api/contact/route.ts — Route Handler)
       ├── validates { name, email } (required)
       ├── logs payload (Phase 1 stub)
       └── returns { success: true } | 400
```
**Phase 2 TODO in that file:** replace `console.log` with Resend / Nodemailer / HubSpot.

### 3.4 Design-match quiz flow (Phase 3 — logic ready, UI not wired)
```
Quiz UI (not yet built)
  → lib/quiz.ts :: scoreQuiz(answers)
       → picks winning DesignProfile
       → returns QuizResult (title, tagline, palette, linked service)
```

---

## 4. Directory Layout

```
app/
  layout.tsx          RSC — fonts, metadata, global chrome
  page.tsx            RSC — composes landing sections
  globals.css         Tailwind v4 import + design tokens
  api/
    contact/route.ts  POST handler (lead capture stub)
components/           Shared UI — client components with GSAP/Lenis
  sections/           One file per landing section
data/                 Static typed content (projects, services, etc.)
lib/                  Pure TS utilities + custom hooks (quiz, useLenis)
public/               SVG assets only (project imagery is remote Unsplash)
.cursor/skills/       Editor skills (not runtime code)
.kiro/                Kiro IDE config
```

**Alias:** `@/*` maps to the repo root. Prefer `@/components/...`, `@/data/...`, `@/lib/...`.

---

## 5. Dependencies (runtime)

| Package | Version | Purpose |
|---|---|---|
| `next` | 16.2.6 | Framework |
| `react`, `react-dom` | 19.2.4 | UI runtime |
| `gsap` | ^3.15.0 | Section animations, ScrollTrigger |
| `lenis` | ^1.3.23 | Smooth scroll (preferred) |
| `@studio-freight/lenis` | ^1.0.42 | Legacy — do not introduce new imports from it |
| `framer-motion` | ^12.38.0 | Component transitions |
| `d3` | latest | AtlasGlobe — orthographic globe canvas, Maharashtra path projection |
| `topojson-client` | latest | AtlasGlobe — decoding world-atlas + india-states topojson |

**Dev:**
`typescript@^5`, `eslint@^9`, `eslint-config-next@16.2.6`, `tailwindcss@^4`, `@tailwindcss/postcss@^4`, `@types/node@^20`, `@types/react@^19`, `@types/react-dom@^19`.

---

## 6. External Services

- **Unsplash CDN** — all project/journal/material imagery. Hostname allowlisted in `next.config.ts` under `images.remotePatterns`.
- **Google Fonts** — delivered via `next/font/google` (self-hosted at build time, not a runtime CDN call).

No database, CMS, auth, or analytics wired yet. When these are added, document the service, env vars, and the module boundary here before writing client code against it.

---

## 7. Environment Variables

None currently required. `.env*` is gitignored.
When `/api/contact` is upgraded to real email/CRM, add:
- `RESEND_API_KEY` (or equivalent)
- `CONTACT_TO_EMAIL`

Document every new var in this file with: purpose, where it's read, and whether it's required at build or runtime.

---

## 8. Commands

```bash
npm run dev      # next dev
npm run build    # next build
npm run start    # next start
npm run lint     # eslint (flat config)
```

No test runner configured yet. Don't add one silently — propose the choice first.

---

## 9. Known Non-Obvious Decisions

1. **Custom cursor replaces the native cursor globally.** `globals.css` sets `cursor: none !important` on every element. Any new interactive element must still work with `CustomCursor`'s hover-state detection (currently driven by generic tag/role selectors — verify when adding new elements).
2. **Lenis is global, not per-section.** Do not instantiate a second Lenis. If a section needs to opt out, use Lenis's `data-lenis-prevent` attribute.
3. **`ScrollTrigger` is plumbed through Lenis' scroll event** in `LenisProvider`. Any GSAP `ScrollTrigger` you add will pick up smooth scroll automatically — don't re-wire it.
4. **Styling uses inline `style={...}` heavily in section components** (tokens referenced via `var(--token)`) rather than Tailwind utilities. This is intentional for design-token precision. Stay consistent with that pattern in existing files; new sections can prefer Tailwind if tokens are exposed via `@theme inline`.
5. **Phase-3 dynamic routes** (`/projects/[area]`) are *planned* per `data/areas.ts` comments but not yet implemented. Do not delete the data.

---

## 10. Next.js 16 Gotchas (do not assume from older versions)

- `params` and `searchParams` in route segments are **async** — `await` them.
- `cookies()`, `headers()`, `draftMode()` are **async**.
- ESLint config must use the `eslint-config-next/*` **subpath exports** (see `eslint.config.mjs`).
- Tailwind config is CSS-first (`@theme inline`), no JS config file.
- Check `node_modules/next/dist/docs/` for the exact guide before introducing a new Next feature.
