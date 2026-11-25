import type { CourseI18n, Locale, Translations } from "@/components/course/i18n";

import type { AlgoScene, Item } from "../lib/types";

/**
 * Where Algo Lab's translations come from. Each language is a chunk of its own, fetched the first
 * time a reader picks it, so the English page does not carry three more copies of the course.
 */
const LOADERS: Record<Exclude<Locale, "en">, () => Promise<Translations>> = {
  vi: () => import("./vi").then((m) => m.default),
  fr: () => import("./fr").then((m) => m.default),
  de: () => import("./de").then((m) => m.default),
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

export const ALGO_I18N: CourseI18n = {
  load: (locale) => LOADERS[locale](),
  mapScene: (scene, labels): AlgoScene => ({
    items: (scene as AlgoScene).items.map((item) => relabel(item, labels)),
  }),
};
