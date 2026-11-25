import type { ReactElement } from "react";
import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 } as const;

export type OgArt = "stack" | "cubes" | "book" | "graph" | "blocks";

export interface OgCardOptions {
  /** Small label above the title, such as "Course". */
  eyebrow: string;
  title: string;
  tagline: string;
  /** The facts under the tagline. */
  chips: readonly string[];
  /** The picture on the right: an isometric scene that suits the page. */
  art: OgArt;
  /** A dark card (the main site) or a light one (the course pages). */
  theme: "dark" | "light";
}

const INK = "#12202c";

interface Palette {
  paper: string;
  ink: string;
  muted: string;
  line: string;
  top: string;
  left: string;
  right: string;
  accent: string;
  accent2: string;
  accent3: string;
}

const LIGHT: Palette = {
  paper: "#eef3f8",
  ink: INK,
  muted: "#5b6f82",
  line: "#d3dfea",
  top: "#e3effb",
  left: "#bcd7ee",
  right: "#9cc3e6",
  accent: "#86bfe8",
  accent2: "#9fdcd2",
  accent3: "#b9c4f3",
};

const DARK: Palette = {
  ...LIGHT,
  paper: "#0b1118",
  ink: "#e8f0f7",
  muted: "#8a9cad",
  line: "#1b2835",
  top: "#2b4660",
  left: "#1f3347",
  right: "#172736",
  accent: "#3b8fe6",
  accent2: "#1f9d8f",
  accent3: "#5b6fd6",
};

type Point = readonly [number, number];
const pts = (list: readonly Point[]) => list.map(([x, y]) => `${x},${y}`).join(" ");

/** One isometric block. (x, y) is the centre of its top face; `w` is the half-width of that face. */
function Block({
  id,
  x,
  y,
  w,
  h,
  fill,
  stroke,
  line = 4,
}: {
  /** The React key, for blocks drawn in a loop. */
  id?: number;
  x: number;
  y: number;
  w: number;
  h: number;
  fill: readonly [string, string, string];
  stroke: string;
  line?: number;
}) {
  const b = w / 2;
  const common = { stroke, strokeWidth: line, strokeLinejoin: "round" as const };
  return (
    <g key={id}>
      <polygon
        points={pts([
          [x - w, y],
          [x, y + b],
          [x, y + b + h],
          [x - w, y + h],
        ])}
        fill={fill[1]}
        {...common}
      />
      <polygon
        points={pts([
          [x + w, y],
          [x, y + b],
          [x, y + b + h],
          [x + w, y + h],
        ])}
        fill={fill[2]}
        {...common}
      />
      <polygon
        points={pts([
          [x, y - b],
          [x + w, y],
          [x, y + b],
          [x - w, y],
        ])}
        fill={fill[0]}
        {...common}
      />
    </g>
  );
}

/** The faint diamond grid behind a scene, like graph paper laid flat. */
function Grid({ color }: { color: string }) {
  const lines: ReactElement[] = [];
  for (let i = -6; i <= 14; i++) {
    lines.push(
      <line
        key={`a${i}`}
        x1={i * 60}
        y1={0}
        x2={i * 60 + 520}
        y2={300}
        stroke={color}
        strokeWidth={2}
      />,
      <line
        key={`b${i}`}
        x1={i * 60 + 520}
        y1={0}
        x2={i * 60}
        y2={300}
        stroke={color}
        strokeWidth={2}
      />,
    );
  }
  return <g transform="translate(0 150)">{lines}</g>;
}

