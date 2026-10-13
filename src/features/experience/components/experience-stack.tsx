import type { CSSProperties } from "react";

import { JOURNEY } from "../lib/journey";

/**
 * Cards that pile up as you scroll: each one sticks a little lower than the one before, so the
 * earlier roles stay visible as a stack behind the current one. Pure CSS (`position: sticky`),
 * so it works everywhere, including phones and with reduced motion.
 */
export function ExperienceStack() {
  const count = JOURNEY.length;

  return (
    <ol className="mx-auto max-w-4xl [--stack-top:6rem] sm:[--stack-top:7.5rem]">
      {JOURNEY.map(({ role, accent }, i) => (
        <li
          key={`${role.company}-${role.period}`}
          style={
            {
              top: `calc(var(--stack-top) + ${i} * 1.5rem)`,
              "--accent": accent,
            } as CSSProperties
          }
          className="sticky mb-[18svh] last:mb-0"
        >
          <article className="min-h-72 rounded-2xl border border-t-2 border-white/10 border-t-(--accent) bg-[#0e0e16] p-7 shadow-[0_-24px_48px_-12px_rgba(0,0,0,0.8)] sm:p-10">
            <p className="font-mono text-xs tracking-widest text-(--accent) uppercase">
              {String(i + 1).padStart(2, "0")} / {String(count).padStart(2, "0")} &middot;{" "}
              {role.period}
            </p>
            <h3 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">{role.title}</h3>
            <p className="mt-2 text-zinc-300">{role.company}</p>
            <ul className="mt-6 max-w-2xl space-y-3 text-zinc-300">
              {role.highlights.map((line) => (
                <li key={line} className="flex gap-3">
                  <span aria-hidden="true" className="mt-2.5 h-px w-4 shrink-0 bg-(--accent)" />
                  {line}
                </li>
              ))}
            </ul>
          </article>
        </li>
      ))}
    </ol>
  );
}
