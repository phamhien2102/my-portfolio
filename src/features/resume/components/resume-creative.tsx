import type { CSSProperties, ReactNode } from "react";

import { FadeIn } from "@/components/ui/fade-in";
import { accentAt } from "@/config/theme";
import { ABOUT } from "@/features/about";
import { EXPERIENCE, RoleProjects } from "@/features/experience";
import { SKILL_GROUPS } from "@/features/skills";
import { cn } from "@/lib/cn";

import {
  EDUCATION,
  EXTRA_SKILLS,
  HONORS,
  PERSON,
  STATS,
  getContacts,
  type Contact,
} from "./resume-data";

/** The one accent colour of this layout (the orange of the shared palette). Everything else is neutral. */
const ACCENT = accentAt(2);
const ACCENT_VAR = { "--accent": ACCENT } as CSSProperties;

function Label({ children }: { children: string }) {
  return (
    <p
      style={ACCENT_VAR}
      className="flex items-center gap-3 font-mono text-xs tracking-widest text-zinc-500 uppercase"
    >
      <span aria-hidden="true" className="h-px w-6 bg-(--accent)" />
      {children}
    </p>
  );
}

function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      style={ACCENT_VAR}
      className={cn(
        "relative h-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition-colors duration-300 hover:border-(--accent) motion-reduce:transition-none sm:p-8",
        className,
      )}
    >
      {children}
    </div>
  );
}

function ContactPill({ contact }: { contact: Contact }) {
  const className = cn(
    "inline-flex items-center gap-2 rounded-full border border-zinc-700 px-3.5 py-2 text-sm text-zinc-200",
    contact.href &&
      "transition-colors duration-300 hover:border-(--accent) hover:bg-(--accent) hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none",
  );
  const content = (
    <>
      <span aria-hidden="true" className="size-4 shrink-0">
        {contact.icon}
      </span>
      {contact.text}
    </>
  );
  const style = ACCENT_VAR;

  if (!contact.href) {
    return (
      <span style={style} className={className}>
        {content}
      </span>
    );
  }
  const external = contact.href.startsWith("http");
  return (
    <a
      href={contact.href}
      style={style}
      className={className}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {content}
    </a>
  );
}

/**
 * The resume as a dark, neutral bento page with a single orange accent, made for the screen (the
 * classic A4 layout is what gets printed). Server-rendered, flat colours only: no gradients or glows.
 */
