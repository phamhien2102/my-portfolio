# my-portfolio

Personal portfolio built with Next.js (App Router), TypeScript and Tailwind CSS v4.

## Getting started

```bash
nvm use          # Node 24 (see .nvmrc)
npm install
npm run dev      # http://localhost:3000
```

| Script           | Purpose                                     |
| ---------------- | ------------------------------------------- |
| `npm run dev`    | Start the dev server                        |
| `npm run build`  | Production build                            |
| `npm run check`  | Lint + typecheck + format check (run in CI) |
| `npm run format` | Format with Prettier                        |

## Project structure

```
src/
├── app/                  # Routing and global styles only. Keep pages thin.
├── config/               # Site-wide constants (name, metadata).
├── features/             # Self-contained features, one folder each.
│   └── reveal/
│       ├── index.ts      # Public API: the only file others may import.
│       ├── config.ts     # Tunable settings.
│       ├── components/   # React components.
│       └── lib/          # Framework-agnostic logic (WebGL scene, shaders).
├── components/ui/        # Shared, feature-agnostic UI primitives.
├── lib/                  # Shared utilities.
└── types/                # Shared TypeScript types.
```

### Conventions

- **Pages compose features.** `app/**` imports from `@/features/<name>`, nothing deeper.
- **Features own their code.** Components, logic and config live together and are
  exposed through `index.ts`.
- **Boundaries are enforced by ESLint** (`no-restricted-imports`): deep imports into a
  feature, or a feature importing from `app/`, fail `npm run lint`.
- **Shared code is promoted, not pre-built.** Move something to `components/ui` or
  `lib` only once a second feature needs it.
- **Files are kebab-case**, components are PascalCase exports.

## Deployment (Vercel)

Vercel detects Next.js automatically, so no extra config is needed.

1. Push the repo to GitHub.
2. In Vercel: **Add New → Project**, import the repo, keep the defaults (Framework: Next.js,
   build command `next build`, install command `npm install`).
3. Add any variables from `.env.example` under **Settings → Environment Variables**.
4. Deploy. Every push to `main` ships to production; every other branch and pull request
   gets its own preview URL.

Or deploy from the terminal with the Vercel CLI:

```bash
npx vercel          # preview deployment
npx vercel --prod   # production deployment
```

Set `NEXT_PUBLIC_SITE_URL` to the production URL once you have a domain.

## The reveal effect

`features/reveal` renders a full-viewport WebGL canvas (Three.js). A chrome blob follows
the pointer (or auto-sweeps on load) and reveals the word in a new colour for each
stroke. Tune it in `src/features/reveal/config.ts`.
