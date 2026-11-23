import type { Lesson } from "./types";

export type ChapterTone = "red" | "amber" | "blue" | "green" | "ink";

/** The small coloured tag above a step's title, worked out from where the step sits. */
export function chapterOf(lesson: Lesson, index: number): { label: string; tone: ChapterTone } {
  const step = lesson.steps[index];
  if (step.chapter) return step.chapter;
  if (index === 0) return { label: "Problem", tone: "red" };
  if (step.scene.down?.length) return { label: "Failure", tone: "amber" };
  if (index === lesson.steps.length - 1) return { label: "Recap", tone: "ink" };
  return { label: "Technique", tone: "blue" };
}

export interface Change {
  kind: "add" | "del" | "mod";
  text: string;
}

const MAX_CHANGES = 6;

/**
 * "What changed": how this step differs from the one before it. Unless the step spells it out
 * (`changes`), it is worked out from the scene: blocks that appear, vanish or fail, then numbers
 * that move, captions that change, traffic that starts, and where the focus lands. Earlier kinds
 * win when the list has to be cut short.
 */
export function changesOf(lesson: Lesson, index: number): Change[] {
  const step = lesson.steps[index];
  if (step.changes?.length) return step.changes;

  const node = (id: string) => {
    const n = lesson.nodes.find((x) => x.id === id);
    return n ? (n.sub ? `${n.label} ${n.sub}` : n.label) : id;
  };
  const now = step.scene;
  const before = index > 0 ? lesson.steps[index - 1].scene : undefined;
  const prev = index > 0 ? lesson.steps[index - 1] : undefined;
  const prevShown = new Set(before?.show);
  const prevDown = new Set(before?.down);
  const nowDown = new Set(now.down);

  const out: Change[] = [];
  for (const id of now.show) if (!prevShown.has(id)) out.push({ kind: "add", text: node(id) });
  for (const id of before?.show ?? [])
    if (!now.show.includes(id)) out.push({ kind: "del", text: node(id) });
  for (const id of nowDown)
    if (!prevDown.has(id)) out.push({ kind: "mod", text: `${node(id)} goes down` });
  for (const id of prevDown)
    if (!nowDown.has(id)) out.push({ kind: "mod", text: `${node(id)} is back` });

  // Numbers: a chip that appears, or one whose value moved.
  const before_metrics = new Map((prev?.metrics ?? []).map((m) => [m.label, m.value]));
  for (const m of step.metrics ?? []) {
    const old = before_metrics.get(m.label);
    if (old === undefined) out.push({ kind: "add", text: `${m.label}: ${m.value}` });
    else if (old !== m.value) out.push({ kind: "mod", text: `${m.label}: ${old} → ${m.value}` });
  }

  // Captions under blocks.
  for (const [id, text] of Object.entries(now.badges ?? {})) {
    const old = before?.badges?.[id];
    if (old !== text) out.push({ kind: old ? "mod" : "add", text: `${node(id)}: ${text}` });
  }

  // Traffic that was not there in the previous step.
  const oldLabels = new Set((before?.flows ?? []).map((f) => f.label).filter(Boolean));
  for (const f of now.flows ?? [])
    if (f.label && !oldLabels.has(f.label)) out.push({ kind: "add", text: `Traffic: ${f.label}` });

  // Nothing else moved: say where to look.
  if (!out.length) {
    for (const id of now.hot ?? []) out.push({ kind: "mod", text: `Focus on ${node(id)}` });
  }
  return out.slice(0, MAX_CHANGES);
}
