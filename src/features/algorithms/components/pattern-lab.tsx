"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

import { cn } from "@/lib/cn";

import type { Pattern } from "../data";
import {
  BACKTRACK_INPUT,
  backtrackSteps,
  BINARY_INPUT,
  binarySearchSteps,
  bfsSteps,
  DP_INPUT,
  dpSteps,
  HASH_INPUT,
  HEAP_INPUT,
  hashMapSteps,
  heapSteps,
  MONO_INPUT,
  monoStackSteps,
  UNION_INPUT,
  unionFindSteps,
  SLIDING_INPUT,
  slidingWindowSteps,
  TWO_POINTERS_INPUT,
  twoPointersSteps,
  type Step,
} from "../lib/steps";
import { ArrayView, Bucket, GridView, HeapView, Readout, type Marker } from "./visuals";

const SPEEDS = [
  { label: "0.5×", ms: 1800 },
  { label: "1×", ms: 1000 },
  { label: "2×", ms: 500 },
] as const;

interface Frame {
  line: number;
  caption: string;
  view: ReactNode;
}

/** Turn the steps of one pattern into frames: code line, caption and the picture for that step. */
function useFrames(pattern: Pattern): Frame[] {
  const accent = pattern.accent;
  return useMemo(() => {
    const frames = <S,>(steps: Step<S>[], view: (state: S) => ReactNode): Frame[] =>
      steps.map((step) => ({ line: step.line, caption: step.caption, view: view(step.state) }));

    switch (pattern.slug) {
      case "two-pointers": {
        const { numbers, target } = TWO_POINTERS_INPUT;
        return frames(twoPointersSteps(), (s) => (
          <div className="space-y-4">
            <ArrayView
              values={numbers}
              accent={accent}
              markers={[
                { index: s.left, label: "L", color: accent },
                { index: s.right, label: "R", color: "#ffb020" },
              ]}
              tone={(i) =>
                s.found && (i === s.left || i === s.right)
                  ? "found"
                  : i === s.left || i === s.right
                    ? "active"
                    : i < s.left || i > s.right
                      ? "dim"
                      : "range"
              }
            />
            <Readout
              items={[
                ["target", target],
                ["sum", s.sum ?? "–"],
              ]}
            />
          </div>
        ));
      }
      case "sliding-window": {
        return frames(slidingWindowSteps(), (s) => {
          const markers: Marker[] = [];
          if (s.right >= 0) {
            markers.push({ index: s.left, label: "L", color: accent });
            markers.push({ index: s.right, label: "R", color: "#ffb020" });
          }
          return (
            <div className="space-y-4">
              <ArrayView
                values={[...SLIDING_INPUT]}
                accent={accent}
                markers={markers}
                tone={(i) =>
                  i === s.dropping
                    ? "drop"
                    : i === s.right && !s.done
                      ? "active"
                      : s.right >= 0 && i >= s.left && i <= s.right
                        ? "range"
                        : "dim"
                }
              />
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <Bucket label="seen (in window)" items={s.seen.map((ch) => `"${ch}"`)} />
                <div className="alg-box alg-readout">
                  best = <span className="alg-num">{s.best}</span>
                </div>
              </div>
            </div>
          );
        });
      }
      case "binary-search": {
        const { nums, target } = BINARY_INPUT;
        return frames(binarySearchSteps(), (s) => {
          const markers: Marker[] = [
            { index: s.lo, label: "lo", color: accent },
            { index: s.hi, label: "hi", color: "#00c4ff" },
          ];
          if (s.mid !== null) markers.push({ index: s.mid, label: "mid", color: "#ff4d6d" });
          return (
            <div className="space-y-4">
              <ArrayView
                values={nums}
                accent={accent}
                markers={markers.filter((m) => m.index >= 0 && m.index < nums.length)}
                tone={(i) =>
                  s.found && i === s.mid
                    ? "found"
                    : i === s.mid
                      ? "active"
                      : i >= s.lo && i <= s.hi
                        ? "range"
                        : "dim"
                }
              />
              <Readout
                items={[
                  ["target", target],
                  ["range size", Math.max(0, s.hi - s.lo + 1)],
                ]}
              />
            </div>
          );
        });
      }
      case "hash-map": {
        const { nums, target } = HASH_INPUT;
        return frames(hashMapSteps(), (s) => (
          <div className="space-y-4">
            <ArrayView
              values={nums}
              accent={accent}
              markers={s.i >= 0 ? [{ index: s.i, label: "i", color: accent }] : []}
              tone={(i) =>
                s.match !== null && (i === s.i || i === s.match)
                  ? "found"
                  : i === s.i
                    ? "active"
                    : i < s.i
                      ? "range"
                      : "dim"
              }
            />
            <div className="grid gap-3 sm:grid-cols-[auto_1fr]">
              <div className="alg-box alg-readout">
                need = <span className="alg-num">{s.need ?? "–"}</span>
                <span className="alg-note">target {target}</span>
              </div>
              <Bucket
                label="seen: value → index"
                items={s.map.map(([value, index]) => `${value} → ${index}`)}
                highlight={
                  s.match !== null ? s.map.findIndex(([, index]) => index === s.match) : undefined
                }
              />
            </div>
          </div>
        ));
      }
      case "bfs": {
        return frames(bfsSteps(), (s) => (
          <div className="space-y-4">
            <GridView cells={s.cells} scan={s.scan} current={s.current} queued={s.queue} />
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <Bucket label="queue" items={s.queue.map(([y, x]) => `(${y}, ${x})`)} />
              <div className="alg-box alg-readout">
                islands = <span className="alg-num">{s.count}</span>
              </div>
            </div>
          </div>
        ));
      }
      case "dynamic-programming": {
        return frames(dpSteps(), (s) => (
          <div className="space-y-4">
            <div>
              <p className="alg-label mb-1">houses (nums)</p>
              <ArrayView
                values={DP_INPUT}
                accent={accent}
                markers={
                  s.i && !s.done ? [{ index: s.i - 1, label: `house ${s.i}`, color: accent }] : []
                }
                tone={(i) => (s.done ? "range" : s.i !== null && i === s.i - 1 ? "active" : "dim")}
              />
            </div>
            <div>
              <p className="alg-label mb-1">dp table</p>
              <ArrayView
                values={s.dp.map((v) => v ?? "·")}
                accent={accent}
                markers={
                  s.skip !== null && s.i !== null
                    ? [
                        { index: s.i - 1, label: "skip", color: "#00c4ff" },
                        { index: s.i - 2, label: "take", color: "#ffb020" },
                      ]
                    : []
                }
                tone={(i) =>
                  s.done && i === s.dp.length - 1
                    ? "found"
                    : i === s.i
                      ? "active"
                      : s.dp[i] === null
                        ? "dim"
                        : "range"
                }
              />
            </div>
            <Readout
              items={[
                ["skip", s.skip ?? "–"],
                ["take", s.take ?? "–"],
              ]}
            />
          </div>
        ));
      }
      case "backtracking": {
        const nums = BACKTRACK_INPUT;
        return frames(backtrackSteps(), (s) => (
          <div className="space-y-4">
            <ArrayView
              values={nums}
              accent={accent}
              markers={
                s.start < nums.length && s.action !== "done"
                  ? [{ index: s.start, label: "start", color: "#ffb020" }]
                  : []
              }
              tone={(i) =>
                s.action === "pop" && i === s.touched
                  ? "drop"
                  : i === s.touched
                    ? "active"
                    : s.path.includes(i)
                      ? "found"
                      : i >= s.start
                        ? "range"
                        : "dim"
              }
            />
            <div className="grid gap-3 sm:grid-cols-[auto_1fr]">
              <div className="alg-box alg-readout">
                path = <span className="alg-num">[{s.path.map((i) => nums[i]).join(", ")}]</span>
              </div>
              <Bucket
                label={`result (${s.result.length})`}
                items={s.result.map((subset) => `[${subset.join(", ")}]`)}
                highlight={s.action === "record" ? s.result.length - 1 : undefined}
              />
            </div>
          </div>
        ));
      }
      case "heap": {
        const { nums, k } = HEAP_INPUT;
        return frames(heapSteps(), (s) => (
          <div className="space-y-4">
            <ArrayView
              values={nums}
              accent={accent}
              markers={s.i >= 0 && !s.done ? [{ index: s.i, label: "num", color: accent }] : []}
              tone={(i) =>
                s.done && nums[i] === s.heap[0]
                  ? "found"
                  : i === s.i && !s.done
                    ? "active"
                    : i < s.i
                      ? "range"
                      : "dim"
              }
            />
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <HeapView values={s.heap} accent={accent} />
              <div className="alg-box alg-readout flex-col gap-2">
                <span>
                  k = <span className="alg-num">{k}</span>
                </span>
                <span>
                  popped = <span className="alg-num is-pop">{s.popped ?? "–"}</span>
                </span>
              </div>
            </div>
          </div>
        ));
      }
      case "monotonic-stack": {
        const temps = MONO_INPUT;
        return frames(monoStackSteps(), (s) => (
          <div className="space-y-4">
            <div>
              <p className="alg-label mb-1">temperatures</p>
              <ArrayView
                values={temps}
                accent={accent}
                markers={s.i >= 0 && !s.done ? [{ index: s.i, label: "i", color: accent }] : []}
                tone={(i) =>
                  i === s.popped
                    ? "found"
                    : i === s.i && !s.done
                      ? "active"
                      : s.stack.includes(i)
                        ? "range"
                        : "dim"
                }
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-[auto_1fr]">
              <div className="alg-box alg-stack">
                <span className="alg-label">stack</span>
                {s.stack.map((j, depth) => (
                  <span
                    key={j}
                    className={cn("alg-stack-item", depth === s.stack.length - 1 && "is-top")}
                  >
                    {temps[j]} · d{j}
                  </span>
                ))}
              </div>
              <div>
                <p className="alg-label mb-1">answer (days to wait)</p>
                <ArrayView
                  values={s.answer.map((v) => v ?? "·")}
                  accent={accent}
                  tone={(i) => (i === s.popped ? "found" : s.answer[i] === null ? "dim" : "range")}
                />
              </div>
            </div>
          </div>
        ));
      }
      case "union-find": {
        const edges = UNION_INPUT;
        return frames(unionFindSteps(), (s) => {
          const root = (x: number): number => (s.parent[x] === x ? x : root(s.parent[x]));
          const groups = new Map<number, number[]>();
          for (let x = 1; x < s.parent.length; x++) {
            groups.set(root(x), [...(groups.get(root(x)) ?? []), x]);
          }
          return (
            <div className="space-y-4">
              <Bucket
                label="edges"
                items={edges.map(([a, b]) => `[${a}, ${b}]`)}
                highlight={s.edge >= 0 ? s.edge : undefined}
              />
              <div>
                <p className="alg-label mb-1">parent[x] (x below)</p>
                <ArrayView
                  values={s.parent}
                  accent={accent}
                  tone={(x) =>
                    x === 0
                      ? "dim"
                      : s.found && s.active.includes(x)
                        ? "found"
                        : s.active.includes(x)
                          ? "active"
                          : s.parent[x] === x
                            ? "range"
                            : "normal"
                  }
                />
              </div>
              <Bucket
                label="groups (by root)"
                items={[...groups].map(([r, members]) => `root ${r}: {${members.join(", ")}}`)}
              />
            </div>
          );
        });
      }
    }
  }, [pattern.slug, accent]);
}

