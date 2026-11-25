import type { CourseI18n, LocaleBundle } from "@/components/course/i18n";

import type { AlgoScene, Item } from "../lib/types";
import en from "./locales/en";
import type { AlgoUi } from "./types";

/**
 * Where Algo Lab's languages come from: one file per language in ./locales. English is built in;
 * the others are chunks of their own, fetched the first time a reader picks one, so the English
 * page does not carry three more copies of the course.
 */
const LOADERS: Record<"vi" | "fr" | "de", () => Promise<LocaleBundle<AlgoUi>>> = {
  vi: () => import("./locales/vi").then((m) => m.default),
  fr: () => import("./locales/fr").then((m) => m.default),
  de: () => import("./locales/de").then((m) => m.default),
};

/**
 * A step's translated `labels`, keyed by item id: `id` is the text of a label, pointer, frame or
 * block, `id.sub` the caption under a block, and `id.label` the tag on an edge. Items that a map
 * does not mention keep their English words.
 */
function relabel(item: Item, labels: Record<string, string>): Item {
  const text = labels[item.id];
  switch (item.t) {
    case "edge": {
      const label = labels[`${item.id}.label`];
      return label === undefined ? item : { ...item, label };
    }
    case "cell":
    case "disc": {
      const sub = labels[`${item.id}.sub`];
      if (text === undefined && sub === undefined) return item;
      return { ...item, text: text ?? item.text, sub: sub ?? item.sub };
    }
    default:
      return text === undefined ? item : { ...item, text };
  }
}

export const ALGO_I18N: CourseI18n<AlgoUi> = {
  english: en.ui,
  load: (locale) => LOADERS[locale](),
  mapScene: (scene, labels): AlgoScene => ({
    items: (scene as AlgoScene).items.map((item) => relabel(item, labels)),
  }),
};
