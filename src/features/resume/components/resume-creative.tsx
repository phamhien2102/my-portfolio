import type { CSSProperties, ReactNode } from "react";

import { SITE } from "@/config/site";
import { accentAt } from "@/config/theme";
import { ABOUT } from "@/features/about";
import { EXPERIENCE } from "@/features/experience";
import { PROJECTS } from "@/features/projects";
import { SKILL_GROUPS } from "@/features/skills";

import {
  EDUCATION,
  EXTRA_SKILLS,
  HONORS,
  PERSON,
  STATS,
  displayUrl,
  getContacts,
} from "./resume-data";
import { HandPointIcon } from "./resume-icons";
import { Emphasis } from "@/components/ui/emphasis";

/** The one accent colour of this layout (the orange of the shared palette). */
const ACCENT_VAR = { "--accent": accentAt(2) } as CSSProperties;

function SectionTitle({ children, note }: { children: string; note?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <h2 className="text-2xl font-bold tracking-tight text-zinc-900">{children}</h2>
      {note && <p className="text-sm text-zinc-500">{note}</p>}
    </div>
  );
}

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr] sm:gap-6">
      <dt className="text-zinc-500">{label}</dt>
      <dd className="text-zinc-900">{children}</dd>
    </div>
  );
}

/**
 * The resume as an App Store listing, made for the screen (the classic A4 layout is what gets
 * printed): the portrait is the app icon (round), the roles are release notes, the projects are the
 * preview screens. Light and flat, with a single orange accent.
 */
