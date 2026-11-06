"use client";

import { useState } from "react";

import { cn } from "@/lib/cn";

import { PHASES, stepIds, TRACKS, type TrackId } from "../data";
import { useProgress } from "../lib/progress";
import { PhaseCard } from "./phase-card";

type Filter = "both" | TrackId;

const FILTERS: ReadonlyArray<{ value: Filter; label: string }> = [
  { value: "both", label: "Both" },
  ...TRACKS.map((track) => ({ value: track.id as Filter, label: track.label })),
];

function tracksFor(filter: Filter): readonly TrackId[] {
  return filter === "both" ? TRACKS.map((track) => track.id) : [filter];
}

/** The ticking part of the page: the track filter, the progress bar and the eight phases. */
export function RoadmapBoard() {
  const [filter, setFilter] = useState<Filter>("both");
  const { countOf, clear } = useProgress();
  const tracks = tracksFor(filter);
  const ids = stepIds(tracks);
  const done = countOf(ids);
  const percent = Math.round((done / ids.length) * 100);

  return (
    <div>
      <div className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-3">
        <div
          role="group"
          aria-label="Show one platform or both"
          className="flex gap-1 rounded-full border border-zinc-200 bg-white p-1"
        >
          {FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilter(option.value)}
              aria-pressed={filter === option.value}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-bold transition",
                filter === option.value
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-500 hover:text-zinc-900",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="flex min-w-[14rem] flex-1 items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-200">
            <div
              className="h-full rounded-full bg-[#15803d] transition-[width] duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
          <span aria-live="polite" className="font-mono text-xs text-zinc-500 tabular-nums">
            {done} / {ids.length} done
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
        {PHASES.map((phase) => (
          <PhaseCard key={phase.id} phase={phase} tracks={tracks} />
        ))}
      </div>
    </div>
  );
}
