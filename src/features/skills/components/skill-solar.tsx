"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { FadeIn } from "@/components/ui/fade-in";
import { accentAt } from "@/config/theme";

import { SKILL_GROUPS, levelLabel } from "../data";
import { createSolarScene, type SolarScene } from "../lib/create-solar-scene";
import { PLANETS } from "../lib/solar";
import { GroupFilter } from "./group-filter";

/** Run whenever the visitor hasn't asked for less motion. */
const SOLAR_QUERY = "(prefers-reduced-motion: no-preference)";

interface SkillSolarProps {
  /** Title of the pinned group, if any (controlled by the parent). */
  pinned: string | null;
  onPin: (group: string | null) => void;
  /** Shown instead with reduced motion, or if WebGL fails. */
  fallback: ReactNode;
}

/**
 * Skills as a 3D solar system: a ring per group, a planet per skill (bigger = stronger).
 * Hover or focus a planet to slow time and read it; click one (or a group chip) to pin its group.
 * The planet labels are buttons, so the whole thing also works with a keyboard.
 */
export function SkillSolar({ pinned, onPin, fallback }: SkillSolarProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const sceneRef = useRef<SolarScene | null>(null);
  // The scene's click handler outlives renders, so it reads the latest pin through refs.
  const pinRef = useRef({ pinned, onPin });

  const hoveredPlanet = hovered === null ? null : PLANETS[hovered];
  const activeGroup = hoveredPlanet?.group ?? pinned;
  const groupIndex = SKILL_GROUPS.findIndex((group) => group.title === activeGroup);

  // The scene lives outside React; the latest focus is replayed whenever it is (re)created.
  const focusRef = useRef({ hovered, group: groupIndex < 0 ? null : groupIndex });

  useEffect(() => {
    const root = rootRef.current;
    const host = hostRef.current;
    if (!root || !host) return;

    const query = window.matchMedia(SOLAR_QUERY);
    const sync = () => {
      sceneRef.current?.dispose();
      sceneRef.current = null;
      if (!query.matches) return;
      try {
        sceneRef.current = createSolarScene({
          host,
          labels: labelRefs.current,
          onHover: setHovered,
          onSelect: (index) => {
            const group = PLANETS[index].group;
            const { pinned: current, onPin: pin } = pinRef.current;
            pin(current === group ? null : group);
          },
        });
        sceneRef.current.setFocus(focusRef.current);
        delete root.dataset.solar;
      } catch {
        // No WebGL (or it failed): fall back to the plain list.
        root.dataset.solar = "off";
      }
    };

    sync();
    query.addEventListener("change", sync);
    return () => {
      query.removeEventListener("change", sync);
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    pinRef.current = { pinned, onPin };
  }, [pinned, onPin]);

  useEffect(() => {
    focusRef.current = { hovered, group: groupIndex < 0 ? null : groupIndex };
    sceneRef.current?.setFocus(focusRef.current);
  }, [hovered, groupIndex]);

  return (
    <div ref={rootRef} className="group/solar">
      {/* The 3D view: motion allowed, WebGL working. */}
      <div className="hidden group-data-[solar=off]/solar:hidden! motion-safe:block">
        <GroupFilter pinned={pinned} onPin={onPin} />

        <p className="mt-4 font-mono text-[11px] tracking-widest text-zinc-600 uppercase">
          One orbit per group · bigger planet = stronger · hover or tap a planet
        </p>

        <FadeIn className="relative mx-auto mt-6 aspect-square max-h-[calc(100svh-16rem)] w-full max-w-5xl sm:aspect-3/2 lg:aspect-16/9">
          {/* Soft glow behind the sun. */}
          <div
            aria-hidden="true"
            className="absolute inset-[30%] rounded-full bg-[radial-gradient(circle,rgba(255,170,80,0.10),transparent_70%)]"
          />
          <div ref={hostRef} aria-hidden="true" className="absolute inset-0 touch-pan-y" />

          {/* One label per planet, moved under it by the scene. They take keyboard focus but
              leave the pointer to the scene, which hit-tests planets and labels together. */}
          <ul className="pointer-events-none absolute inset-0 overflow-hidden">
            {PLANETS.map((planet) => {
              const isHovered = hovered === planet.index;
              return (
                <li key={planet.name}>
                  <button
                    ref={(el) => {
                      labelRefs.current[planet.index] = el;
                    }}
                    type="button"
                    tabIndex={0}
                    aria-label={`${planet.name}, ${planet.group}, ${levelLabel(planet.level)}`}
                    onFocus={() => setHovered(planet.index)}
                    onBlur={() => setHovered(null)}
                    onClick={() => onPin(pinned === planet.group ? null : planet.group)}
                    style={{ transform: "translate3d(-9999px, 0, 0)" }}
                    className={`absolute top-0 left-0 rounded-full px-2 py-0.5 text-sm font-medium whitespace-nowrap transition-colors duration-200 [text-shadow:0_0_10px_#09090e,0_0_4px_#09090e] focus-visible:outline-2 focus-visible:outline-white max-sm:hidden ${
                      isHovered ? "text-white" : "text-zinc-300"
                    }`}
                  >
                    {planet.name}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Readout of the planet being pointed at. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-2 left-2 min-h-14 sm:bottom-4 sm:left-4"
          >
            {hoveredPlanet ? (
              <>
                <span className="block font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
                  {hoveredPlanet.group}
                </span>
                <span className="mt-1 block text-2xl leading-tight font-black tracking-tight">
                  {hoveredPlanet.name}
                </span>
                <span
                  style={{ color: accentAt(hoveredPlanet.groupIndex + 1) }}
                  className="mt-1 block font-mono text-[10px] tracking-widest uppercase"
                >
                  {levelLabel(hoveredPlanet.level)} · {hoveredPlanet.level}
                </span>
              </>
            ) : (
              <>
                <span className="block text-3xl leading-none font-black tracking-tight tabular-nums">
                  {PLANETS.length}
                </span>
                <span className="mt-1 block font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
                  skills · {SKILL_GROUPS.length} groups
                </span>
              </>
            )}
          </div>
        </FadeIn>
      </div>

      {/* The plain list: reduced motion, or no WebGL. */}
      <div className="block group-data-[solar=off]/solar:block! motion-safe:hidden">
        {fallback}
      </div>
    </div>
  );
}
