import type { CSSProperties } from "react";

import { FadeIn } from "@/components/ui/fade-in";
import { Section } from "@/components/ui/section";
import { accentAt } from "@/config/theme";

import { EXPERIENCE } from "../data";

export function ExperienceSection() {
  return (
    <Section id="experience" index="04" label="Experience" heading="Where I've worked.">
      <ol className="relative space-y-14 border-l border-white/10 pl-8 sm:pl-12">
        {EXPERIENCE.map((role, i) => (
          <li key={`${role.company}-${role.period}`} className="relative">
            {/* Timeline dot, coloured from the shared palette. */}
            <span
              aria-hidden="true"
              style={{ backgroundColor: accentAt(i + 2) } as CSSProperties}
              className="absolute top-2 -left-[calc(2rem+4.5px)] size-2 rounded-full sm:-left-[calc(3rem+4.5px)]"
            />
            <FadeIn delay={i * 80}>
              <p className="font-mono text-xs tracking-widest text-zinc-500 uppercase">
                {role.period}
              </p>
              <h3 className="mt-3 text-2xl font-black tracking-tight sm:text-4xl">{role.title}</h3>
              <p className="mt-1 text-zinc-400">{role.company}</p>
              <ul className="mt-5 max-w-2xl list-disc space-y-2 pl-5 text-zinc-400 marker:text-zinc-600">
                {role.highlights.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </FadeIn>
          </li>
        ))}
      </ol>
    </Section>
  );
}
