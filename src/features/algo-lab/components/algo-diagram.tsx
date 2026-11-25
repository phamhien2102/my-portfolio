"use client";

import { useEffect, useRef, type CSSProperties } from "react";

import { cn } from "@/lib/cn";

import type { AlgoScene, Cell, Disc, Edge, Frame, Item, Label, Pointer, Tone } from "../lib/types";

const VIEW_W = 640;
const VIEW_H = 560;

/**
 * True isometric projection. The layout coordinates of a scene (x, y) are a plan view: u = x runs
 * down and to the right, v = y runs down and to the left, and z lifts straight up the screen.
 * One layout unit along either axis is one pixel on screen, so spacing authored in the plan is kept.
 */
const COS = Math.cos(Math.PI / 6);
const SIN = 0.5;

const CELL_W = 52;
const CELL_H = 46;
const DISC_R = 20;
/** How thick a round puck is. */
const DISC_T = 14;

const project = (u: number, v: number, z = 0): [number, number] => [
  (u - v) * COS,
  (u + v) * SIN - z,
];

const f = (n: number) => Math.round(n * 100) / 100;
const pt = (u: number, v: number, z: number) => {
  const [x, y] = project(u, v, z);
  return `${f(x)} ${f(y)}`;
};

/** The matrix that lays text flat on the floor: its baseline runs along u, its top points toward -v. */
const FLAT = `matrix(${f(COS)} ${SIN} ${f(-COS)} ${SIN} 0 0)`;

/**
 * `d` is a CSS property in Chrome and Firefox, so a path given through `style` morphs between steps;
 * the `d` attribute next to it is the fallback for engines that do not animate it.
 */
const morph = (d: string) => ({ d: `path("${d}")` }) as unknown as CSSProperties;

/** A footprint on the floor and how tall the block stands on it. */
interface Box {
  u: number;
  v: number;
  /** Half the footprint along u and along v (the radius for a round one). */
  hu: number;
  hv: number;
  z: number;
  round: boolean;
}

const heightOf = (w: number, h: number) => Math.min(Math.max(Math.min(w, h) * 0.5, 14), 26);

/** The outline of an item that edges and pointers can attach to. */
function boxOf(item: Item): Box | undefined {
  if (item.t === "cell") {
    const w = item.w ?? CELL_W;
    const h = item.h ?? CELL_H;
    // A bar is anchored on its bottom edge and grows up the screen; the rest are slabs on the floor.
    if (item.base) {
      return { u: item.x, v: item.y, hu: w / 2, hv: Math.min(w, CELL_H) / 2, z: h, round: false };
    }
    return { u: item.x, v: item.y, hu: w / 2, hv: h / 2, z: heightOf(w, h), round: false };
  }
  if (item.t === "disc") {
    const r = item.r ?? DISC_R;
    return { u: item.x, v: item.y, hu: r, hv: r, z: DISC_T, round: true };
  }
  return undefined;
}

/** Where the line from a footprint toward a point leaves its outline, `gap` further out. */
function leave(from: Box, toward: { u: number; v: number }, gap = 3) {
  const du = toward.u - from.u;
  const dv = toward.v - from.v;
  const len = Math.hypot(du, dv) || 1;
  const t = from.round
    ? from.hu / len
    : Math.min(from.hu / (Math.abs(du) || 1e-6), from.hv / (Math.abs(dv) || 1e-6));
  return { u: from.u + du * t + (du / len) * gap, v: from.v + dv * t + (dv / len) * gap };
}

const PILL_H = 23;
const pillWidth = (text: string) => text.length * 7.2 + 24;

/** Where a pointer's dot sits on its target, and where its label hangs. All in screen space. */
function pointerGeom(p: Pointer, boxes: Map<string, Box>) {
  const target =
    typeof p.at === "string"
      ? boxes.get(p.at)
      : ({ u: p.at.x, v: p.at.y, hu: 0, hv: 0, z: 0, round: false } satisfies Box);
  if (!target) return undefined;
  const side = p.side ?? "below";
  const [cx, cy] = project(target.u, target.v);
  const rx = target.round ? target.hu * Math.SQRT2 * COS : (target.hu + target.hv) * COS;

  let ax = cx;
  let ay = cy - target.z;
  let dx = 0;
  let dy = 0;
  if (side === "above") dy = -1;
  else if (side === "below") {
    // The front corner at the foot of the block.
    ax = cx + (target.round ? 0 : (target.hu - target.hv) * COS);
    ay = cy + (target.round ? target.hu * Math.SQRT1_2 : (target.hu + target.hv) * SIN);
    dy = 1;
  } else {
    // The outermost vertical edge, half way up.
    ax = cx + (side === "right" ? rx : -rx);
    ay = cy - target.z / 2;
    dx = side === "right" ? 1 : -1;
  }
  const far = 26;
  const pillW = pillWidth(p.text);
  return {
    ax,
    ay,
    dx,
    dy,
    far,
    pillW,
    px: dx * (far + (dy === 0 ? pillW / 2 : 0)),
    py: dy * (far + (dx === 0 ? 12 : 0)),
  };
}

