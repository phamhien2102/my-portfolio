import type { CSSProperties, ReactNode } from "react";

import { FadeIn } from "@/components/ui/fade-in";
import { THEME, accentAt } from "@/config/theme";
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

const GRADIENT = `linear-gradient(90deg, ${THEME.palette.join(", ")})`;
const RING = `conic-gradient(from 0deg, ${[...THEME.palette, THEME.palette[0]].join(", ")})`;

function Label({ children, accent }: { children: string; accent: number }) {
  return (
    <p
      style={{ "--accent": accentAt(accent) } as CSSProperties}
      className="flex items-center gap-3 font-mono text-xs tracking-widest text-zinc-500 uppercase"
    >
      <span aria-hidden="true" className="size-2 rounded-full bg-(--accent)" />
      {children}
    </p>
  );
}

function Card({
  accent,
  className,
  children,
}: {
  accent: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{ "--accent": accentAt(accent) } as CSSProperties}
      className={cn(
        "relative h-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition-colors duration-300 hover:border-(--accent)/60 motion-reduce:transition-none sm:p-8",
        className,
      )}
    >
      {children}
    </div>
  );
}

function ContactPill({ contact, index }: { contact: Contact; index: number }) {
  const className = cn(
    "inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-sm text-zinc-200",
    contact.href &&
      "transition-colors duration-300 hover:border-transparent hover:bg-(--accent) hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none",
  );
  const content = (
    <>
      <span aria-hidden="true" className="size-4 shrink-0">
        {contact.icon}
      </span>
      {contact.text}
    </>
  );
  const style = { "--accent": accentAt(index + 1) } as CSSProperties;

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
 * The resume as a dark, neon bento page, made for the screen (the classic A4 layout is what gets
 * printed). Server-rendered; the only motion is a slow colour ring around the portrait, which
 * stops for visitors who prefer reduced motion.
 */
export function ResumeCreative() {
  const contacts = getContacts();
  const skillGroups = [
    ...SKILL_GROUPS.map((group) => ({ title: group.title, items: group.items.map((i) => i.name) })),
    ...EXTRA_SKILLS.map((group) => ({ title: group.title, items: [...group.items] })),
  ];

  return (
    <div className="relative mx-auto w-full max-w-6xl">
      {/* Soft neon glow behind everything; purely decorative. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-1/4 size-[32rem] rounded-full bg-[#7a2cff]/20 blur-[120px]" />
        <div className="absolute top-1/3 -right-24 size-[28rem] rounded-full bg-[#ff2d95]/15 blur-[120px]" />
        <div className="absolute bottom-0 left-0 size-[26rem] rounded-full bg-[#00c4ff]/10 blur-[120px]" />
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        {/* Hero */}
        <FadeIn className="lg:col-span-12">
          <Card accent={12} className="p-8 sm:p-12">
            <div className="flex flex-col-reverse items-start justify-between gap-10 md:flex-row md:items-center">
              <div className="min-w-0">
                <p className="font-mono text-xs tracking-widest text-zinc-500 uppercase">Résumé</p>
                <h1 className="mt-4 text-5xl leading-[0.95] font-black tracking-tighter sm:text-7xl">
                  <span
                    style={{ backgroundImage: GRADIENT }}
                    className="bg-clip-text text-transparent [-webkit-text-fill-color:transparent]"
                  >
                    {PERSON.fullName}
                  </span>
                  <span className="ml-3 align-middle text-2xl font-normal tracking-normal text-zinc-500 sm:text-3xl">
                    ({PERSON.nickname})
                  </span>
                </h1>
                <p className="mt-5 max-w-xl text-lg text-zinc-300 sm:text-xl">
                  Senior Mobile Developer · React Native &amp; ReactJS
                </p>
                <ul className="mt-8 flex flex-wrap gap-2">
                  {contacts.map((contact, i) => (
                    <li key={contact.text}>
                      <ContactPill contact={contact} index={i} />
                    </li>
                  ))}
                </ul>
              </div>

              {/* Portrait inside a slowly turning colour ring. */}
              <div className="relative size-44 shrink-0 sm:size-56">
                <span
                  aria-hidden="true"
                  style={{ backgroundImage: RING }}
                  className="absolute inset-0 rounded-full motion-safe:animate-[spin_14s_linear_infinite]"
                />
                {/* eslint-disable-next-line @next/next/no-img-element -- single small static image */}
                <img
                  src="/cv-photo.png"
                  alt={`Portrait of ${PERSON.fullName}`}
                  className="absolute inset-1.5 size-[calc(100%-0.75rem)] rounded-full border-4 border-[#0e0e16] object-cover"
                />
              </div>
            </div>
          </Card>
        </FadeIn>

        {/* Headline numbers */}
        {STATS.map((stat, i) => (
          <FadeIn key={stat.label} delay={80 * (i + 1)} className="lg:col-span-4">
            <Card accent={i * 4 + 2}>
              <p
                style={{ backgroundImage: GRADIENT }}
                className="bg-clip-text text-6xl font-black tracking-tighter text-transparent [-webkit-text-fill-color:transparent]"
              >
                {stat.value}
              </p>
              <p className="mt-2 text-zinc-400">{stat.label}</p>
            </Card>
          </FadeIn>
        ))}

        {/* About and education */}
        <FadeIn className="lg:col-span-7">
          <Card accent={1}>
            <Label accent={1}>About</Label>
            <p className="mt-5 text-lg leading-relaxed text-zinc-200">{ABOUT.paragraphs[0]}</p>
          </Card>
        </FadeIn>
        <FadeIn delay={80} className="lg:col-span-5">
          <Card accent={5}>
            <Label accent={5}>Education</Label>
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
          <Card accent={9}>
            <Label accent={9}>Experience</Label>
            <ol className="relative mt-8 ml-1.5 space-y-10 border-l border-white/10 pl-8">
              {EXPERIENCE.map((role, i) => (
                <li
                  key={`${role.company}-${role.period}`}
                  style={{ "--accent": accentAt(i + 2) } as CSSProperties}
                  className="relative"
                >
                  <span
                    aria-hidden="true"
                    className="absolute top-1.5 -left-[calc(2rem+4.5px)] size-2 rounded-full bg-(--accent) shadow-[0_0_12px_var(--accent)]"
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
            <Card accent={3}>
              <Label accent={3}>Skills</Label>
              <div className="mt-5 space-y-5">
                {skillGroups.map((group, g) => (
                  <div key={group.title} style={{ "--accent": accentAt(g * 2) } as CSSProperties}>
                    <p className="font-mono text-xs tracking-widest text-zinc-500 uppercase">
                      {group.title}
                    </p>
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                      {group.items.map((name) => (
                        <li
                          key={name}
                          className="rounded-full border border-(--accent)/40 bg-(--accent)/10 px-3 py-1 text-sm text-zinc-200"
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
            <Card accent={12}>
              <Label accent={12}>Honors &amp; awards</Label>
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
