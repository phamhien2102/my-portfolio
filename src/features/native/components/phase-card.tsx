"use client";

import { cn } from "@/lib/cn";

import { TRACKS, type Phase, type ShipApi, type Step, type TrackId } from "../data";
import { useProgress } from "../lib/progress";

interface CheckProps {
  id: string;
  accent: string;
  label: string;
  detail: string;
  /** The page to read for this step. The link sits outside the toggle, so both stay clickable. */
  href?: string;
  source?: string;
  strong?: boolean;
}

/** A tickable line: one topic with its link, or the app at the end of a phase. */
function Check({ id, accent, label, detail, href, source, strong }: CheckProps) {
  const { isDone, toggle } = useProgress();
  const done = isDone(id);
  return (
    <div className="rounded-2xl p-3 transition hover:bg-white">
      <button
        type="button"
        onClick={() => toggle(id)}
        aria-pressed={done}
        className="group flex w-full gap-3 text-left"
      >
        <span
          aria-hidden="true"
          className={cn(
            "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border text-[11px] leading-none text-white transition",
            done ? "border-transparent" : "border-zinc-300 group-hover:border-zinc-500",
          )}
          style={done ? { background: accent, borderColor: accent } : undefined}
        >
          {done ? "✓" : ""}
        </span>
        <span className="min-w-0">
          <span
            className={cn(
              "block font-bold text-zinc-900",
              strong ? "text-base" : "text-sm",
              done && "text-zinc-400 line-through decoration-zinc-300",
            )}
          >
            {label}
          </span>
          <span className={cn("mt-1 block text-sm text-zinc-600", done && "text-zinc-400")}>
            {detail}
          </span>
        </span>
      </button>
      {href && (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="mt-1.5 ml-8 inline-block text-xs font-bold underline-offset-4 hover:underline"
          style={{ color: accent }}
        >
          {source} ↗
        </a>
      )}
    </div>
  );
}

function TrackColumn({
  track,
  steps,
  single,
}: {
  track: TrackId;
  steps: readonly Step[];
  single: boolean;
}) {
  const meta = TRACKS.find((item) => item.id === track);
  if (!meta) return null;
  return (
    <div
      className={cn("rounded-3xl border border-zinc-200 bg-zinc-50 p-4", single && "sm:col-span-2")}
    >
      <div className="flex items-baseline gap-2 px-3 pt-1 pb-2">
        <span
          aria-hidden="true"
          className="size-2 rounded-full"
          style={{ background: meta.accent }}
        />
        <h4
          className="font-mono text-xs tracking-[0.25em] uppercase"
          style={{ color: meta.accent }}
        >
          {meta.platform}
        </h4>
        <span className="truncate font-mono text-[11px] text-zinc-500">{meta.stack}</span>
      </div>
      <ul className={cn(single && "sm:grid sm:grid-cols-2 sm:gap-x-2")}>
        {steps.map((step) => (
          <li key={step.id}>
            <Check
              id={step.id}
              accent={meta.accent}
              label={step.title}
              detail={step.detail}
              href={step.href}
              source={step.source}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The endpoints and a trimmed response for the service a phase's app calls. */
function ApiNote({ api, accent }: { api: ShipApi; accent: string }) {
  return (
    <div className="mt-3 rounded-2xl border border-zinc-200 bg-white p-4">
      <p className="font-mono text-xs tracking-[0.25em]" style={{ color: accent }}>
        API · {api.name.toUpperCase()}
      </p>
      <p className="mt-2 text-sm text-zinc-600">{api.note}</p>
      <ul className="mt-3 space-y-2">
        {api.endpoints.map((endpoint) => (
          <li key={endpoint.url}>
            <a
              href={endpoint.url}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold underline-offset-4 hover:underline"
              style={{ color: accent }}
            >
              {endpoint.label} ↗
            </a>
            <code className="mt-1 block overflow-x-auto rounded-lg bg-zinc-50 px-3 py-2 font-mono text-[11px] whitespace-nowrap text-zinc-600">
              GET {endpoint.url}
            </code>
          </li>
        ))}
      </ul>
      <pre className="mt-3 overflow-x-auto rounded-lg bg-zinc-900 p-3 font-mono text-[11px] leading-relaxed text-zinc-100">
        {api.sample}
      </pre>
    </div>
  );
}

/** One phase: the goal, the topics per track with their links, and the app that closes it. */
export function PhaseCard({ phase, tracks }: { phase: Phase; tracks: readonly TrackId[] }) {
  const { countOf } = useProgress();
  const ids = [...tracks.flatMap((track) => phase.steps[track].map((s) => s.id)), phase.ship.id];
  const done = countOf(ids);
  const complete = done === ids.length;

  return (
    <section
      aria-labelledby={`phase-${phase.id}`}
      className="relative overflow-hidden rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-sm sm:p-7"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-16 size-56 rounded-full opacity-15 blur-3xl"
        style={{ background: phase.accent }}
      />
      <header className="relative flex flex-wrap items-start gap-x-5 gap-y-3">
        <span
          className="font-mono text-4xl font-black tabular-nums sm:text-5xl"
          style={{ color: phase.accent }}
        >
          {phase.number}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h3
              id={`phase-${phase.id}`}
              className="text-2xl font-black tracking-tight text-zinc-900 sm:text-3xl"
            >
              {phase.title}
            </h3>
            <span className="rounded-full border border-zinc-300 px-2.5 py-0.5 font-mono text-[11px] tracking-wider text-zinc-500">
              {phase.weeks}
            </span>
            {phase.bonus && (
              <span className="rounded-full border border-zinc-300 px-2.5 py-0.5 font-mono text-[11px] tracking-wider text-zinc-500">
                BONUS
              </span>
            )}
            {complete && (
              <span className="rounded-full border border-[#15803d]/30 bg-[#15803d]/10 px-2.5 py-0.5 font-mono text-[11px] tracking-wider text-[#15803d]">
                ✓ DONE
              </span>
            )}
          </div>
          <p className="mt-2 max-w-3xl text-zinc-600">{phase.goal}</p>
        </div>
        <span className="font-mono text-xs text-zinc-500 tabular-nums">
          {done} / {ids.length}
        </span>
      </header>

      <div className="relative mt-6 grid gap-4 sm:grid-cols-2">
        {tracks.map((track) => (
          <TrackColumn
            key={track}
            track={track}
            steps={phase.steps[track]}
            single={tracks.length === 1}
          />
        ))}
      </div>

      <div
        className="relative mt-4 rounded-3xl border p-4 sm:p-5"
        style={{ borderColor: `${phase.accent}40`, background: `${phase.accent}0d` }}
      >
        <p className="px-3 font-mono text-xs tracking-[0.25em]" style={{ color: phase.accent }}>
          SHIP IT
        </p>
        <Check
          id={phase.ship.id}
          accent={phase.accent}
          label={phase.ship.name}
          detail={phase.ship.blurb}
          strong
        />
        <ul className="mt-1 flex flex-wrap gap-2 px-3 pb-1">
          {phase.ship.proves.map((item) => (
            <li
              key={item}
              className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-xs text-zinc-600"
            >
              {item}
            </li>
          ))}
        </ul>
        {phase.ship.api && <ApiNote api={phase.ship.api} accent={phase.accent} />}
      </div>
    </section>
  );
}
