import { cn } from "@/lib/cn";

import type { AlgoScene, Cell, Disc, Edge, Frame, Item, Label, Pointer, Tone } from "../lib/types";

const VIEW_W = 640;
const VIEW_H = 372;

interface Box {
  cx: number;
  cy: number;
  /** Half width and half height of the outline. */
  hw: number;
  hh: number;
  round: boolean;
  /** The block has a caption (its index) under it, which a pointer from below must clear. */
  sub?: boolean;
}

const CELL_W = 52;
const CELL_H = 46;
const DISC_R = 20;

/** The outline of an item that edges and pointers can attach to. */
function boxOf(item: Item): Box | undefined {
  if (item.t === "cell") {
    const w = item.w ?? CELL_W;
    const h = item.h ?? CELL_H;
    return {
      cx: item.x,
      cy: item.base ? item.y - h / 2 : item.y,
      hw: w / 2,
      hh: h / 2,
      round: false,
      sub: !!item.sub,
    };
  }
  if (item.t === "disc") {
    const r = item.r ?? DISC_R;
    return { cx: item.x, cy: item.y, hw: r, hh: r, round: true, sub: !!item.sub };
  }
  return undefined;
}

/** Where the line from a box toward a point leaves the box's outline, `gap` further out. */
function leave(from: Box, toward: { x: number; y: number }, gap = 3) {
  const dx = toward.x - from.cx;
  const dy = toward.y - from.cy;
  const len = Math.hypot(dx, dy) || 1;
  const t = from.round
    ? from.hw / len
    : Math.min(from.hw / (Math.abs(dx) || 1e-6), from.hh / (Math.abs(dy) || 1e-6));
  return { x: from.cx + dx * t + (dx / len) * gap, y: from.cy + dy * t + (dy / len) * gap };
}

/** A camera that frames every item, applied as a CSS transform so it glides between steps. */
function fit(items: Item[], boxes: Map<string, Box>) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  const grow = (x0: number, y0: number, x1: number, y1: number) => {
    minX = Math.min(minX, x0);
    maxX = Math.max(maxX, x1);
    minY = Math.min(minY, y0);
    maxY = Math.max(maxY, y1);
  };
  for (const item of items) {
    const b = boxes.get(item.id);
    if (b)
      grow(
        b.cx - b.hw,
        b.cy - b.hh,
        b.cx + b.hw,
        b.cy + b.hh + (item.t === "cell" && item.sub ? 20 : 0),
      );
    else if (item.t === "label")
      grow(
        item.x - item.text.length * 3.4,
        item.y - 12,
        item.x + item.text.length * 3.4,
        item.y + 6,
      );
    else if (item.t === "frame")
      grow(item.x, item.y - (item.text ? 12 : 0), item.x + item.w, item.y + item.h);
    else if (item.t === "pointer") {
      const t = typeof item.at === "string" ? boxes.get(item.at) : undefined;
      const cx = t ? t.cx : typeof item.at === "string" ? 0 : item.at.x;
      const cy = t ? t.cy : typeof item.at === "string" ? 0 : item.at.y;
      if (t || typeof item.at !== "string") grow(cx - 40, cy - 70, cx + 40, cy + 80);
    }
  }
  if (!Number.isFinite(minX)) return { x: 0, y: 0, scale: 1 };
  const pad = 22;
  const w = maxX - minX + pad * 2;
  const h = maxY - minY + pad * 2;
  const scale = Math.min(Math.max(Math.min(VIEW_W / w, VIEW_H / h), 0.5), 1.5);
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

/**
 * The stage for an algorithm lesson. Every item has an id, and React keeps the same SVG group for
 * the same id from one step to the next, so a moved cell slides, a recoloured one fades, and a
 * pointer glides to its new target (CSS transitions do the work; no timers).
 */
