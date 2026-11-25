import type { CourseLesson, CourseModule, CourseStep } from "@/components/course/types";

/** How a cell or disc is painted. */
export type Tone = "plain" | "active" | "found" | "done" | "warn" | "mark" | "muted" | "ghost";
export type EdgeTone = "plain" | "active" | "found" | "warn" | "muted";

interface Base {
  /** Items keep their identity across steps by id: the same id slides and recolours instead of popping in. */
  id: string;
}

/** A keycap-style block: an array slot, a stack entry, a bar. x, y is its centre (or its bottom centre when `base`). */
export interface Cell extends Base {
  t: "cell";
  x: number;
  y: number;
  w?: number;
  h?: number;
  text: string;
  /** Small caption under the cell, such as its index. */
  sub?: string;
  tone?: Tone;
  /** y is the bottom edge, so a taller `h` grows upward (bars). */
  base?: boolean;
}

/** A round node of a tree or graph. x, y is its centre. */
export interface Disc extends Base {
  t: "disc";
  x: number;
  y: number;
  r?: number;
  text: string;
  sub?: string;
  tone?: Tone;
}

/** A line between two items, by id, clipped to their outlines. */
export interface Edge extends Base {
  t: "edge";
  from: string;
  to: string;
  arrow?: "end" | "both" | "none";
  tone?: EdgeTone;
  label?: string;
  dashed?: boolean;
}

/** An arrow with a small pill that points at an item (by id) or a spot. */
export interface Pointer extends Base {
  t: "pointer";
  at: string | { x: number; y: number };
  text: string;
  side?: "below" | "above" | "left" | "right";
  tone?: Tone;
}

/** Free text. */
export interface Label extends Base {
  t: "label";
  x: number;
  y: number;
  text: string;
  size?: number;
  anchor?: "start" | "middle" | "end";
  tone?: "ink" | "muted" | "warn" | "good";
  weight?: number;
}

/** A dashed outline around a region (a window, a subarray, a memory block) with an optional caption. */
export interface Frame extends Base {
  t: "frame";
  x: number;
  y: number;
  w: number;
  h: number;
  text?: string;
  tone?: Tone;
  dashed?: boolean;
  /** A raised slab with sides, for a region of memory, instead of a flat outline. */
  solid?: boolean;
}

export type Item = Cell | Disc | Edge | Pointer | Label | Frame;

/** What the stage shows during one step. */
export interface AlgoScene {
  items: Item[];
}

export type AlgoStep = CourseStep<AlgoScene>;
export type AlgoLesson = CourseLesson<AlgoScene>;
export type AlgoModule = CourseModule<AlgoLesson>;
