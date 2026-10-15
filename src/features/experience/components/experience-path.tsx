"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

import { THEME } from "@/config/theme";

import { createPathScene } from "@/lib/path-journey/create-path-scene";
import { PATH_STYLES, type PathEffect } from "@/lib/path-journey/effects";
import { cardState, nearestRole, waypointP } from "@/lib/path-journey/flight-path";
import { JOURNEY } from "../lib/journey";

const COUNT = JOURNEY.length;

/** Fly whenever the visitor hasn't asked for less motion. */
const FLY_QUERY = "(prefers-reduced-motion: no-preference)";

/** Scroll distance of the flight, in viewport heights. */
const SCREENS_PER_ROLE = 1;

interface ExperiencePathProps {
  /** Which 3D look to fly through. */
  effect: PathEffect;
  /** Shown instead of the flight with reduced motion, or if WebGL fails. */
  children: ReactNode;
}

/**
 * Experience as a 3D scroll-driven journey (flying a path, climbing a helix, warping a tunnel).
 * Scrolling moves a camera along the route, hovering in front of one gate per role while its
 * card fades in. Everything that changes per frame
 * (cards, rail) is written straight to the DOM, so scrolling never triggers a React render.
 */
export function ExperiencePath({ effect, children }: ExperiencePathProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const runwayRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const railFillRef = useRef<HTMLSpanElement>(null);
  const cardRefs = useRef<(HTMLLIElement | null)[]>([]);
  const stopRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const root = rootRef.current;
    const runway = runwayRef.current;
    const stage = stageRef.current;
    const host = hostRef.current;
    if (!root || !runway || !stage || !host) return;

    const onProgress = (p: number) => {
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        const { opacity, shift } = cardState(p, i, COUNT);
        card.style.opacity = opacity.toFixed(3);
        card.style.transform = `translate3d(0, ${shift.toFixed(1)}px, 0)`;
      });

      const current = nearestRole(p, COUNT);
      stopRefs.current.forEach((stop, i) => {
        if (stop) stop.dataset.current = i === current ? "true" : "false";
      });
      if (railFillRef.current) railFillRef.current.style.transform = `scaleY(${p.toFixed(3)})`;
      if (hintRef.current) hintRef.current.style.opacity = String(Math.max(0, 1 - p / 0.05));
    };

    const query = window.matchMedia(FLY_QUERY);
    let dispose: (() => void) | undefined;

    // Start or stop the scene as the screen size / motion preference changes.
    const sync = () => {
      dispose?.();
      dispose = undefined;
      if (!query.matches) return;
      try {
        dispose = createPathScene({
          effect,
          host,
          runway,
          stage,
          accents: JOURNEY.map((step) => step.accent),
          onProgress,
        });
        delete root.dataset.path;
      } catch {
        // No WebGL (or it failed): fall back to the plain timeline.
        root.dataset.path = "off";
      }
    };

    sync();
    query.addEventListener("change", sync);
    return () => {
      query.removeEventListener("change", sync);
      dispose?.();
    };
  }, [effect]);

  /** Scroll so that role `i` is the current one. */
  const flyTo = (i: number) => {
    const runway = runwayRef.current;
    const stage = stageRef.current;
    if (!runway || !stage) return;
    const range = runway.offsetHeight - stage.offsetHeight;
    const top = runway.getBoundingClientRect().top + window.scrollY + waypointP(i, COUNT) * range;
    window.scrollTo({ top, behavior: "smooth" });
  };

  const bg = THEME.background;

  return (
    <div ref={rootRef} className="group/exp">
      {/* The flight: motion allowed, WebGL working. */}
      <div className="hidden group-data-[path=off]/exp:hidden! motion-safe:block">
        <div
          ref={runwayRef}
          style={{ height: `${(COUNT * SCREENS_PER_ROLE + 1) * 100}svh` }}
          className="relative"
        >
          <div
            ref={stageRef}
            className="sticky top-0 h-svh overflow-hidden border-t border-white/10"
          >
            <div ref={hostRef} aria-hidden="true" className="absolute inset-0 touch-pan-y" />

            {/* Keeps the cards legible over the scene, and softens the edges. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[#09090e]/55 md:hidden"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 hidden md:block"
              style={{
                background: `linear-gradient(90deg, ${bg}f2 0%, ${bg}a6 34%, transparent 66%), radial-gradient(ellipse at center, transparent 55%, ${bg}cc 100%)`,
              }}
            />

            <ol className="pointer-events-none absolute inset-0 grid items-center px-6 pr-14 sm:px-10 lg:px-20">
              {JOURNEY.map(({ role, accent }, i) => (
                <li
                  key={`${role.company}-${role.period}`}
                  ref={(el) => {
                    cardRefs.current[i] = el;
                  }}
                  style={{ opacity: i === 0 ? 1 : 0 }}
                  className="col-start-1 row-start-1 max-w-lg will-change-[opacity,transform]"
                >
                  <p
                    style={{ color: accent }}
                    className="font-mono text-xs tracking-widest uppercase"
                  >
                    {String(i + 1).padStart(2, "0")} / {String(COUNT).padStart(2, "0")} &middot;{" "}
                    {role.period}
                  </p>
                  <h3 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
                    {role.title}
                  </h3>
                  <p className="mt-2 text-zinc-300">{role.company}</p>
                  <ul className="mt-6 space-y-3 text-zinc-300">
                    {role.highlights.map((line) => (
                      <li key={line} className="flex gap-3">
                        <span
                          aria-hidden="true"
                          style={{ backgroundColor: accent }}
                          className="mt-2.5 h-px w-4 shrink-0"
                        />
                        {line}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>

            {/* Progress rail: jump to any role. */}
            <div className="absolute top-1/2 right-4 -translate-y-1/2 lg:right-10">
              <div className="relative flex flex-col items-start gap-10">
                <span
                  aria-hidden="true"
                  className="absolute top-1.5 bottom-1.5 left-[5px] w-px bg-white/15"
                />
                <span
                  ref={railFillRef}
                  aria-hidden="true"
                  style={{ transform: "scaleY(0)" }}
                  className="absolute top-1.5 bottom-1.5 left-[5px] w-px origin-top bg-white"
                />
                {JOURNEY.map(({ role, accent }, i) => (
                  <button
                    key={`${role.company}-${role.period}`}
                    ref={(el) => {
                      stopRefs.current[i] = el;
                    }}
                    type="button"
                    data-current={i === 0 ? "true" : "false"}
                    aria-label={`Fly to ${role.title}, ${role.company}`}
                    onClick={() => flyTo(i)}
                    style={{ "--accent": accent } as CSSProperties}
                    className="group/stop relative flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  >
                    <span
                      aria-hidden="true"
                      className="size-[11px] rounded-full border-2 border-(--accent) bg-(--background) transition-[background-color,scale] duration-300 group-data-[current=true]/stop:scale-125 group-data-[current=true]/stop:bg-(--accent) motion-reduce:transition-none"
                    />
                    <span className="hidden font-mono text-[11px] tracking-widest text-zinc-500 uppercase transition-colors duration-300 group-hover/stop:text-white group-data-[current=true]/stop:text-white lg:inline">
                      {role.period}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div
              ref={hintRef}
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-8 flex flex-col items-center gap-2 font-mono text-[11px] tracking-widest text-zinc-400 uppercase"
            >
              {PATH_STYLES[effect].hint}
              <span className="block h-8 w-px animate-pulse bg-linear-to-b from-zinc-400 to-transparent motion-reduce:animate-none" />
            </div>
          </div>
        </div>
      </div>

      {/* The plain timeline: reduced motion, or no WebGL. */}
      <div className="mx-auto block max-w-6xl px-6 group-data-[path=off]/exp:block! sm:px-10 motion-safe:hidden">
        {children}
      </div>
    </div>
  );
}
