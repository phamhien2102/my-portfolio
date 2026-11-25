import Link from "next/link";

import { CAPSTONES, COURSES, PHASES, RULES, TOTAL_WEEKS, TRACKS } from "../data";
import { BridgeTable } from "./bridge-table";

const FACTS = [
  { value: String(PHASES.length), label: "phases" },
  { value: `${TOTAL_WEEKS}w`, label: "end to end" },
  { value: String(PHASES.length), label: "apps shipped" },
  { value: "2", label: "platforms, in parallel" },
];

function Kicker({ children }: { children: string }) {
  return <p className="font-mono text-xs tracking-[0.3em] text-slate-500">{children}</p>;
}

/** The first thing the reader sees: what the plan is, and its numbers. */
export function Overview() {
  return (
    <section aria-labelledby="overview">
      <Kicker>SWIFTUI · JETPACK COMPOSE</Kicker>
      <h1 id="overview" className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
        Going native.
      </h1>
      <p className="mt-4 max-w-2xl text-slate-600">
        A plan to learn SwiftUI and Kotlin at the same time, written for someone who already ships
        React Native. Every phase teaches the same idea twice, once per platform, and ends with an
        app small enough to finish. Each step links to the one page worth reading for it. Tick
        things off as you go.
      </p>
      <p className="mt-3 max-w-2xl text-slate-600">
        The app is Weather, growing one version per phase.{" "}
        <Link
          href="/native/weather-design"
          className="font-semibold text-slate-900 underline underline-offset-4 hover:text-slate-600"
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
              <span className="ml-2 text-sm text-slate-500">{fact.label}</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function Courses() {
  return (
    <section aria-labelledby="courses">
      <Kicker>READ UNDERNEATH IT ALL</Kicker>
      <h2 id="courses" className="mt-3 text-2xl font-black tracking-tight sm:text-4xl">
        Six courses, not sixty.
      </h2>
      <p className="mt-3 max-w-2xl text-slate-600">
        The links inside each phase are references for one topic. These are the long reads to run
        underneath the whole plan.
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
                className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-slate-400 hover:shadow-sm"
              >
                <span className="flex items-center gap-2 font-mono text-[11px] tracking-[0.2em]">
                  <span
                    aria-hidden="true"
                    className="size-2 rounded-full"
                    style={{ background: track?.accent ?? "#64748b" }}
                  />
                  <span style={{ color: track?.accent ?? "#64748b" }}>
                    {track ? track.platform.toUpperCase() : "BOTH"}
                  </span>
                </span>
                <span className="mt-2 font-bold text-slate-900">{course.label} ↗</span>
                <span className="mt-1 text-sm text-slate-600">{course.note}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function Capstones() {
  return (
    <section aria-labelledby="capstone">
      <Kicker>AFTER THE PHASES</Kicker>
      <h2 id="capstone" className="mt-3 text-2xl font-black tracking-tight sm:text-4xl">
        One app worth showing.
      </h2>
      <p className="mt-3 max-w-2xl text-slate-600">
        The eight small apps prove the mechanics. One bigger app proves you can hold a product
        together. Pick whichever of these you would use yourself.
      </p>
      <ul className="mt-6 grid gap-4 sm:grid-cols-3">
        {CAPSTONES.map((app) => (
          <li
            key={app.id}
            className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -top-16 -right-16 size-40 rounded-full opacity-15 blur-3xl"
              style={{ background: app.accent }}
            />
            <h3 className="relative text-xl font-black tracking-tight">{app.name}</h3>
            <p className="relative mt-2 text-sm text-slate-600">{app.blurb}</p>
            <p
              className="relative mt-4 font-mono text-[11px] tracking-wider"
              style={{ color: app.accent }}
            >
              THE HARD BIT
            </p>
            <p className="relative mt-1 text-sm text-slate-700">{app.hard}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Bridge() {
  return (
    <section aria-labelledby="bridge">
      <Kicker>TRANSLATION TABLE</Kicker>
      <h2 id="bridge" className="mt-3 text-2xl font-black tracking-tight sm:text-4xl">
        You already know most of this.
      </h2>
      <p className="mt-3 max-w-2xl text-slate-600">
        Both frameworks are React with different spelling. Keep this next to you for the first
        month; after that you will not need it.
      </p>
      <BridgeTable />
    </section>
  );
}

export function Rules() {
  return (
    <section aria-labelledby="rules">
      <Kicker>HOUSE RULES</Kicker>
      <h2 id="rules" className="mt-3 text-2xl font-black tracking-tight sm:text-4xl">
        How to actually finish.
      </h2>
      <ol className="mt-6 space-y-3">
        {RULES.map((rule, index) => (
          <li
            key={rule}
            className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <span className="font-mono text-sm text-slate-400 tabular-nums">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="text-slate-700">{rule}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
