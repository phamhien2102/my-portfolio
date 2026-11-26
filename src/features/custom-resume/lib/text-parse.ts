import { EMPTY_DATA, TITLES_EN, TITLES_VI, newId } from "../data";
import {
  SECTION_KEYS,
  type ResumeData,
  type ResumeDoc,
  type SectionKey,
  type TemplateId,
} from "../types";
import { parseSettings } from "./serialize";

/**
 * Best-effort recovery of a CV from the text of a PDF that has no embedded data. It relies on the
 * shapes our own templates produce (heading, title line with a date, company line, bullets) and
 * says what it was unsure about, so the person can fix it before continuing.
 */

export interface RawItem {
  page: number;
  x: number;
  /** Distance of the baseline from the top of the page. */
  y: number;
  w: number;
  size: number;
  str: string;
}

export interface ExtractDraft {
  doc: ResumeDoc;
  template: TemplateId;
  templateGuess: "layout" | "default";
  /** Names of the fields the parser could not be sure of. */
  unsure: string[];
  /** Text that was found but not placed anywhere. */
  unassigned: string[];
  found: { key: SectionKey; count: number }[];
}

interface Seg {
  x0: number;
  x1: number;
  text: string;
}

interface Line {
  page: number;
  y: number;
  size: number;
  segs: Seg[];
  text: string;
}

const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[:·|]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();

const HEADINGS: Record<SectionKey | "contact", string[]> = {
  contact: ["contact", "contact info", "contact information", "lien he", "thong tin lien he"],
  summary: [
    "summary",
    "profile",
    "about me",
    "about",
    "professional summary",
    "objective",
    "career objective",
    "gioi thieu",
    "gioi thieu ban than",
    "tom tat",
    "muc tieu",
    "muc tieu nghe nghiep",
  ],
  experience: [
    "experience",
    "work experience",
    "professional experience",
    "employment",
    "employment history",
    "work history",
    "kinh nghiem",
    "kinh nghiem lam viec",
  ],
  education: ["education", "academic background", "hoc van", "trinh do hoc van"],
  skills: [
    "skills",
    "technical skills",
    "core skills",
    "key skills",
    "ky nang",
    "ky nang chuyen mon",
  ],
  projects: ["projects", "personal projects", "selected projects", "du an", "du an noi bat"],
  certifications: ["certifications", "certificates", "licenses", "chung chi"],
  languages: ["languages", "ngon ngu"],
};

function headingOf(text: string, strict = false): SectionKey | "contact" | null {
  // Strict: our templates set headings in capitals, or larger than the body (Modern).
  if (strict && text !== text.toUpperCase()) return null;
  const n = norm(text);
  if (!n || n.length > 40) return null;
  // Letter-spaced headings lose their word gaps in extraction, so compare without spaces.
  const flat = n.replace(/\s/g, "");
  for (const [key, words] of Object.entries(HEADINGS)) {
    if (words.some((w) => w.replace(/\s/g, "") === flat)) return key as SectionKey | "contact";
  }
  return null;
}

const MONTH = "(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\\.?";
const POINT = `(?:(?:${MONTH}\\s+)?\\d{4}|\\d{1,2}/\\d{4})`;
const OPEN = "present|now|current|hien tai|nay";
const DATE_RE = new RegExp(`^(?:${POINT})(?:\\s*[–—-]\\s*(?:${POINT}|${OPEN}))?$`, "i");
const DATE_LOOSE_RE = new RegExp(
  `^(?:${POINT}|${OPEN})(?:\\s*[–—-]\\s*(?:${POINT}|${OPEN}))?$`,
  "i",
);

function isDate(text: string): boolean {
  const t = norm(text).replace(/–|—/g, "-");
  return DATE_RE.test(t) || DATE_LOOSE_RE.test(t);
}

function splitDates(text: string): [string, string] {
  const parts = text.split(/\s+[–—-]\s+|\s*[–—]\s*/);
  return [parts[0]?.trim() ?? "", parts.slice(1).join(" – ").trim()];
}

const BULLET_RE = /^[•–·▪‣◦*-]\s*/;
const isBullet = (l: Line) => BULLET_RE.test(l.segs[0]?.text ?? "");
const stripBullet = (s: string) => s.replace(BULLET_RE, "").trim();

/* ---------- items -> lines ---------- */