/** A camera that frames every item, applied as a CSS transform so it glides between steps. */
function fit(items: Item[], boxes: Map<string, Box>) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  const add = (x: number, y: number) => {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  };
  const addGround = (u: number, v: number, z = 0) => add(...project(u, v, z));

  for (const item of items) {
    const b = boxes.get(item.id);
    if (b) {
      for (const du of [-1, 1])
        for (const dv of [-1, 1]) {
          addGround(b.u + du * b.hu, b.v + dv * b.hv);
          addGround(b.u + du * b.hu, b.v + dv * b.hv, b.z);
        }
      if ((item.t === "cell" || item.t === "disc") && item.sub) addGround(b.u, b.v + b.hv + 18);
    } else if (item.t === "label") {
      const [x, y] = project(item.x, item.y);
      add(x - item.text.length * 3.4, y - 12);
      add(x + item.text.length * 3.4, y + 6);
    } else if (item.t === "frame") {
      addGround(item.x, item.y - (item.text ? 14 : 0));
      addGround(item.x + item.w, item.y);
      addGround(item.x + item.w, item.y + item.h);
      addGround(item.x, item.y + item.h);
    } else if (item.t === "pointer") {
      const g = pointerGeom(item, boxes);
      if (g) {
        add(g.ax + g.px - g.pillW / 2, g.ay + g.py - PILL_H / 2);
        add(g.ax + g.px + g.pillW / 2, g.ay + g.py + PILL_H / 2);
        add(g.ax, g.ay);
      }
    }
  }
  if (!Number.isFinite(minX)) return { x: 0, y: 0, scale: 1 };
  const pad = 26;
  const w = maxX - minX + pad * 2;
  const h = maxY - minY + pad * 2;
  const scale = Math.min(Math.max(Math.min(VIEW_W / w, VIEW_H / h), 0.5), 1.8);
  return {
    scale,
    x: VIEW_W / 2 - ((minX + maxX) / 2) * scale,
    y: VIEW_H / 2 - ((minY + maxY) / 2) * scale,
  };
}

/** The tones whose sides are drawn with stripes (a ghost slot has none). */
const HATCHED = ["plain", "active", "found", "done", "warn", "mark", "muted"] as const;

const textSize = (text: string, base = 15) =>
  text.length <= 3 ? base : text.length <= 6 ? base - 3 : text.length <= 10 ? base - 5 : base - 6;

/** The footprint of a block on the floor, as a closed path relative to its centre. */
const footprint = (b: Box, grow = 0) => {
  const a = b.hu + grow;
  const c = b.hv + grow;
  if (b.round) {
    const rx = a * Math.SQRT2 * COS;
    const ry = a * Math.SQRT1_2;
    return `M${f(-rx)} 0A${f(rx)} ${f(ry)} 0 1 0 ${f(rx)} 0A${f(rx)} ${f(ry)} 0 1 0 ${f(-rx)} 0Z`;
  }
  return `M${pt(-a, -c, 0)}L${pt(a, -c, 0)}L${pt(a, c, 0)}L${pt(-a, c, 0)}Z`;
};

/** Tones that read as "set aside": a block that takes one of them dips instead of swelling. */
const SETTLED = new Set<Tone>(["muted", "done", "ghost"]);

interface Motion {
  frames: Keyframe[];
  duration: number;
}

/**
 * Rest, then up to a lift and a scale, held there for a moment so the size change can be seen, then
 * back to rest. `at` is where the peak is reached and `hold` how long it stays, both as a share of
 * the beat.
 */
const beat = (lift: number, scale: number, at = 0.3, hold = 0.25): Keyframe[] => [
  { transform: "translateY(0px) scale(1)" },
  { transform: `translateY(${-lift}px) scale(${scale})`, offset: at },
  { transform: `translateY(${-lift}px) scale(${scale})`, offset: at + hold },
  { transform: "translateY(0px) scale(1)" },
];

