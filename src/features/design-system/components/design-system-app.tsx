"use client";

import { CourseApp, type NavItem } from "@/components/course/course-app";
import { BookIcon, Cheat, Frame, Gear } from "@/components/course/icons";
import type { Change, SceneEngine } from "@/components/course/types";

import { MODULES } from "../data";
import type { Lesson } from "../lib/types";
import { LessonDiagram } from "./lesson-diagram";

const NAV: readonly NavItem[] = [
  { label: "Learn", Icon: BookIcon },
  { label: "Practice", Icon: Gear, soon: true },
  { label: "Design Lab", Icon: Frame, soon: true },
  { label: "Cheatsheets", Icon: Cheat, soon: true },
];

/** What this page's scene adds to "What changed": blocks, captions and traffic. */
function diff(lesson: Lesson, index: number) {
  const node = (id: string) => {
    const n = lesson.nodes.find((x) => x.id === id);
    return n ? (n.sub ? `${n.label} ${n.sub}` : n.label) : id;
  };
  const now = lesson.steps[index].scene;
  const before = index > 0 ? lesson.steps[index - 1].scene : undefined;
  const prevShown = new Set(before?.show);
  const prevDown = new Set(before?.down);
  const nowDown = new Set(now.down);

  const structure: Change[] = [];
  for (const id of now.show)
    if (!prevShown.has(id)) structure.push({ kind: "add", text: node(id) });
  for (const id of before?.show ?? [])
    if (!now.show.includes(id)) structure.push({ kind: "del", text: node(id) });
  for (const id of nowDown)
    if (!prevDown.has(id)) structure.push({ kind: "mod", text: `${node(id)} goes down` });
  for (const id of prevDown)
    if (!nowDown.has(id)) structure.push({ kind: "mod", text: `${node(id)} is back` });

  const details: Change[] = [];
  for (const [id, text] of Object.entries(now.badges ?? {})) {
    const old = before?.badges?.[id];
    if (old !== text) details.push({ kind: old ? "mod" : "add", text: `${node(id)}: ${text}` });
  }
  const oldLabels = new Set((before?.flows ?? []).map((f) => f.label).filter(Boolean));
  for (const f of now.flows ?? [])
    if (f.label && !oldLabels.has(f.label))
      details.push({ kind: "add", text: `Traffic: ${f.label}` });

  const focus: Change[] = (now.hot ?? []).map((id) => ({
    kind: "mod" as const,
    text: `Focus on ${node(id)}`,
  }));
  return { structure, details, focus };
}

const ENGINE: SceneEngine<Lesson> = {
  render: (lesson, index, sceneKey) => (
    <LessonDiagram
      nodes={lesson.nodes}
      links={lesson.links}
      scene={lesson.steps[index].scene}
      sceneKey={sceneKey}
      title={`${lesson.title}: ${lesson.steps[index].title}`}
    />
  ),
  diff,
  isFailure: (lesson, index) => !!lesson.steps[index].scene.down?.length,
  legend: (
    <>
      <span>
        <i className="lg req" /> request
      </span>
      <span>
        <i className="lg res" /> response
      </span>
      <span>
        <i className="lg hand" /> handshake
      </span>
      <span>
        <i className="lg warn" /> failed
      </span>
    </>
  ),
};

export function DesignSystemApp({ fontClassName }: { fontClassName: string }) {
  return (
    <CourseApp
      modules={MODULES}
      engine={ENGINE}
      fontClassName={fontClassName}
      storageKey="design-system"
      brand={
        <>
          Raymond&rsquo;s <span>System Design</span>
        </>
      }
      nav={NAV}
      searchPlaceholder="Search lessons & concepts…"
    />
  );
}
