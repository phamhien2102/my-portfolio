# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Personal portfolio: Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind v4, Three.js.

## Commands

```bash
nvm use            # Node 24 (.nvmrc); package.json requires >= 20.9
npm install
npm run dev        # http://localhost:3000
npm run build      # production build — the real check that every route still renders
npm run check      # lint + typecheck + format:check — run this before calling work done
npm run format     # prettier --write .
```

There is **no test runner and no `npm test`** in this repo. Verify changes with `npm run check`,
`npm run build`, and by loading the affected route.

`npm run check` reports two pre-existing `react-hooks/exhaustive-deps` warnings in
`features/settings` and a handful of files that fail `format:check`. Don't bulk-format the repo:
run `npx prettier --write <paths>` on the files you touched.

## Architecture

### `app/` is routing only; features hold the code

Pages are a few lines: metadata plus one component imported from a feature's public API.

| Route                               | Feature                                                                   | Notes                                                   |
| ----------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------- |
| `/`                                 | composes `about`, `projects`, `skills`, `experience`, `contact`, `reveal` | the only page in `SITE.nav`                             |
| `/resume`                           | `resume`                                                                  | printable; `robots: noindex` (personal details)         |
| `/algorithms`, `/algorithms/[slug]` | `algorithms`                                                              | LeetCode pattern walkthroughs                           |
| `/dating`                           | `date`                                                                    | date invite as an airport check-in                      |
| `/bloom-pool`                       | `bloom-pool`                                                              | own `layout.tsx` with a light `viewport` theme          |
| `/native`                           | `native`                                                                  | SwiftUI + Kotlin roadmap; light page, `robots: noindex` |

**Unlisted pages** are kept out of `SITE.nav` _and_ set `robots: { index: false, follow: false }`
in their `metadata`. Follow both halves when adding another one.

### Feature boundaries are enforced by ESLint

`src/features/<name>/` holds `index.ts` (public API), `data.ts`, optional `config.ts`,
`components/`, `lib/`. `no-restricted-imports` in `eslint.config.mjs` fails the build on:

- deep imports from outside a feature (`@/features/x/components/y`) — import `@/features/x`,
- a feature importing `@/app/*`,
- a feature reaching into another feature's internals.

So exposing something new means adding it to that feature's `index.ts`. Shared code is promoted
to `components/ui/`, `lib/` or `lib/path-journey/` only once a second feature needs it.

### Content lives in `data.ts` / `config/`

Copy, projects, skills, roles, roadmap steps are plain exported consts, not JSX. Start at
`src/config/site.ts` (name, email, socials, nav) and `src/config/theme.ts` (background + the neon
palette, `accentAt(i)`). Each feature's `data.ts` owns its own copy.

### WebGL scenes

Scenes are framework-agnostic factories — `<feature>/lib/create-*-scene.ts` — that take a host
element and return a disposable handle. The React component mounts one in `useEffect`, rebuilds it
when the `(prefers-reduced-motion: no-preference)` media query changes, and disposes on unmount.
Every immersive view takes a `fallback` prop rendered under reduced motion or when WebGL throws;
new 3D work must keep that escape hatch.

`src/lib/path-journey/` is the shared scroll-driven flight engine behind both the Skills path and
the Experience fly-through / helix / tunnel / runner effects.

### Visitor settings and per-page progress

`features/settings` is a `useSyncExternalStore` store over `localStorage` (`portfolio.settings`),
read with `useSettings()`. The server and the first client render always use `DEFAULT_SETTINGS`, so
hydration matches and saved values appear right after. Presentation variants are chosen in
`*-view.tsx` (`skills-view`, `projects-view`, `experience-view`); adding one means an option in
`settings/config.ts`, a branch in the view, and a non-immersive fallback.

The same store pattern (localStorage + a custom event + `storage` for other tabs) backs the
checkbox progress on `/algorithms` (`algorithms-learned`) and `/native` (`native-roadmap-done`).
Server output is always the empty state.

### Server-only secrets

`features/date/actions.ts` is `"use server"` and compares the passenger name and booking code with
`timingSafeEqual`, reading `DATE_PASSENGER_NAME` / `DATE_BOOKING_CODE`. Those values must never
move into client code or data files. Public config goes through `NEXT_PUBLIC_*` (see
`.env.example`).

### Next 16 specifics

`next.config.ts` enables `cacheComponents` and `partialPrefetching`, and routes CSS through the
`@tailwindcss/turbopack` loader — Tailwind v4 is configured in `src/app/globals.css`
(`@import "tailwindcss"` plus `@theme inline`); there is no `tailwind.config` or PostCSS file.
Layouts use the generated `LayoutProps<"/route">` type; dynamic-route `params` are Promises.

`AGENTS.md` is written and re-added by `next dev` — don't try to delete it. It is right that this
Next version differs from older training data: read `node_modules/next/dist/docs/` before using an
unfamiliar Next API.

## Conventions

- Files kebab-case, component exports PascalCase; `cn()` from `src/lib/cn.ts` (no clsx).
- The site is dark: `THEME.background`, `font-mono` uppercase eyebrows with wide tracking,
  cards as `rounded-3xl border border-white/10 bg-white/[0.02-0.05]`, accents from `THEME.palette`.
- A light page opts out by putting `data-page-theme="light"` on its root element — `globals.css`
  flips `color-scheme` and the body background off that attribute — plus a route `layout.tsx`
  exporting a light `viewport`. `/native` does both; its accents are darker than `THEME.palette`
  because neon on white is unreadable.
- Printing shows only `features/resume`; the home page renders a hidden `<Resume />` for it, and
  `globals.css` holds the `@page` rules.
- Comments explain _why_, not _what_. Most are English; parts of `features/date` are Vietnamese —
  match the file you are editing.
- `README.md` documents the content-editing map, deployment, and the `/dating` query-parameter
  shortcuts (`?jump=`, `?skip=`, `?pilot=`).
