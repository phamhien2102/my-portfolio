"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

import { accentAt } from "@/config/theme";

import { PROJECTS } from "../data";
import { ProjectBackdrop } from "./project-backdrop";

const COUNT = PROJECTS.length;

/** Run whenever the visitor hasn't asked for less motion. */
const SCROLL_QUERY = "(prefers-reduced-motion: no-preference)";

/** Extra offset between stacked cards. The first card's top comes from `--stick-top` in CSS. */
const STICK_STEP = 16;

const clamp = (x: number, lo: number, hi: number) => Math.min(Math.max(x, lo), hi);

interface ProjectScrollProps {
  /** Shown instead with reduced motion. */
  fallback: ReactNode;
}

/**
 * Projects as a stack of cards that pile up as you scroll down.
 *
 * Each card sticks near the top; the next one rises from below and slides over it. While a card
 * is being covered it shrinks a little and darkens, and while a card rises it tips up out of the
 * floor (a slight 3D lean) and its picture drifts for depth.
 *
 * Everything that changes with scroll is written straight to the DOM (no React renders).
 */
export function ProjectScroll({ fallback }: ProjectScrollProps) {
  const slotRefs = useRef<(HTMLLIElement | null)[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const shadeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const artRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const query = window.matchMedia(SCROLL_QUERY);
    let frame = 0;

    const update = () => {
      frame = 0;
      if (!query.matches) return;
      const vh = window.innerHeight;
      const reach = vh * 0.75; // how far below its resting place a card starts to rise

      for (let i = 0; i < COUNT; i++) {
        const slot = slotRefs.current[i];
        const card = cardRefs.current[i];
        if (!slot || !card) continue;

        const sticky = card.parentElement;
        if (!sticky) continue;
        const stick = parseFloat(getComputedStyle(sticky).top) || 0;
        // 0 while the card is far below, 1 once it has settled at its sticking place.
        const rise = 1 - clamp((slot.getBoundingClientRect().top - stick) / reach, 0, 1);

        // 0 until the next card starts to cover this one, 1 when it fully has.
        const next = slotRefs.current[i + 1];
        const cover = next
          ? 1 - clamp((next.getBoundingClientRect().top - (stick + STICK_STEP)) / reach, 0, 1)
          : 0;

        const scale = (0.94 + 0.06 * rise) * (1 - 0.05 * cover);
        const lean = (1 - rise) * 9;
        card.style.transform = `rotateX(${lean.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
        card.style.opacity = String(clamp(0.25 + rise * 1.2, 0, 1).toFixed(3));

        const shade = shadeRefs.current[i];
        if (shade) shade.style.opacity = (cover * 0.6).toFixed(3);
        const art = artRefs.current[i];
        if (art)
          art.style.transform = `translate3d(0,${((rise - 0.5) * -36).toFixed(1)}px,0) scale(1.14)`;
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    query.addEventListener("change", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      query.removeEventListener("change", schedule);
    };
  }, []);

  return (
    <div>
      {/* The stack: motion allowed. `--stick-top` clears the taller phone header. */}
      <ol className="hidden [perspective:1800px] [--stick-top:8.25rem] motion-safe:block sm:[--stick-top:5.5rem]">
        {PROJECTS.map((project, i) => {
          const accent = accentAt(i);
          const last = i === COUNT - 1;
          return (
            <li
              key={project.title}
              ref={(el) => {
                slotRefs.current[i] = el;
              }}
              // Room to scroll while the next card slides over this one.
              style={{ height: last ? undefined : "min(78svh, 40rem)" }}
            >
              <div
                style={
                  {
                    top: `calc(var(--stick-top) + ${i * STICK_STEP}px)`,
                    "--accent": accent,
                  } as CSSProperties
                }
                className="sticky"
              >
                <div
                  ref={(el) => {
                    cardRefs.current[i] = el;
                  }}
                  className="relative origin-top overflow-hidden rounded-3xl border border-white/10 bg-[#0b0b11] shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.8)] will-change-[transform,opacity]"
                >
                  {/* A thin accent line along the top edge. */}
                  <span
                    aria-hidden="true"
                    style={{ backgroundColor: accent }}
                    className="absolute inset-x-0 top-0 z-10 h-px opacity-70"
                  />

                  <a
                    href={project.href}
                    className="group grid min-h-[min(60svh,32rem)] gap-8 p-6 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-(--accent) lg:grid-cols-[1fr_1.15fr] lg:gap-12 lg:p-8"
                  >
                    <div className="flex flex-col justify-between gap-8 py-2">
                      <p className="font-mono text-xs tracking-widest text-zinc-500">
                        <span style={{ color: accent }}>{String(i + 1).padStart(2, "0")}</span> /{" "}
                        {String(COUNT).padStart(2, "0")} &middot; {project.year}
                      </p>

                      <div>
                        <h3 className="text-4xl leading-[1.02] font-black tracking-tight transition-colors duration-300 group-hover:text-(--accent) sm:text-5xl xl:text-6xl">
                          {project.title}
                        </h3>
                        <p className="mt-5 max-w-md text-lg text-zinc-400">{project.summary}</p>
                        <ul className="mt-6 flex flex-wrap gap-2">
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

                      <span className="inline-flex items-center gap-3 font-mono text-xs tracking-widest text-zinc-300 uppercase">
                        View project
                        <span
                          aria-hidden="true"
                          className="flex size-10 items-center justify-center rounded-full bg-white text-lg text-black transition-[transform,background-color] duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:bg-(--accent) group-hover:text-white"
                        >
                          &#8599;
                        </span>
                      </span>
                    </div>

                    {/* Picture, larger than its frame so it can drift inside it. */}
                    <div className="relative min-h-64 overflow-hidden rounded-2xl bg-[#0d0d14]">
                      <div
                        ref={(el) => {
                          artRefs.current[i] = el;
                        }}
                        className="absolute inset-0 will-change-transform"
                      >
                        <ProjectBackdrop
                          project={project}
                          index={i}
                          sizes="(min-width: 1024px) 40rem, 90vw"
                        />
                      </div>
                    </div>
                  </a>

                  {/* Darkens as the next card covers this one. */}
                  <div
                    ref={(el) => {
                      shadeRefs.current[i] = el;
                    }}
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-black opacity-0"
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {/* The card grid: reduced motion. */}
      <div className="block motion-safe:hidden">{fallback}</div>
    </div>
  );
}
