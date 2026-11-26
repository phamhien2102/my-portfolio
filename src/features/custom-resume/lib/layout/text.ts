import type { FontStyle, Measurer } from "../fonts";
import type { Item, Prim, TextPrim } from "./types";

export interface Run {
  s: string;
  f?: FontStyle;
  color?: string;
  size?: number;
  link?: string;
  /** A key of ICONS drawn before the first word of this run. */
  icon?: string;
  iconColor?: string;
}

export interface TextStyle {
  f: FontStyle;
  size: number;
  color: string;
  track?: number;
}

interface Seg {
  s: string;
  f: FontStyle;
  size: number;
  color: string;
  link?: string;
  w: number;
  icon?: { name: string; color: string; w: number };
}

interface Line {
  segs: Seg[];
  w: number;
}

interface Token {
  text: string;
  run: number;
  spaceBefore: boolean;
  first: boolean;
}

function tokenize(runs: Run[]): Token[] {
  const out: Token[] = [];
  let pendingSpace = false;
  runs.forEach((r, run) => {
    let first = true;
    const parts = r.s.split(/(\s+)/);
    for (const part of parts) {
      if (part === "") continue;
      if (/^\s+$/.test(part)) {
        pendingSpace = true;
        continue;
      }
      out.push({ text: part, run, spaceBefore: pendingSpace && out.length > 0, first });
      first = false;
      pendingSpace = false;
    }
  });
  return out;
}

/** Greedy word wrap over runs of different styles. */
export function wrapRuns(m: Measurer, runs: Run[], maxW: number, base: TextStyle): Line[] {
  const style = (r: Run) => ({
    f: r.f ?? base.f,
    size: r.size ?? base.size,
    color: r.color ?? base.color,
  });
  const track = base.track ?? 0;
  const lines: Line[] = [];
  let cur: Line = { segs: [], w: 0 };

  const iconW = (run: number) => (runs[run].icon ? style(runs[run]).size * 1.4 : 0);

  const push = (text: string, run: number, spaced: boolean, withIcon = false) => {
    const r = runs[run];
    const st = style(r);
    const lead = spaced && cur.segs.length ? " " : "";
    const last = cur.segs[cur.segs.length - 1];
    const lastRun =
      !withIcon &&
      last &&
      last.f === st.f &&
      last.size === st.size &&
      last.color === st.color &&
      last.link === r.link;
    if (lastRun) {
      const added = lead + text;
      const w = m.width(added, st.f, st.size, track);
      last.s += added;
      last.w += w;
      cur.w += w;
    } else {
      // The separating space belongs to the previous segment's style.
      if (lead && last) {
        const sw = m.width(" ", last.f, last.size, track);
        last.s += " ";
        last.w += sw;
        cur.w += sw;
      }
      const iw = withIcon ? iconW(run) : 0;
      const w = m.width(text, st.f, st.size, track) + iw;
      cur.segs.push({
        s: text,
        ...st,
        link: r.link,
        w,
        icon:
          withIcon && r.icon ? { name: r.icon, color: r.iconColor ?? st.color, w: iw } : undefined,
      });
      cur.w += w;
    }
  };

  const flush = () => {
    if (cur.segs.length) {
      lines.push(cur);
      cur = { segs: [], w: 0 };
    }
  };

  for (const tok of tokenize(runs)) {
    const st = style(runs[tok.run]);
    const w = m.width(tok.text, st.f, st.size, track) + (tok.first ? iconW(tok.run) : 0);
    const sp = tok.spaceBefore && cur.segs.length ? m.width(" ", st.f, st.size, track) : 0;
    if (cur.w + sp + w <= maxW || cur.segs.length === 0) {
      if (w > maxW && cur.segs.length === 0) {
        // One word wider than the column: break it by characters.
        let piece = "";
        let withIcon = tok.first;
        for (const ch of tok.text) {
          const room = maxW - (withIcon ? iconW(tok.run) : 0);
          if (m.width(piece + ch, st.f, st.size, track) > room && piece) {
            push(piece, tok.run, false, withIcon);
            withIcon = false;
            flush();
            piece = "";
          }
          piece += ch;
        }
        if (piece) push(piece, tok.run, false, withIcon);
        continue;
      }
      push(tok.text, tok.run, tok.spaceBefore, tok.first);
    } else {
      flush();
      push(tok.text, tok.run, false, tok.first);
    }
  }
  flush();
  return lines;
}

export interface ParaOptions {
  x: number;
  w: number;
  /** Line height as a multiple of the font size. */
  lh: number;
  align?: "l" | "c" | "r";
  /** Draw this glyph at `x` and indent the text, for list items. */
  bullet?: { glyph: string; indent: number; color?: string };
  /** Right-hand run on the first line (dates). */
  right?: Run[];
  /** Gap kept between the left text and the right run. */
  gap?: number;
  link?: string;
}

/**
 * Turn runs into line items. Each item is `size * lh` tall with the baseline centred in it, so the
 * same text always sits at the same height whichever font is chosen.
 */
export function para(m: Measurer, runs: Run[], base: TextStyle, o: ParaOptions): Item[] {
  const bulletIndent = o.bullet?.indent ?? 0;
  const gap = o.gap ?? 10;
  let rightLine: Line | null = null;
  if (o.right && o.right.length) {
    rightLine = wrapRuns(m, o.right, o.w, base)[0] ?? null;
  }
  const leftW = o.w - bulletIndent - (rightLine ? rightLine.w + gap : 0);
  const lines = wrapRuns(m, runs, Math.max(leftW, 40), base);
  if (lines.length === 0 && rightLine) lines.push({ segs: [], w: 0 });

  const items: Item[] = [];
  const h = base.size * o.lh;
  const face = m.family.faces[base.f];
  const baseline = (h - (face.asc + face.desc) * base.size) / 2 + face.asc * base.size;

  lines.forEach((line, idx) => {
    const prims: Prim[] = [];
    const emit = (segs: Seg[], x0: number) => {
      let x = x0;
      for (const sg of segs) {
        let tx = x;
        if (sg.icon) {
          const isz = sg.size * 0.95;
          prims.push({
            k: "icon",
            name: sg.icon.name,
            x,
            y: baseline - sg.size * 0.84,
            size: isz,
            color: sg.icon.color,
          });
          tx = x + sg.icon.w;
        }
        const p: TextPrim = {
          k: "text",
          x: tx,
          y: baseline,
          s: sg.s,
          f: sg.f,
          size: sg.size,
          color: sg.color,
        };
        if (base.track) p.track = base.track;
        const link = sg.link ?? o.link;
        if (link) p.link = link;
        prims.push(p);
        x += sg.w;
      }
    };
    let x0 = o.x + bulletIndent;
    if (o.align === "c") x0 = o.x + bulletIndent + (o.w - bulletIndent - line.w) / 2;
    else if (o.align === "r") x0 = o.x + o.w - line.w;
    emit(line.segs, x0);
    if (idx === 0 && o.bullet) {
      prims.push({
        k: "text",
        x: o.x,
        y: baseline,
        s: o.bullet.glyph,
        f: "r",
        size: base.size,
        color: o.bullet.color ?? base.color,
      });
    }
    if (idx === 0 && rightLine) emit(rightLine.segs, o.x + o.w - rightLine.w);
    items.push({ h, prims });
  });
  return items;
}

/** Split on blank-trimmed lines; used for "one item per line" fields. */
export function linesOf(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim().replace(/^[-•–·*]\s+/, ""))
    .filter(Boolean);
}
