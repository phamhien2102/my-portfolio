import type { CourseI18n, LocaleBundle } from "@/components/course/i18n";

import type { Lesson, Scene, Tag } from "../lib/types";
import en from "./locales/en";
import type { DesignUi } from "./types";

/**
 * Where the course's languages come from: one file per language in ./locales. English is built in;
 * the others are chunks of their own, fetched the first time a reader picks one, so the English
 * page does not carry three more copies of the course.
 */
const LOADERS: Record<"vi" | "fr" | "de", () => Promise<LocaleBundle<DesignUi>>> = {
  vi: () => import("./locales/vi").then((m) => m.default),
  fr: () => import("./locales/fr").then((m) => m.default),
  de: () => import("./locales/de").then((m) => m.default),
};

/** Replace the text of a caption that is a plain string or a `{ text, tone, icon }` tag. */
const retag = (value: string | Tag, text: string | undefined): string | Tag => {
  if (text === undefined) return value;
  return typeof value === "string" ? text : { ...value, text };
};

const mapRecord = <T>(
  record: Record<string, T> | undefined,
  prefix: string,
  labels: Record<string, string>,
  swap: (value: T, text: string | undefined) => T,
) =>
  record &&
  Object.fromEntries(
    Object.entries(record).map(([id, value]) => [id, swap(value, labels[`${prefix}.${id}`])]),
  );

/**
 * A step's translated `labels`. The keys name where a piece of text sits in the scene:
 * `badges.<node>`, `bubbles.<node>`, `linkLabels.<link>` and `labels.<node>` (the node's name for
 * this step), `flows.<n>` (a moving packet's label), `panels.<n>.title` and `panels.<n>.line<m>`.
 * Whatever a map does not mention keeps its English words.
 */
function relabel(scene: Scene, labels: Record<string, string>): Scene {
  return {
    ...scene,
    badges: mapRecord(scene.badges, "badges", labels, (v, t) => t ?? v),
    bubbles: mapRecord(scene.bubbles, "bubbles", labels, retag),
    linkLabels: mapRecord(scene.linkLabels, "linkLabels", labels, retag),
    labels: mapRecord(scene.labels, "labels", labels, (v, t) => t ?? v),
    flows: scene.flows?.map((flow, i) =>
      labels[`flows.${i}`] === undefined ? flow : { ...flow, label: labels[`flows.${i}`] },
    ),
    panels: scene.panels?.map((panel, i) => ({
      ...panel,
      title: labels[`panels.${i}.title`] ?? panel.title,
      lines: panel.lines.map((line, j) => labels[`panels.${i}.line${j}`] ?? line),
    })),
  };
}

/** The names on the diagram: `<node>` is a block's label and `<node>.sub` the line under it. */
function renameNodes(lesson: Lesson, labels: Record<string, string>): Lesson {
  return {
    ...lesson,
    nodes: lesson.nodes.map((node) => ({
      ...node,
      label: labels[node.id] ?? node.label,
      sub: labels[`${node.id}.sub`] ?? node.sub,
    })),
  };
}

export const DESIGN_I18N: CourseI18n<DesignUi> = {
  english: en.ui,
  load: (locale) => LOADERS[locale](),
  mapScene: (scene, labels) => relabel(scene as Scene, labels),
  mapLesson: (lesson, labels) => renameNodes(lesson as Lesson, labels),
};
