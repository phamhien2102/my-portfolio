import type { CourseUi } from "./i18n";
import type { Change, ChapterTone, CourseLesson, SceneEngine } from "./types";

/** The small coloured tag above a step's title, worked out from where the step sits. */
export function chapterOf<L extends CourseLesson>(
  lesson: L,
  index: number,
  failing: boolean,
  ui: CourseUi,
): { label: string; tone: ChapterTone } {
  const step = lesson.steps[index];
  if (step.chapter) return step.chapter;
  if (index === 0) return { label: ui.problem, tone: "red" };
  if (failing) return { label: ui.failure, tone: "amber" };
  if (index === lesson.steps.length - 1) return { label: ui.recap, tone: "ink" };
  return { label: ui.technique, tone: "blue" };
}

const MAX_CHANGES = 6;

/**
 * "What changed": how this step differs from the one before it. Unless the step spells it out
 * (`changes`), the page's engine reports what moved in the scene and this adds the numbers that
 * moved. Order: structure, numbers, details; when none of those changed, where the focus is.
 * Earlier kinds win when the list has to be cut short.
 */
export function changesOf<L extends CourseLesson>(
  lesson: L,
  index: number,
  engine: SceneEngine<L>,
): Change[] {
  const step = lesson.steps[index];
  if (step.changes?.length) return step.changes;

  const prev = index > 0 ? lesson.steps[index - 1] : undefined;
  const scene = engine.diff?.(lesson, index) ?? {};

  const metrics: Change[] = [];
  const before = new Map((prev?.metrics ?? []).map((m) => [m.label, m.value]));
  for (const m of step.metrics ?? []) {
    const old = before.get(m.label);
    if (old === undefined) metrics.push({ kind: "add", text: `${m.label}: ${m.value}` });
    else if (old !== m.value)
      metrics.push({ kind: "mod", text: `${m.label}: ${old} → ${m.value}` });
  }

  const out = [...(scene.structure ?? []), ...metrics, ...(scene.details ?? [])];
  if (!out.length) out.push(...(scene.focus ?? []));
  return out.slice(0, MAX_CHANGES);
}
