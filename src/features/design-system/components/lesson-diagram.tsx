import type { DiagramLink, DiagramNode, Flow, NodeKind, Panel, Scene, Tag } from "../lib/types";
import { cn } from "@/lib/cn";

import { GLYPH } from "@/components/course/icons";

export const VIEW_W = 640;
export const VIEW_H = 372;

interface Point {
  x: number;
  y: number;
}

/** How a block sits on screen: where its visual centre is, and how far its edge is from it. */
interface Frame {
  dy: number;
  halfW: number;
  halfH: number;
  /** The block is a diamond (the laptop's platform) rather than a box. */
  diamond?: boolean;
}

// The laptop stands on a wide platform; every other kind is a rounded cube.
const USER: Frame = { dy: 20, halfW: 100, halfH: 54, diamond: true };
const CUBE: Frame = { dy: 4, halfW: 52, halfH: 50 };
const frameOf = (n: DiagramNode): Frame => (n.kind === "user" ? USER : CUBE);

const centre = (n: DiagramNode): Point => ({ x: n.x, y: n.y + frameOf(n).dy });

/** Where the straight line from `a` toward `b` leaves a's block. */
function edge(a: DiagramNode, b: DiagramNode, gap = 6): Point {
  const from = centre(a);
  const to = centre(b);
  const { halfW, halfH, diamond } = frameOf(a);
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const t = diamond
    ? 1 / (Math.abs(dx) / halfW + Math.abs(dy) / halfH || 1e-6)
    : Math.min(halfW / (Math.abs(dx) || 1e-6), halfH / (Math.abs(dy) || 1e-6));
  const len = Math.hypot(dx, dy) || 1;
  return { x: from.x + dx * t + (dx / len) * gap, y: from.y + dy * t + (dy / len) * gap };
}

const asTag = (value: string | Tag): Tag => (typeof value === "string" ? { text: value } : value);
/** Width of a caption pill: text at about 6.4 units a character, plus room for an icon. */
const tagBox = (tag: Tag) => tag.text.length * 6.4 + (tag.icon ? 38 : 24);
const bubbleWidth = (tag: Tag) => tagBox(tag) + 8;
const tagWidth = (text: string) => text.length * 6.2 + 22;

/**
 * A "camera" that frames whatever is on stage: it scales and shifts the scene so the visible
 * blocks, their labels and bubbles fill the view. It is applied as a CSS transform, so moving
 * from one step to the next glides instead of jumping.
 */
function fitCamera(shown: readonly DiagramNode[], scene: Scene) {
  if (!shown.length) return { x: 0, y: 0, scale: 1 };
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const n of shown) {
    const badge = scene.badges?.[n.id];
    const bubbleRaw = scene.bubbles?.[n.id];
    const bubble = bubbleRaw ? asTag(bubbleRaw) : undefined;
    const label = scene.labels?.[n.id] ?? n.label;
    const cube = n.kind !== "user";
    const half = Math.max(
      cube ? 58 : 100,
      badge ? (badge.length * 6 + 16) / 2 : 0,
      bubble ? bubbleWidth(bubble) / 2 + (cube ? 0 : 32) : 0,
      cube ? 0 : (label.length * 6.2 + 38) / 2,
    );
    minX = Math.min(minX, n.x - half);
    maxX = Math.max(maxX, n.x + half);
    minY = Math.min(minY, n.y - (bubble ? (cube ? 86 : 126) : cube ? 52 : 80));
    maxY = Math.max(maxY, n.y + (cube ? (badge ? 88 : 58) : badge ? 140 : 118));
  }
  for (const p of scene.panels ?? []) {
    const { w, h } = panelSize(p);
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x + w);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y + h);
  }
  const pad = 26;
  const w = maxX - minX + pad * 2;
  const h = maxY - minY + pad * 2;
  const scale = Math.min(Math.max(Math.min(VIEW_W / w, VIEW_H / h), 0.45), 1.6);
  return {
    scale,
    x: VIEW_W / 2 - ((minX + maxX) / 2) * scale,
    y: VIEW_H / 2 - ((minY + maxY) / 2) * scale,
  };
}

