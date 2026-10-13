import type { CSSProperties } from "react";

import { FadeIn } from "@/components/ui/fade-in";
import { Section } from "@/components/ui/section";
import { accentAt } from "@/config/theme";

import { PROJECTS } from "../data";

export function ProjectsSection() {
  return (
    <Section id="projects" index="02" label="Projects" heading="Selected work.">
      <ul className="border-t border-white/10">
        {PROJECTS.map((project, i) => (
          <li key={project.title} className="border-b border-white/10">
            <FadeIn delay={i * 80}>
              {/* Each row picks its hover accent from the shared palette. */}
              <a
                href={project.href}
                style={{ "--accent": accentAt(i) } as CSSProperties}
                className="group grid items-baseline gap-x-8 gap-y-3 py-8 transition-[padding] duration-300 hover:pl-4 sm:grid-cols-[3rem_1fr_auto] sm:py-10"
              >
                <span className="font-mono text-xs tracking-widest text-zinc-600">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div>
                  <h3 className="text-3xl font-black tracking-tight transition-colors duration-300 group-hover:text-(--accent) sm:text-5xl">
                    {project.title}
                  </h3>
                  <p className="mt-3 max-w-xl text-zinc-400">{project.summary}</p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <li
                        key={tag}
                        className="rounded-full border border-white/15 px-3 py-1 font-mono text-[11px] tracking-wider text-zinc-400"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                </div>

                <span className="flex items-center gap-4 font-mono text-xs tracking-widest text-zinc-500 sm:flex-col sm:items-end sm:gap-6">
                  {project.year}
                  <span
                    aria-hidden="true"
                    className="text-2xl transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-(--accent)"
                  >
                    &#8599;
                  </span>
                </span>
              </a>
            </FadeIn>
          </li>
        ))}
      </ul>
    </Section>
  );
}
