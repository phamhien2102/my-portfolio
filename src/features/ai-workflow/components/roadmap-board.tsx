"use client";

import { idsOf, type Phase } from "../data";
import { useProgress } from "../lib/progress";
import { PhaseCard } from "./phase-card";

/** The ticking part of the page: the progress bar and the phases. */
export function RoadmapBoard({ phases }: { phases: readonly Phase[] }) {
  const stepIds = idsOf(phases);
  const { countOf, clear } = useProgress();
  const done = countOf(stepIds);
  const percent = Math.round((done / stepIds.length) * 100);

  return (
    <div>
      <div className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-3">
        <div className="flex min-w-[14rem] flex-1 items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-200">
            <div
              className="h-full rounded-full bg-[#15803d] transition-[width] duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
          <span aria-live="polite" className="font-mono text-xs text-zinc-500 tabular-nums">
            {done} / {stepIds.length} done
          </span>
        </div>
        {done > 0 && (
          <button
            type="button"
            onClick={clear}
            className="font-mono text-xs tracking-wider text-zinc-400 underline-offset-4 hover:text-zinc-700 hover:underline"
          >
            RESET
          </button>
        )}
      </div>
      <p className="mt-3 font-mono text-[11px] tracking-wider text-zinc-400">
        TICKS ARE KEPT IN THIS BROWSER ONLY
      </p>
      <div className="mt-8 space-y-6">
        {phases.map((phase) => (
          <PhaseCard key={phase.id} phase={phase} />
        ))}
      </div>
    </div>
  );
}