/** How far a block swells when it is highlighted, and how far it shrinks when it is set aside. */
const SWELL = 1.45;
const SHRINK = 0.55;

/**
 * How a block should move when a step changes it, or nothing if it is as it was. A block that came
 * in grows from nothing, one that moved hops over the gap it slides across, one that was just
 * highlighted swells, one that was set aside dips, and one whose value changed ticks.
 */
function motionFor(before: Item | undefined, item: Cell | Disc): Motion | undefined {
  const tone: Tone = item.tone ?? "plain";
  if (!before || (before.t !== "cell" && before.t !== "disc")) {
    if (tone === "ghost") return undefined;
    return {
      duration: 900,
      frames: [
        { transform: "translateY(0px) scale(0)", opacity: 0 },
        { transform: "translateY(0px) scale(1.3)", opacity: 1, offset: 0.55 },
        { transform: "translateY(0px) scale(1.3)", opacity: 1, offset: 0.7 },
        { transform: "translateY(0px) scale(1)", opacity: 1 },
      ],
    };
  }
  const toneChanged = (before.tone ?? "plain") !== tone;
  const moved = before.x !== item.x || before.y !== item.y;
  const scale = toneChanged
    ? SETTLED.has(tone)
      ? SHRINK
      : SWELL
    : item.text !== before.text
      ? 1.25
      : 1;

  if (moved) return { duration: 1000, frames: beat(34, scale, 0.4, 0.2) };
  if (toneChanged) return { duration: 900, frames: beat(0, scale) };
  if (scale !== 1) return { duration: 700, frames: beat(0, scale) };
  return undefined;
}

/**
 * The stage for an algorithm lesson, drawn as an isometric diagram. Every item has an id, and React
 * keeps the same SVG group for the same id from one step to the next, so a moved block slides, a
 * recoloured one fades, and a pointer glides to its new target (CSS transitions do the work). On top
 * of that, each block that a step changes gets a beat of its own (see `motionFor`), played with the
 * Web Animations API on an inner group so it never fights the slide.
 */