/** Letter-spaced text comes out of PDFs as "E X P E R I E N C E": put the word back together. */
function unspace(str: string): string {
  const t = str.trim();
  const tokens = t.split(" ");
  if (tokens.length < 4) return t;
  const singles = tokens.filter((k) => k.length === 1).length;
  const blanks = tokens.filter((k) => k === "").length;
  if (singles + blanks !== tokens.length) return t;
  return t
    .split(/ {2,}/)
    .map((w) => w.replace(/ /g, ""))
    .join(" ");
}

function toLines(rawItems: RawItem[]): Line[] {
  const items = rawItems.map((i) => ({ ...i, str: unspace(i.str.normalize("NFC")) }));
  const lines: Line[] = [];
  const byPage = new Map<number, RawItem[]>();
  for (const it of items) {
    if (!it.str.trim() || /^\d+\s*\/\s*\d+$/.test(it.str.trim())) continue; // page numbers
    byPage.set(it.page, [...(byPage.get(it.page) ?? []), it]);
  }
  for (const page of [...byPage.keys()].sort((a, b) => a - b)) {
    const its = byPage.get(page)!.sort((a, b) => a.y - b.y || a.x - b.x);
    let cur: RawItem[] = [];
    const flush = () => {
      if (!cur.length) return;
      cur.sort((a, b) => a.x - b.x);
      const size = Math.max(...cur.map((c) => c.size));
      const segs: Seg[] = [];
      for (const it of cur) {
        const last = segs[segs.length - 1];
        const gap = last ? it.x - last.x1 : Infinity;
        if (last && gap < size * 1.3) {
          last.text += (gap > size * 0.12 ? " " : "") + it.str.trim();
          last.x1 = it.x + it.w;
        } else {
          segs.push({ x0: it.x, x1: it.x + it.w, text: it.str.trim() });
        }
      }
      const y = cur.reduce((s, c) => s + c.y, 0) / cur.length;
      lines.push({ page, y, size, segs, text: segs.map((s) => s.text).join(" ") });
      cur = [];
    };
    for (const it of its) {
      if (cur.length && Math.abs(it.y - cur[0].y) > Math.max(1.5, it.size * 0.3)) flush();
      cur.push(it);
    }
    flush();
  }
  return lines;
}

/** The x of a vertical gutter that no text crosses, if the page is two columns. */
function findGutter(items: RawItem[], pageW: number): number | null {
  const lo = pageW * 0.25;
  const hi = pageW * 0.5;
  const spans = items
    .filter((i) => i.str.trim())
    .map((i) => [i.x, i.x + i.w] as const)
    .sort((a, b) => a[0] - b[0]);
  if (spans.length < 12) return null;
  let best: { at: number; gap: number } | null = null;
  let reach = -Infinity;
  for (let i = 0; i < spans.length; i++) {
    const [s, e] = spans[i];
    if (reach > -Infinity && s - reach > 14 && reach >= lo * 0.6 && s <= hi * 1.15) {
      const at = (reach + s) / 2;
      if (at >= lo && at <= hi && (!best || s - reach > best.gap)) best = { at, gap: s - reach };
    }
    reach = Math.max(reach, e);
  }
  if (!best) return null;
  const left = spans.filter((s) => s[1] <= best!.at).length;
  const right = spans.filter((s) => s[0] >= best!.at).length;
  return left >= 5 && right >= 8 && left + right >= spans.length * 0.95 ? best.at : null;
}

/* ---------- section parsing ---------- */

const EMAIL_RE = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/;
const PHONE_RE = /^\+?[\d\s().-]{8,}$/;
const URL_RE = /^(?:https?:\/\/)?(?:www\.)?[\w-]+(?:\.[\w-]+)+(?:\/\S*)?$/i;

function parseContactToken(tok: string, d: ResumeData, loose: string[]) {
  const t = tok.trim();
  if (!t) return;
  if (EMAIL_RE.test(t)) d.basics.email ||= t;
  else if (PHONE_RE.test(t) && /\d{7,}/.test(t.replace(/\D/g, ""))) d.basics.phone ||= t;
  else if (/linkedin\.com/i.test(t)) d.basics.linkedin ||= t;
  else if (/github\.com/i.test(t)) d.basics.github ||= t;
  else if (URL_RE.test(t) && !/\s/.test(t)) d.basics.website ||= t;
  else if (!d.basics.location) d.basics.location = t;
  else loose.push(t);
}

