import type {
  AlgoScene,
  Cell,
  Disc,
  Edge,
  EdgeTone,
  Frame,
  Item,
  Label,
  Pointer,
  Tone,
} from "./types";

type Part = Item | AlgoScene | Part[] | false | null | undefined | "" | 0;

const flatten = (part: Part): Item[] => {
  if (!part) return [];
  if (Array.isArray(part)) return part.flatMap(flatten);
  if ("items" in part) return part.items;
  return [part];
};

/**
 * Build a scene from items, lists of items (nested lists and whole scenes are fine) and falsy
 * parts, which are skipped, so `cond && ptr(...)` works.
 */
export function scene(...parts: Part[]): AlgoScene {
  return { items: parts.flatMap(flatten) };
}

// ---- single items -------------------------------------------------------------------------

export const cell = (
  id: string,
  x: number,
  y: number,
  text: string | number,
  o: Partial<Cell> = {},
): Cell => ({
  t: "cell",
  id,
  x,
  y,
  text: String(text),
  ...o,
});

export const disc = (
  id: string,
  x: number,
  y: number,
  text: string | number,
  o: Partial<Disc> = {},
): Disc => ({
  t: "disc",
  id,
  x,
  y,
  text: String(text),
  ...o,
});

export const edge = (id: string, from: string, to: string, o: Partial<Edge> = {}): Edge => ({
  t: "edge",
  id,
  from,
  to,
  ...o,
});

export const ptr = (
  id: string,
  at: string | { x: number; y: number },
  text: string,
  o: Partial<Pointer> = {},
): Pointer => ({ t: "pointer", id, at, text, ...o });

export const label = (
  id: string,
  x: number,
  y: number,
  text: string,
  o: Partial<Label> = {},
): Label => ({
  t: "label",
  id,
  x,
  y,
  text,
  ...o,
});

export const frame = (
  id: string,
  x: number,
  y: number,
  w: number,
  h: number,
  text?: string,
  o: Partial<Frame> = {},
): Frame => ({ t: "frame", id, x, y, w, h, text, ...o });

// ---- layouts -------------------------------------------------------------------------------

type ToneMap = Record<number, Tone> | ((i: number) => Tone | undefined);
const toneAt = (tones: ToneMap | undefined, i: number) =>
  typeof tones === "function" ? tones(i) : tones?.[i];

export interface RowOptions {
  /** Centre of the whole row. */
  x?: number;
  /** Centre line of the row. */
  y?: number;
  /** Prefix of the cell ids: `${id}${key}`. Default "a". */
  id?: string;
  /** Per-cell keys; give a cell the same key in two steps and it slides instead of popping. Default: its index. */
  keys?: (string | number)[];
  w?: number;
  h?: number;
  gap?: number;
  tones?: ToneMap;
  /** Show the index under each cell, counting from this number (true = from 0). */
  index?: boolean | number;
  /** Blank out cells (e.g. unfilled capacity) by index; they are drawn as ghost slots. */
  empty?: number[];
}

/** A horizontal row of cells, centred on `x`. Returns the cells; pointers can target `${id}${key}`. */
export function row(values: (string | number)[], o: RowOptions = {}): Cell[] {
  const { x = 320, y = 150, id = "a", keys, w = 52, h = 46, gap = 8, tones, index, empty = [] } = o;
  const total = values.length * w + (values.length - 1) * gap;
  const start = x - total / 2 + w / 2;
  return values.map((v, i) =>
    cell(`${id}${keys?.[i] ?? i}`, start + i * (w + gap), y, empty.includes(i) ? "" : v, {
      w,
      h,
      tone: empty.includes(i) ? "ghost" : toneAt(tones, i),
      sub:
        index === undefined || index === false
          ? undefined
          : String(i + (index === true ? 0 : index)),
    }),
  );
}

export interface BarsOptions {
  x?: number;
  /** y of the baseline. */
  y?: number;
  id?: string;
  keys?: (string | number)[];
  w?: number;
  gap?: number;
  /** Pixels per unit of value. Default: the tallest bar is 120 px. */
  scale?: number;
  tones?: ToneMap;
  index?: boolean | number;
}

/** Bars standing on a baseline; each bar is a cell whose height follows its value. */
export function bars(values: number[], o: BarsOptions = {}): Cell[] {
  const { x = 320, y = 200, id = "b", keys, w = 36, gap = 8, tones, index } = o;
  const scale = o.scale ?? 120 / Math.max(...values, 1);
  const total = values.length * w + (values.length - 1) * gap;
  const start = x - total / 2 + w / 2;
  return values.map((v, i) =>
    cell(`${id}${keys?.[i] ?? i}`, start + i * (w + gap), y, v, {
      w,
      h: Math.max(v * scale, 18),
      base: true,
      tone: toneAt(tones, i),
      sub:
        index === undefined || index === false
          ? undefined
          : String(i + (index === true ? 0 : index)),
    }),
  );
}

export interface StackOptions {
  x?: number;
  /** y of the bottom of the stack. */
  y?: number;
  id?: string;
  keys?: (string | number)[];
  w?: number;
  h?: number;
  gap?: number;
  tones?: ToneMap;
}

/** A vertical stack, first value at the bottom, growing upward. */
export function stack(values: (string | number)[], o: StackOptions = {}): Cell[] {
  const { x = 320, y = 230, id = "s", keys, w = 96, h = 36, gap = 6, tones } = o;
  return values.map((v, i) =>
    cell(`${id}${keys?.[i] ?? i}`, x, y - i * (h + gap) - h / 2, v, {
      w,
      h,
      tone: toneAt(tones, i),
    }),
  );
}

