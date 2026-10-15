"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

import { THEME, accentAt } from "@/config/theme";
import { createPathScene } from "@/lib/path-journey/create-path-scene";
import { PATH_STYLES } from "@/lib/path-journey/effects";
import { cardState, nearestRole, waypointP } from "@/lib/path-journey/flight-path";

import { SKILL_GROUPS, levelLabel } from "../data";

const COUNT = SKILL_GROUPS.length;
const ACCENTS = SKILL_GROUPS.map((_, i) => accentAt(i + 1));

/** Fly whenever the visitor hasn't asked for less motion. */
const FLY_QUERY = "(prefers-reduced-motion: no-preference)";

/** Scroll distance of the flight, in viewport heights per group. */
const SCREENS_PER_GROUP = 0.9;

interface SkillsPathProps {
  /** Shown instead of the flight with reduced motion, or if WebGL fails. */
  fallback: ReactNode;
}

/**
 * Skills as a 3D scroll-driven flight: the same glowing path as the Experience fly-through,
 * with one gate per skill group. The page scrolls while a full-screen stage stays put, and the
 * camera glides along the path, hovering at each gate while that group's skills fade in.
 * Per-frame changes (cards, rail) are written straight to the DOM: no React renders on scroll.
 */
export function SkillsPath({ fallback }: SkillsPathProps) {
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
        card.style.visibility = opacity < 0.01 ? "hidden" : "visible";
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
          effect: "flythrough",
          host,
          runway,
          stage,
          accents: ACCENTS,
          onProgress,
        });
        delete root.dataset.path;
      } catch {
        // No WebGL (or it failed): fall back to the plain list.
        root.dataset.path = "off";
      }
    };

    sync();
    query.addEventListener("change", sync);
    return () => {
      query.removeEventListener("change", sync);
      dispose?.();
    };
  }, []);

  /** Scroll so that group `i` is the current one. */
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
    <div ref={rootRef} className="group/path">
      {/* The flight: motion allowed, WebGL working. */}
      <div className="hidden group-data-[path=off]/path:hidden! motion-safe:block">
        <div
          ref={runwayRef}
          style={{ height: `${(COUNT * SCREENS_PER_GROUP + 1) * 100}svh` }}
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
                background: `linear-gradient(90deg, ${bg}f2 0%, ${bg}a6 38%, transparent 70%), radial-gradient(ellipse at center, transparent 55%, ${bg}cc 100%)`,
              }}
            />

            <ol className="pointer-events-none absolute inset-0 grid items-center px-6 pr-14 sm:px-10 lg:px-20">
              {SKILL_GROUPS.map((group, i) => (
                <li
                  key={group.title}
                  ref={(el) => {
                    cardRefs.current[i] = el;
                  }}
                  style={{ opacity: i === 0 ? 1 : 0, "--accent": ACCENTS[i] } as CSSProperties}
                  className="col-start-1 row-start-1 max-w-md will-change-[opacity,transform] lg:max-w-lg"
                >
                  <p
                    style={{ color: ACCENTS[i] }}
                    className="font-mono text-xs tracking-widest uppercase"
                  >
                    {String(i + 1).padStart(2, "0")} / {String(COUNT).padStart(2, "0")}
                  </p>
                  <h3 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
                    {group.title}
                  </h3>

                  <ul className="mt-8 space-y-4">
                    {group.items.map((skill) => (
                      <li key={skill.name}>
                        <div className="flex items-baseline justify-between gap-4">
                          <span className="text-lg font-semibold text-zinc-100">{skill.name}</span>
                          <span className="font-mono text-[11px] tracking-widest text-zinc-500 uppercase">
                            {levelLabel(skill.level)}
                          </span>
                        </div>
                        <div className="mt-2 h-[3px] bg-white/10">
                          <div
                            style={{ width: `${skill.level}%`, backgroundColor: ACCENTS[i] }}
                            className="h-full"
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>

            {/* Progress rail: jump to any group. */}
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
                {SKILL_GROUPS.map((group, i) => (
                  <button
                    key={group.title}
                    ref={(el) => {
                      stopRefs.current[i] = el;
                    }}
                    type="button"
                    data-current={i === 0 ? "true" : "false"}
                    aria-label={`Fly to ${group.title}`}
                    onClick={() => flyTo(i)}
                    style={{ "--accent": ACCENTS[i] } as CSSProperties}
                    className="group/stop relative flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  >
                    <span
                      aria-hidden="true"
                      className="size-[11px] rounded-full border-2 border-(--accent) bg-(--background) transition-[background-color,scale] duration-300 group-data-[current=true]/stop:scale-125 group-data-[current=true]/stop:bg-(--accent) motion-reduce:transition-none"
                    />
                    <span className="hidden font-mono text-[11px] tracking-widest text-zinc-500 uppercase transition-colors duration-300 group-hover/stop:text-white group-data-[current=true]/stop:text-white lg:inline">
                      {group.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div
              ref={hintRef}
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-6 flex flex-col items-center gap-2 font-mono text-[11px] tracking-widest text-zinc-400 uppercase"
            >
              {PATH_STYLES.flythrough.hint}
              <span className="block h-8 w-px animate-pulse bg-linear-to-b from-zinc-400 to-transparent motion-reduce:animate-none" />
            </div>
          </div>
        </div>
      </div>

      {/* The plain list: reduced motion, or no WebGL. */}
      <div className="mx-auto block max-w-6xl px-6 group-data-[path=off]/path:block! sm:px-10 motion-safe:hidden">
        {fallback}
      </div>
    </div>
  );
}
