import type { CSSProperties } from "react";

import { FadeIn } from "@/components/ui/fade-in";
import { SITE } from "@/config/site";
import { THEME, accentAt } from "@/config/theme";
import { PrintResumeButton } from "@/features/resume";

import { CopyEmailButton } from "./copy-email-button";

/** `https://www.github.com/foo/` -> `github.com/foo` */
function displayUrl(href: string): string {
  return href.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

const GRADIENT = `linear-gradient(90deg, ${THEME.palette.join(", ")})`;

export function ContactSection() {
  return (
    <section
      id="contact"
      className="relative scroll-mt-16 overflow-hidden border-t border-white/10 px-6 py-24 sm:px-10 sm:py-32"
    >
      {/* Soft neon glow behind the content; purely decorative. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -bottom-48 left-1/4 size-[36rem] rounded-full bg-[#7a2cff]/25 blur-[120px]" />
        <div className="absolute -right-24 -bottom-32 size-[30rem] rounded-full bg-[#ff2d95]/20 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <FadeIn>
          <p className="font-mono text-xs tracking-widest text-zinc-500 uppercase">
            05 &mdash; Contact
          </p>

          <p className="mt-8 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-4 py-2 font-mono text-xs tracking-widest text-zinc-300 uppercase">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#00b96b] opacity-75 motion-reduce:hidden" />
              <span className="relative inline-flex size-2 rounded-full bg-[#00b96b]" />
            </span>
            {SITE.availability}
          </p>

          <h2 className="mt-8 text-6xl leading-[0.92] font-black tracking-tighter sm:text-8xl lg:text-9xl">
            Let&apos;s work
            <br />
            <span
              style={{ backgroundImage: GRADIENT }}
              className="bg-clip-text text-transparent [-webkit-text-fill-color:transparent]"
            >
              together.
            </span>
          </h2>

          <p className="mt-8 max-w-xl text-lg text-zinc-400 sm:text-xl">
            Have a project in mind, or just want to say hi? My inbox is always open.
          </p>
        </FadeIn>

        <FadeIn delay={120} className="mt-10 flex flex-wrap items-center gap-4">
          <a
            href={`mailto:${SITE.email}`}
            style={{ "--accent": accentAt(5) } as CSSProperties}
            className="group inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 font-mono text-sm font-semibold tracking-widest text-black uppercase transition-colors duration-300 hover:bg-(--accent) hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Say hello
            <span
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
            >
              &#8599;
            </span>
          </a>
          <CopyEmailButton email={SITE.email} />
          <PrintResumeButton />
        </FadeIn>

        <ul className="mt-20 grid gap-4 sm:grid-cols-2">
          {SITE.socials.map((social, i) => (
            <li key={social.label}>
              <FadeIn delay={200 + i * 100}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ "--accent": accentAt(i + 1) } as CSSProperties}
                  className="group relative flex items-end justify-between gap-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors duration-300 hover:border-transparent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:p-8"
                >
                  {/* Accent layer that sweeps up from the bottom on hover. */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 translate-y-full bg-(--accent) transition-transform duration-500 ease-out group-hover:translate-y-0 motion-reduce:transition-none"
                  />

                  <span className="relative">
                    <span className="block font-mono text-xs tracking-widest text-zinc-500 uppercase transition-colors duration-300 group-hover:text-black/60">
                      {social.label}
                    </span>
                    <span className="mt-3 block text-2xl font-black tracking-tight transition-colors duration-300 group-hover:text-black sm:text-4xl">
                      {displayUrl(social.href)}
                    </span>
                  </span>

                  <span
                    aria-hidden="true"
                    className="relative text-3xl text-zinc-500 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-black"
                  >
                    &#8599;
                  </span>
                </a>
              </FadeIn>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
