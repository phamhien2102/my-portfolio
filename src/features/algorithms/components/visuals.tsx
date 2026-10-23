import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export interface Marker {
  index: number;
  label: string;
  color: string;
}

export type CellTone = "normal" | "active" | "range" | "dim" | "found" | "drop";

/** A row of boxes with index numbers below and pointer labels above. */
export function ArrayView({
  values,
  markers = [],
  tone,
  accent,
}: {
  values: ReadonlyArray<string | number>;
  markers?: Marker[];
  tone: (index: number) => CellTone;
  accent: string;
}) {
  return (
    <div className="overflow-x-auto pb-1">
      <div className="mx-auto flex w-max gap-1 px-1 pt-7 min-[400px]:gap-1.5 sm:gap-2">
        {values.map((value, index) => {
          const t = tone(index);
          const here = markers.filter((m) => m.index === index);
          return (
            <div key={index} className="relative flex flex-col items-center">
              {here.length > 0 && (
                <div className="absolute -top-7 flex gap-0.5">
                  {here.map((m) => (
                    <span
                      key={m.label}
                      className="rounded px-1.5 py-0.5 font-mono text-[10px] font-bold whitespace-nowrap text-black transition-all duration-300"
                      style={{ background: m.color }}
                    >
                      {m.label}
                    </span>
                  ))}
                </div>
              )}
              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-lg border font-mono text-xs font-bold transition-all duration-300 min-[400px]:size-10 min-[400px]:text-sm sm:size-12 sm:text-base",
                  t === "normal" && "border-white/15 bg-white/5 text-zinc-200",
                  t === "range" && "border-white/30 bg-white/10 text-white",
                  t === "dim" && "border-white/5 bg-white/[0.02] text-zinc-600",
                  t === "drop" && "border-[#ff4d6d] bg-[#ff4d6d]/20 text-[#ffb3c0] line-through",
                  t === "active" && "scale-110 text-black",
                  t === "found" && "scale-110 border-[#5cff9d] bg-[#5cff9d] text-black",
                )}
                style={t === "active" ? { background: accent, borderColor: accent } : undefined}
              >
                {value}
              </div>
              <span className="mt-1 font-mono text-[10px] text-zinc-500">{index}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** A labelled box of chips, used for the set / map / queue next to the main view. */
export function Bucket({
  label,
  items,
  empty = "empty",
  highlight,
}: {
  label: string;
  items: ReadonlyArray<ReactNode>;
  empty?: string;
  highlight?: number;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-3">
      <p className="font-mono text-[10px] tracking-[0.2em] text-zinc-500 uppercase">{label}</p>
      <div className="mt-2 flex min-h-7 flex-wrap gap-1.5">
        {items.length === 0 ? (
          <span className="font-mono text-xs text-zinc-600">{empty}</span>
        ) : (
          items.map((item, index) => (
            <span
              key={index}
              className={cn(
                "rounded-md border px-2 py-0.5 font-mono text-xs transition-colors duration-300",
                index === highlight
                  ? "border-[#5cff9d] bg-[#5cff9d]/20 text-[#b8ffd6]"
                  : "border-white/15 bg-white/5 text-zinc-200",
              )}
            >
              {item}
            </span>
          ))
        )}
      </div>
    </div>
  );
}

/** A small "name = value" readout. */
export function Readout({ items }: { items: ReadonlyArray<[string, ReactNode]> }) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {items.map(([name, value]) => (
        <span
          key={name}
          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-xs text-zinc-300"
        >
          {name} = <span className="font-bold text-white">{value}</span>
        </span>
      ))}
    </div>
  );
}

const ISLAND_COLORS = ["#00c4ff", "#ffb020", "#c44dff", "#00b96b", "#ff4d6d"];

/** The island grid: water, unvisited land, and land coloured by the island it joined. */
export function GridView({
  cells,
  scan,
  current,
  queued,
}: {
  cells: number[][];
  scan: [number, number] | null;
  current: [number, number] | null;
  queued: Array<[number, number]>;
}) {
  const isQueued = (r: number, c: number) => queued.some(([y, x]) => y === r && x === c);
  return (
    <div
      className="mx-auto grid w-max gap-1.5"
      style={{ gridTemplateColumns: `repeat(${cells[0].length}, auto)` }}
    >
      {cells.map((row, r) =>
        row.map((cell, c) => {
          const island = cell > 0 ? ISLAND_COLORS[(cell - 1) % ISLAND_COLORS.length] : null;
          const isCurrent = current?.[0] === r && current?.[1] === c;
          const isScan = scan?.[0] === r && scan?.[1] === c;
          return (
            <div
              key={`${r}-${c}`}
              className={cn(
                "relative flex size-10 items-center justify-center rounded-lg border font-mono text-xs font-bold transition-all duration-300 sm:size-12",
                cell === 0 && "border-[#1f5bff]/30 bg-[#1f5bff]/10 text-[#7fa6ff]",
                cell === -1 && "border-[#c9a46a]/50 bg-[#c9a46a]/25 text-[#f3dcb0]",
                isCurrent && "scale-110",
                isScan && "ring-2 ring-white ring-offset-2 ring-offset-[#09090e]",
              )}
              style={
                island ? { background: island, borderColor: island, color: "#000" } : undefined
              }
            >
              {cell === 0 ? "~" : cell === -1 ? "1" : `#${cell}`}
              {isQueued(r, c) && (
                <span className="absolute -top-1.5 -right-1.5 size-3 rounded-full border-2 border-[#09090e] bg-white" />
              )}
            </div>
          );
        }),
      )}
    </div>
  );
}

/** A binary heap drawn as a tree, level by level, with the top (index 0) first. */
export function HeapView({ values, accent }: { values: number[]; accent: string }) {
  const levels: number[][] = [];
  for (let start = 0, size = 1; start < values.length; start += size, size *= 2) {
    levels.push(values.slice(start, start + size));
  }
  return (
    <div className="flex min-h-36 flex-col items-center justify-center gap-3 rounded-xl border border-white/10 bg-black/30 p-4">
      {values.length === 0 ? (
        <span className="font-mono text-xs text-zinc-600">heap is empty</span>
      ) : (
        levels.map((level, depth) => (
          <div key={depth} className="flex gap-6">
            {level.map((value, index) => (
              <span
                key={index}
                className={cn(
                  "flex size-10 items-center justify-center rounded-full border font-mono text-sm font-bold transition-all duration-300 sm:size-12",
                  depth === 0 ? "text-black" : "border-white/20 bg-white/5 text-zinc-200",
                )}
                style={depth === 0 ? { background: accent, borderColor: accent } : undefined}
              >
                {value}
              </span>
            ))}
          </div>
        ))
      )}
      {values.length > 0 && (
        <span className="font-mono text-[10px] tracking-[0.2em] text-zinc-500 uppercase">
          top = smallest
        </span>
      )}
    </div>
  );
}