export function AlgoDiagram({ scene, title }: { scene: AlgoScene; title: string }) {
  const bodies = useRef(new Map<string, SVGGElement>());
  const previous = useRef<Map<string, Item> | null>(null);

  useEffect(() => {
    const before = previous.current;
    previous.current = new Map(scene.items.map((i) => [i.id, i]));
    // The first scene just appears; a later one animates what changed from the one before.
    if (!before || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    for (const item of scene.items) {
      if (item.t !== "cell" && item.t !== "disc") continue;
      const el = bodies.current.get(item.id);
      const motion = motionFor(before.get(item.id), item);
      if (!el || !motion) continue;
      el.getAnimations().forEach((a) => a.cancel());
      el.animate(motion.frames, { duration: motion.duration, easing: "ease-in-out" });
    }
  }, [scene]);

  const bodyRef = (id: string) => (el: SVGGElement | null) => {
    if (el) bodies.current.set(id, el);
    else bodies.current.delete(id);
  };

  const boxes = new Map<string, Box>();
  for (const item of scene.items) {
    const b = boxOf(item);
    if (b) boxes.set(item.id, b);
  }
  const camera = fit(scene.items, boxes);

  const edges = scene.items.filter((i): i is Edge => i.t === "edge");
  const frames = scene.items.filter((i): i is Frame => i.t === "frame");
  // Painted back to front: the further down the plan, the nearer the viewer.
  const blocks = scene.items
    .filter((i): i is Cell | Disc => i.t === "cell" || i.t === "disc")
    .sort((p, q) => {
      const bp = boxes.get(p.id)!;
      const bq = boxes.get(q.id)!;
      return bp.u + bp.v - (bq.u + bq.v) || bp.z - bq.z;
    });
  const pointers = scene.items.filter((i): i is Pointer => i.t === "pointer");
  const labels = scene.items.filter((i): i is Label => i.t === "label");

  return (
    <svg
      className="al-diagram"
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={title}
    >
      <defs>
        {(["plain", "active", "found", "warn", "muted"] as const).map((tone) => (
          <marker
            key={tone}
            id={`al-arrow-${tone}`}
            viewBox="0 0 10 10"
            refX="8.4"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
            markerUnits="strokeWidth"
          >
            <path d="M1,1.2 L9,5 L1,8.8 Z" className={`al-arrowhead tone-${tone}`} />
          </marker>
        ))}
        {HATCHED.map((tone) => (
          <pattern
            key={tone}
            id={`al-hatch-${tone}`}
            width="6"
            height="6"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-45)"
          >
            <rect className={`al-hatch-bg tone-${tone}`} width="6" height="6" />
            <rect className={`al-hatch-bar tone-${tone}`} width="3" height="6" />
          </pattern>
        ))}
        <filter id="al-blur" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>
      <g
        className="al-camera"
        style={{ transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})` }}
      >
        {frames.map((fr) => {
          const d = `M${pt(fr.x, fr.y, 0)}L${pt(fr.x + fr.w, fr.y, 0)}L${pt(fr.x + fr.w, fr.y + fr.h, 0)}L${pt(fr.x, fr.y + fr.h, 0)}Z`;
          const [tx, ty] = project(fr.x + 10, fr.y - 7);
          return (
            <g key={fr.id} className="al-item">
              <path
                className={cn(
                  "al-frame",
                  `tone-${fr.tone ?? "plain"}`,
                  fr.dashed !== false && "is-dashed",
                )}
                d={d}
                style={morph(d)}
              />
              {fr.text && (
                <text className="al-frame-text" transform={`translate(${f(tx)} ${f(ty)}) ${FLAT}`}>
                  {fr.text}
                </text>
              )}
            </g>
          );
        })}

        {/* Soft shadows on the floor, one blur for the whole layer. */}
        <g filter="url(#al-blur)">
          {blocks.map((item) => {
            const b = boxes.get(item.id)!;
            if (item.tone === "ghost") return null;
            const [x, y] = project(b.u, b.v);
            const d = footprint(b, 2);
            return (
              <g
                key={item.id}
                className="al-item"
                style={{ transform: `translate(${f(x + 7)}px, ${f(y + 5)}px)` }}
              >
                <path className="al-shadow" d={d} style={morph(d)} />
              </g>
            );
          })}
        </g>

        {edges.map((e) => {
          const a = boxes.get(e.from);
          const b = boxes.get(e.to);
          if (!a || !b) return null;
          // Lines run along the floor and meet the foot of each block.
          const p = leave(a, b);
          const q = leave(b, a);
          const [x1, y1] = project(p.u, p.v, 1);
          const [x2, y2] = project(q.u, q.v, 1);
          const tone = e.tone ?? "plain";
          const arrow = e.arrow ?? "end";
          const url = `url(#al-arrow-${tone})`;
          return (
            <g key={e.id} className="al-item">
              <line
                className={cn("al-edge", `tone-${tone}`, e.dashed && "is-dashed")}
                x1={f(x1)}
                y1={f(y1)}
                x2={f(x2)}
                y2={f(y2)}
                markerEnd={arrow !== "none" ? url : undefined}
                markerStart={arrow === "both" ? url : undefined}
              />
              {e.label && (
                <g transform={`translate(${f((x1 + x2) / 2)} ${f((y1 + y2) / 2)})`}>
                  <rect
                    className="al-edge-tag"
                    x={-(e.label.length * 3.1 + 8)}
                    y={-8}
                    width={e.label.length * 6.2 + 16}
                    height={16}
                    rx={8}
                  />
                  <text className="al-edge-text" y={3.5} textAnchor="middle">
                    {e.label}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {blocks.map((item) => {
          const b = boxes.get(item.id)!;
          const tone: Tone = item.tone ?? "plain";
          const hatch = tone === "ghost" ? "none" : `url(#al-hatch-${tone})`;
          const [x, y] = project(b.u, b.v);
          const H = b.z;

          if (item.t === "disc") {
            // A puck: a light top that carries the text, a shaded left half and a striped right half.
            const rx = b.hu * Math.SQRT2 * COS;
            const ry = b.hu * Math.SQRT1_2;
            const left = `M${f(-rx)} ${-H}L${f(-rx)} 0A${f(rx)} ${f(ry)} 0 0 0 0 ${f(ry)}L0 ${-H}Z`;
            const right = `M0 ${-H}L0 ${f(ry)}A${f(rx)} ${f(ry)} 0 0 0 ${f(rx)} 0L${f(rx)} ${-H}Z`;
            const size = textSize(item.text, 13);
            return (
              <g
                key={item.id}
                className={cn("al-item", `tone-${tone}`)}
                style={{ transform: `translate(${f(x)}px, ${f(y)}px)` }}
              >
                <g ref={bodyRef(item.id)} className="al-body">
                  <path className={cn("al-left", `tone-${tone}`)} d={left} />
                  <path className="al-right" d={right} fill={hatch} />
                  <ellipse
                    className={cn("al-top", `tone-${tone}`)}
                    cx={0}
                    cy={-H}
                    rx={f(rx)}
                    ry={f(ry)}
                  />
                  <text
                    className="al-text"
                    transform={`translate(0 ${-H}) ${FLAT}`}
                    y={size / 3 + 0.5}
                    textAnchor="middle"
                    fontSize={size}
                  >
                    {item.text}
                  </text>
                </g>
                {item.sub && (
                  <text
                    className="al-sub"
                    transform={`translate(${f(-(b.hu + 9) * COS)} ${f((b.hu + 9) * SIN)}) ${FLAT}`}
                    textAnchor="middle"
                  >
                    {item.sub}
                  </text>
                )}
              </g>
            );
          }

          const a = b.hu;
          const c = b.hv;
          const top = `M${pt(-a, -c, H)}L${pt(a, -c, H)}L${pt(a, c, H)}L${pt(-a, c, H)}Z`;
          const leftFace = `M${pt(-a, c, H)}L${pt(a, c, H)}L${pt(a, c, 0)}L${pt(-a, c, 0)}Z`;
          const rightFace = `M${pt(a, c, H)}L${pt(a, -c, H)}L${pt(a, -c, 0)}L${pt(a, c, 0)}Z`;
          const crease = `M${pt(-a, c, H)}L${pt(a, c, H)}L${pt(a, -c, H)}`;
          const size = textSize(item.text);
          return (
            <g
              key={item.id}
              className={cn("al-item", `tone-${tone}`)}
              style={{ transform: `translate(${f(x)}px, ${f(y)}px)` }}
            >
              <g ref={bodyRef(item.id)} className="al-body">
                <path
                  className={cn("al-left", `tone-${tone}`)}
                  d={leftFace}
                  style={morph(leftFace)}
                />
                <path className="al-right" d={rightFace} style={morph(rightFace)} fill={hatch} />
                <path className={cn("al-top", `tone-${tone}`)} d={top} style={morph(top)} />
                <path className="al-crease" d={crease} style={morph(crease)} />
                <text
                  className="al-text"
                  transform={`translate(0 ${-H}) ${FLAT}`}
                  y={size / 3 + 1}
                  textAnchor="middle"
                  fontSize={size}
                >
                  {item.text}
                </text>
              </g>
              {item.sub && (
                <text
                  className="al-sub"
                  transform={`translate(${f(-(c + 9) * COS)} ${f((c + 9) * SIN)}) ${FLAT}`}
                  textAnchor="middle"
                >
                  {item.sub}
                </text>
              )}
            </g>
          );
        })}

        {labels.map((l) => {
          const [x, y] = project(l.x, l.y);
          return (
            <text
              key={l.id}
              className={cn("al-label", `tone-${l.tone ?? "ink"}`)}
              style={{ transform: `translate(${f(x)}px, ${f(y)}px)` }}
              textAnchor={l.anchor ?? "middle"}
              fontSize={l.size ?? 12}
              fontWeight={l.weight ?? 700}
            >
              {l.text}
            </text>
          );
        })}

        {pointers.map((p) => {
          const g = pointerGeom(p, boxes);
          if (!g) return null;
          const tone = p.tone ?? "plain";
          return (
            <g
              key={p.id}
              className="al-item"
              style={{ transform: `translate(${f(g.ax)}px, ${f(g.ay)}px)` }}
            >
              <line
                className={cn("al-pointer-line", `tone-${tone}`)}
                x1={0}
                y1={0}
                x2={g.dx * g.far}
                y2={g.dy * g.far}
              />
              <circle className={cn("al-pointer-dot", `tone-${tone}`)} cx={0} cy={0} r={3.6} />
              <g transform={`translate(${f(g.px)} ${f(g.py)})`}>
                <rect
                  className={cn("al-pill-face", `tone-${tone}`)}
                  x={-g.pillW / 2}
                  y={-PILL_H / 2}
                  width={g.pillW}
                  height={PILL_H}
                  rx={8}
                />
                <text className="al-pill-text" y={4} textAnchor="middle">
                  {p.text}
                </text>
              </g>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