export function AlgoDiagram({ scene, title }: { scene: AlgoScene; title: string }) {
  const boxes = new Map<string, Box>();
  for (const item of scene.items) {
    const b = boxOf(item);
    if (b) boxes.set(item.id, b);
  }
  const camera = fit(scene.items, boxes);

  const edges = scene.items.filter((i): i is Edge => i.t === "edge");
  const frames = scene.items.filter((i): i is Frame => i.t === "frame");
  const blocks = scene.items.filter((i): i is Cell | Disc => i.t === "cell" || i.t === "disc");
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
      </defs>
      <g
        className="al-camera"
        style={{ transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})` }}
      >
        {frames.map((f) => (
          <g key={f.id} className="al-item">
            <rect
              className={cn(
                "al-frame",
                `tone-${f.tone ?? "plain"}`,
                f.dashed !== false && "is-dashed",
              )}
              style={{ x: f.x, y: f.y, width: f.w, height: f.h }}
              rx={12}
            />
            {f.text && (
              <text className="al-frame-text" x={f.x + 10} y={f.y - 6}>
                {f.text}
              </text>
            )}
          </g>
        ))}

        {edges.map((e) => {
          const a = boxes.get(e.from);
          const b = boxes.get(e.to);
          if (!a || !b) return null;
          const p = leave(a, { x: b.cx, y: b.cy });
          const q = leave(b, { x: a.cx, y: a.cy });
          const tone = e.tone ?? "plain";
          const arrow = e.arrow ?? "end";
          const url = `url(#al-arrow-${tone})`;
          return (
            <g key={e.id} className="al-item">
              <line
                className={cn("al-edge", `tone-${tone}`, e.dashed && "is-dashed")}
                x1={p.x}
                y1={p.y}
                x2={q.x}
                y2={q.y}
                markerEnd={arrow !== "none" ? url : undefined}
                markerStart={arrow === "both" ? url : undefined}
              />
              {e.label && (
                <g transform={`translate(${(p.x + q.x) / 2} ${(p.y + q.y) / 2})`}>
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
          if (item.t === "disc") {
            // A puck: a light top, and a hatched side underneath.
            const r = b.hw;
            const ry = r * 0.55;
            const thick = r * 0.55;
            return (
              <g
                key={item.id}
                className={cn("al-item", `tone-${tone}`)}
                style={{ transform: `translate(${b.cx}px, ${b.cy - thick / 2}px)` }}
              >
                <path
                  className="al-side"
                  fill={hatch}
                  d={`M${-r} 0 L${-r} ${thick} A${r} ${ry} 0 0 0 ${r} ${thick} L${r} 0 Z`}
                />
                <ellipse className={cn("al-top", `tone-${tone}`)} cx={0} cy={0} rx={r} ry={ry} />
                <text
                  className="al-text"
                  y={textSize(item.text, 13) / 3 + 0.5}
                  textAnchor="middle"
                  fontSize={textSize(item.text, 13)}
                >
                  {item.text}
                </text>
                {item.sub && (
                  <text className="al-sub" y={thick + ry + 13} textAnchor="middle">
                    {item.sub}
                  </text>
                )}
              </g>
            );
          }
          const w = b.hw * 2;
          const h = b.hh * 2;
          const baseY = item.base ? item.y : b.cy;
          // A box seen slightly from the side and above: the front face keeps the layout rectangle,
          // the top and the right side lean back and up.
          const depth = Math.min(Math.max(w * 0.2, 8), 14);
          const sy = depth * 0.6;
          const x0 = -w / 2;
          const x1 = w / 2;
          const y0 = item.base ? -h : -h / 2;
          const y1 = y0 + h;
          return (
            <g
              key={item.id}
              className={cn("al-item", `tone-${tone}`)}
              style={{ transform: `translate(${b.cx}px, ${baseY}px)` }}
            >
              <polygon
                className="al-side"
                fill={hatch}
                points={`${x1},${y0} ${x1 + depth},${y0 - sy} ${x1 + depth},${y1 - sy} ${x1},${y1}`}
              />
              <polygon
                className={cn("al-top", `tone-${tone}`)}
                points={`${x0},${y0} ${x1},${y0} ${x1 + depth},${y0 - sy} ${x0 + depth},${y0 - sy}`}
              />
              <rect
                className={cn("al-face", `tone-${tone}`)}
                style={{ width: w, height: h, x: x0, y: y0 }}
                rx={3}
              />
              <text
                className="al-text"
                y={item.base ? y0 + Math.min(h, 40) / 2 + 5 : textSize(item.text) / 3 + 1}
                textAnchor="middle"
                fontSize={textSize(item.text)}
              >
                {item.text}
              </text>
              {item.sub && (
                <text className="al-sub" y={y1 + 16} textAnchor="middle">
                  {item.sub}
                </text>
              )}
            </g>
          );
        })}

        {labels.map((l) => (
          <text
            key={l.id}
            className={cn("al-label", `tone-${l.tone ?? "ink"}`)}
            style={{ transform: `translate(${l.x}px, ${l.y}px)` }}
            textAnchor={l.anchor ?? "middle"}
            fontSize={l.size ?? 12}
            fontWeight={l.weight ?? 700}
          >
            {l.text}
          </text>
        ))}

        {pointers.map((p) => {
          const t = typeof p.at === "string" ? boxes.get(p.at) : undefined;
          if (typeof p.at === "string" && !t) return null;
          const side = p.side ?? "below";
          const target: Box = t ?? {
            cx: (p.at as { x: number }).x,
            cy: (p.at as { y: number }).y,
            hw: 0,
            hh: 0,
            round: false,
          };
          const vertical = side === "below" || side === "above";
          const sign = side === "below" || side === "right" ? 1 : -1;
          // The dot sits on the target; the label hangs a little further out along the same axis.
          const reach =
            (vertical ? target.hh : target.hw) + 4 + (side === "below" && target.sub ? 18 : 0);
          const pillW = p.text.length * 7.2 + 24;
          const far = reach + 26;
          const dx = vertical ? 0 : sign;
          const dy = vertical ? sign : 0;
          const px = dx * (far + (vertical ? 0 : pillW / 2));
          const py = dy * (far + (vertical ? 12 : 0));
          return (
            <g
              key={p.id}
              className="al-item"
              style={{ transform: `translate(${target.cx}px, ${target.cy}px)` }}
            >
              <line
                className={cn("al-pointer-line", `tone-${p.tone ?? "plain"}`)}
                x1={dx * reach}
                y1={dy * reach}
                x2={dx * far}
                y2={dy * far}
              />
              <circle
                className={cn("al-pointer-dot", `tone-${p.tone ?? "plain"}`)}
                cx={dx * reach}
                cy={dy * reach}
                r={3.6}
              />
              <g transform={`translate(${px} ${py})`}>
                <rect
                  className={cn("al-pill-face", `tone-${p.tone ?? "plain"}`)}
                  x={-pillW / 2}
                  y={-11.5}
                  width={pillW}
                  height={23}
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
