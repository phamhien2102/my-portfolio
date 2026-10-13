import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SITE } from "@/config/site";
import { AboutSection } from "@/features/about";
import { ContactSection } from "@/features/contact";
import { ExperienceSection } from "@/features/experience";
import { ProjectsSection } from "@/features/projects";
import { RevealCanvas } from "@/features/reveal";
import { SkillsSection } from "@/features/skills";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section id="top" className="relative h-svh">
          <RevealCanvas />

          {/* Overlay sits above the canvas; pointer-events-none keeps the effect interactive. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-6 font-mono text-[11px] tracking-widest text-zinc-400 uppercase sm:p-10 sm:text-xs">
            <span>{SITE.role}</span>
            <span className="text-zinc-500">
              <span className="pointer-coarse:hidden">Move your cursor to reveal</span>
              <span className="hidden pointer-coarse:inline">Drag to reveal</span>
              <span aria-hidden="true"> &darr;</span>
            </span>
          </div>
        </section>

        <AboutSection />
        <ProjectsSection />
        <SkillsSection />
        <ExperienceSection />
        <ContactSection />
      </main>
      <SiteFooter />
    </>
  );
}
