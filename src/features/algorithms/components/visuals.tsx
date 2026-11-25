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
                    <span key={m.label} className="alg-marker" style={{ background: m.color }}>
                      {m.label}
                    </span>
                  ))}
                </div>
              )}
              {/* The pattern's neon is the fill of the active cell, with dark ink and edge. */}
              <div
                className={cn("alg-cell", t !== "normal" && `is-${t}`)}
                style={t === "active" ? { background: accent } : undefined}
              >
                {value}
              </div>
              <span className="alg-index">{index}</span>
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
    <div className="alg-box alg-bucket">
      <p className="alg-label">{label}</p>
      <div className="items">
        {items.length === 0 ? (
          <span className="none">{empty}</span>
        ) : (
          items.map((item, index) => (
            <span key={index} className={cn("alg-item", index === highlight && "is-hit")}>
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
    <div className="alg-pills">
      {items.map(([name, value]) => (
        <span key={name}>
          {name} = <b>{value}</b>
        </span>
      ))}
    </div>
  );
}

const ISLAND_COLORS = ["#2b9fe8", "#5a8fe0", "#7b6fe0", "#1f9d8f", "#4a6fd0"];

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
                "alg-cell relative",
                cell === 0 && "alg-water",
                cell === -1 && "alg-land",
                isCurrent && "is-active",
                isScan && "alg-ring",
              )}
              style={island ? { background: island } : undefined}
            >
              {cell === 0 ? "~" : cell === -1 ? "1" : `#${cell}`}
              {isQueued(r, c) && <span className="alg-queued" />}
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
    <div className="alg-box alg-heap">
      {values.length === 0 ? (
        <span className="alg-note">heap is empty</span>
      ) : (
        levels.map((level, depth) => (
          <div key={depth} className="flex gap-6">
            {level.map((value, index) => (
              <span
                key={index}
                className={cn("alg-node", depth === 0 && "is-top")}
                style={depth === 0 ? { background: accent } : undefined}
              >
                {value}
              </span>
            ))}
          </div>
        ))
      )}
      {values.length > 0 && <span className="alg-label">top = smallest</span>}
    </div>
  );
}
