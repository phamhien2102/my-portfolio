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
├── config/
│   ├── site.ts           # Name, role, email, socials, nav. Edit this first.
│   └── theme.ts          # Colours shared by the WebGL hero and the DOM sections.
├── features/             # Self-contained features, one folder each.
│   ├── reveal/           # Hero: WebGL blob + RAYMOND reveal.
│   │   ├── index.ts      # Public API: the only file others may import.
│   │   ├── config.ts     # Tunable settings.
│   │   ├── components/   # React components.
│   │   └── lib/          # Framework-agnostic logic (WebGL scene, shaders).
│   ├── about/            # Each content section: index.ts + data.ts + components/.
│   ├── projects/
│   ├── skills/
│   ├── experience/
│   └── contact/
├── components/
│   ├── layout/           # Site header and footer.
│   └── ui/               # Shared primitives (Section, FadeIn).
├── lib/                  # Shared utilities (cn).
└── types/                # Shared TypeScript types.
```

### Editing content

All copy is placeholder. Replace it in these files:

| What                            | File                              |
| ------------------------------- | --------------------------------- |
| Name, role, email, social links | `src/config/site.ts`              |
| About text and facts            | `src/features/about/data.ts`      |
| Projects                        | `src/features/projects/data.ts`   |
| Skill groups                    | `src/features/skills/data.ts`     |
| Work history                    | `src/features/experience/data.ts` |
| Colours                         | `src/config/theme.ts`             |

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

`features/reveal` renders the hero as a WebGL canvas (Three.js) that fills its parent
section. A chrome blob follows the pointer (or auto-sweeps on load) and reveals the word
in a new colour for each stroke. The render loop pauses while the hero is scrolled out of
view. Tune it in `src/features/reveal/config.ts`.

Accessibility: the word is exposed as a visually hidden `<h1>`, scroll-triggered fades and
the skills ticker are disabled under `prefers-reduced-motion`, and content is visible
without JavaScript.

## The dating page

`/dating` (`features/date`) is a date invite told as an airport check-in: departures board,
passenger name and booking code, schedule, seat, security and a boarding pass to take off
with. All copy lives in `src/features/date/data.ts`.

The passenger name and booking code are checked on the server, so they never reach the
browser. Override the defaults with environment variables:

| Variable              | Purpose                            |
| --------------------- | ---------------------------------- |
| `DATE_PASSENGER_NAME` | The only name accepted at check-in |
| `DATE_BOOKING_CODE`   | The 8-character booking code       |

To send the invite to someone specific, put their name and booking code in the link:
`/dating?passenger=hvan&code=abcdxyz`. They still type both at check-in, and each must match
the link (case, accents and spaces are ignored). The code can be up to 12 letters or digits,
and the code boxes follow its length. Without these parameters, the page falls back to
`DATE_PASSENGER_NAME` and `DATE_BOOKING_CODE`, checked on the server.

The inviter's name defaults to Raymond. Add `?pilot=<name>` to sign the invite with another
name: it replaces "Raymond" everywhere, from the welcome screen and the secret flight to the
CAPTCHA, the letter and the skywriting. Letters and spaces only, up to 12 characters.

### Test shortcuts

Going through every step to test the last one takes a while, so the page accepts two query
parameters, in development and in production. Open the URL, press **Turn on sound &
enter**, and the shortcut applies.

`?jump=` also skips the passenger name and booking code, so anyone who knows the URL can see
the ticket without them.

| URL                               | What it does                                                    |
| --------------------------------- | --------------------------------------------------------------- |
| `/dating?jump=<step>`             | Opens that step directly, with sample answers for earlier steps |
| `/dating?skip=security`           | After picking a seat, skips the three security questions        |
| `/dating?jump=seat&skip=security` | Both together: pick a seat, then go straight to the ticket      |

`<step>` is one of `board`, `destination`, `schedule`, `seat`, `security` or `ticket`.
