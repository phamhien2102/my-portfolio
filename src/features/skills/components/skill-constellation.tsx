"use client";

import { useState } from "react";

import { FadeIn } from "@/components/ui/fade-in";
import { accentAt } from "@/config/theme";
import { cn } from "@/lib/cn";

import { SKILL_GROUPS, levelLabel } from "../data";
import { RINGS, STARS, constellationPoints, type Star } from "../lib/constellation";
import { GroupFilter } from "./group-filter";

interface SkillConstellationProps {
  /** Title of the pinned group, if any (controlled by the parent). */
  pinned: string | null;
  onPin: (group: string | null) => void;
}

/**
 * Skills as a night sky. Distance from the centre encodes proficiency (stronger = closer),
 * each group is its own constellation. Hover or focus a star, or pin a group, to light it up.
 */
export function SkillConstellation({ pinned, onPin }: SkillConstellationProps) {
  const [hovered, setHovered] = useState<Star | null>(null);

  const activeGroup = hovered?.group ?? pinned;

  return (
    <div>
      <GroupFilter pinned={pinned} onPin={onPin} />

      <p className="mt-4 font-mono text-[11px] tracking-widest text-zinc-600 uppercase">
        Closer to the centre = stronger · hover or tap a star
      </p>

      <FadeIn className="group/fade mx-auto mt-6 w-[min(48rem,100%,calc(100svh-16rem))]">
        <div className="relative aspect-square" onPointerLeave={() => setHovered(null)}>
          {/* Soft glow behind the core. */}
          <div
            aria-hidden="true"
            className="absolute inset-[22%] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.08),transparent_70%)]"
          />

          <svg
            viewBox="0 0 100 100"
            aria-hidden="true"
            className="absolute inset-0 size-full overflow-visible"
          >
            {RINGS.map((ring, i) => (
              <circle
                key={ring.label}
                cx={50}
                cy={50}
                r={ring.r}
                fill="none"
                strokeWidth={0.15}
                strokeDasharray="0.4 1.2"
                style={{
                  animationDuration: `${140 + i * 60}s`,
                  animationDirection: i % 2 ? "reverse" : "normal",
                }}
                className="origin-center animate-spin stroke-white/20 [transform-box:fill-box] motion-reduce:animate-none"
              />
            ))}

            {SKILL_GROUPS.map((group, i) => {
              const lit = activeGroup === group.title;
              return (
                <polyline
                  key={group.title}
                  points={constellationPoints(i)}
                  fill="none"
                  stroke={accentAt(i + 1)}
                  strokeWidth={lit ? 1.6 : 1}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  className={cn(
                    "transition-opacity duration-300 motion-reduce:transition-none",
                    lit ? "opacity-90" : activeGroup ? "opacity-5" : "opacity-25",
                  )}
                />
              );
            })}
          </svg>

          {RINGS.map((ring) => (
            <span
              key={ring.label}
              aria-hidden="true"
              style={{ top: `${50 - ring.r}%` }}
              className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-(--background) px-2 font-mono text-[9px] tracking-widest text-zinc-600 uppercase"
            >
              {ring.label}
            </span>
          ))}

          {/* Core readout. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-[38%] text-center"
          >
            {hovered ? (
              <>
                <span className="font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
                  {hovered.group}
                </span>
                <span className="mt-1 text-xl leading-tight font-black tracking-tight">
                  {hovered.name}
                </span>
                <span
                  style={{ color: accentAt(hovered.groupIndex + 1) }}
                  className="mt-1 font-mono text-[10px] tracking-widest uppercase"
                >
                  {levelLabel(hovered.level)} · {hovered.level}
                </span>
              </>
            ) : (
              <>
                <span className="text-3xl leading-none font-black tracking-tight tabular-nums">
                  {STARS.length}
                </span>
                <span className="mt-1 font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
                  skills · {SKILL_GROUPS.length} groups
                </span>
              </>
            )}
          </div>

          <ul>
            {STARS.map((star, i) => {
              const accent = accentAt(star.groupIndex + 1);
              const isHovered = hovered?.name === star.name;
              const dimmed = activeGroup !== null && activeGroup !== star.group;
              return (
                <li
                  key={star.name}
                  style={{ left: `${star.x}%`, top: `${star.y}%` }}
                  className={cn(
                    "absolute -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 motion-reduce:transition-none",
                    dimmed && "opacity-20",
                  )}
                >
                  <button
                    type="button"
                    aria-label={`${star.name}, ${star.group}, ${levelLabel(star.level)}`}
                    onPointerEnter={() => setHovered(star)}
                    onFocus={() => setHovered(star)}
                    onBlur={() => setHovered(null)}
                    onClick={() => onPin(pinned === star.group ? null : star.group)}
                    className="group relative flex size-9 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    {/* Entrance only: scales in once the stage scrolls into view. */}
                    <span
                      style={{ transitionDelay: `${i * 45}ms` }}
                      className="flex items-center justify-center transition-[opacity,scale] duration-700 group-data-[fade=hidden]/fade:scale-0 group-data-[fade=hidden]/fade:opacity-0 motion-reduce:transition-none"
                    >
                      <span
                        aria-hidden="true"
                        style={{
                          width: star.size,
                          height: star.size,
                          backgroundColor: accent,
                          boxShadow: `0 0 ${isHovered ? 22 : 10}px ${accent}`,
                        }}
                        className={cn(
                          "rounded-full transition-[scale,box-shadow] duration-300 motion-reduce:transition-none",
                          isHovered && "scale-150",
                        )}
                      />
                      <span
                        aria-hidden="true"
                        className={cn(
                          "absolute hidden text-sm font-medium whitespace-nowrap transition-colors duration-300 sm:block",
                          star.side === "right" ? "left-full -ml-0.5" : "right-full -mr-0.5",
                          isHovered ? "text-white" : "text-zinc-400",
                        )}
                      >
                        {star.name}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </FadeIn>
    </div>
  );
}
