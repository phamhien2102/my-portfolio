import { newId, TITLES_EN } from "../data";
import {
  customKey,
  isCustomKey,
  type BasicKey,
  type OrderKey,
  type RecordKey,
  type ResumeData,
  type ResumeDoc,
  type ResumeSettings,
  type SectionKey,
} from "../types";
import { SECTION_KEYS } from "../types";

/** Pure edits of a document. The editor passes these to the store's `update`. */

export type Doc = ResumeDoc;

export function setBasic(doc: Doc, key: BasicKey, value: string): Doc {
  return { ...doc, data: { ...doc.data, basics: { ...doc.data.basics, [key]: value } } };
}

export function setSummary(doc: Doc, value: string): Doc {
  return { ...doc, data: { ...doc.data, summary: value } };
}

type Rec = { id: string };

function records(doc: Doc, key: RecordKey): Rec[] {
  return doc.data[key] as Rec[];
}

function withRecords(doc: Doc, key: RecordKey, list: Rec[]): Doc {
  return { ...doc, data: { ...doc.data, [key]: list } as ResumeData };
}

export function patchRecord(
  doc: Doc,
  key: RecordKey,
  id: string,
  patch: Record<string, string>,
): Doc {
  return withRecords(
    doc,
    key,
    records(doc, key).map((r) => (r.id === id ? { ...r, ...patch } : r)),
  );
}

export const BLANK: Record<RecordKey, () => Rec> = {
  experience: () => ({
    id: newId("exp"),
    role: "",
    company: "",
    location: "",
    start: "",
    end: "",
    bullets: "",
  }),
  education: () => ({
    id: newId("edu"),
    school: "",
    degree: "",
    location: "",
    start: "",
    end: "",
    details: "",
  }),
  skills: () => ({ id: newId("sk"), name: "", items: "" }),
  projects: () => ({ id: newId("pr"), name: "", link: "", tech: "", bullets: "" }),
  certifications: () => ({ id: newId("ce"), name: "", issuer: "", date: "" }),
  languages: () => ({ id: newId("la"), name: "", level: "" }),
};

export function addRecord(doc: Doc, key: RecordKey): { doc: Doc; id: string } {
  const rec = BLANK[key]();
  return { doc: withRecords(doc, key, [...records(doc, key), rec]), id: rec.id };
}

export function removeRecord(doc: Doc, key: RecordKey, id: string): Doc {
  return withRecords(
    doc,
    key,
    records(doc, key).filter((r) => r.id !== id),
  );
}

export function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return list;
  const next = list.slice();
  const [it] = next.splice(from, 1);
  next.splice(to, 0, it);
  return next;
}

export function moveRecord(doc: Doc, key: RecordKey, from: number, to: number): Doc {
  return withRecords(doc, key, moveItem(records(doc, key), from, to));
}

function withSettings(doc: Doc, patch: Partial<ResumeSettings>): Doc {
  return { ...doc, settings: { ...doc.settings, ...patch } };
}

export function setSettings(doc: Doc, patch: Partial<ResumeSettings>): Doc {
  return withSettings(doc, patch);
}

export function moveSection(doc: Doc, from: number, to: number): Doc {
  return withSettings(doc, { order: moveItem(doc.settings.order, from, to) });
}

export function toggleHidden(doc: Doc, key: OrderKey): Doc {
  const hidden = doc.settings.hidden.includes(key)
    ? doc.settings.hidden.filter((k) => k !== key)
    : [...doc.settings.hidden, key];
  return withSettings(doc, { hidden });
}

export function removeSection(doc: Doc, key: OrderKey): Doc {
  const next = withSettings(doc, {
    order: doc.settings.order.filter((k) => k !== key),
    hidden: doc.settings.hidden.filter((k) => k !== key),
  });
  if (!isCustomKey(key)) return next;
  return {
    ...next,
    data: { ...next.data, custom: next.data.custom.filter((c) => customKey(c.id) !== key) },
  };
}

/** A new, empty custom section at the end of the CV. */
export function addCustomSection(doc: Doc): { doc: Doc; key: OrderKey } {
  const id = newId("cu");
  const key = customKey(id);
  const next: Doc = {
    data: {
      ...doc.data,
      custom: [...doc.data.custom, { id, title: "New section", style: "bullets", body: "" }],
    },
    settings: { ...doc.settings, order: [...doc.settings.order, key] },
  };
  return { doc: next, key };
}

export function patchCustom(
  doc: Doc,
  key: OrderKey,
  patch: Partial<{ title: string; style: "bullets" | "text"; body: string }>,
): Doc {
  return {
    ...doc,
    data: {
      ...doc.data,
      custom: doc.data.custom.map((c) => (customKey(c.id) === key ? { ...c, ...patch } : c)),
    },
  };
}

export function addSection(doc: Doc, key: SectionKey): Doc {
  if (doc.settings.order.includes(key)) return doc;
  return withSettings(doc, { order: [...doc.settings.order, key] });
}

export function missingSections(doc: Doc): SectionKey[] {
  return SECTION_KEYS.filter((k) => !doc.settings.order.includes(k));
}

export function setTitle(doc: Doc, key: keyof ResumeSettings["titles"], value: string): Doc {
  return withSettings(doc, { titles: { ...doc.settings.titles, [key]: value } });
}

export function resetTitle(doc: Doc, key: keyof ResumeSettings["titles"]): Doc {
  return setTitle(doc, key, TITLES_EN[key]);
}

export function addExtra(doc: Doc, label = ""): { doc: Doc; id: string } {
  const id = newId("ex");
  return {
    id,
    doc: {
      ...doc,
      data: {
        ...doc.data,
        basics: {
          ...doc.data.basics,
          extras: [...doc.data.basics.extras, { id, label, value: "", icon: "" }],
        },
      },
    },
  };
}

export function patchExtra(
  doc: Doc,
  id: string,
  patch: { label?: string; value?: string; icon?: string },
): Doc {
  const b = doc.data.basics;
  return {
    ...doc,
    data: {
      ...doc.data,
      basics: { ...b, extras: b.extras.map((x) => (x.id === id ? { ...x, ...patch } : x)) },
    },
  };
}

export function removeExtra(doc: Doc, id: string): Doc {
  const b = doc.data.basics;
  return {
    ...doc,
    data: { ...doc.data, basics: { ...b, extras: b.extras.filter((x) => x.id !== id) } },
  };
}