interface Props {
  nodes: readonly DiagramNode[];
  links: readonly DiagramLink[];
  scene: Scene;
  /** Changes with the step (and on Replay), so looping packets restart from their delay. */
  sceneKey: string;
  title: string;
}

/** Mix two #rrggbb colours: t = 0 gives `a`, t = 1 gives `b`. */
function mix(a: string, b: string, t: number) {
  const n = (hex: string, i: number) => Number.parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
  const c = (i: number) => Math.round(n(a, i) + (n(b, i) - n(a, i)) * t);
  return `#${[0, 1, 2].map((i) => c(i).toString(16).padStart(2, "0")).join("")}`;
}

/** The base colour of each kind of block; the gradients are worked out from it. */
const TONES = {
  orange: "#cfe3f6",
  green: "#bfe6df",
  blue: "#c4d9f0",
  yellow: "#f6dc94",
  purple: "#dccdf0",
  slab: "#e3ecf4",
} as const;

type Tone = keyof typeof TONES;

const TONE_OF: Record<NodeKind, Tone> = {
  user: "slab",
  dns: "yellow",
  server: "green",
  service: "green",
  lb: "purple",
  limiter: "purple",
  db: "blue",
  cache: "orange",
  queue: "orange",
};

const KIND_GLYPH: Record<NodeKind, string> = {
  user: "user",
  dns: "globe",
  server: "server",
  service: "server",
  lb: "layers",
  cache: "gauge",
  db: "database",
  queue: "queue",
  limiter: "shield",
};

/**
 * An SVG scene driven by a `Scene`: which blocks are on stage, which glow or are down, which
 * links carry a looping packet, and a caption under each block. Packets are SMIL animations, so
 * there is no timer in React. `prefers-reduced-motion` hides them in CSS; the links and badges
 * still say what is happening.
 */
