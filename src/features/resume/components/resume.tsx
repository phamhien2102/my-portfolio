import type { CSSProperties } from "react";

import { SITE } from "@/config/site";
import { THEME, accentAt } from "@/config/theme";
import { ABOUT } from "@/features/about";
import { EXPERIENCE } from "@/features/experience";
import { PROJECTS } from "@/features/projects";
import { SKILL_GROUPS } from "@/features/skills";

/** `https://www.github.com/foo/` -> `github.com/foo` */
function displayUrl(href: string): string {
  return href.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

function Heading({ children }: { children: string }) {
  return (
    <h2 className="mt-[7mm] mb-[3mm] border-b border-zinc-300 pb-[1.2mm] font-mono text-[8pt] font-bold tracking-[0.22em] text-zinc-500 uppercase">
      {children}
    </h2>
  );
}

/**
 * A one-page A4 resume, laid out as a timeline. It is never shown on screen: print styles hide
 * the rest of the page and reveal only this (see `PrintResumeButton`).
 */
export function Resume() {
  const location = ABOUT.facts.find((fact) => fact.label === "Based in")?.value;

  return (
    <article className="hidden bg-white p-[14mm] text-[9.5pt] leading-snug text-zinc-900 [-webkit-print-color-adjust:exact] [print-color-adjust:exact] print:block">
      <header>
        <h1 className="text-[26pt] leading-none font-black tracking-tight">{SITE.name}</h1>
        <p className="mt-[2mm] text-[12pt] font-semibold text-zinc-600">{SITE.role}</p>
        <ul className="mt-[3mm] flex flex-wrap gap-x-[5mm] gap-y-[1mm] font-mono text-[8.5pt] text-zinc-600">
          <li>{SITE.email}</li>
          {SITE.socials.map((social) => (
            <li key={social.label}>{displayUrl(social.href)}</li>
          ))}
          {location && <li>{location}</li>}
        </ul>
        {/* A thin band in the portfolio's palette. */}
        <div className="mt-[4mm] flex h-[1.2mm] overflow-hidden rounded-full">
          {THEME.palette.map((color) => (
            <span key={color} style={{ backgroundColor: color }} className="flex-1" />
          ))}
        </div>
      </header>

      <section>
        <Heading>Profile</Heading>
        <p className="text-zinc-700">{ABOUT.paragraphs[0]}</p>
      </section>

      <section>
        <Heading>Experience</Heading>
        <ol className="relative ml-[1.5mm] border-l border-zinc-300 pl-[6mm]">
          {EXPERIENCE.map((role, i) => (
            <li
              key={`${role.company}-${role.period}`}
              style={{ "--accent": accentAt(i + 2) } as CSSProperties}
              className="relative break-inside-avoid pb-[4.5mm] last:pb-0"
            >
              <span
                aria-hidden="true"
                className="absolute top-[1mm] -left-[calc(6mm+1.2mm+0.5px)] size-[2.4mm] rounded-full border-[0.6mm] border-white bg-(--accent) ring-[0.4mm] ring-(--accent)"
              />
              <p className="font-mono text-[8pt] tracking-widest text-zinc-500 uppercase">
                {role.period}
              </p>
              <h3 className="mt-[0.5mm] text-[11pt] leading-tight font-bold">
                {role.title}
                <span className="font-normal text-zinc-600"> &middot; {role.company}</span>
              </h3>
              <ul className="mt-[1.5mm] list-disc space-y-[0.8mm] pl-[4mm] text-zinc-700 marker:text-zinc-400">
                {role.highlights.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <Heading>Selected projects</Heading>
        <ul className="space-y-[2.5mm]">
          {PROJECTS.map((project) => (
            <li key={project.title} className="break-inside-avoid">
              <p className="font-bold">
                {project.title}
                <span className="font-mono text-[8pt] font-normal text-zinc-500">
                  {" "}
                  &middot; {project.year}
                </span>
              </p>
              <p className="text-zinc-700">{project.summary}</p>
              <p className="font-mono text-[8pt] text-zinc-500">{project.tags.join(" / ")}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <Heading>Skills</Heading>
        <dl className="grid grid-cols-[22mm_1fr] gap-x-[3mm] gap-y-[1.2mm]">
          {SKILL_GROUPS.map((group) => (
            <div key={group.title} className="contents">
              <dt className="font-mono text-[8pt] tracking-widest text-zinc-500 uppercase">
                {group.title}
              </dt>
              <dd className="text-zinc-800">{group.items.map((item) => item.name).join(", ")}</dd>
            </div>
          ))}
        </dl>
      </section>
    </article>
  );
}
