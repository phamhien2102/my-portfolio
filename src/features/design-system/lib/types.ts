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
  /** Replaces a node's label for this step, e.g. "you · Sydney". */
  labels?: Record<string, string>;
  /** Figures drawn on the stage, such as a recap of where the time went. */
  panels?: Panel[];
}

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
  | "shield";

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

export type CalloutKind = "insight" | "tip" | "warn";

export interface Step {
  short: string;
  title: string;
  /** Paragraphs. `code` between backticks is rendered as inline code. */
  body: string[];
  callout?: { kind: CalloutKind; text: string };
  /** Overrides the tag worked out from the step's position, e.g. a worked case. */
  chapter?: { label: string; tone: "red" | "amber" | "blue" | "green" | "ink" };
  metrics?: Metric[];
  /** Replaces the "What changed" list that is otherwise worked out from the scene and numbers. */
  changes?: { kind: "add" | "del" | "mod"; text: string }[];
  scene: Scene;
}

export type Level = "beginner" | "intermediate" | "advanced";

export interface Lesson {
  id: string;
  title: string;
  summary: string;
  minutes: number;
  level: Level;
  goals: string[];
  takeaways: string[];
  /** The chips above the diagram. A step's `metrics` fill them by label. */
  hud: HudSlot[];
  nodes: DiagramNode[];
  links: DiagramLink[];
  steps: Step[];
}

export interface Module {
  id: string;
  name: string;
  color: string;
  lessons: Lesson[];
}