export function LessonDiagram({ nodes, links, scene, sceneKey, title }: Props) {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const shown = new Set(scene.show);
  const hot = new Set(scene.hot);
  const down = new Set(scene.down);
  const flows = scene.flows ?? [];
  const dim = new Set(scene.dim);

  const visibleLinks = links.filter((l) => shown.has(l.from) && shown.has(l.to));

  const geometry = (link: DiagramLink, reverse = false) => {
    const a = byId.get(reverse ? link.to : link.from)!;
    const b = byId.get(reverse ? link.from : link.to)!;
    return { a: edge(a, b), b: edge(b, a) };
  };

  const camera = fitCamera(
    nodes.filter((n) => shown.has(n.id)),
    scene,
  );

  return (
    <svg
      className="ds-diagram"
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={title}
    >
      <defs>
        {(Object.keys(TONES) as Tone[]).map((tone) => {
          const base = TONES[tone];
          return (
            <g key={tone}>
              <linearGradient id={`g-${tone}-top`} x1="0" y1="0" x2="0.4" y2="1">
                <stop offset="0" stopColor={mix(base, "#ffffff", 0.55)} />
                <stop offset="1" stopColor={mix(base, "#ffffff", 0.2)} />
              </linearGradient>
              <linearGradient id={`g-${tone}-left`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={base} />
                <stop offset="1" stopColor={mix(base, "#3b6a96", 0.14)} />
              </linearGradient>
              <linearGradient id={`g-${tone}-right`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={mix(base, "#2f5170", 0.16)} />
                <stop offset="1" stopColor={mix(base, "#2f5170", 0.3)} />
              </linearGradient>
            </g>
          );
        })}
        <linearGradient id="ds-screen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E3D6F3" />
          <stop offset="1" stopColor="#C9B5E6" />
        </linearGradient>
        <linearGradient id="ds-glare" x1="0" y1="0" x2="1" y2="0.6">
          <stop offset="0" stopColor="#fff" stopOpacity=".35" />
          <stop offset=".45" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <filter id="ds-blur-sm" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
        <filter id="ds-blur-lg" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6.5" />
        </filter>
        <marker
          id="ds-arrow-muted"
          viewBox="0 0 10 10"
          refX="8.6"
          refY="5"
          markerWidth="5.2"
          markerHeight="5.2"
          orient="auto-start-reverse"
          markerUnits="strokeWidth"
        >
          <path
            d="M1,1.2 L9,5 L1,8.8 Z"
            className="ds-arrowhead-muted"
            strokeWidth="1"
            strokeLinejoin="round"
          />
        </marker>
        <marker
          id="ds-arrow"
          viewBox="0 0 10 10"
          refX="8.6"
          refY="5"
          markerWidth="5.2"
          markerHeight="5.2"
          orient="auto-start-reverse"
          markerUnits="strokeWidth"
        >
          <path
            d="M1,1.2 L9,5 L1,8.8 Z"
            className="ds-arrowhead"
            strokeWidth="1"
            strokeLinejoin="round"
          />
        </marker>
      </defs>

      <g
        className="ds-camera"
        style={{ transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})` }}
      >
        <g>
          {visibleLinks.map((link) => {
            const { a, b } = geometry(link);
            const cut = down.has(link.from) || down.has(link.to);
            const muted = dim.has(link.id);
            const arrow = muted ? "url(#ds-arrow-muted)" : "url(#ds-arrow)";
            return (
              <line
                key={link.id}
                className={cn("ds-link", cut && "is-cut", muted && "is-dim")}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                markerStart={arrow}
                markerEnd={arrow}
              />
            );
          })}
        </g>

        {/* Back to front, so a block lower on the page overlaps the one behind it. */}
        <g>
          {nodes
            .filter((n) => shown.has(n.id))
            .sort((a, b) => a.y - b.y)
            .map((n) => (
              <Block
                key={n.id}
                node={n}
                hot={hot.has(n.id)}
                down={down.has(n.id)}
                badge={scene.badges?.[n.id]}
                bubble={scene.bubbles?.[n.id] ? asTag(scene.bubbles[n.id]) : undefined}
                label={scene.labels?.[n.id]}
                sceneKey={sceneKey}
              />
            ))}
        </g>

        <g>
          {visibleLinks.flatMap((link) => {
            const raw = scene.linkLabels?.[link.id];
            if (!raw) return [];
            const tag = asTag(raw);
            const { a, b } = geometry(link);
            const w = tagBox(tag);
            // Beside the line, on its lower side, clear of the arrowheads at both ends.
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const len = Math.hypot(dx, dy) || 1;
            let nx = -dy / len;
            let ny = dx / len;
            if (ny < 0 || (ny === 0 && nx < 0)) {
              nx = -nx;
              ny = -ny;
            }
            const reach = Math.abs(nx) * (w * 0.3) + Math.abs(ny) * 13 + 6;
            return [
              <Pill
                key={link.id}
                cx={(a.x + b.x) / 2 + nx * reach}
                cy={(a.y + b.y) / 2 + ny * reach}
                w={w}
                text={tag.text}
                size={9.5}
                glyph={tag.icon}
                tone={tag.tone}
              />,
            ];
          })}
          {(scene.panels ?? []).map((p) => (
            <PanelCard key={p.title} panel={p} />
          ))}
        </g>

        <g key={sceneKey}>
          {flows.map((flow, i) => {
            const link = links.find((l) => l.id === flow.link);
            if (!link || !shown.has(link.from) || !shown.has(link.to)) return null;
            return <Packet key={i} flow={flow} geometry={geometry(link, flow.reverse)} />;
          })}
        </g>
      </g>
    </svg>
  );
}

// ---- shapes ----------------------------------------------------------------------------
// Every shape is a polygon whose corners are rounded by one helper, so the look comes from a
// few numbers (width, height, radius) instead of hand-written curves.

type Pt = [number, number];

/** A closed path through `pts` with each corner rounded by up to `r`. */
function rounded(pts: Pt[], r: number) {
  const n = pts.length;
  const cut = (from: Pt, to: Pt, d: number): Pt => {
    const len = Math.hypot(to[0] - from[0], to[1] - from[1]) || 1;
    const k = Math.min(d, len / 2) / len;
    return [from[0] + (to[0] - from[0]) * k, from[1] + (to[1] - from[1]) * k];
  };
  let d = "";
  for (let i = 0; i < n; i++) {
    const prev = pts[(i + n - 1) % n];
    const cur = pts[i];
    const next = pts[(i + 1) % n];
    const a = cut(cur, prev, r);
    const b = cut(cur, next, r);
    d += `${i === 0 ? "M" : "L"}${a[0].toFixed(2)} ${a[1].toFixed(2)} Q${cur[0]} ${cur[1]} ${b[0].toFixed(2)} ${b[1].toFixed(2)} `;
  }
  return `${d}Z`;
}

/** An isometric box: a rhombus top of half-size (hw, hh) and sides `depth` tall, centred at (0, 0) on top. */
function boxFaces(hw: number, hh: number, depth: number) {
  const top: Pt[] = [
    [0, -hh],
    [hw, 0],
    [0, hh],
    [-hw, 0],
  ];
  const left: Pt[] = [
    [-hw, 0],
    [0, hh],
    [0, hh + depth],
    [-hw, depth],
  ];
  const right: Pt[] = [
    [hw, 0],
    [0, hh],
    [0, hh + depth],
    [hw, depth],
  ];
  const outline: Pt[] = [
    [0, -hh],
    [hw, 0],
    [hw, depth],
    [0, hh + depth],
    [-hw, depth],
    [-hw, 0],
  ];
  return { top, left, right, outline };
}

const CUBE_SHAPE = boxFaces(46, 24, 52);

function Cube({ node }: { node: DiagramNode }) {
  const tone = TONE_OF[node.kind];
  const words = node.label.split(" ");
  const lines = node.sub
    ? [
        { t: node.label, y: 20, size: 13.5, weight: 800 },
        { t: node.sub, y: 34, size: 10, weight: 600 },
      ]
    : words.length > 1
      ? [
          { t: words[0], y: 17, size: 13, weight: 800 },
          { t: words.slice(1).join(" "), y: 32, size: 13, weight: 800 },
        ]
      : [{ t: node.label, y: 26, size: 13.5, weight: 800 }];
  // The cube's top face is centred at y - 24 so that the whole block is centred on the node.
  return (
    <g className="ds-figure" transform={`translate(${node.x} ${node.y - 22})`}>
      <ellipse
        cx="0"
        cy="62"
        rx="58"
        ry="17"
        fill="#3d5a78"
        opacity="0.22"
        filter="url(#ds-blur-lg)"
      />
      <path d={rounded(CUBE_SHAPE.left, 5)} fill={`url(#g-${tone}-left)`} />
      <path d={rounded(CUBE_SHAPE.right, 5)} fill={`url(#g-${tone}-right)`} />
      <path d={rounded(CUBE_SHAPE.top, 5)} fill={`url(#g-${tone}-top)`} />
      <path
        d={`M${-CUBE_SHAPE.top[3][0] + 4} 0 L0 ${CUBE_SHAPE.top[2][1]} L${CUBE_SHAPE.top[1][0] - 4} 0`}
        fill="none"
        stroke="#fff"
        strokeOpacity=".7"
        strokeWidth="1.5"
        strokeLinecap="round"
        transform="translate(0 1.5)"
      />
      <path
        d={rounded(CUBE_SHAPE.outline, 9)}
        fill="none"
        stroke="#14202b"
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
      <g transform="translate(-12 -12)" className="ds-cube-icon">
        <path d={GLYPH[KIND_GLYPH[node.kind]]} />
      </g>
      {lines.map((l) => (
        <text
          key={l.t}
          x="0"
          y={l.y + 6}
          textAnchor="middle"
          fontSize={l.size}
          fontWeight={l.weight}
          className="ds-cube-text"
        >
          {l.t}
        </text>
      ))}
    </g>
  );
}

// ---- the laptop on its platform --------------------------------------------------------

const PLATFORM = boxFaces(96, 46, 14);
const BASE = boxFaces(54, 27, 7);

function Device({ node }: { node: DiagramNode }) {
  const { x, y } = node;
  // The laptop base sits a little behind the middle of the platform.
  const bx = 4;
  const by = -4;
  // Corners of the base's top face, used to place the screen and keys.
  const L: Pt = [bx - 54, by];
  const T: Pt = [bx, by - 27];
  const R: Pt = [bx + 54, by];
  const along = (a: number, b: number): Pt => [
    L[0] + a * (T[0] - L[0]) + b * (R[0] - T[0]),
    L[1] + a * (T[1] - L[1]) + b * (R[1] - T[1]),
  ];
  // The screen stands on the L-T edge, `H` tall. u runs along the edge, v up the panel.
  const H = 60;
  const scr = (u: number, v: number): Pt => [
    L[0] + u * (T[0] - L[0]),
    L[1] + u * (T[1] - L[1]) - v * H,
  ];
  const panel = (u0: number, v0: number, u1: number, v1: number): Pt[] => [
    scr(u0, v0),
    scr(u1, v0),
    scr(u1, v1),
    scr(u0, v1),
  ];
  const shift = (pts: Pt[], dx: number, dy: number): Pt[] =>
    pts.map(([px, py]) => [px + dx, py + dy]);
  const at = (p: Pt) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
  const move = (pts: Pt[]) => pts.map(([px, py]) => [px + bx, py + by] as Pt);

  return (
    <g className="ds-figure" transform={`translate(${x} ${y + 16})`}>
      <ellipse
        cx="0"
        cy="58"
        rx="104"
        ry="24"
        fill="#3d5a78"
        opacity="0.18"
        filter="url(#ds-blur-lg)"
      />
      {/* platform */}
      <path d={rounded(PLATFORM.left, 6)} fill="url(#g-slab-left)" />
      <path d={rounded(PLATFORM.right, 6)} fill="url(#g-slab-right)" />
      <path d={rounded(PLATFORM.top, 8)} fill="url(#g-slab-top)" />
      <path
        d={rounded(PLATFORM.outline, 11)}
        fill="none"
        stroke="#334556"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* the laptop's base and its keys */}
      <g transform={`translate(${bx} ${by})`}>
        <path d={rounded(BASE.left, 3)} fill="url(#g-slab-left)" />
        <path d={rounded(BASE.right, 3)} fill="url(#g-slab-right)" />
        <path d={rounded(BASE.top, 4)} fill="#f3eee7" />
        <path
          d={rounded(BASE.outline, 5)}
          fill="none"
          stroke="#14202b"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </g>
      <g
        stroke="#9fb2c4"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="3.4 2.4"
        fill="none"
      >
        {[0.34, 0.46, 0.58].map((b) => (
          <path key={b} d={`M${at(along(0.13, b))} L${at(along(0.87, b))}`} />
        ))}
      </g>
      <path
        d={`M${at(along(0.4, 0.78))} L${at(along(0.6, 0.78))} L${at(along(0.6, 0.92))} L${at(along(0.4, 0.92))} Z`}
        fill="#e7e0d6"
        stroke="#9fb2c4"
        strokeWidth="1"
      />
      {/* the screen: a dark back, the lit front, and what is on it */}
      <path d={rounded(shift(move(panel(0, 0, 1, 1)), -5, -2.5), 3)} fill="#5f5868" />
      <path
        d={rounded(move(panel(0, 0, 1, 1)), 3)}
        fill="#2f2b36"
        stroke="#14202b"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d={rounded(move(panel(0.07, 0.09, 0.93, 0.92)), 2)} fill="#f5f9fc" />
      <path d={rounded(move(panel(0.07, 0.8, 0.93, 0.92)), 1.5)} fill="#e6dccf" />
      <path d={rounded(move(panel(0.14, 0.44, 0.86, 0.72)), 2)} fill="url(#ds-screen)" />
      <path d={rounded(move(panel(0.14, 0.3, 0.7, 0.36)), 1)} fill="#c3d1de" />
      <path d={rounded(move(panel(0.14, 0.18, 0.55, 0.24)), 1)} fill="#c3d1de" />
    </g>
  );
}

/** A rounded label with a hard dark shadow, the way the course draws every caption. */
function Pill({
  cx,
  cy,
  w,
  text,
  size = 10.5,
  glyph,
  tone,
  className,
}: {
  cx: number;
  cy: number;
  w: number;
  text: string;
  size?: number;
  glyph?: string;
  tone?: string;
  className?: string;
}) {
  return (
    <g className={cn("ds-pill", tone && `tone-${tone}`, className)}>
      <rect
        className="ds-pill-shadow"
        x={cx - w / 2}
        y={cy - 8.5}
        width={w}
        height={21}
        rx={10.5}
      />
      <rect className="ds-pill-face" x={cx - w / 2} y={cy - 10.5} width={w} height={21} rx={10.5} />
      {glyph && (
        <g transform={`translate(${cx - w / 2 + 9} ${cy - 6}) scale(0.5)`} className="ds-pill-icon">
          <path d={GLYPH[glyph]} />
        </g>
      )}
      <text
        x={cx + (glyph ? 7.5 : 0)}
        y={cy + size * 0.36}
        textAnchor="middle"
        fontSize={size}
        fontWeight={700}
        className="ds-pill-text"
      >
        {text}
      </text>
    </g>
  );
}

function Block({
  node: baseNode,
  hot,
  down,
  badge,
  bubble,
  label,
  sceneKey,
}: {
  node: DiagramNode;
  hot: boolean;
  down: boolean;
  badge?: string;
  bubble?: Tag;
  /** Replaces the node's own label for this step. */
  label?: string;
  sceneKey: string;
}) {
  const node = label ? { ...baseNode, label } : baseNode;
  const { x, y } = node;
  const isUser = node.kind === "user";
  const cube = !isUser;
  const youW = node.label.length * 6.2 + 38;
  const badgeW = badge ? badge.length * 6 + 16 : 0;
  const badgeX = Math.min(Math.max(x, badgeW / 2 + 4), VIEW_W - badgeW / 2 - 4);
  const badgeY = cube ? y + 66 : y + 118;
  return (
    <g className={cn("ds-node", hot && "is-hot", down && "is-down")} data-kind={node.kind}>
      {/* The focus effect: two glowing rings burst out from the block and fade. Keyed by the step,
          so it plays again on every step and on Replay. */}
      {hot && !down && (
        <g key={sceneKey} className="ds-burst">
          {[0, 1].map((i) => (
            <ellipse
              key={i}
              className="spot"
              style={{ animationDelay: `${i * 0.22}s` }}
              cx={x}
              cy={y + (cube ? 38 : 56)}
              rx={cube ? 62 : 100}
              ry={cube ? 24 : 38}
            />
          ))}
        </g>
      )}
      {isUser ? <Device node={node} /> : <Cube node={node} />}
      {down && (
        <g className="ds-x">
          <circle cx={x} cy={y + (cube ? 8 : 16)} r={12} />
          <path d={`M${x - 5} ${y + (cube ? 3 : 11)} l10 10 m0 -10 l-10 10`} />
        </g>
      )}
      {bubble && (
        <Pill
          cx={isUser ? x - 32 : x}
          cy={isUser ? y - 98 : y - 66}
          w={tagBox(bubble)}
          text={bubble.text}
          glyph={bubble.icon}
          tone={bubble.tone}
          className="ds-bubble"
        />
      )}
      {isUser && (
        <Pill cx={x} cy={y + 98} w={youW} text={node.label} glyph={KIND_GLYPH[node.kind]} />
      )}
      {badge && (
        <g>
          <rect
            className="ds-badge"
            x={badgeX - badgeW / 2}
            y={badgeY}
            width={badgeW}
            height={17}
            rx={8.5}
          />
          <text x={badgeX} y={badgeY + 12} textAnchor="middle" className="ds-badge-text">
            {badge}
          </text>
        </g>
      )}
    </g>
  );
}

function Packet({ flow, geometry }: { flow: Flow; geometry: { a: Point; b: Point } }) {
  const { a, b } = geometry;
  const delay = `${flow.delay ?? 0}s`;
  const path = `M${a.x} ${a.y} L${b.x} ${b.y}`;
  const tone = flow.tone ?? "req";

  // The label sits beside the middle of the link, clear of the line: requests on one side and
  // replies on the other. How far it moves depends on how much of the tag lies along the normal.
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const w = flow.label ? tagWidth(flow.label) : 0;
  const reach = Math.abs(nx) * (w / 2) + Math.abs(ny) * 11 + 9;
  const side = tone === "req" || tone === "hand" ? -1 : 1;
  const lx = mx + nx * reach * side;
  const ly = my + ny * reach * side;

  return (
    <g className={`ds-pkt tone-${tone}`}>
      {flow.label && (
        <g className="ds-flow-tag">
          <rect x={lx - w / 2} y={ly - 11} width={w} height={22} rx={11} />
          <text x={lx} y={ly + 4} textAnchor="middle" className="ds-flow-label">
            {flow.label}
          </text>
        </g>
      )}
      <circle className="ds-packet" r={6} visibility="hidden">
        <set attributeName="visibility" to="visible" begin={delay} />
        <animateMotion dur="1.6s" repeatCount="indefinite" begin={delay} path={path} />
      </circle>
    </g>
  );
}

// ---- a card of figures --------------------------------------------------------------------

const PANEL_W = 214;
const panelSize = (p: Panel) => ({ w: PANEL_W, h: 34 + p.lines.length * 15 });

/** A small card with a title and rows of "label  value"; a tab inside a line splits the two. */
function PanelCard({ panel }: { panel: Panel }) {
  const { w, h } = panelSize(panel);
  return (
    <g className="ds-panel" transform={`translate(${panel.x} ${panel.y})`}>
      <rect className="ds-panel-shadow" x="0" y="2" width={w} height={h} rx="10" />
      <rect className="ds-panel-face" x="0" y="0" width={w} height={h} rx="10" />
      {panel.icon && (
        <g transform="translate(10 8) scale(0.55)" className="ds-pill-icon">
          <path d={GLYPH[panel.icon]} />
        </g>
      )}
      <text x={panel.icon ? 28 : 12} y="19" className="ds-panel-title">
        {panel.title}
      </text>
      {panel.lines.map((line, i) => {
        const [left, right] = line.split("\t");
        const y = 38 + i * 15;
        return right === undefined ? (
          <text key={i} x="12" y={y} className="ds-panel-note">
            {line}
          </text>
        ) : (
          <g key={i}>
            <text x="12" y={y} className="ds-panel-line">
              {left}
            </text>
            <text x={w - 12} y={y} textAnchor="end" className="ds-panel-value">
              {right}
            </text>
          </g>
        );
      })}
    </g>
  );
}
