# CODING_RULES.md

> Naming conventions, patterns, and formatting rules for Ukiyo Interior.
> Match the existing codebase. When in doubt, grep for a similar file and mirror it.

---

## 1. Language & Formatting

- **TypeScript strict mode** — no implicit `any`, no untyped exports. Target ES2017, `moduleResolution: "bundler"`.
- **Single quotes** for strings in TS/TSX. Double quotes only inside JSX attributes where the existing code does (mixed is tolerated — match the file you're editing).
- **Semicolons:** always.
- **Trailing commas:** in multi-line arrays/objects/params.
- **Indent:** 2 spaces. No tabs.
- **Line length:** soft wrap ~100 columns. Break long JSX props onto new lines.
- **Imports:** group as `external → @/alias → relative`, blank line between groups (matches current files like `app/layout.tsx`).
- Use the `@/*` alias for any cross-directory import. No `../../..` ladders.

Run `npm run lint` before handing work back. Fix warnings — don't suppress them without a comment explaining why.

---

## 2. Naming

| Thing | Convention | Example |
|---|---|---|
| React component file | PascalCase `.tsx` | `CustomCursor.tsx`, `Navigation.tsx` |
| Section component | PascalCase under `components/sections/` | `sections/Hero.tsx` |
| Hook file | camelCase, `use` prefix | `useLenis.ts` |
| Utility / logic file | camelCase or kebab-case `.ts` | `quiz.ts` |
| Data module | plural camelCase | `projects.ts`, `areas.ts` |
| Type / interface | PascalCase | `Project`, `QuizQuestion` |
| Union literal type | PascalCase alias, kebab-case string values | `type DesignProfile = 'wabi-sabi' \| …` |
| Exported constant collection | SCREAMING_SNAKE or camelCase array | `MATERIALS`, `projects`, `FILTER_LABELS` |
| CSS custom property | `--kebab-case` | `--color-bronze`, `--ease-luxury` |
| CSS utility class | `.kebab-case` with `--` for variant | `.btn--primary`, `.card-accent-hover` |
| Route segment folder | lowercase, kebab-case | `app/api/contact/` |

**Do not rename existing exports** to match new preferences — it ripples into consumers. Propose the rename first.

---

## 3. React / Component Patterns

### 3.1 Server vs Client
- Default to Server Component. Add `'use client'` only when the file uses hooks, refs, browser APIs, or event handlers.
- The `'use client'` directive must be the **first non-empty line** of the file.
- Client components should stay leaf-ish. Keep data fetching and composition in RSCs upstream.

### 3.2 File shape
```tsx
'use client';                          // only if needed

import { ... } from 'external';
import { ... } from '@/lib/...';
import { ... } from './Local';

/* ── optional constants / types ── */
const NAV_LINKS = [...] as const;

export default function ComponentName() {
  /* refs */
  const ref = useRef<HTMLDivElement>(null);

  /* state */
  const [open, setOpen] = useState(false);

  /* effects — each with cleanup */
  useEffect(() => {
    const cleanup = /* ... */;
    return () => cleanup();
  }, []);

  /* handlers */
  const onClick = () => { /* ... */ };

  /* render */
  return ( ... );
}
```

- **One default export per component file.** Named exports only for helpers inside the same module.
- **Typed props via `interface Props` or inline type**, never `any`.
- **`Readonly<{ children: React.ReactNode }>`** for layout-style components (see `app/layout.tsx`).

### 3.3 Effects
- Every `useEffect` that attaches listeners, spawns timelines, or starts rAF loops **must** return a cleanup.
- Guard against null refs: `if (!el) return;` early.
- Don't depend on refs' `.current` in the dependency array — depend on the ref object itself (as `LenisProvider` does).

### 3.4 Styling inside components
Two accepted patterns — mirror what the surrounding file does:
1. **Inline `style={{ … }}` with tokens** — preferred for pixel-precise chrome (see `Navigation.tsx`, `Footer.tsx`).
2. **Utility classes** from `globals.css` (`.btn`, `.container`, `.text-label`) — preferred for buttons, layout wrappers, typography.

**Never** hard-code colour/font/spacing values. Always go through `var(--token)` or an existing utility.

---

## 4. Data Modules (`data/`)

- Export a TypeScript `interface` / `type` for the shape.
- Export the array or record as a **named const** (`projects`, not `default`).
- No side effects on import — pure data only.
- Image URLs: keep using Unsplash `?w=…&q=80&auto=format&fit=crop`. If the hostname changes, update `next.config.ts`'s `images.remotePatterns`.
- IDs and slugs are kebab-case, lowercase, unique within the module.

---

## 5. Library / Logic Modules (`lib/`)

- Pure TS by default. A module that needs React/DOM must state so:
  - `'use client';` at top **and** name starts with `use` if it's a hook.
- Export a JSDoc block at the top describing purpose and phase (see `lib/quiz.ts`).
- No I/O inside pure logic — the quiz scorer takes `answers`, it does not fetch.
- Prefer narrow, typed function signatures. Return typed results, not `any`.

---

## 6. API / Route Handlers

- Location: `app/api/<resource>/route.ts`.
- Export `async function GET|POST|...`. Signature: `(req: NextRequest, ctx?: { params: Promise<…> })`.
- **Validate first, work second, respond last.**
- Consistent JSON envelope:
  ```ts
  { success: true, data?: ... }               // 2xx
  { success: false, error: string }           // 4xx / 5xx
  ```
- Never leak internal errors — catch at the boundary, log server-side, return a generic message.
- Secrets come from `process.env.*` — never hard-code. Document any new var in `PROJECT_CONTEXT.md`.

---

## 7. CSS / Design Tokens

- All new colour/spacing/font/z-index/transition values **must** be added as CSS custom properties in `app/globals.css`.
- If a token should be Tailwind-visible, also alias it inside `@theme inline { … }`.
- **No `tailwind.config.js`** — this is Tailwind v4, config is CSS-first. Don't scaffold one.
- Class naming for new utilities: `.namespace-modifier` (`.btn--primary`, `.card-accent-hover`). Follow the existing BEM-ish flavour.
- Keep `cursor: none !important` global. Any new interactive pattern must cooperate with `CustomCursor`.

---

## 8. Animation Rules

- Use the **single global Lenis** and the ticker it registers. Do not create a new Lenis instance.
- GSAP `ScrollTrigger` is already integrated — `import { gsap } from 'gsap'` and create triggers; they will tick with Lenis.
- Clean up every timeline and trigger in the effect's cleanup.
- Respect `prefers-reduced-motion` — either reuse `.reveal-up` / `.reveal-fade` (already handled in CSS) or gate the effect on `matchMedia('(prefers-reduced-motion: reduce)').matches`.

---

## 9. Next.js 16 Specifics (don't fall back to older patterns)

- **App Router only.** Do not add `pages/` files.
- `params`, `searchParams`, `cookies()`, `headers()`, `draftMode()` are **Promise-returning / async**. Always `await`.
- Fonts: `next/font/google` with a `variable: '--font-…-loaded'`. Apply the variable class to `<html>` as done in `app/layout.tsx`.
- Images from remote hosts must be allowlisted in `next.config.ts` → `images.remotePatterns`.
- ESLint config uses subpath exports: `eslint-config-next/core-web-vitals`, `eslint-config-next/typescript`. Don't regress to the old single-export form.
- Before using any Next feature you're unsure about, read the relevant file under `node_modules/next/dist/docs/01-app/`.

---

## 10. Commits & Git Hygiene

- Commit after every stable feature. Small, scoped commits over squashed mega-commits.
- Commit message style: short imperative subject (≤ 72 chars), optional body explaining why.
  - `Add contact route handler stub`
  - `Refactor Hero scroll pin to shared ScrollTrigger`
- Do **not** commit `.env*`, `.next/`, `tsconfig.tsbuildinfo`, `node_modules/`. `.gitignore` covers these — don't force-add.
- Never push directly to `main` without explicit request.

---

## 11. Review Checklist (run through before marking done)

- [ ] `npm run lint` clean
- [ ] `npm run build` succeeds
- [ ] No new hard-coded colours / pixel values / font names
- [ ] No new `'use client'` on files that don't need it
- [ ] Every new `useEffect` has a cleanup
- [ ] New tokens added to `globals.css`, not inlined
- [ ] New data shapes exported with types
- [ ] Logic kept out of components; lives in `lib/`
- [ ] `PROJECT_CONTEXT.md`, `ARCHITECTURE.md`, `FEATURE_LOG.md` updated if the change is structural
