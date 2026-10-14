import { SectionPager } from "@/components/layout/section-pager";
import { SiteFooter } from "@/components/layout/site-footer";
import { LOGO_DOCK_ID, SiteHeader } from "@/components/layout/site-header";
import { SITE } from "@/config/site";
import { AboutSection } from "@/features/about";
import { ContactSection } from "@/features/contact";
import { ExperienceSection } from "@/features/experience";
import { ProjectsSection } from "@/features/projects";
import { RevealCanvas } from "@/features/reveal";
import { Resume } from "@/features/resume";
import { SkillsSection } from "@/features/skills";

export default function Home() {
  return (
    <>
      <SectionPager />
      <SiteHeader />
      <main className="flex-1 print:hidden">
        <section id="top" className="relative h-svh">
          <RevealCanvas dockId={LOGO_DOCK_ID} />

          {/* Overlay sits above the canvas layer (z-20); pointer-events-none keeps the effect interactive. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-25 flex items-end justify-between gap-6 p-6 font-mono text-[11px] tracking-widest text-zinc-400 uppercase sm:p-10 sm:text-xs">
            <span>{SITE.role}</span>
            <span className="text-zinc-500">
              <span className="pointer-coarse:hidden">
                Move your cursor to reveal
                <span aria-hidden="true"> &darr;</span>
              </span>
              <a
                href="#about"
                className="pointer-events-auto hidden items-center gap-1.5 pointer-coarse:inline-flex focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white motion-safe:animate-next-hint"
              >
                Continue
                <span aria-hidden="true">&darr;</span>
              </a>
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
      <Resume />
    </>
  );
}