const CONTACT_LABELS = new Set([
  "email",
  "phone",
  "location",
  "website",
  "linkedin",
  "github",
  "dien thoai",
  "dia chi",
]);

function minPitch(lines: Line[]): number {
  let m = Infinity;
  for (let i = 1; i < lines.length; i++) {
    const d = lines[i].y - lines[i - 1].y;
    if (lines[i].page === lines[i - 1].page && d > 4) m = Math.min(m, d);
  }
  return Number.isFinite(m) ? m : 13;
}

function newBlockAt(lines: Line[], i: number, pitch: number): boolean {
  if (i === 0 || lines[i].page !== lines[i - 1].page) return true;
  return lines[i].y - lines[i - 1].y > pitch + 1.5;
}

function dateSegIndex(l: Line): number {
  return l.segs.findIndex((s) => isDate(s.text));
}

function parseRecords(lines: Line[], kind: "experience" | "education" | "projects", d: ResumeData) {
  type Rec = {
    title: string;
    date: string;
    sub: string;
    bullets: string[];
    link: string;
    bulletX: number;
  };
  const recs: Rec[] = [];
  let cur: Rec | null = null;
  let state: 0 | 1 | 2 = 0;
  let lastBullet = false;
  const blank = (): Rec => ({ title: "", date: "", sub: "", bullets: [], link: "", bulletX: 0 });

  for (const l of lines) {
    if (isBullet(l)) {
      if (!cur) {
        cur = blank();
        recs.push(cur);
      }
      cur.bullets.push(stripBullet(l.text));
      cur.bulletX = l.segs[0].x0;
      state = 2;
      lastBullet = true;
      continue;
    }
    if (lastBullet && cur && l.segs[0].x0 >= cur.bulletX + 5 && dateSegIndex(l) < 0) {
      cur.bullets[cur.bullets.length - 1] += " " + l.text;
      continue;
    }
    lastBullet = false;
    const di = dateSegIndex(l);
    const startsRecord =
      state === 0 || state === 2 || (state === 1 && di >= 0 && kind !== "projects");
    if (startsRecord) {
      cur = blank();
      recs.push(cur);
      const rest = l.segs.filter((_, i) => i !== di);
      if (di >= 0) cur.date = l.segs[di].text;
      if (kind === "projects" && rest.length > 1 && URL_RE.test(rest[rest.length - 1].text)) {
        cur.link = rest.pop()!.text;
      }
      cur.title = rest.map((s) => s.text).join(" ");
      state = 1;
    } else if (cur) {
      cur.sub = cur.sub ? `${cur.sub} ${l.text}` : l.text;
    }
  }

  for (const r of recs) {
    const parts = r.sub.split(/\s+·\s+|\s*·\s*/);
    const [start, end] = splitDates(r.date);
    if (kind === "experience") {
      d.experience.push({
        id: newId("exp"),
        role: r.title,
        company: parts[0]?.trim() ?? "",
        location: parts.slice(1).join(", ").trim(),
        start,
        end,
        bullets: r.bullets.join("\n"),
      });
    } else if (kind === "education") {
      d.education.push({
        id: newId("edu"),
        degree: r.title,
        school: parts[0]?.trim() ?? "",
        location: parts.slice(1).join(", ").trim(),
        start,
        end,
        details: r.bullets.join("\n"),
      });
    } else {
      d.projects.push({
        id: newId("pr"),
        name: r.title,
        link: r.link,
        tech: r.sub,
        bullets: r.bullets.join("\n"),
      });
    }
  }
}

function parseSkills(lines: Line[], d: ResumeData) {
  if (!lines.length) return;
  const colon = /^([^:,]{1,40}):\s*(.*)$/;
  const pitch = minPitch(lines);
  const colonShare = lines.filter((l) => colon.test(l.text)).length / lines.length;
  const gutterMode = lines[0].segs.length >= 2;
  const groups: { name: string; items: string }[] = [];
  lines.forEach((l, i) => {
    const cur = groups[groups.length - 1];
    if (gutterMode) {
      if (l.segs.length >= 2)
        groups.push({
          name: l.segs[0].text,
          items: l.segs
            .slice(1)
            .map((s) => s.text)
            .join(" "),
        });
      else if (cur) cur.items += " " + l.text;
    } else if (colonShare >= 0.5) {
      const m = colon.exec(l.text);
      if (m) groups.push({ name: m[1].trim(), items: m[2].trim() });
      else if (cur) cur.items += " " + l.text;
      else groups.push({ name: "", items: l.text });
    } else if (newBlockAt(lines, i, pitch) || !cur) {
      groups.push({ name: l.text, items: "" });
    } else {
      cur.items += (cur.items ? " " : "") + l.text;
    }
  });
  for (const g of groups) d.skills.push({ id: newId("sk"), name: g.name, items: g.items.trim() });
}

