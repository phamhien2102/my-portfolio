import type { ReactNode } from "react";

import { SITE } from "@/config/site";
import { ABOUT } from "@/features/about";

import {
  CakeIcon,
  GithubIcon,
  GlobeIcon,
  LinkedinIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon,
} from "./resume-icons";

/** Resume-only skills: tools used day to day that are not part of the website's skill bars. */
export const EXTRA_SKILLS = [
  {
    title: "Quality",
    items: ["Jest", "Fastlane", "Firebase App Distribution"],
  },
  {
    title: "Platform",
    items: ["Contentful (CMS)", "Contentstack (CMS)", "LaunchDarkly", "Remote config", "OneTrust"],
  },
] as const;

interface Honor {
  date: string;
  name: string;
  place: string;
  /** Only for certificates that expire. */
  validUntil?: string;
  /** The certificate file or page, linked from the creative layout. */
  href?: string;
}

export const HONORS = [
  {
    date: "Sep 2026",
    name: "Certificate, Contentful Certified Professional",
    place: "Contentful",
    validUntil: "Sep 2028",
    href: "/certificates/raymond-pham-5c28ad90-2041-4d9a-85d5-efcd27ee3afc-certificate.pdf",
  },
  {
    date: "Aug 2026",
    name: "Certificate, Optimizely Certified SaaS CMS Developer",
    place: "Optimizely",
    validUntil: "Aug 2028",
    href: "/certificates/Raymond%20Pham%20-%20Optimizely%20Certified%20SaaS%20CMS%20Developer.pdf",
  },
  { date: "Dec 2022", name: "Certificate, Neural Networks and Deep Learning", place: "Coursera" },
  { date: "Nov 2022", name: "Certificate, Convolutional Neural Networks", place: "Coursera" },
] as const satisfies readonly Honor[];

/** Personal details printed on the resume only (not shown elsewhere on the site). */
export const PERSON = {
  fullName: "Phạm Thanh Hiền",
  nickname: "Raymond",
  phone: "(+84) 83.9199.121",
  birthday: "Feb 21, 1994",
  birthplace: "Tây Ninh (Long An)",
} as const;

interface Education {
  school: string;
  place: string;
  degree: string;
  date: string;
}

export const EDUCATION = [
  {
    school: "University of Technology (UT)",
    place: "Ho Chi Minh City",
    degree: "Master of Data Science",
    date: "Apr 2025",
  },
  {
    school: "University of Information Technology (UIT)",
    place: "Ho Chi Minh City",
    degree: "Engineer of Embedded Systems",
    date: "May 2017",
  },
] as const satisfies readonly Education[];

/** Headline numbers for the creative layout. The pull requests come from the git history at Huge. */
export const STATS = [
  { label: "Experience", value: "6+", caption: "Years" },
  { label: "Pull requests", value: "400+", caption: "Merged at Huge" },
  { label: "Education", value: "MSc", caption: "Data Science" },
  { label: "Based in", value: "HCMC", caption: "Vietnam" },
] as const;

/** `https://www.github.com/foo/` -> `github.com/foo` */
export function displayUrl(href: string): string {
  return href.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

export interface Contact {
  icon: ReactNode;
  text: string;
  /** Present when the entry can be a link (phone, email, profiles, website). */
  href?: string;
}

const SOCIAL_ICONS: Record<string, ReactNode> = {
  GitHub: <GithubIcon />,
  LinkedIn: <LinkedinIcon />,
};

/** Contact details in print order. Social links without a profile path are left out. */
export function getContacts(): Contact[] {
  const location = ABOUT.facts.find((fact) => fact.label === "Based in")?.value;

  return [
    { icon: <PhoneIcon />, text: PERSON.phone, href: `tel:${PERSON.phone.replace(/[^+\d]/g, "")}` },
    { icon: <MailIcon />, text: SITE.email, href: `mailto:${SITE.email}` },
    ...SITE.socials
      .filter((social) => displayUrl(social.href).includes("/"))
      .map((social) => ({
        icon: SOCIAL_ICONS[social.label] ?? <UserIcon />,
        text: displayUrl(social.href),
        href: social.href,
      })),
    { icon: <GlobeIcon />, text: displayUrl(SITE.website), href: SITE.website },
    ...(location ? [{ icon: <MapPinIcon />, text: location }] : []),
    { icon: <CakeIcon />, text: `${PERSON.birthday} · ${PERSON.birthplace}` },
  ];
}
