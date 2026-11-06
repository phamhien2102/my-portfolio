"use client";

import { cn } from "@/lib/cn";

import type { Phase, Step } from "../data";
import { useProgress } from "../lib/progress";

function Check({
  id,
  accent,
  label,
  detail,
  step,
  strong,
}: {
  id: string;
  accent: string;
  label: string;
  detail: string;
  step?: Step;
  strong?: boolean;
}) {
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
      {step && (
        <a
          href={step.href}
          target="_blank"
          rel="noreferrer"
          className="mt-1.5 ml-8 inline-block text-xs font-bold underline-offset-4 hover:underline"
          style={{ color: accent }}
        >
          {step.source} ↗
        </a>
      )}
    </div>
  );
}

/** One phase: the goal, the topics with their links, and the version of the workflow it ends on. */
export function PhaseCard({ phase }: { phase: Phase }) {
  const { countOf } = useProgress();
  const ids = [...phase.steps.map((s) => s.id), phase.build.id];
  const done = countOf(ids);
  const complete = done === ids.length;
  const { build } = phase;

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

      <ul className="relative mt-6 rounded-3xl border border-zinc-200 bg-zinc-50 p-2 sm:grid sm:grid-cols-2 sm:gap-x-2">
        {phase.steps.map((step) => (
          <li key={step.id}>
            <Check
              id={step.id}
              accent={phase.accent}
              label={step.title}
              detail={step.detail}
              step={step}
            />
          </li>
        ))}
      </ul>

      <div
        className="relative mt-4 rounded-3xl border p-4 sm:p-5"
        style={{ borderColor: `${phase.accent}40`, background: `${phase.accent}0d` }}
      >
        <p className="px-3 font-mono text-xs tracking-[0.25em]" style={{ color: phase.accent }}>
          BUILD IT
        </p>
        <Check id={build.id} accent={phase.accent} label={build.name} detail={build.blurb} strong />
        <ul className="mt-1 flex flex-wrap gap-2 px-3 pb-1">
          {build.proves.map((item) => (
            <li
              key={item}
              className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-xs text-zinc-600"
            >
              {item}
            </li>
          ))}
        </ul>
        {build.example && (
          <div className="mt-3 rounded-2xl border border-zinc-200 bg-white p-4">
            <p className="font-mono text-xs tracking-[0.25em]" style={{ color: phase.accent }}>
              START FROM · {build.example.file}
            </p>
            <pre className="mt-3 overflow-x-auto rounded-lg bg-zinc-900 p-3 font-mono text-[11px] leading-relaxed text-zinc-100">
              {build.example.code}
            </pre>
          </div>
        )}
      </div>
    </section>
  );
}
