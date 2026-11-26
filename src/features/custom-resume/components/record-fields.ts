import type { RecordKey } from "../types";

export interface FieldDef {
  name: string;
  label: string;
  placeholder?: string;
  multiline?: boolean;
  hint?: string;
  /** Takes the whole row in the two-column grid. */
  wide?: boolean;
}

export const RECORD_FIELDS: Record<RecordKey, FieldDef[]> = {
  experience: [
    { name: "role", label: "Job title", placeholder: "Senior Software Engineer" },
    { name: "company", label: "Company", placeholder: "Company name" },
    { name: "location", label: "Location", placeholder: "City" },
    { name: "start", label: "Start", placeholder: "Mar 2022" },
    { name: "end", label: "End", placeholder: "Present" },
    {
      name: "bullets",
      label: "Achievements",
      multiline: true,
      wide: true,
      hint: "One bullet per line. Numbers help.",
    },
  ],
  education: [
    { name: "degree", label: "Degree", placeholder: "B.Eng. in Computer Science" },
    { name: "school", label: "School", placeholder: "School name" },
    { name: "location", label: "Location" },
    { name: "start", label: "Start", placeholder: "2012" },
    { name: "end", label: "End", placeholder: "2016" },
    { name: "details", label: "Details", multiline: true, wide: true, hint: "One point per line." },
  ],
  skills: [
    { name: "name", label: "Skill group", placeholder: "Languages" },
    {
      name: "items",
      label: "Skills",
      multiline: true,
      wide: true,
      placeholder: "TypeScript, Go, Python",
      hint: "Separate with commas.",
    },
  ],
  projects: [
    { name: "name", label: "Project name" },
    { name: "link", label: "Link", placeholder: "github.com/you/project" },
    { name: "tech", label: "Tech", placeholder: "Go, PostgreSQL", wide: true },
    {
      name: "bullets",
      label: "Description",
      multiline: true,
      wide: true,
      hint: "One point per line.",
    },
  ],
  certifications: [
    { name: "name", label: "Certification", wide: true },
    { name: "issuer", label: "Issuer" },
    { name: "date", label: "Year", placeholder: "2023" },
  ],
  languages: [
    { name: "name", label: "Language", placeholder: "English" },
    { name: "level", label: "Level", placeholder: "Fluent (IELTS 8.0)" },
  ],
};

type Rec = Record<string, string>;

/** Two short strings to recognise a collapsed record by. */
export function recordLabel(key: RecordKey, r: Rec): [string, string] {
  switch (key) {
    case "experience":
      return [r.role || r.company || "Untitled", r.role ? r.company : ""];
    case "education":
      return [r.degree || r.school || "Untitled", r.degree ? r.school : ""];
    case "skills":
      return [r.name || "Untitled", r.items];
    case "projects":
      return [r.name || "Untitled", r.tech];
    case "certifications":
      return [r.name || "Untitled", r.issuer];
    case "languages":
      return [r.name || "Untitled", r.level];
  }
}

export const ADD_LABEL: Record<RecordKey, string> = {
  experience: "Add experience",
  education: "Add education",
  skills: "Add skill group",
  projects: "Add project",
  certifications: "Add certification",
  languages: "Add language",
};
