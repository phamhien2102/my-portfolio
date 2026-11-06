import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import {
  CITIES,
  COMPONENTS,
  DAILY,
  HOURLY,
  METRICS,
  SKIES,
  SPACING,
  TYPE_SCALE,
  type GlyphName,
  type Sky,
} from "../weather-data";

const SKY_BY_ID = Object.fromEntries(SKIES.map((sky) => [sky.id, sky]));

function skyStyle(sky: Sky): CSSProperties {
  return { backgroundImage: `linear-gradient(to bottom, ${sky.from}, ${sky.to})`, color: sky.ink };
}

function Kicker({ children }: { children: string }) {
  return <p className="font-mono text-xs tracking-[0.3em] text-zinc-500">{children}</p>;
}

function Glyph({ name, className = "size-5" }: { name: GlyphName; className?: string }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    className,
    "aria-hidden": true,
  };
  if (name === "sun")
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" />
      </svg>
    );
  if (name === "moon")
    return (
      <svg {...common}>
        <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
      </svg>
    );
  if (name === "snow")
    return (
      <svg {...common}>
        <path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M7 17a4 4 0 0 1-.4-8A5.5 5.5 0 0 1 17 8.5a4.3 4.3 0 0 1 0 8.5H7Z" />
      {name === "rain" && <path d="M9 20l-1 2M13 20l-1 2M17 20l-1 2" />}
    </svg>
  );
}

/** A phone-shaped frame. Decorative: the caption underneath is what a screen reader gets. */
function Phone({ sky, children }: { sky: Sky; children: ReactNode }) {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto aspect-[9/19] w-[250px] overflow-hidden rounded-[2.4rem] border-[7px] border-zinc-900 shadow-xl"
      style={skyStyle(sky)}
    >
      <div className="absolute top-2 left-1/2 h-4 w-16 -translate-x-1/2 rounded-full bg-zinc-900" />
      <div className="flex h-full flex-col px-4 pt-9 pb-4">{children}</div>
    </div>
  );
}

