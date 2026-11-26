import { guessIcon, isIconName } from "../icons";
import type { Measurer } from "../fonts";
import {
  customKey,
  type Basics,
  type OrderKey,
  type ResumeData,
  type ResumeSettings,
} from "../../types";
import type { Block, ImagePrim, Item, Prim } from "./types";
import { linesOf, para, type Run, type TextStyle } from "./text";

/* ---------- colour helpers ---------- */

export function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  const n = m ? parseInt(m[1], 16) : 0;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex([r, g, b]: [number, number, number]): string {
  return "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
}

export function mix(a: string, b: string, t: number): string {
  const x = hexToRgb(a);
  const y = hexToRgb(b);
  return rgbToHex([0, 1, 2].map((i) => x[i] + (y[i] - x[i]) * t) as [number, number, number]);
}

function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** White or near-black, whichever reads better on `bg`. */
export function readableOn(bg: string): string {
  return luminance(bg) > 0.4 ? "#111827" : "#ffffff";
}

/* ---------- context ---------- */

export interface Ctx {
  m: Measurer;
  d: ResumeData;
  s: ResumeSettings;
  accent: string;
  ink: string;
  muted: string;
  /** Body font size. */
  base: number;
  /** Spacing multiplier. */
  sp: number;
  /** Line height multiple. */
  lh: number;
}

export function makeCtx(m: Measurer, d: ResumeData, s: ResumeSettings): Ctx {
  const sp = s.spacing;
  return {
    m,
    d,
    s,
    accent: s.accent,
    ink: "#1a1a1a",
    muted: "#585858",
    base: s.fontSize,
    sp,
    lh: 1.18 + 0.17 * sp,
  };
}

export function title(c: Ctx, key: keyof ResumeSettings["titles"]): string {
  return c.s.titles[key]?.trim() || "";
}

/* ---------- small builders ---------- */

export function dates(start: string, end: string): string {
  const a = start.trim();
  const b = end.trim();
  if (a && b) return `${a} – ${b}`;
  return a || b;
}

export function joinNonEmpty(parts: string[], sep: string): string {
  return parts
    .map((p) => p.trim())
    .filter(Boolean)
    .join(sep);
}

export function ensureUrl(v: string): string {
  const t = v.trim();
  return /^[a-z][a-z0-9+.-]*:/i.test(t) ? t : `https://${t}`;
}

export interface ContactItem {
  label: string;
  value: string;
  link?: string;
  /** What a one-line contact row prints: the value, or "Label: value" for an added detail. */
  inline: string;
  /** A key of ICONS, or undefined for none. */
  icon?: string;
}

export function contactItems(b: Basics, vi = false): ContactItem[] {
  const out: ContactItem[] = [];
  const add = (label: string, value: string, link?: string, icon?: string) => {
    if (value.trim()) out.push({ label, value: value.trim(), link, inline: value.trim(), icon });
  };
  add("Email", b.email, `mailto:${b.email.trim()}`, "mail");
  add(vi ? "Điện thoại" : "Phone", b.phone, `tel:${b.phone.replace(/[^\d+]/g, "")}`, "phone");
  add(vi ? "Địa chỉ" : "Location", b.location, undefined, "pin");
  add("Website", b.website, ensureUrl(b.website), "globe");
  add("LinkedIn", b.linkedin, ensureUrl(b.linkedin), "linkedin");
  add("GitHub", b.github, ensureUrl(b.github), "code");
  for (const x of b.extras) {
    const value = x.value.trim();
    if (!value) continue;
    const label = x.label.trim();
    // A value that looks like a web address becomes a link.
    const link =
      !/\s/.test(value) && /^(https?:\/\/)?[\w-]+(\.[\w-]+)+(\/\S*)?$/i.test(value)
        ? ensureUrl(value)
        : undefined;
    const icon = x.icon === "none" ? undefined : isIconName(x.icon) ? x.icon : guessIcon(label);
    out.push({
      label: label || "Info",
      value,
      link,
      inline: label ? `${label}: ${value}` : value,
      icon,
    });
  }
  return out;
}

export function style(c: Ctx, over: Partial<TextStyle> & { size: number }): TextStyle {
  return { f: "r", color: c.ink, ...over };
}

export function block(items: Item[], before: number, keepNext = false): Block {
  return { items, before, keepNext };
}

export function ruleItem(x: number, w: number, color: string, width: number, pad = 0): Item {
  const prims: Prim[] = [{ k: "line", x1: x, x2: x + w, y1: pad, y2: pad, color, width }];
  return { h: pad * 2 + width, prims };
}

export function textOf(runs: Run[]): string {
  return runs.map((r) => r.s).join("");
}

export { linesOf, para };

/* ---------- avatar ---------- */

export function hasAvatar(c: Ctx): boolean {
  return c.d.basics.avatar.startsWith("data:image/");
}

export function avatarPrim(c: Ctx, x: number, y: number, size: number): ImagePrim {
  return {
    k: "image",
    x,
    y,
    w: size,
    h: size,
    src: c.d.basics.avatar,
    shape: c.s.avatarShape,
  };
}

/** Add a spacer so the blocks from `from` on are at least `h` tall (a photo beside the header). */
export function padHeader(blocks: Block[], from: number, h: number) {
  let total = 0;
  blocks.slice(from).forEach((b, i) => {
    total += (i ? b.before : 0) + b.items.reduce((s, it) => s + it.h, 0);
  });
  if (total < h) blocks.push(block([{ h: h - total, prims: [] }], 0));
}

/** Merge a stack of line items into one item (so it can sit beside another stack). */
export function stackItems(items: Item[]): Item {
  const prims: Prim[] = [];
  let y = 0;
  for (const it of items) {
    for (const p of it.prims) {
      prims.push(p.k === "line" ? { ...p, y1: p.y1 + y, y2: p.y2 + y } : { ...p, y: p.y + y });
    }
    y += it.h;
  }
  return { h: y, prims };
}

/** A template's photo size, scaled by the person's choice. */
export function avSize(c: Ctx, base: number): number {
  return Math.round(base * c.s.avatarScale);
}

/** The heading to print for a section of the order. */
export function titleOf(c: Ctx, key: OrderKey): string {
  const custom = c.d.custom.find((x) => customKey(x.id) === key);
  if (custom) return custom.title.trim() || "Section";
  return c.s.titles[key as keyof ResumeSettings["titles"]] || key;
}
