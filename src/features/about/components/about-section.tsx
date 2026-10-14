import type { CSSProperties, ReactNode } from "react";

import { FadeIn } from "@/components/ui/fade-in";
import { Section } from "@/components/ui/section";
import { SITE } from "@/config/site";
import { accentAt } from "@/config/theme";

import { ABOUT } from "../data";
import { DotPortrait } from "./dot-portrait";
import { LocalTime } from "./local-time";
import { PixelText } from "./pixel-text";

export function AboutSection() {
  const [lead, ...rest] = ABOUT.paragraphs;
  const fact = (label: string) => ABOUT.facts.find((item) => item.label === label)?.value ?? "";
  const location = fact("Based in");
  const status = fact("Status");
  const focus = fact("Focus")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <Section id="about" index="01" label="About" heading={ABOUT.heading} compactHeading>
      <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,30rem)_1fr] lg:gap-20">
        {/* ---- Halftone portrait ---- */}
        <FadeIn className="mx-auto w-full max-w-lg">
          <figure className="relative overflow-hidden border border-white/10 bg-[#0d0d0d]">
            <DotPortrait label={`Halftone portrait of ${SITE.name}, made of glowing dots`} />

            {/* Small print in the corners. */}
            <figcaption className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 font-mono text-[10px] leading-relaxed tracking-widest text-zinc-300 uppercase sm:p-5 sm:text-[11px]">
              <span className="flex justify-between gap-4">
                <span>{SITE.name}</span>
                <span className="text-right">{location}</span>
              </span>
              <span className="max-w-[16rem]">{SITE.role}</span>
            </figcaption>
          </figure>
        </FadeIn>

        {/* ---- Story ---- */}
        <div>
          {/* Every block of text resolves out of a mosaic of pixels as it scrolls into view. */}
          <PixelText
            as="p"
            className="font-mono text-[11px] tracking-widest text-zinc-500 uppercase"
          >
            <span className="text-zinc-300">(A)</span> The short version
          </PixelText>

          <PixelText
            as="p"
            className="mt-5 text-2xl leading-snug font-medium tracking-tight text-zinc-100 sm:text-3xl"
          >
            {lead}
          </PixelText>

          <PixelText className="mt-6 space-y-5 text-lg leading-relaxed text-zinc-400">
            {rest.map((text) => (
              <p key={text}>{text}</p>
            ))}
          </PixelText>

          {/* Spec sheet. */}
          <PixelText
            as="p"
            className="mt-12 font-mono text-[11px] tracking-widest text-zinc-500 uppercase"
          >
            <span className="text-zinc-300">(B)</span> The details
          </PixelText>
          <PixelText
            as="dl"
            className="mt-5 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2"
          >
            <Cell label="Based in" index="01" accent={accentAt(2)}>
              <span className="text-zinc-100">{location}</span>
              <span className="mt-1 block font-mono text-xs text-zinc-500">
                <LocalTime timeZone={ABOUT.timeZone} /> local time
              </span>
            </Cell>

            <Cell label="Status" index="02" accent={accentAt(3)}>
              <span className="flex items-center gap-3 text-zinc-100">
                <span aria-hidden="true" className="relative flex size-2.5">
                  <span className="absolute inline-flex size-full rounded-full bg-emerald-400 opacity-75 motion-safe:animate-ping" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-emerald-400" />
                </span>
                {status}
              </span>
            </Cell>

            <Cell label="Focus" index="03" accent={accentAt(4)} wide>
              <ul className="flex flex-wrap gap-2">
                {focus.map((item) => (
                  <li
                    key={item}
                    className="border border-white/15 px-3 py-1 font-mono text-xs tracking-wider text-zinc-200"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </Cell>
          </PixelText>

          <FadeIn delay={200}>
            <a
              href="#contact"
              className="group mt-10 inline-flex items-center gap-3 border border-white/30 px-6 py-3 font-mono text-xs tracking-widest uppercase transition-colors duration-300 hover:border-white hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Work with me
              <span
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                &rarr;
              </span>
            </a>
          </FadeIn>
        </div>
      </div>
    </Section>
  );
}

/** One cell of the spec sheet: a label, an index, and whatever the value needs. */
function Cell({
  label,
  index,
  accent,
  wide = false,
  children,
}: {
  label: string;
  index: string;
  accent: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      style={{ "--accent": accent } as CSSProperties}
      className={`group relative bg-[#0b0b11] p-5 transition-colors duration-300 hover:bg-[#101018] ${wide ? "sm:col-span-2" : ""}`}
    >
      {/* A line that draws across the top on hover. */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-(--accent) transition-transform duration-500 ease-out group-hover:scale-x-100"
      />
      <dt className="flex items-center justify-between font-mono text-[11px] tracking-widest text-zinc-500 uppercase">
        {label}
        <span aria-hidden="true" className="text-zinc-700">
          {index}
        </span>
      </dt>
      <dd className="mt-4 text-base">{children}</dd>
    </div>
  );
}