/**
 * The interactive part of a pattern page: the picture for the current step, a caption, playback
 * controls, and the solution code with the line that just ran highlighted.
 */
export function PatternLab({ pattern }: { pattern: Pattern }) {
  const frames = useFrames(pattern);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const last = frames.length - 1;
  const frame = frames[index];

  useEffect(() => {
    if (!playing) return;
    if (index >= last) {
      const id = window.setTimeout(() => setPlaying(false), 0);
      return () => window.clearTimeout(id);
    }
    const id = window.setTimeout(() => setIndex((i) => Math.min(last, i + 1)), SPEEDS[speed].ms);
    return () => window.clearTimeout(id);
  }, [playing, index, last, speed]);

  const go = (next: number) => {
    setPlaying(false);
    setIndex(Math.max(0, Math.min(last, next)));
  };

  const togglePlay = () => {
    if (index >= last) setIndex(0);
    setPlaying((value) => !value);
  };

  return (
    <div
      className="alg-lab"
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") go(index + 1);
        if (event.key === "ArrowLeft") go(index - 1);
      }}
    >
      <div className="alg-stage">
        <div className="flex-1">{frame.view}</div>

        <p aria-live="polite" className="alg-caption" style={{ borderLeftColor: pattern.accent }}>
          {frame.caption}
        </p>

        <div className="alg-controls">
          <ControlButton label="Restart" onClick={() => go(0)} disabled={index === 0}>
            ⏮
          </ControlButton>
          <ControlButton label="Previous step" onClick={() => go(index - 1)} disabled={index === 0}>
            ◀
          </ControlButton>
          <button
            type="button"
            onClick={togglePlay}
            className="alg-play"
            style={{ background: pattern.accent }}
          >
            {playing ? "❚❚ Pause" : index >= last ? "↻ Replay" : "▶ Play"}
          </button>
          <ControlButton label="Next step" onClick={() => go(index + 1)} disabled={index >= last}>
            ▶
          </ControlButton>
          <div className="alg-speed">
            {SPEEDS.map((option, i) => (
              <button
                key={option.label}
                type="button"
                onClick={() => setSpeed(i)}
                aria-pressed={speed === i}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="alg-scrub">
          <input
            type="range"
            min={0}
            max={last}
            value={index}
            onChange={(event) => go(Number(event.target.value))}
            aria-label="Step"
            style={{ accentColor: pattern.accent }}
          />
          <output>
            {index + 1} / {frames.length}
          </output>
        </div>
      </div>

      <div className="alg-code">
        <header>
          <i style={{ background: "#ff5f57" }} />
          <i style={{ background: "#febc2e" }} />
          <i style={{ background: "#28c840" }} />
          <span>solution.ts</span>
        </header>
        <pre>
          {pattern.code.map((code, line) => (
            <div
              key={line}
              className={cn("ln", line === frame.line && "is-on")}
              style={line === frame.line ? { borderLeftColor: pattern.accent } : undefined}
            >
              <span className="no">{line + 1}</span>
              <code>{code}</code>
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}

function ControlButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="alg-round"
    >
      {children}
    </button>
  );
}
