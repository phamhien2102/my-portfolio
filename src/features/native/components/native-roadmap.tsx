import Link from "next/link";

import { CAPSTONES, COURSES, PHASES, RULES, TOTAL_WEEKS, TRACKS } from "../data";
import { BridgeTable } from "./bridge-table";
import { RoadmapBoard } from "./roadmap-board";

const FACTS = [
  { value: String(PHASES.length), label: "phases" },
  { value: `${TOTAL_WEEKS}w`, label: "end to end" },
  { value: String(PHASES.length), label: "apps shipped" },
  { value: "2", label: "platforms, in parallel" },
];

function Kicker({ children }: { children: string }) {
  return <p className="font-mono text-xs tracking-[0.3em] text-zinc-500">{children}</p>;
}

/** /native: a learning roadmap for SwiftUI and Kotlin, with a link and an app at every step. */
export function NativeRoadmap() {
  return (
    <main
      data-page-theme="light"
      className="min-h-svh bg-white px-5 py-16 text-zinc-900 [color-scheme:light] sm:px-8"
    >
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="font-mono text-xs tracking-[0.25em] text-zinc-400 hover:text-zinc-900"
        >
          ← RAYMOND PHAM
        </Link>

        <p className="mt-10 font-mono text-xs tracking-[0.3em] text-zinc-500">
          SWIFTUI · JETPACK COMPOSE
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">Going native.</h1>
        <p className="mt-4 max-w-2xl text-zinc-600">
          A plan to learn SwiftUI and Kotlin at the same time, written for someone who already ships
          React Native. Every phase teaches the same idea twice, once per platform, and ends with an
          app small enough to finish. Each step links to the one page worth reading for it. Tick
          things off as you go.
        </p>
        <p className="mt-3 max-w-2xl text-zinc-600">
          The app is Weather, growing one version per phase.{" "}
          <Link
            href="/native/weather-design"
            className="font-semibold text-zinc-900 underline underline-offset-4 hover:text-zinc-600"
          >
            See the design →
          </Link>
        </p>

        <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
          {FACTS.map((fact) => (
            <div key={fact.label}>
              <dt className="sr-only">{fact.label}</dt>
              <dd>
                <span className="font-mono text-2xl font-black tabular-nums">{fact.value}</span>
                <span className="ml-2 text-sm text-zinc-500">{fact.label}</span>
              </dd>
            </div>
          ))}
        </dl>

        <RoadmapBoard />

        <section className="mt-20" aria-labelledby="courses">
          <Kicker>READ UNDERNEATH IT ALL</Kicker>
          <h2 id="courses" className="mt-3 text-2xl font-black tracking-tight sm:text-4xl">
            Six courses, not sixty.
          </h2>
          <p className="mt-3 max-w-2xl text-zinc-600">
            The links inside each phase are references for one topic. These are the long reads to
            run underneath the whole plan.
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {COURSES.map((course) => {
              const track = TRACKS.find((item) => item.id === course.track);
              return (
                <li key={course.href}>
                  <a
                    href={course.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-400 hover:shadow-sm"
                  >
                    <span className="flex items-center gap-2 font-mono text-[11px] tracking-[0.2em]">
                      <span
                        aria-hidden="true"
                        className="size-2 rounded-full"
                        style={{ background: track?.accent ?? "#71717a" }}
                      />
                      <span style={{ color: track?.accent ?? "#71717a" }}>
                        {track ? track.platform.toUpperCase() : "BOTH"}
                      </span>
                    </span>
                    <span className="mt-2 font-bold text-zinc-900">{course.label} ↗</span>
                    <span className="mt-1 text-sm text-zinc-600">{course.note}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="mt-20" aria-labelledby="capstone">
          <Kicker>AFTER THE PHASES</Kicker>
          <h2 id="capstone" className="mt-3 text-2xl font-black tracking-tight sm:text-4xl">
            One app worth showing.
          </h2>
          <p className="mt-3 max-w-2xl text-zinc-600">
            The eight small apps prove the mechanics. One bigger app proves you can hold a product
            together. Pick whichever of these you would use yourself.
          </p>
          <ul className="mt-6 grid gap-4 sm:grid-cols-3">
            {CAPSTONES.map((app) => (
              <li
                key={app.id}
                className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-16 -right-16 size-40 rounded-full opacity-15 blur-3xl"
                  style={{ background: app.accent }}
                />
                <h3 className="relative text-xl font-black tracking-tight">{app.name}</h3>
                <p className="relative mt-2 text-sm text-zinc-600">{app.blurb}</p>
                <p
                  className="relative mt-4 font-mono text-[11px] tracking-wider"
                  style={{ color: app.accent }}
                >
                  THE HARD BIT
                </p>
                <p className="relative mt-1 text-sm text-zinc-700">{app.hard}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-20" aria-labelledby="bridge">
          <Kicker>TRANSLATION TABLE</Kicker>
          <h2 id="bridge" className="mt-3 text-2xl font-black tracking-tight sm:text-4xl">
            You already know most of this.
          </h2>
          <p className="mt-3 max-w-2xl text-zinc-600">
            Both frameworks are React with different spelling. Keep this next to you for the first
            month; after that you will not need it.
          </p>
          <BridgeTable />
        </section>

        <section className="mt-20" aria-labelledby="rules">
          <Kicker>HOUSE RULES</Kicker>
          <h2 id="rules" className="mt-3 text-2xl font-black tracking-tight sm:text-4xl">
            How to actually finish.
          </h2>
          <ol className="mt-6 space-y-3">
            {RULES.map((rule, index) => (
              <li
                key={rule}
                className="flex gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
              >
                <span className="font-mono text-sm text-zinc-400 tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-zinc-700">{rule}</span>
              </li>
            ))}
          </ol>
        </section>

        <p className="mt-20 font-mono text-xs tracking-wider text-zinc-400">
          A private page. Not linked from anywhere, not in search results.
        </p>
      </div>
    </main>
  );
}