function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white/15 p-3 backdrop-blur-sm ${className}`}>{children}</div>
  );
}

function Screen({
  version,
  title,
  note,
  children,
}: {
  version: string;
  title: string;
  note: string;
  children: ReactNode;
}) {
  return (
    <figure>
      {children}
      <figcaption className="mx-auto mt-4 max-w-[250px]">
        <span className="font-mono text-[11px] tracking-[0.2em] text-zinc-400">{version}</span>
        <span className="mt-1 block font-bold text-zinc-900">{title}</span>
        <span className="mt-1 block text-sm text-zinc-600">{note}</span>
      </figcaption>
    </figure>
  );
}

function HomeScreen() {
  const sky = SKY_BY_ID.clear;
  const lows = DAILY.map((d) => d.low);
  const highs = DAILY.map((d) => d.high);
  const min = Math.min(...lows);
  const range = Math.max(...highs) - min;
  return (
    <Phone sky={sky}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-lg font-semibold">Ho Chi Minh City</p>
          <p className="text-[11px] opacity-80">Partly cloudy</p>
        </div>
        <div className="flex rounded-full bg-white/20 p-0.5 text-[10px] font-semibold">
          <span className="rounded-full bg-white px-2 py-0.5 text-sky-800">°C</span>
          <span className="px-2 py-0.5">°F</span>
        </div>
      </div>
      <p className="mt-5 text-center text-7xl font-thin tabular-nums">21°</p>
      <p className="text-center text-xs opacity-90">H 24° · L 15°</p>
      <Panel className="mt-5">
        <div className="flex justify-between">
          {HOURLY.map((h) => (
            <div key={h.time} className="flex flex-col items-center gap-1 text-[10px]">
              <span className="opacity-80">{h.time}</span>
              <Glyph name={h.icon} className="size-4" />
              <span className="font-semibold tabular-nums">{h.deg}°</span>
            </div>
          ))}
        </div>
      </Panel>
      <Panel className="mt-3 flex-1">
        <ul className="space-y-1.5">
          {DAILY.map((d) => (
            <li key={d.day} className="flex items-center gap-2 text-[11px]">
              <span className="w-9">{d.day}</span>
              <Glyph name={d.icon} className="size-3.5" />
              <span className="w-5 text-right tabular-nums opacity-80">{d.low}°</span>
              <span className="relative h-1 flex-1 rounded-full bg-white/25">
                <span
                  className="absolute inset-y-0 rounded-full bg-white"
                  style={{
                    left: `${((d.low - min) / range) * 100}%`,
                    right: `${100 - ((d.high - min) / range) * 100}%`,
                  }}
                />
              </span>
              <span className="w-5 tabular-nums">{d.high}°</span>
            </li>
          ))}
        </ul>
      </Panel>
    </Phone>
  );
}

function CitiesScreen() {
  return (
    <Phone sky={{ ...SKY_BY_ID.cloudy, from: "#f8fafc", to: "#e2e8f0", ink: "#0f172a" }}>
      <div className="flex items-center justify-between">
        <p className="text-2xl font-bold">Weather</p>
        <span className="flex size-7 items-center justify-center rounded-full bg-zinc-900 text-lg leading-none text-white">
          +
        </span>
      </div>
      <div className="mt-3 rounded-xl bg-white px-3 py-1.5 text-[11px] text-zinc-400 shadow-sm">
        Search for a city
      </div>
      <ul className="mt-3 space-y-2">
        {CITIES.map((city) => {
          const sky = SKY_BY_ID[city.sky];
          return (
            <li
              key={city.name}
              className="flex items-center justify-between rounded-2xl px-3 py-2.5 shadow-sm"
              style={{
                ...skyStyle(sky),
                backgroundImage: `linear-gradient(to right, ${sky.from}, ${sky.to})`,
              }}
            >
              <div>
                <p className="text-xs font-semibold">{city.name}</p>
                <p className="text-[10px] opacity-80">
                  {city.local} · {city.condition}
                </p>
              </div>
              <p className="text-2xl font-light tabular-nums">{city.deg}°</p>
            </li>
          );
        })}
      </ul>
    </Phone>
  );
}

function DetailScreen() {
  const sky = SKY_BY_ID.rain;
  return (
    <Phone sky={sky}>
      <p className="text-[11px] opacity-80">‹ Cities</p>
      <p className="mt-3 text-lg font-semibold">Hanoi</p>
      <p className="mt-2 text-center text-7xl font-thin tabular-nums">26°</p>
      <p className="text-center text-xs opacity-90">Light rain · H 28° L 24°</p>
      <Panel className="mt-4">
        <p className="text-[10px] opacity-90">Rain expected from 17:00, easing after 20:00.</p>
      </Panel>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {METRICS.map((m) => (
          <Panel key={m.label} className="!p-2.5">
            <p className="font-mono text-[9px] tracking-[0.12em] opacity-75">{m.label}</p>
            <p className="mt-1 text-lg font-light tabular-nums">{m.value}</p>
          </Panel>
        ))}
      </div>
    </Phone>
  );
}

const STATES = [
  {
    version: "v0.4",
    name: "Loading",
    body: "Grey blocks the same size as the content, no spinner on top of an empty screen.",
  },
  {
    version: "v0.4",
    name: "Error",
    body: "What went wrong in one sentence, and a Retry button. Never a raw exception message.",
  },
  {
    version: "v0.4",
    name: "No results",
    body: "“No city called ‘Hanio’. Did you mean Hanoi?” Search stays focused.",
  },
  {
    version: "v0.5",
    name: "Offline",
    body: "Keep showing the cached forecast with a quiet banner: “Updated 2 hours ago”.",
  },
] as const;

/** /native/weather-design: the app that the roadmap builds, drawn once for both platforms. */
export function WeatherDesign() {
  return (
    <main
      data-page-theme="light"
      className="min-h-svh bg-white px-5 py-16 text-zinc-900 [color-scheme:light] sm:px-8"
    >
      <div className="mx-auto max-w-5xl">
        <Link
          href="/native"
          className="font-mono text-xs tracking-[0.25em] text-zinc-400 hover:text-zinc-900"
        >
          ← GOING NATIVE
        </Link>

        <p className="mt-10 font-mono text-xs tracking-[0.3em] text-zinc-500">
          THE APP · SWIFTUI · JETPACK COMPOSE
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">
          Weather, drawn once.
        </h1>
        <p className="mt-4 max-w-2xl text-zinc-600">
          One design for both platforms. The weather picks the colour, one big number carries the
          screen, and everything else stays out of its way. Build the same screens in SwiftUI and
          Compose and let each platform decide how a segmented control or a swipe feels.
        </p>

        <section className="mt-16" aria-labelledby="screens">
          <Kicker>SCREENS</Kicker>
          <h2 id="screens" className="mt-3 text-2xl font-black tracking-tight sm:text-4xl">
            Three screens are the whole app.
          </h2>
          <div className="mt-10 grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
            <Screen
              version="V0.2 · PHASE 02"
              title="Today"
              note="Hard-coded data. Learn stacks, a horizontal list and one piece of state: the unit."
            >
              <HomeScreen />
            </Screen>
            <Screen
              version="V0.3 · PHASE 03"
              title="Cities"
              note="Add, remove and open a city. Each row borrows the sky of its own weather."
            >
              <CitiesScreen />
            </Screen>
            <Screen
              version="V0.3 · PHASE 03"
              title="City detail"
              note="The same layout as Today plus a metric grid. Reuse the components, do not copy them."
            >
              <DetailScreen />
            </Screen>
          </div>
        </section>

        <section className="mt-20" aria-labelledby="skies">
          <Kicker>COLOUR</Kicker>
          <h2 id="skies" className="mt-3 text-2xl font-black tracking-tight sm:text-4xl">
            Six skies, one rule.
          </h2>
          <p className="mt-3 max-w-2xl text-zinc-600">
            The app has no brand colour. The gradient comes from the weather code and the text
            colour is fixed per sky so contrast never depends on the forecast.
          </p>
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {SKIES.map((sky) => (
              <li key={sky.id} className="overflow-hidden rounded-2xl border border-zinc-200">
                <div className="h-24 p-3 font-semibold" style={skyStyle(sky)}>
                  {sky.label}
                </div>
                <div className="p-3 font-mono text-[10px] leading-relaxed text-zinc-500">
                  <p>{sky.from}</p>
                  <p>{sky.to}</p>
                  <p className="mt-1 text-zinc-400">codes {sky.codes}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-20" aria-labelledby="type">
          <Kicker>TYPE AND SPACE</Kicker>
          <h2 id="type" className="mt-3 text-2xl font-black tracking-tight sm:text-4xl">
            Four text styles on a 4-point grid.
          </h2>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-zinc-200">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-zinc-50 font-mono text-[11px] tracking-wider text-zinc-500">
                <tr>
                  <th className="p-3">STYLE</th>
                  <th className="p-3">SPEC</th>
                  <th className="p-3">SWIFTUI</th>
                  <th className="p-3">COMPOSE</th>
                </tr>
              </thead>
              <tbody>
                {TYPE_SCALE.map((style) => (
                  <tr key={style.name} className="border-t border-zinc-200 align-top">
                    <td className="p-3">
                      <p className={`${style.className} leading-tight`}>{style.sample}</p>
                      <p className="mt-1 font-mono text-[11px] text-zinc-400">{style.name}</p>
                    </td>
                    <td className="p-3 text-zinc-600">{style.spec}</td>
                    <td className="p-3 font-mono text-xs text-zinc-600">{style.swift}</td>
                    <td className="p-3 font-mono text-xs text-zinc-600">{style.kotlin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
            {SPACING.map((space) => (
              <li key={space.token} className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="inline-block rounded-sm bg-zinc-900"
                  style={{ width: space.px, height: space.px }}
                />
                <span className="text-sm">
                  <span className="font-mono font-bold">
                    {space.token} · {space.px}
                  </span>
                  <span className="ml-2 text-zinc-500">{space.use}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-20" aria-labelledby="components">
          <Kicker>COMPONENTS</Kicker>
          <h2 id="components" className="mt-3 text-2xl font-black tracking-tight sm:text-4xl">
            Seven pieces, named the same on both sides.
          </h2>
          <p className="mt-3 max-w-2xl text-zinc-600">
            Give the SwiftUI view and the Composable the same name. When a bug shows up on one
            platform, you can open the other and compare like with like.
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {COMPONENTS.map((c) => (
              <li key={c.name} className="rounded-2xl border border-zinc-200 p-4 shadow-sm">
                <p className="flex items-baseline justify-between">
                  <span className="font-mono font-bold">{c.name}</span>
                  <span className="font-mono text-[11px] tracking-wider text-zinc-400">
                    {c.from}
                  </span>
                </p>
                <p className="mt-1 text-sm text-zinc-600">{c.detail}</p>
                <p className="mt-3 font-mono text-[11px] leading-relaxed">
                  <span className="text-[#c2410c]">iOS </span>
                  <span className="text-zinc-600">{c.swift}</span>
                  <br />
                  <span className="text-[#6d28d9]">Android </span>
                  <span className="text-zinc-600">{c.kotlin}</span>
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-20" aria-labelledby="states">
          <Kicker>EVERY STATE</Kicker>
          <h2 id="states" className="mt-3 text-2xl font-black tracking-tight sm:text-4xl">
            Design the unhappy screens first.
          </h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {STATES.map((state) => (
              <li key={state.name} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="font-mono text-[11px] tracking-wider text-zinc-400">
                  {state.version}
                </p>
                <p className="mt-1 font-bold">{state.name}</p>
                <p className="mt-1 text-sm text-zinc-600">{state.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-20 font-mono text-xs tracking-wider text-zinc-400">
          A private page. Not linked from anywhere, not in search results.
        </p>
      </div>
    </main>
  );
}