export function ResumeCreative() {
  const contacts = getContacts();
  const skillGroups = [
    ...SKILL_GROUPS.map((group) => ({ title: group.title, items: group.items.map((i) => i.name) })),
    ...EXTRA_SKILLS.map((group) => ({ title: group.title, items: [...group.items] })),
  ];

  return (
    <div
      style={ACCENT_VAR}
      className="mx-auto w-full max-w-4xl rounded-[2rem] bg-white p-6 text-zinc-900 shadow-sm sm:p-12"
    >
      {/* The "app" header: icon, name, subtitle, call to action. */}
      <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
        {/* The photo is a round picture, so it stays round; the slight zoom hides its thin dark rim. */}
        <span className="block size-32 shrink-0 overflow-hidden rounded-full ring-1 ring-black/10 sm:size-40">
          {/* eslint-disable-next-line @next/next/no-img-element -- single small static image */}
          <img
            src="/cv-photo.png"
            alt={`Portrait of ${PERSON.fullName}`}
            className="size-full scale-110 object-cover"
          />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {PERSON.fullName}
            <span className="ml-2 font-normal text-zinc-500">({PERSON.nickname})</span>
          </h1>
          <p className="mt-1 text-lg text-zinc-600">{SITE.role}</p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <a
              href={`mailto:${SITE.email}`}
              className="rounded-full bg-(--accent) px-7 py-2.5 text-sm font-bold tracking-wide text-black uppercase transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 motion-reduce:transition-none"
            >
              Hire me
            </a>
            <a
              href={SITE.website}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-zinc-100 px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 motion-reduce:transition-none"
            >
              {displayUrl(SITE.website)}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </div>
      </header>

      {/* The rating strip. */}
      <dl className="mt-10 grid grid-cols-2 gap-y-6 border-y border-zinc-200 py-5 sm:grid-cols-4 sm:gap-y-0 sm:divide-x sm:divide-zinc-200">
        {STATS.map((stat) => (
          <div key={stat.label} className="px-4 text-center">
            <dt className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
              {stat.label}
            </dt>
            <dd className="mt-1 text-2xl font-bold">{stat.value}</dd>
            <dd className="text-sm text-zinc-500">{stat.caption}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-12">
        <SectionTitle>About</SectionTitle>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-zinc-700">
          {ABOUT.paragraphs[0]}
        </p>
      </section>

      {/* Roles with their release notes, newest first. */}
      <section className="mt-12">
        <SectionTitle note="Newest first">Experience</SectionTitle>
        <ol className="mt-2 divide-y divide-zinc-200">
          {EXPERIENCE.map((role, i) => (
            <li
              key={`${role.company}-${role.period}`}
              className="grid gap-4 py-7 sm:grid-cols-[9.5rem_1fr] sm:gap-8"
            >
              <div>
                <p className="font-mono text-sm leading-snug tracking-wide text-zinc-700 uppercase">
                  {role.period}
                </p>
                {i === 0 && (
                  <span className="mt-3 inline-block rounded-full bg-(--accent) px-3 py-0.5 text-xs font-bold text-black">
                    Current
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {role.title}
                  <span className="font-normal text-zinc-500"> &middot; {role.company}</span>
                </h3>
                {role.projects && (
                  <ul aria-label="Projects" className="mt-3 flex flex-wrap gap-2">
                    {role.projects.map((project) => (
                      <li
                        key={project}
                        className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700"
                      >
                        {project}
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-4 text-xs font-semibold tracking-wider text-zinc-500 uppercase">
                  What&apos;s new
                </p>
                <ul className="mt-2 list-disc space-y-2 pl-5 text-zinc-700 marker:text-(--accent)">
                  {role.highlights.map((line) => (
                    <li key={line}>
                      <Emphasis text={line} className="font-bold text-zinc-900" />
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Projects as screenshots in a sideways-scrolling row. */}
      <section className="mt-12">
        <SectionTitle>Preview</SectionTitle>
        <div
          role="region"
          aria-label="Projects"
          tabIndex={0}
          className="-mx-6 mt-5 flex snap-x snap-mandatory scroll-px-6 [scrollbar-width:none] gap-4 overflow-x-auto px-6 pb-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 sm:-mx-12 sm:scroll-px-12 sm:px-12 [&::-webkit-scrollbar]:hidden"
        >
          {PROJECTS.map((project) => (
            <article
              key={project.title}
              className="flex h-[28rem] w-64 shrink-0 snap-start flex-col overflow-hidden rounded-3xl bg-zinc-900 text-white sm:w-72"
            >
              {project.image ? (
                // eslint-disable-next-line @next/next/no-img-element -- small static preview
                <img src={project.image} alt="" className="h-36 w-full object-cover" />
              ) : (
                <div
                  aria-hidden="true"
                  className="flex h-36 items-end bg-zinc-800 p-5 text-5xl font-black tracking-tighter text-zinc-600"
                >
                  {project.title.charAt(0)}
                </div>
              )}
              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <p className="font-mono text-xs tracking-widest text-(--accent) uppercase">
                    {project.year}
                  </p>
                  <h3 className="mt-2 text-lg leading-tight font-bold">{project.title}</h3>
                  <p className="mt-2 line-clamp-4 text-sm text-zinc-400">{project.summary}</p>
                </div>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {project.tags.slice(0, 3).map((tag) => (
                    <li
                      key={tag}
                      className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-zinc-300"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
                {project.links && (
                  <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold">
                    {project.links.map((link) => (
                      <li key={link.href}>
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white underline decoration-(--accent) decoration-2 underline-offset-4 hover:text-(--accent) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                        >
                          {link.label} <span aria-hidden="true">&#8599;</span>
                          <span className="sr-only"> ({project.title}, opens in a new tab)</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Key-value details. */}
      <section className="mt-12">
        <SectionTitle>Information</SectionTitle>
        <dl className="mt-2 divide-y divide-zinc-200 border-y border-zinc-200 text-sm">
          <InfoRow label="Education">
            <ul className="space-y-2">
              {EDUCATION.map((item) => (
                <li key={item.school}>
                  {item.degree} &middot; {item.school}
                  <span className="text-zinc-500">
                    {" "}
                    ({item.place}, {item.date})
                  </span>
                </li>
              ))}
            </ul>
          </InfoRow>
          {skillGroups.map((group) => (
            <InfoRow key={group.title} label={group.title}>
              {group.items.join(", ")}
            </InfoRow>
          ))}
          <InfoRow label="Honors & awards">
            <ul className="space-y-2">
              {HONORS.map((honor) => (
                <li key={honor.name}>
                  {honor.name}
                  <span className="text-zinc-500">
                    {" "}
                    ({honor.date}, {honor.place}
                    {"validUntil" in honor && `, valid until ${honor.validUntil}`})
                  </span>
                  {"href" in honor && (
                    <>
                      {" "}
                      <span className="inline-flex items-center gap-1.5 align-middle">
                        <a
                          href={honor.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold underline decoration-(--accent) decoration-2 underline-offset-4 hover:text-(--accent) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
                        >
                          View
                          <span className="sr-only"> {honor.name} (opens in a new tab)</span>
                        </a>
                        {/* The hand sits to the right and points left (the right-pointing hand, mirrored so the thumb stays on top). */}
                        <span
                          aria-hidden="true"
                          className="motion-safe:animate-point-nudge inline-block size-6 text-(--accent)"
                        >
                          <span className="block size-full -scale-x-100">
                            <span className="block size-full rotate-90">
                              <HandPointIcon />
                            </span>
                          </span>
                        </span>
                      </span>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </InfoRow>
          <InfoRow label="Contact">
            <ul className="space-y-2">
              {contacts.map((contact) => (
                <li key={contact.text} className="flex items-center gap-2">
                  <span aria-hidden="true" className="size-4 shrink-0 text-zinc-500">
                    {contact.icon}
                  </span>
                  {contact.href ? (
                    <a
                      href={contact.href}
                      className="underline decoration-zinc-300 underline-offset-4 hover:decoration-(--accent) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
                      {...(contact.href.startsWith("http")
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    >
                      {contact.text}
                    </a>
                  ) : (
                    contact.text
                  )}
                </li>
              ))}
            </ul>
          </InfoRow>
        </dl>
      </section>

      <p className="mt-10 text-center text-xs text-zinc-400">
        &copy; {PERSON.fullName} &middot; {displayUrl(SITE.website)}
      </p>
    </div>
  );
}