function parseCertifications(lines: Line[], d: ResumeData) {
  const pitch = minPitch(lines);
  const recs: {
    name: string;
    issuer: string;
    date: string;
    size: number;
    issuerStarted: boolean;
  }[] = [];
  lines.forEach((l, i) => {
    const cur = recs[recs.length - 1];
    if (newBlockAt(lines, i, pitch) || !cur) {
      const di = dateSegIndex(l);
      const rest = l.segs.filter((_, k) => k !== di);
      recs.push({
        name: rest.map((s) => s.text).join(" "),
        issuer: "",
        date: di >= 0 ? l.segs[di].text : "",
        size: l.size,
        issuerStarted: false,
      });
    } else if (
      !cur.issuerStarted &&
      l.size >= cur.size - 0.3 &&
      cur.size > 0 &&
      l.size > 0 &&
      !cur.issuer &&
      lines[i - 1] &&
      lines[i - 1].size >= cur.size - 0.3 &&
      l.size >= lines[i - 1].size - 0.3 &&
      isNarrowSplit(lines, i)
    ) {
      // The name wrapped onto a second line: same size as its first line.
      cur.name += " " + l.text;
    } else {
      cur.issuerStarted = true;
      cur.issuer = cur.issuer ? `${cur.issuer} ${l.text}` : l.text;
    }
  });
  for (const r of recs) {
    if (r.name || r.issuer)
      d.certifications.push({ id: newId("ce"), name: r.name, issuer: r.issuer, date: r.date });
  }
}

/** In a narrow column the issuer is set smaller than the name; a line as large as the name is more name. */
function isNarrowSplit(lines: Line[], i: number): boolean {
  const first = lines[i - 1];
  return !!first && lines.some((l) => l.size < first.size - 0.5);
}

function parseLanguages(lines: Line[], d: ResumeData) {
  for (const l of lines) {
    const parts = l.text.split(/\s+[—–-]\s+/);
    d.languages.push({
      id: newId("la"),
      name: parts[0].trim(),
      level: parts.slice(1).join(" – ").trim(),
    });
  }
}

/* ---------- entry point ---------- */

