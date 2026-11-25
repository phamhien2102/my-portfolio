import type { CourseLesson, CourseModule, CourseStep } from "@/components/course/types";

export type NodeKind =
  "user" | "dns" | "server" | "service" | "lb" | "cache" | "db" | "queue" | "limiter";

/** A box on the diagram. Coordinates live in a 640 x 300 viewBox. */
export interface DiagramNode {
  id: string;
  kind: NodeKind;
  label: string;
  /** A smaller second line under the label, such as "resolver". */
  sub?: string;
  x: number;
  y: number;
}

/** A straight line between two nodes; it is drawn only while both ends are on stage. */
export interface DiagramLink {
  id: string;
  from: string;
  to: string;
}

/** One packet looping along a link. `reverse` sends it from `to` back to `from`. */
export interface Flow {
  link: string;
  reverse?: boolean;
  tone?: "req" | "res" | "warn" | "hand";
  label?: string;
  /** Seconds to wait before the packet starts, so a request and its reply look sequential. */
  delay?: number;
}

export type TagTone = "amber" | "green" | "violet" | "red";

/** A caption pill: plain text, or text with a colour and an icon (an icon name from GLYPH). */
export interface Tag {
  text: string;
  tone?: TagTone;
  icon?: string;
}

/** A small card of figures drawn on the stage; a line may hold a label and a value split by a tab. */
export interface Panel {
  x: number;
  y: number;
  title: string;
  icon?: string;
  lines: string[];
}

/** What the diagram shows during one step. */
export interface Scene {
  show: string[];
  hot?: string[];
  down?: string[];
  flows?: Flow[];
  /** A small caption under a node. */
  badges?: Record<string, string>;
  /** A speech-bubble pill above a node, such as the URL typed into the browser. */
  bubbles?: Record<string, string | Tag>;
  /** A pill that sits on a link and stays there, e.g. "GET /products". */
  linkLabels?: Record<string, string | Tag>;
  /** Links drawn muted and dashed: still there, but no longer in use. */
  dim?: string[];
  /** Links left out of this step altogether, such as a direct line that a load balancer replaces. */
  hideLinks?: string[];
  /** Replaces a node's label for this step, e.g. "you · Sydney". */
  labels?: Record<string, string>;
  /** Figures drawn on the stage, such as a recap of where the time went. */
  panels?: Panel[];
}

export type Step = CourseStep<Scene>;

export interface Lesson extends CourseLesson<Scene> {
  nodes: DiagramNode[];
  links: DiagramLink[];
}

export type Module = CourseModule<Lesson>;
