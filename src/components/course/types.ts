import type { ReactNode } from "react";

/** Types shared by every course page (/design-system, /algo-lab). A scene is whatever the page's own diagram engine draws. */

export type Level = "beginner" | "intermediate" | "advanced";
export type CalloutKind = "insight" | "tip" | "warn";
export type ChapterTone = "red" | "amber" | "blue" | "green" | "coral" | "ink";

export type HudIcon =
  | "globe"
  | "link"
  | "server"
  | "download"
  | "timer"
  | "gauge"
  | "database"
  | "layers"
  | "alert"
  | "users"
  | "queue"
  | "shield"
  | "list"
  | "grid"
  | "branch"
  | "swap"
  | "search"
  | "memory"
  | "sigma"
  | "bolt"
  | "check"
  | "hourglass";

/** A slot in the row of chips above the diagram; every step fills it in, or leaves a dash. */
export interface HudSlot {
  label: string;
  icon: HudIcon;
}

/** A live number shown as a chip above the diagram. */
export interface Metric {
  label: string;
  value: string;
  level?: "good" | "warn" | "bad";
}

export interface Change {
  kind: "add" | "del" | "mod";
  text: string;
}

export interface CourseStep<S> {
  short: string;
  title: string;
  /** Paragraphs. `code` between backticks is rendered as inline code. */
  body: string[];
  callout?: { kind: CalloutKind; text: string };
  /** Overrides the tag worked out from the step's position, e.g. a worked case. */
  chapter?: { label: string; tone: ChapterTone };
  metrics?: Metric[];
  /** Lines of the lesson's `pseudocode` (1-based) to highlight during this step. */
  lines?: number[];
  /** Replaces the "What changed" list that is otherwise worked out from the scene and numbers. */
  changes?: Change[];
  scene: S;
}

export interface CourseLesson<S = unknown> {
  id: string;
  title: string;
  summary: string;
  minutes: number;
  level: Level;
  goals: string[];
  takeaways: string[];
  /** The chips above the diagram. A step's `metrics` fill them by label. */
  hud: HudSlot[];
  /** Optional pseudocode shown in its own card; each step can highlight lines with `lines`. */
  pseudocode?: string[];
  steps: CourseStep<S>[];
}

export interface CourseModule<L extends CourseLesson> {
  id: string;
  name: string;
  color: string;
  lessons: L[];
}

/** How the shell looks: the System Design course's green mono style, or Algo Lab's coral one. */
export type CourseVariant = "classic" | "algo";

/** What a course page supplies to the shared shell: how to draw a step, and what changed in it. */
export interface SceneEngine<L extends CourseLesson> {
  render(lesson: L, index: number, sceneKey: string): ReactNode;
  /** What the scene itself changed since the previous step; the shell adds the number changes. */
  diff?(lesson: L, index: number): { structure?: Change[]; details?: Change[]; focus?: Change[] };
  /** True when the step shows something failing (its tag becomes "Failure"). */
  isFailure?(lesson: L, index: number): boolean;
  /** The colour key under the stage. */
  legend?: ReactNode;
}