export function parseExtracted(items: RawItem[], pageW: number): ExtractDraft {
  const d: ResumeData = structuredClone(EMPTY_DATA);
  const unsure: string[] = [];
  const unassigned: string[] = [];

  const gutter = findGutter(items, pageW);
  const columns: Line[][] = gutter
    ? [
        toLines(items.filter((i) => i.x + i.w / 2 < gutter)),
        toLines(items.filter((i) => i.x + i.w / 2 >= gutter)),
      ]
    : [toLines(items)];

  // Which template made it? Two columns is Modern; a centred, largest first line is Executive.
  let template: TemplateId = "classic";
  let templateGuess: ExtractDraft["templateGuess"] = "default";
  const mainLines = columns[columns.length - 1];
  if (gutter) {
    template = "modern";
    templateGuess = "layout";
  } else {
    const first = mainLines.filter((l) => l.page === 0).sort((a, b) => b.size - a.size)[0];
    if (first && first.segs.length === 1) {
      const mid = (first.segs[0].x0 + first.segs[0].x1) / 2;
      if (Math.abs(mid - pageW / 2) < 14) {
        template = "executive";
        templateGuess = "layout";
      } else {
        templateGuess = "layout";
      }
    }
  }

  const sizes = columns
    .flat()
    .map((l) => l.size)
    .sort((x, y) => x - y);
  const body = sizes[Math.floor(sizes.length / 2)] ?? 10;

  const split = (strict: boolean) => {
    const sections = new Map<SectionKey, Line[]>();
    const order: SectionKey[] = [];
    const contactLines: Line[] = [];
    const headerLines: Line[] = [];
    for (const col of columns) {
      let cur: SectionKey | "contact" | "header" = "header";
      let seenHeading = false;
      for (const l of col) {
        // A heading is alone on its line (the executive rule has no text of its own).
        const text = l.segs[0]?.text ?? "";
        const looksLike = !strict || text === text.toUpperCase() || l.size >= body * 1.2;
        const h = l.segs.length === 1 && looksLike ? headingOf(text) : null;
        if (h) {
          cur = h;
          seenHeading = true;
          if (h !== "contact" && !order.includes(h)) {
            order.push(h);
            sections.set(h, []);
          }
          continue;
        }
        if (cur === "header") {
          if (!seenHeading) headerLines.push(l);
        } else if (cur === "contact") contactLines.push(l);
        else sections.get(cur)!.push(l);
      }
    }
    return { sections, order, contactLines, headerLines };
  };
  let found0 = split(true);
  if (!found0.order.length) found0 = split(false);
  const { sections, order, contactLines, headerLines } = found0;

  // Header: name, title, then contact details.
  const loose: string[] = [];
  const header = headerLines.filter((l) => l.page === 0);
  const sorted = [...header].sort((a, b) => b.size - a.size);
  const nameLine = sorted[0];
  if (nameLine) {
    d.basics.name = nameLine.text.trim();
    const after = header.filter((l) => l.y > nameLine.y);
    const titleLine = after[0];
    if (titleLine && !EMAIL_RE.test(titleLine.text) && titleLine.segs.length === 1) {
      d.basics.title = titleLine.text.trim();
      if (template === "classic") unsure.push("Job title");
    }
    const rest = after.slice(d.basics.title ? 1 : 0);
    for (const l of rest) {
      for (const tok of l.text.split(/\s*[|·•]\s*|\s{3,}/)) parseContactToken(tok, d, loose);
    }
    // Header lines above the name (rare) are kept as loose text.
    for (const l of header.filter((x) => x.y < nameLine.y)) loose.push(l.text);
  }
  // Sidebar contact: LABEL then value.
  for (let i = 0; i < contactLines.length; i++) {
    const t = contactLines[i].text;
    if (CONTACT_LABELS.has(norm(t)) && contactLines[i + 1]) {
      parseContactToken(contactLines[i + 1].text, d, loose);
      i++;
    } else {
      parseContactToken(t, d, loose);
    }
  }
  if (!d.basics.name) unsure.push("Full name");
  if (!d.basics.email) unsure.push("Email");
  if (!d.basics.phone) unsure.push("Phone");
  unassigned.push(...loose);

  const found: ExtractDraft["found"] = [];
  for (const key of order) {
    const lines = sections.get(key)!;
    const before = counts(d, key);
    switch (key) {
      case "summary":
        d.summary = lines
          .map((l) => l.text)
          .join(" ")
          .trim();
        break;
      case "experience":
      case "education":
      case "projects":
        parseRecords(lines, key, d);
        break;
      case "skills":
        parseSkills(lines, d);
        break;
      case "certifications":
        parseCertifications(lines, d);
        break;
      case "languages":
        parseLanguages(lines, d);
        break;
    }
    const n = key === "summary" ? (d.summary ? 1 : 0) : counts(d, key) - before;
    found.push({ key, count: n });
    if (n === 0 && lines.length) unassigned.push(...lines.map((l) => l.text));
  }
  if (!order.length) unsure.push("Sections (no headings recognised)");

  // Titles: keep the language the headings were written in.
  const VI_WORDS = [
    "gioi thieu",
    "tom tat",
    "muc tieu",
    "kinh nghiem",
    "hoc van",
    "ky nang",
    "du an",
    "chung chi",
    "ngon ngu",
    "lien he",
  ];
  const isVi = columns
    .flat()
    .some(
      (l) =>
        VI_WORDS.some((w) => norm(l.text).replace(/\s/g, "").startsWith(w.replace(/\s/g, ""))) &&
        !!headingOf(l.text),
    );
  const settings = parseSettings({
    template,
    order: order.length ? order : undefined,
    titles: isVi ? TITLES_VI : TITLES_EN,
  });
  if (!order.length) settings.order = [...SECTION_KEYS];

  return {
    doc: { data: d, settings },
    template,
    templateGuess,
    unsure,
    unassigned,
    found,
  };
}

function counts(d: ResumeData, key: SectionKey): number {
  switch (key) {
    case "summary":
      return d.summary ? 1 : 0;
    case "experience":
      return d.experience.length;
    case "education":
      return d.education.length;
    case "skills":
      return d.skills.length;
    case "projects":
      return d.projects.length;
    case "certifications":
      return d.certifications.length;
    case "languages":
      return d.languages.length;
  }
}
