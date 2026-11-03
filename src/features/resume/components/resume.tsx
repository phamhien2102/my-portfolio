import type { CSSProperties, ReactNode } from "react";

import { SITE } from "@/config/site";
import { THEME, accentAt } from "@/config/theme";
import { ABOUT } from "@/features/about";
import { EXPERIENCE } from "@/features/experience";
import { SKILL_GROUPS } from "@/features/skills";

import {
  AwardIcon,
  BriefcaseIcon,
  CakeIcon,
  CodeIcon,
  GithubIcon,
  GraduationCapIcon,
  LinkedinIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon,
} from "./resume-icons";

/** Resume-only skills: tools used day to day that are not part of the website's skill bars. */
const EXTRA_SKILLS = [
  {
    title: "Quality",
    items: ["Jest", "Fastlane", "Firebase App Distribution"],
  },
  { title: "Platform", items: ["Contentful (CMS)", "Feature flags", "Remote config", "OneTrust"] },
] as const;

const HONORS = [
  { date: "Dec 2022", name: "Certificate, Neural Networks and Deep Learning", place: "Coursera" },
  { date: "Nov 2022", name: "Certificate, Convolutional Neural Networks", place: "Coursera" },
  {
    date: "Sep 2015",
    name: "Certificate, 10th Annual International Microelectronics Olympiad of Armenia (AMO2015)",
    place: "Ho Chi Minh City",
  },
  {
    date: "May 2015",
    name: "Euréka encouragement award, Student Scientific Research Competition",
    place: "Ho Chi Minh City",
  },
  {
    date: "2012 — 2016",
    name: "Certificate, Outstanding Scholarships Every Semester for UIT Students",
    place: "Ho Chi Minh City",
  },
] as const;

/** Personal details printed on the resume only (not shown elsewhere on the site). */
const PERSON = {
  fullName: "Phạm Thanh Hiền",
  nickname: "Raymond",
  phone: "(+84) 83.9199.121",
  birthday: "Feb 21, 1994",
  birthplace: "Tây Ninh (Long An)",
} as const;

