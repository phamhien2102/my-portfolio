"use client";

import { CourseApp, type NavItem } from "@/components/course/course-app";
import { BookIcon, Cheat, Frame, Gear } from "@/components/course/icons";
import type { Change, SceneEngine } from "@/components/course/types";

import { MODULES } from "../data";
import { DESIGN_I18N } from "../i18n";
import type { DesignUi } from "../i18n/types";
import type { Lesson } from "../lib/types";
import { LessonDiagram } from "./lesson-diagram";

const navFor = (ui: DesignUi): readonly NavItem[] => [
  { label: ui.nav.learn, Icon: BookIcon },
  { label: ui.nav.practice, Icon: Gear, soon: true },
  { label: ui.nav.designLab, Icon: Frame, soon: true },
  { label: ui.nav.cheatsheets, Icon: Cheat, soon: true },
];

const placeholderFor = (ui: DesignUi) => ui.searchPlaceholder;

/** What this page's scene adds to "What changed": blocks, captions and traffic. */
function diff(ui: DesignUi, lesson: Lesson, index: number) {
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
    if (!prevDown.has(id)) structure.push({ kind: "mod", text: ui.goesDown(node(id)) });
  for (const id of prevDown)
    if (!nowDown.has(id)) structure.push({ kind: "mod", text: ui.isBack(node(id)) });

  const details: Change[] = [];
  for (const [id, text] of Object.entries(now.badges ?? {})) {
    const old = before?.badges?.[id];
    if (old !== text) details.push({ kind: old ? "mod" : "add", text: `${node(id)}: ${text}` });
  }
  const oldLabels = new Set((before?.flows ?? []).map((f) => f.label).filter(Boolean));
  for (const f of now.flows ?? [])
    if (f.label && !oldLabels.has(f.label))
      details.push({ kind: "add", text: ui.traffic(f.label) });

  const focus: Change[] = (now.hot ?? []).map((id) => ({
    kind: "mod" as const,
    text: ui.focusOn(node(id)),
  }));
  return { structure, details, focus };
}

function makeEngine(ui: DesignUi): SceneEngine<Lesson> {
  return {
    render: (lesson, index, sceneKey) => (
      <LessonDiagram
        nodes={lesson.nodes}
        links={lesson.links}
        scene={lesson.steps[index].scene}
        sceneKey={sceneKey}
        title={`${lesson.title}: ${lesson.steps[index].title}`}
      />
    ),
    diff: (lesson, index) => diff(ui, lesson, index),
    isFailure: (lesson, index) => !!lesson.steps[index].scene.down?.length,
    legend: (
      <>
        <span>
          <i className="lg req" /> {ui.legend.request}
        </span>
        <span>
          <i className="lg res" /> {ui.legend.response}
        </span>
        <span>
          <i className="lg hand" /> {ui.legend.handshake}
        </span>
        <span>
          <i className="lg warn" /> {ui.legend.failed}
        </span>
      </>
    ),
  };
}

export function DesignSystemApp({ fontClassName }: { fontClassName: string }) {
  return (
    <CourseApp
      modules={MODULES}
      engine={makeEngine}
      fontClassName={fontClassName}
      storageKey="design-system"
      brand={<span>Design System</span>}
      nav={navFor}
      searchPlaceholder={placeholderFor}
      i18n={DESIGN_I18N}
    />
  );
}