export function ResumeCreative() {
  const contacts = getContacts();
  const skillGroups = [
    ...SKILL_GROUPS.map((group) => ({ title: group.title, items: group.items.map((i) => i.name) })),
    ...EXTRA_SKILLS.map((group) => ({ title: group.title, items: [...group.items] })),
  ];

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="grid gap-4 lg:grid-cols-12">
        {/* Hero */}
        <FadeIn className="lg:col-span-12">
          <Card className="p-8 sm:p-12">
            <div className="flex flex-col-reverse items-start justify-between gap-10 md:flex-row md:items-center">
              <div className="min-w-0">
                <p
                  style={ACCENT_VAR}
                  className="font-mono text-xs tracking-widest text-(--accent) uppercase"
                >
                  Résumé
                </p>
                <h1 className="mt-4 text-5xl leading-[0.95] font-black tracking-tighter text-white sm:text-7xl">
                  {PERSON.fullName}
                  <span className="ml-3 align-middle text-2xl font-normal tracking-normal text-zinc-500 sm:text-3xl">
                    ({PERSON.nickname})
                  </span>
                </h1>
                <p className="mt-5 max-w-xl text-lg text-zinc-300 sm:text-xl">
                  Senior Mobile Developer · React Native &amp; ReactJS
                </p>
                <ul className="mt-8 flex flex-wrap gap-2">
                  {contacts.map((contact) => (
                    <li key={contact.text}>
                      <ContactPill contact={contact} />
                    </li>
                  ))}
                </ul>
              </div>

              {/* Portrait with a plain accent ring. */}
              {/* eslint-disable-next-line @next/next/no-img-element -- single small static image */}
              <img
                src="/cv-photo.png"
                alt={`Portrait of ${PERSON.fullName}`}
                style={ACCENT_VAR}
                className="size-44 shrink-0 rounded-full border-2 border-(--accent) object-cover p-1.5 sm:size-56"
              />
            </div>
          </Card>
        </FadeIn>

        {/* Headline numbers */}
        {STATS.map((stat, i) => (
          <FadeIn key={stat.label} delay={80 * (i + 1)} className="lg:col-span-4">
            <Card>
              <p className="text-6xl font-black tracking-tighter text-white">{stat.value}</p>
              <p className="mt-2 text-zinc-400">{stat.label}</p>
            </Card>
          </FadeIn>
        ))}

        {/* About and education */}
        <FadeIn className="lg:col-span-7">
          <Card>
            <Label>About</Label>
            <p className="mt-5 text-lg leading-relaxed text-zinc-200">{ABOUT.paragraphs[0]}</p>
          </Card>
        </FadeIn>
        <FadeIn delay={80} className="lg:col-span-5">
          <Card>
            <Label>Education</Label>
            <ul className="mt-5 space-y-5">
              {EDUCATION.map((item) => (
                <li key={item.school}>
                  <p className="font-bold text-zinc-100">{item.school}</p>
                  <p className="text-zinc-400">{item.degree}</p>
                  <p className="font-mono text-xs tracking-widest text-zinc-500 uppercase">
                    {item.place} &middot; {item.date}
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        </FadeIn>

        {/* Experience */}
        <FadeIn className="lg:col-span-8">
          <Card>
            <Label>Experience</Label>
            <ol className="relative mt-8 ml-1.5 space-y-10 border-l border-zinc-700 pl-8">
              {EXPERIENCE.map((role) => (
                <li key={`${role.company}-${role.period}`} style={ACCENT_VAR} className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute top-1.5 -left-[calc(2rem+4.5px)] size-2 rounded-full bg-(--accent)"
                  />
                  <p className="font-mono text-xs tracking-widest text-(--accent) uppercase">
                    {role.period}
                  </p>
                  <h3 className="mt-2 text-2xl font-black tracking-tight">
                    {role.title}
                    <span className="font-normal text-zinc-400"> &middot; {role.company}</span>
                  </h3>
                  <RoleProjects projects={role.projects} />
                  <ul className="mt-4 space-y-2.5 text-zinc-300">
                    {role.highlights.map((line) => (
                      <li key={line} className="flex gap-3">
                        <span
                          aria-hidden="true"
                          className="mt-2.5 h-px w-4 shrink-0 bg-(--accent)"
                        />
                        {line}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </Card>
        </FadeIn>

        {/* Skills and honors */}
        <div className="flex flex-col gap-4 lg:col-span-4">
          <FadeIn>
            <Card>
              <Label>Skills</Label>
              <div className="mt-5 space-y-5">
                {skillGroups.map((group) => (
                  <div key={group.title}>
                    <p className="font-mono text-xs tracking-widest text-zinc-500 uppercase">
                      {group.title}
                    </p>
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                      {group.items.map((name) => (
                        <li
                          key={name}
                          className="rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-sm text-zinc-200"
                        >
                          {name}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Card>
          </FadeIn>

          <FadeIn delay={80}>
            <Card>
              <Label>Honors &amp; awards</Label>
              <ul className="mt-5 space-y-4">
                {HONORS.map((honor) => (
                  <li key={honor.name}>
                    <p className="font-mono text-xs tracking-widest text-zinc-500 uppercase">
                      {honor.date} &middot; {honor.place}
                    </p>
                    <p className="mt-1 text-sm text-zinc-300">{honor.name}</p>
                  </li>
                ))}
              </ul>
            </Card>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
