import { DEFAULT_SETTINGS, EMPTY_DATA, TEMPLATES, FONTS, TITLES_EN, newId } from "../data";
import {
  SECTION_KEYS,
  type ResumeData,
  type ResumeDoc,
  type ResumeSettings,
  customKey,
  isCustomKey,
  type OrderKey,
  type SectionKey,
  type TitleKey,
} from "../types";

/**
 * The structured copy of the CV that rides inside every exported PDF (and the saved draft).
 * `parseDoc` accepts anything and returns a complete, valid document, so older or hand-edited
 * payloads never break the editor.
 */

export const PAYLOAD_FORMAT = "custom-resume";
export const PAYLOAD_VERSION = 1;
export const ATTACHMENT_NAME = "resume-data.json";

export interface Payload {
  format: typeof PAYLOAD_FORMAT;
  version: number;
  exportedAt: string;
  template: ResumeSettings["template"];
  settings: ResumeSettings;
  data: ResumeData;
}

export function toPayload(doc: ResumeDoc): Payload {
  return {
    format: PAYLOAD_FORMAT,
    version: PAYLOAD_VERSION,
    exportedAt: new Date().toISOString(),
    template: doc.settings.template,
    settings: doc.settings,
    data: doc.data,
  };
}

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown, fallback = ""): string => (typeof v === "string" ? v : fallback);
const num = (v: unknown, lo: number, hi: number, fallback: number): number =>
  typeof v === "number" && Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : fallback;
const list = (v: unknown): Record<string, unknown>[] => (Array.isArray(v) ? v.filter(isObj) : []);
const id = (v: unknown, prefix: string): string => (typeof v === "string" && v ? v : newId(prefix));

export function parseData(raw: unknown): ResumeData {
  const r = isObj(raw) ? raw : {};
  const b = isObj(r.basics) ? r.basics : {};
  return {
    basics: {
      name: str(b.name),
      title: str(b.title),
      email: str(b.email),
      phone: str(b.phone),
      location: str(b.location),
      website: str(b.website),
      linkedin: str(b.linkedin),
      github: str(b.github),
      extras: list(b.extras).map((x) => ({
        id: id(x.id, "ex"),
        label: str(x.label),
        value: str(x.value),
        icon: str(x.icon),
      })),
      avatar: typeof b.avatar === "string" && b.avatar.startsWith("data:image/") ? b.avatar : "",
    },
    summary: str(r.summary),
    experience: list(r.experience).map((x) => ({
      id: id(x.id, "exp"),
      role: str(x.role),
      company: str(x.company),
      location: str(x.location),
      start: str(x.start),
      end: str(x.end),
      bullets: str(x.bullets),
    })),
    education: list(r.education).map((x) => ({
      id: id(x.id, "edu"),
      school: str(x.school),
      degree: str(x.degree),
      location: str(x.location),
      start: str(x.start),
      end: str(x.end),
      details: str(x.details),
    })),
    skills: list(r.skills).map((x) => ({
      id: id(x.id, "sk"),
      name: str(x.name),
      items: str(x.items),
    })),
    projects: list(r.projects).map((x) => ({
      id: id(x.id, "pr"),
      name: str(x.name),
      link: str(x.link),
      tech: str(x.tech),
      bullets: str(x.bullets),
    })),
    certifications: list(r.certifications).map((x) => ({
      id: id(x.id, "ce"),
      name: str(x.name),
      issuer: str(x.issuer),
      date: str(x.date),
    })),
    custom: list(r.custom).map((x) => ({
      id: id(x.id, "cu"),
      title: str(x.title),
      style: x.style === "text" ? ("text" as const) : ("bullets" as const),
      body: str(x.body),
    })),
    languages: list(r.languages).map((x) => ({
      id: id(x.id, "la"),
      name: str(x.name),
      level: str(x.level),
    })),
  };
}

export function parseSettings(raw: unknown): ResumeSettings {
  const r = isObj(raw) ? raw : {};
  const d = DEFAULT_SETTINGS;
  const template = TEMPLATES.some((t) => t.id === r.template)
    ? (r.template as ResumeSettings["template"])
    : d.template;
  const font = FONTS.some((f) => f.id === r.font) ? (r.font as ResumeSettings["font"]) : d.font;
  const accent =
    typeof r.accent === "string" && /^#[0-9a-f]{6}$/i.test(r.accent) ? r.accent : d.accent;
  const validKey = (k: unknown): k is OrderKey =>
    typeof k === "string" && (SECTION_KEYS.includes(k as SectionKey) || isCustomKey(k));
  const order = Array.isArray(r.order)
    ? r.order.filter((k, i, a): k is OrderKey => validKey(k) && a.indexOf(k) === i)
    : d.order;
  const hidden = Array.isArray(r.hidden) ? r.hidden.filter(validKey) : [];
  const titles = { ...TITLES_EN };
  if (isObj(r.titles)) {
    for (const k of Object.keys(titles) as TitleKey[]) {
      if (typeof r.titles[k] === "string") titles[k] = r.titles[k] as string;
    }
  }
  return {
    template,
    accent,
    font,
    pageNumbers:
      (["off", "left", "center", "right"] as const).find((s) => s === r.pageNumbers) ?? "center",
    avatarShape:
      (["circle", "square", "rounded", "arch", "leaf"] as const).find((s) => s === r.avatarShape) ??
      "circle",
    contactIcons: r.contactIcons === true,
    avatarScale: num(r.avatarScale, 0.6, 1.6, 1),
    watermark: (() => {
      const w = isObj(r.watermark) ? r.watermark : {};
      return {
        text: str(w.text).slice(0, 60),
        mode: w.mode === "horizontal" ? ("horizontal" as const) : ("diagonal" as const),
        opacity: num(w.opacity, 0.03, 0.3, 0.1),
        scale: num(w.scale, 0.5, 1.5, 1),
      };
    })(),
    fontSize: num(r.fontSize, 8, 12, d.fontSize),
    spacing: num(r.spacing, 0.7, 1.5, d.spacing),
    order,
    hidden,
    titles,
  };
}

export function parseDoc(raw: unknown): ResumeDoc {
  const r = isObj(raw) ? raw : {};
  const data = parseData(r.data ?? EMPTY_DATA);
  const settings = parseSettings(r.settings);
  const live = (k: OrderKey) => !isCustomKey(k) || data.custom.some((c) => customKey(c.id) === k);
  return {
    data,
    settings: {
      ...settings,
      order: settings.order.filter(live),
      hidden: settings.hidden.filter(live),
    },
  };
}

/** Accepts the JSON text of an embedded payload. Returns null if it is not one of ours. */
export function parsePayload(text: string): ResumeDoc | null {
  try {
    const raw: unknown = JSON.parse(text);
    if (!isObj(raw) || raw.format !== PAYLOAD_FORMAT) return null;
    if (typeof raw.version !== "number" || raw.version > PAYLOAD_VERSION) return null;
    return parseDoc(raw);
  } catch {
    return null;
  }
}
