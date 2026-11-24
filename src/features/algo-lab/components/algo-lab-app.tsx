"use client";

import { CourseApp, type NavItem } from "@/components/course/course-app";
import { BarChart, BookIcon, CodeIcon, FileText, Trophy } from "@/components/course/icons";
import type { Change, SceneEngine } from "@/components/course/types";

import { MODULES } from "../data";
import type { AlgoLesson, Item } from "../lib/types";
import { AlgoDiagram } from "./algo-diagram";

const NAV: readonly NavItem[] = [
  { label: "Learn", Icon: BookIcon },
  { label: "Practice", Icon: CodeIcon, soon: true },
  { label: "Cheatsheets", Icon: FileText, soon: true },
  { label: "Challenges", Icon: Trophy, soon: true },
  { label: "Progress", Icon: BarChart, soon: true },
];

/** A short name for an item in the "What changed" list, or nothing if it has no text of its own. */
const nameOf = (item: Item) =>
  item.t === "cell" || item.t === "disc" || item.t === "label" ? item.text || undefined : undefined;

/** What moved on the stage since the previous step: items that came or went, then recoloured or moved ones. */
function diff(lesson: AlgoLesson, index: number) {
  const now = new Map(lesson.steps[index].scene.items.map((i) => [i.id, i]));
  const before = new Map(
    (index > 0 ? lesson.steps[index - 1].scene.items : []).map((i) => [i.id, i]),
  );

  const structure: Change[] = [];
  for (const [id, item] of now) {
    const name = nameOf(item);
    if (!before.has(id) && name && item.t !== "label") structure.push({ kind: "add", text: name });
  }
  for (const [id, item] of before) {
    const name = nameOf(item);
    if (!now.has(id) && name && item.t !== "label") structure.push({ kind: "del", text: name });
  }

  const details: Change[] = [];
  for (const [id, item] of now) {
    const old = before.get(id);
    const name = nameOf(item);
    if (!old || !name) continue;
    if ((item.t === "cell" || item.t === "disc") && (old.t === "cell" || old.t === "disc")) {
      if ((item.tone ?? "plain") !== (old.tone ?? "plain") && item.tone && item.tone !== "plain")
        details.push({
          kind: "mod",
          text: `${name} is now ${item.tone === "ghost" ? "empty" : item.tone}`,
        });
      else if (item.x !== old.x || item.y !== old.y)
        details.push({ kind: "mod", text: `${name} moved` });
      else if (item.text !== old.text)
        details.push({ kind: "mod", text: `${old.text} → ${item.text}` });
    }
  }
  const pointers: Change[] = [];
  for (const [id, item] of now) {
    const old = before.get(id);
    if (item.t === "pointer" && (!old || (old.t === "pointer" && old.at !== item.at))) {
      pointers.push({ kind: old ? "mod" : "add", text: `Pointer ${item.text}` });
    }
  }
  return { structure, details: [...pointers, ...details], focus: pointers };
}

const ENGINE: SceneEngine<AlgoLesson> = {
  render: (lesson, index) => (
    <AlgoDiagram
      scene={lesson.steps[index].scene}
      title={`${lesson.title}: ${lesson.steps[index].title}`}
    />
  ),
  diff,
  isFailure: (lesson, index) =>
    lesson.steps[index].scene.items.some(
      (i) => (i.t === "cell" || i.t === "disc") && i.tone === "warn",
    ),
  legend: (
    <>
      <span>
        <i className="al-lg active" /> checking
      </span>
      <span>
        <i className="al-lg found" /> found
      </span>
      <span>
        <i className="al-lg done" /> settled
      </span>
      <span>
        <i className="al-lg warn" /> problem
      </span>
    </>
  ),
};

export function AlgoLabApp({ fontClassName }: { fontClassName: string }) {
  return (
    <CourseApp
      modules={MODULES}
      engine={ENGINE}
      fontClassName={fontClassName}
      storageKey="algo-lab"
      variant="algo"
      brand={
        <>
          Raymond&rsquo;s <span>Algo Lab</span>
        </>
      }
      nav={NAV}
      searchPlaceholder="Search lessons & concepts…"
    />
  );
}
