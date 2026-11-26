import type { AvatarShape } from "../../types";
import type { FontStyle } from "../fonts";

/** Everything is laid out in PDF points on an A4 page, with y measured down from the top. */
export const PAGE_W = 595.28;
export const PAGE_H = 841.89;

export interface TextPrim {
  k: "text";
  x: number;
  /** Baseline. */
  y: number;
  s: string;
  f: FontStyle;
  size: number;
  color: string;
  /** Extra space after each character, in pt. */
  track?: number;
  link?: string;
  /** Degrees counter-clockwise around (x, y). */
  rotate?: number;
  opacity?: number;
}

export interface RectPrim {
  k: "rect";
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
}

export interface LinePrim {
  k: "line";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  width: number;
}

export interface ImagePrim {
  k: "image";
  x: number;
  y: number;
  w: number;
  h: number;
  /** Data URL of a JPEG or PNG. */
  src: string;
  shape: AvatarShape;
}

export interface IconPrim {
  k: "icon";
  /** A key of ICONS. */
  name: string;
  x: number;
  y: number;
  size: number;
  color: string;
}

export type Prim = TextPrim | RectPrim | LinePrim | ImagePrim | IconPrim;

export interface Page {
  prims: Prim[];
}

/** One line (or rule) of a block, drawn relative to the block's top-left corner. */
export interface Item {
  h: number;
  prims: Prim[];
}

/**
 * A record or heading. The flow keeps a block on one page when it can, and only splits between
 * its items when the block is taller than a whole page.
 */
export interface Block {
  items: Item[];
  /** Space above it, dropped at the top of a page. */
  before: number;
  /** Stay on the same page as the next block (headings). */
  keepNext?: boolean;
}

export interface Region {
  x: number;
  y: number;
  w: number;
  h: number;
  /** A different top edge and height for the first page (a header band above the columns). */
  first?: { y: number; h: number };
}
