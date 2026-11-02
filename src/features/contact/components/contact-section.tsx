import type { CSSProperties } from "react";

import { FadeIn } from "@/components/ui/fade-in";
import { SITE } from "@/config/site";
import { THEME, accentAt } from "@/config/theme";
import { PrintResumeButton } from "@/features/resume";

import { CopyEmailButton } from "./copy-email-button";

const SOCIAL_ICONS: Record<string, string> = {
  GitHub:
    "M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.7 5.4-5.27 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z",
  LinkedIn:
    "M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z",
};

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

        <ul className="mt-20 flex flex-wrap gap-4">
          {SITE.socials.map((social, i) => (
            <li key={social.label}>
              <FadeIn delay={200 + i * 100}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  title={social.label}
                  style={{ "--accent": accentAt(i + 1) } as CSSProperties}
                  className="group relative flex size-16 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] text-zinc-300 transition-colors duration-300 hover:border-transparent hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:size-20"
                >
                  {/* Accent layer that sweeps up from the bottom on hover. */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 translate-y-full bg-(--accent) transition-transform duration-500 ease-out group-hover:translate-y-0 motion-reduce:transition-none"
                  />
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="relative size-7 sm:size-8"
                  >
                    <path d={SOCIAL_ICONS[social.label]} />
                  </svg>
                </a>
              </FadeIn>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