function Scene({ art, p }: { art: OgArt; p: Palette }) {
  const tint = (c: string): readonly [string, string, string] => [
    c,
    shade(c, -0.14),
    shade(c, -0.26),
  ];
  const base: readonly [string, string, string] = [p.top, p.left, p.right];
  const blue = tint(p.accent);
  const teal = tint(p.accent2);
  const indigo = tint(p.accent3);
  const ink = p.ink === INK ? INK : "#0b1118";
  const stroke = p.paper === "#0b1118" ? "#7fa8cc" : ink;

  return (
    <svg width="616" height="572" viewBox="0 80 560 520">
      {Grid({ color: p.line })}
      {art === "stack" && (
        <g>
          {Block({ x: 280, y: 420, w: 200, h: 26, fill: base, stroke: stroke })}
          {Block({ x: 280, y: 352, w: 170, h: 26, fill: teal, stroke: stroke })}
          {Block({ x: 280, y: 284, w: 140, h: 26, fill: blue, stroke: stroke })}
          {Block({ x: 280, y: 216, w: 110, h: 26, fill: indigo, stroke: stroke })}
        </g>
      )}
      {art === "cubes" && (
        <g>
          {Block({ x: 280, y: 400, w: 230, h: 30, fill: base, stroke: stroke })}
          {Block({ x: 200, y: 340, w: 80, h: 90, fill: teal, stroke: stroke })}
          {Block({ x: 355, y: 330, w: 80, h: 110, fill: blue, stroke: stroke })}
          {Block({ x: 280, y: 250, w: 80, h: 80, fill: indigo, stroke: stroke })}
        </g>
      )}
      {art === "book" && (
        <g>
          {Block({ x: 280, y: 390, w: 230, h: 34, fill: teal, stroke: stroke })}
          <polygon
            points={pts([
              [280, 330],
              [460, 390],
              [280, 450],
              [100, 390],
            ])}
            fill={p.paper === "#0b1118" ? "#243746" : "#f6fbfa"}
            stroke={stroke}
            strokeWidth={4}
            strokeLinejoin="round"
          />
          <line x1={280} y1={330} x2={280} y2={450} stroke={stroke} strokeWidth={4} />
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <line
                x1={170 + i * 4}
                y1={380 + i * 14 - 8}
                x2={250 + i * 4}
                y2={408 + i * 14 - 8}
                stroke={p.accent2}
                strokeWidth={5}
                strokeLinecap="round"
              />
              <line
                x1={390 - i * 4}
                y1={380 + i * 14 - 8}
                x2={310 - i * 4}
                y2={408 + i * 14 - 8}
                stroke={p.accent2}
                strokeWidth={5}
                strokeLinecap="round"
              />
            </g>
          ))}
        </g>
      )}
      {art === "graph" && (
        <g>
          {Block({ x: 280, y: 420, w: 240, h: 26, fill: base, stroke: stroke })}
          <polyline
            points={pts([
              [130, 390],
              [210, 350],
              [280, 380],
              [350, 330],
              [430, 360],
            ])}
            fill="none"
            stroke={stroke}
            strokeWidth={4}
            strokeLinejoin="round"
            strokeDasharray="10 8"
          />
          {Block({ x: 130, y: 385, w: 50, h: 44, fill: teal, stroke: stroke })}
          {Block({ x: 280, y: 340, w: 62, h: 66, fill: blue, stroke: stroke })}
          {Block({ x: 430, y: 355, w: 50, h: 44, fill: indigo, stroke: stroke })}
          {Block({ x: 355, y: 250, w: 44, h: 40, fill: teal, stroke: stroke })}
          {Block({ x: 205, y: 250, w: 44, h: 40, fill: indigo, stroke: stroke })}
        </g>
      )}
      {art === "blocks" && (
        <g>
          {Block({ x: 280, y: 430, w: 240, h: 22, fill: base, stroke: stroke })}
          {[0, 1, 2, 3, 4].map((i) =>
            Block({
              id: i,
              x: 130 + i * 70,
              y: 500 - i * 35 - (40 + (i === 3 ? 34 : 0)),
              w: 42,
              h: 40 + (i === 3 ? 34 : 0),
              fill: i === 3 ? indigo : i % 2 ? teal : blue,
              stroke,
            }),
          )}
        </g>
      )}
    </svg>
  );
}

/** A hex colour mixed towards black (negative) or white (positive). */
function shade(hex: string, amount: number) {
  const n = Number.parseInt(hex.slice(1), 16);
  const mix = (v: number) =>
    Math.round(amount < 0 ? v * (1 + amount) : v + (255 - v) * amount)
      .toString(16)
      .padStart(2, "0");
  return `#${mix((n >> 16) & 255)}${mix((n >> 8) & 255)}${mix(n & 255)}`;
}

/**
 * The picture that a link shows when it is shared. One layout for every page: a name and one line
 * on the left with its facts as chips, and a large isometric scene on the right. Drawn with system
 * fonts and plain SVG so it needs nothing from the network.
 */
export function ogCard({ eyebrow, title, tagline, chips, art, theme }: OgCardOptions) {
  const p = theme === "dark" ? DARK : LIGHT;
  const chipFills = [p.accent2, p.accent, p.accent3];
  const chipInk = theme === "dark" ? "#0b1118" : INK;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: p.paper,
        color: p.ink,
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ position: "absolute", right: 0, top: 36, display: "flex" }}>
        <Scene art={art} p={p} />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: 700,
          height: "100%",
          padding: "60px 0 52px 72px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              display: "flex",
              width: 44,
              height: 44,
              borderRadius: 12,
              background: p.accent,
              border: `3px solid ${theme === "dark" ? "#7fa8cc" : INK}`,
            }}
          />
          <div style={{ fontSize: 28, letterSpacing: 6, color: p.muted, fontWeight: 700 }}>
            {eyebrow.toUpperCase()}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 84, lineHeight: 1.05, fontWeight: 800, letterSpacing: -2.5 }}>
            {title}
          </div>
          <div
            style={{ marginTop: 22, fontSize: 34, lineHeight: 1.3, color: p.muted, maxWidth: 540 }}
          >
            {tagline}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 34, maxWidth: 560 }}>
            {chips.map((chip, i) => (
              <div
                key={chip}
                style={{
                  display: "flex",
                  padding: "8px 22px",
                  fontSize: 25,
                  fontWeight: 700,
                  color: chipInk,
                  background: chipFills[i % chipFills.length],
                  border: `3px solid ${theme === "dark" ? "#7fa8cc" : INK}`,
                  borderRadius: 999,
                }}
              >
                {chip}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 26, color: p.muted, fontWeight: 700 }}>
          hienpt.dev
        </div>
      </div>
    </div>,
    OG_SIZE,
  );
}