/** `https://www.github.com/foo/` -> `github.com/foo` */
function displayUrl(href: string): string {
  return href.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

/** A small rounded square holding an icon, tinted with one of the portfolio's accent colours. */
function Chip({ icon, accent, size }: { icon: ReactNode; accent: number; size: string }) {
  return (
    <span
      style={{ "--accent": accentAt(accent), width: size, height: size } as CSSProperties}
      className="inline-flex shrink-0 items-center justify-center rounded-[1.2mm] bg-(--accent)/15 p-[1mm] text-[color-mix(in_srgb,var(--accent)_65%,black)]"
    >
      {icon}
    </span>
  );
}

function Heading({
  children,
  icon,
  accent,
}: {
  children: string;
  icon: ReactNode;
  accent: number;
}) {
  return (
    <h2 className="mt-[7mm] mb-[3mm] flex items-center gap-[2.5mm] border-b border-zinc-300 pb-[1.5mm] font-mono text-[8pt] font-bold tracking-[0.22em] text-zinc-600 uppercase">
      <Chip icon={icon} accent={accent} size="5.5mm" />
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
  const socialIcons: Record<string, ReactNode> = {
    GitHub: <GithubIcon />,
    LinkedIn: <LinkedinIcon />,
  };
  const contacts: { icon: ReactNode; text: string }[] = [
    { icon: <PhoneIcon />, text: PERSON.phone },
    { icon: <MailIcon />, text: SITE.email },
    ...SITE.socials
      .filter((social) => displayUrl(social.href).includes("/"))
      .map((social) => ({
        icon: socialIcons[social.label] ?? <UserIcon />,
        text: displayUrl(social.href),
      })),
    ...(location ? [{ icon: <MapPinIcon />, text: location }] : []),
    { icon: <CakeIcon />, text: `Born ${PERSON.birthday} \u00b7 ${PERSON.birthplace}` },
  ];

  return (
    <article className="hidden bg-white box-decoration-clone p-[14mm] text-[9.5pt] leading-snug text-zinc-900 [-webkit-print-color-adjust:exact] [print-color-adjust:exact] print:block">
      <header>
        <div className="flex items-center justify-between gap-[6mm]">
          <div>
            <h1 className="text-[26pt] leading-none font-black tracking-tight">
              {PERSON.fullName}
              <span className="ml-[2mm] text-[14pt] font-normal tracking-normal text-zinc-500">
                ({PERSON.nickname})
              </span>
            </h1>
            <p className="mt-[2mm] text-[12pt] font-semibold text-zinc-600">{SITE.role}</p>
            <ul className="mt-[3.5mm] grid grid-cols-[auto_auto] justify-start gap-x-[7mm] gap-y-[1.6mm] text-[8.5pt] text-zinc-700">
              {contacts.map((item, i) => (
                <li key={item.text} className="flex items-center gap-[2mm]">
                  <Chip icon={item.icon} accent={i + 1} size="4.6mm" />
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element -- print-only, no optimization needed */}
          <img
            src="/cv-photo.png"
            alt={`Portrait of ${PERSON.fullName}`}
            className="size-[36mm] shrink-0 rounded-full object-cover"
          />
        </div>
        {/* A thin band in the portfolio's palette. */}
        <div className="mt-[4mm] flex h-[1.2mm] overflow-hidden rounded-full">
          {THEME.palette.map((color) => (
            <span key={color} style={{ backgroundColor: color }} className="flex-1" />
          ))}
        </div>
      </header>

      <section>
        <Heading icon={<UserIcon />} accent={1}>
          Profile
        </Heading>
        <p className="text-zinc-700">{ABOUT.paragraphs[0]}</p>
      </section>

      <section>
        <Heading icon={<GraduationCapIcon />} accent={2}>
          Education
        </Heading>
        <ul className="space-y-[2mm]">
          <li>
            <p className="font-bold">
              University of Technology (UT)
              <span className="font-normal text-zinc-600"> &middot; Ho Chi Minh City</span>
            </p>
            <p className="text-zinc-700">Master of Data Science &middot; Apr 2025</p>
          </li>
          <li>
            <p className="font-bold">
              University of Information Technology (UIT)
              <span className="font-normal text-zinc-600"> &middot; Ho Chi Minh City</span>
            </p>
            <p className="text-zinc-700">Engineer of Embedded Systems &middot; May 2017</p>
          </li>
        </ul>
      </section>

      <section>
        <Heading icon={<BriefcaseIcon />} accent={3}>
          Experience
        </Heading>
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
        <Heading icon={<CodeIcon />} accent={4}>
          Skills
        </Heading>
        <dl className="grid grid-cols-[22mm_1fr] gap-x-[3mm] gap-y-[1.2mm]">
          {SKILL_GROUPS.map((group) => (
            <div key={group.title} className="contents">
              <dt className="font-mono text-[8pt] tracking-widest text-zinc-500 uppercase">
                {group.title}
              </dt>
              <dd className="text-zinc-800">{group.items.map((item) => item.name).join(", ")}</dd>
            </div>
          ))}
          {EXTRA_SKILLS.map((group) => (
            <div key={group.title} className="contents">
              <dt className="font-mono text-[8pt] tracking-widest text-zinc-500 uppercase">
                {group.title}
              </dt>
              <dd className="text-zinc-800">{group.items.join(", ")}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <Heading icon={<AwardIcon />} accent={5}>
          Honors &amp; Awards
        </Heading>
        <ul className="space-y-[1mm]">
          {HONORS.map((honor) => (
            <li key={honor.name} className="grid grid-cols-[26mm_1fr] gap-x-[3mm]">
              <span className="font-mono text-[8pt] tracking-widest text-zinc-500 uppercase">
                {honor.date}
              </span>
              <span>
                <span className="font-bold">{honor.name}</span>
                <span className="text-zinc-600"> &middot; {honor.place}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
