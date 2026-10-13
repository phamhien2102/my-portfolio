import type { ReactNode } from "react";

import { FadeIn } from "./fade-in";

interface SectionProps {
  /** Anchor id used by the navigation (e.g. "about" -> #about). */
  id: string;
  /** Section number shown in the eyebrow, e.g. "01". */
  index: string;
  /** Short eyebrow label, e.g. "About". */
  label: string;
  /** Large heading. */
  heading: ReactNode;
  children: ReactNode;
}

/** Shared section frame: anchor, spacing, eyebrow and big heading. */
export function Section({ id, index, label, heading, children }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-16 border-t border-white/10 px-6 py-24 sm:px-10 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <FadeIn>
          <p className="font-mono text-xs tracking-widest text-zinc-500 uppercase">
            {index} &mdash; {label}
          </p>
          <h2 className="mt-6 max-w-4xl text-4xl leading-[1.05] font-black tracking-tight text-balance sm:text-6xl">
            {heading}
          </h2>
        </FadeIn>
        <div className="mt-14 sm:mt-20">{children}</div>
      </div>
    </section>
  );
}
