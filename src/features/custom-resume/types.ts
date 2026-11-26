/** The CV as plain data, plus the look chosen for it. Everything here is JSON-serialisable. */

export const SECTION_KEYS = [
  "summary",
  "experience",
  "education",
  "skills",
  "projects",
  "certifications",
  "languages",
] as const;
export type SectionKey = (typeof SECTION_KEYS)[number];

export type TemplateId = "classic" | "modern" | "executive" | "compact" | "creative" | "minimal";
export type PageNumbers = "off" | "left" | "center" | "right";
export type AvatarShape = "circle" | "square" | "rounded" | "arch" | "leaf";
export type FontId = "sans" | "serif" | "times" | "mono";

/** An extra personal detail the person adds themselves (Date of birth, Nationality...). */
export interface ExtraDetail {
  id: string;
  label: string;
  value: string;
  /** An icon name, "" to pick one from the label, or "none". */
  icon: string;
}

/** The plain text fields of Basics (everything but the list of extras). */
export type BasicKey = Exclude<keyof Basics, "extras">;

export interface Basics {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  /** Square JPEG as a data URL, or empty for no photo. */
  avatar: string;
  extras: ExtraDetail[];
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  location: string;
  start: string;
  end: string;
  /** One achievement per line. */
  bullets: string;
}

export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  location: string;
  start: string;
  end: string;
  /** One detail per line. */
  details: string;
}

export interface SkillGroup {
  id: string;
  name: string;
  /** Comma separated. */
  items: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  link: string;
  tech: string;
  /** One point per line. */
  bullets: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

export interface LanguageItem {
  id: string;
  name: string;
  level: string;
}

export interface ResumeData {
  basics: Basics;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillGroup[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  languages: LanguageItem[];
  custom: CustomSection[];
}

export type TitleKey = SectionKey | "contact";

export interface Watermark {
  /** Empty means no watermark. */
  text: string;
  mode: "diagonal" | "horizontal";
  /** 0.03 to 0.3: how visible it is. */
  opacity: number;
  /** Multiplier on the automatic size. */
  scale: number;
}

export interface ResumeSettings {
  template: TemplateId;
  /** Hex colour, `#rrggbb`. */
  accent: string;
  font: FontId;
  /** Draw a small icon before each contact detail. */
  contactIcons: boolean;
  pageNumbers: PageNumbers;
  watermark: Watermark;
  avatarShape: AvatarShape;
  /** Multiplier on the template's own photo size. */
  avatarScale: number;
  /** Body size in pt. */
  fontSize: number;
  /** Multiplier for line height and the gaps between records and sections. */
  spacing: number;
  /** Sections that are in the CV, in order. A section not listed here has been removed. */
  order: OrderKey[];
  /** Sections that are kept in the editor but not drawn. */
  hidden: OrderKey[];
  titles: Record<TitleKey, string>;
}

export interface ResumeDoc {
  data: ResumeData;
  settings: ResumeSettings;
}

/** A section the person made themselves (Interests, Awards, Volunteering...). */
export interface CustomSection {
  id: string;
  title: string;
  style: "bullets" | "text";
  body: string;
}

export type CustomKey = `custom:${string}`;
/** What the section order holds: a built-in section or a custom one. */
export type OrderKey = SectionKey | CustomKey;

export const customKey = (id: string): CustomKey => `custom:${id}`;
export const isCustomKey = (k: string): k is CustomKey => k.startsWith("custom:");

export type RecordKey = Exclude<SectionKey, "summary">;