export interface MatrixOptions {
  x?: number;
  y?: number;
  id?: string;
  w?: number;
  h?: number;
  gap?: number;
  /** Tone by "row,col", e.g. { "1,2": "active" }. */
  tones?: Record<string, Tone>;
}

/** A grid of cells centred on (x, y); ids are `${id}${row}-${col}`. */
export function matrix(rows: (string | number)[][], o: MatrixOptions = {}): Cell[] {
  const { x = 320, y = 150, id = "m", w = 44, h = 38, gap = 6, tones = {} } = o;
  const cols = Math.max(...rows.map((r) => r.length));
  const left = x - (cols * w + (cols - 1) * gap) / 2 + w / 2;
  const top = y - (rows.length * h + (rows.length - 1) * gap) / 2 + h / 2;
  return rows.flatMap((r, ri) =>
    r.map((v, ci) =>
      cell(`${id}${ri}-${ci}`, left + ci * (w + gap), top + ri * (h + gap), v, {
        w,
        h,
        tone: tones[`${ri},${ci}`],
      }),
    ),
  );
}

export interface LinkedOptions {
  x?: number;
  y?: number;
  id?: string;
  keys?: (string | number)[];
  w?: number;
  gap?: number;
  tones?: ToneMap;
  /** Draw a back arrow too (doubly linked). */
  doubly?: boolean;
  /** Add an arrow from the last node back to the first. */
  circular?: boolean;
  /** Show "null" after the last node. */
  tail?: boolean;
}

/** Nodes in a row joined by arrows; node ids are `${id}${key}`, edge ids `${id}e${i}`. */
export function linked(values: (string | number)[], o: LinkedOptions = {}): Item[] {
  const { x = 320, y = 150, id = "n", keys, w = 52, gap = 34, tones, doubly, circular, tail } = o;
  const nodes = row(values, { x, y, id, keys, w, h: 44, gap, tones });
  const edges: Edge[] = nodes
    .slice(1)
    .map((n, i) => edge(`${id}e${i}`, nodes[i].id, n.id, { arrow: doubly ? "both" : "end" }));
  const extra: Item[] = [];
  if (tail && nodes.length) {
    const last = nodes[nodes.length - 1];
    extra.push(
      label(`${id}null`, last.x + w / 2 + gap + 14, y + 5, "null", { tone: "muted", size: 11 }),
    );
    extra.push(edge(`${id}etail`, last.id, `${id}null`, { dashed: true }));
  }
  if (circular && nodes.length > 1) {
    extra.push(
      edge(`${id}eback`, nodes[nodes.length - 1].id, nodes[0].id, { dashed: true, tone: "muted" }),
    );
  }
  return [...edges, ...nodes, ...extra];
}

export interface TreeOptions {
  x?: number;
  y?: number;
  id?: string;
  /** Width of the widest level. */
  width?: number;
  dy?: number;
  r?: number;
  tones?: Record<number, Tone>;
  /** Edge tone by child index. */
  edgeTones?: Record<number, EdgeTone>;
  /** Per-node keys by level-order index (to keep identity when the shape changes). */
  keys?: (string | number)[];
}

/**
 * A binary tree from a level-order list; `null` leaves a gap. Node ids are `${id}${key}` (key =
 * its level-order index unless `keys` is given), edge ids `${id}e${childKey}`. (x, y) is the root.
 */
export function tree(values: (string | number | null)[], o: TreeOptions = {}): Item[] {
  const {
    x = 320,
    y = 50,
    id = "t",
    width = 360,
    dy = 62,
    r = 20,
    tones = {},
    edgeTones = {},
    keys,
  } = o;
  const key = (i: number) => keys?.[i] ?? i;
  // Each level splits the width evenly, so a node sits centred over its two children.
  const pos = (i: number) => {
    const level = Math.floor(Math.log2(i + 1));
    const slots = 2 ** level;
    const slot = i + 1 - slots;
    return { x: x + ((slot + 0.5) / slots - 0.5) * width, y: y + level * dy };
  };
  const out: Item[] = [];
  values.forEach((v, i) => {
    if (v === null) return;
    const p = pos(i);
    out.push(disc(`${id}${key(i)}`, p.x, p.y, v, { r, tone: tones[i] }));
    if (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (values[parent] !== null && values[parent] !== undefined)
        out.unshift(
          edge(`${id}e${key(i)}`, `${id}${key(parent)}`, `${id}${key(i)}`, {
            arrow: "none",
            tone: edgeTones[i],
          }),
        );
    }
  });
  return out;
}

export interface GraphOptions {
  id?: string;
  r?: number;
  directed?: boolean;
  tones?: Record<string, Tone>;
  /** Edge tone by "A-B". */
  edgeTones?: Record<string, EdgeTone>;
  /** Weights by "A-B", drawn on the edge. */
  weights?: Record<string, string | number>;
}

/**
 * A graph: `nodes` maps a name to [x, y]; `edges` lists [from, to] pairs. Node ids are
 * `${id}${name}`, edge ids `${id}${from}-${to}`.
 */
export function graph(
  nodes: Record<string, [number, number]>,
  edges: [string, string][],
  o: GraphOptions = {},
): Item[] {
  const { id = "g", r = 20, directed, tones = {}, edgeTones = {}, weights = {} } = o;
  const es = edges.map(([a, b]) =>
    edge(`${id}${a}-${b}`, `${id}${a}`, `${id}${b}`, {
      arrow: directed ? "end" : "none",
      tone: edgeTones[`${a}-${b}`],
      label: weights[`${a}-${b}`] === undefined ? undefined : String(weights[`${a}-${b}`]),
    }),
  );
  const ns = Object.entries(nodes).map(([name, [px, py]]) =>
    disc(`${id}${name}`, px, py, name, { r, tone: tones[name] }),
  );
  return [...es, ...ns];
}
