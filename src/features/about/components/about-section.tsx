import { FadeIn } from "@/components/ui/fade-in";
import { Section } from "@/components/ui/section";

import { ABOUT } from "../data";

export function AboutSection() {
  return (
    <Section id="about" index="01" label="About" heading={ABOUT.heading}>
      <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
        <FadeIn className="space-y-6 text-lg leading-relaxed text-zinc-400 sm:text-xl">
          {ABOUT.paragraphs.map((text) => (
            <p key={text}>{text}</p>
          ))}
        </FadeIn>

        <FadeIn delay={150}>
          <dl className="divide-y divide-white/10 border-y border-white/10">
            {ABOUT.facts.map((fact) => (
              <div key={fact.label} className="flex justify-between gap-6 py-4">
                <dt className="font-mono text-xs tracking-widest text-zinc-500 uppercase">
                  {fact.label}
                </dt>
                <dd className="text-right text-zinc-200">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </FadeIn>
      </div>
    </Section>
  );
}
