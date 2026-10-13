"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

import { accentAt } from "@/config/theme";

import { SKILL_GROUPS, levelLabel } from "../data";

/** The scroll story only runs on wide screens, for people who haven't asked for less motion. */
const STORY_QUERY = "(min-width: 768px) and (prefers-reduced-motion: no-preference)";

/** The overview, then one step per group. */
const STEPS = SKILL_GROUPS.length + 1;

interface SkillsScrollerProps {
  /** Title of the pinned group, if any. */
  pinned: string | null;
  onPin: (group: string | null) => void;
  children: ReactNode;
}

/**
 * Turns Skills into a scroll-driven walkthrough.
 *
 * On wide screens the view is pinned to the top while the page keeps scrolling underneath it,
 * and the scroll position picks which group is lit: first the overview, then Mobile, Frontend,
 * Backend, Tooling. Clicking a chip still works; the next step boundary hands control back to the
 * scroll. On phones, or with reduced motion, it is just the plain view.
 */
export function SkillsScroller({ pinned, onPin, children }: SkillsScrollerProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const onPinRef = useRef(onPin);

  useEffect(() => {
    onPinRef.current = onPin;
  }, [onPin]);

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    const bar = barRef.current;
    const counter = counterRef.current;
    if (!track || !stage || !bar) return;

    const query = window.matchMedia(STORY_QUERY);
    let frame = 0;
    let step = -1;

    const update = () => {
      frame = 0;
      if (!query.matches) return;
      const top = parseFloat(getComputedStyle(stage).top) || 0;
      const rect = track.getBoundingClientRect();
      const range = Math.max(1, rect.height - stage.offsetHeight);
      const progress = Math.min(1, Math.max(0, (top - rect.top) / range));

      bar.style.transform = `scaleX(${progress.toFixed(4)})`;

      const next = Math.min(STEPS - 1, Math.floor(progress * STEPS));
      if (counter) counter.textContent = String(next).padStart(2, "0");
      if (next !== step) {
        step = next;
        onPinRef.current(next === 0 ? null : SKILL_GROUPS[next - 1].title);
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    const reset = () => {
      step = -1;
      bar.style.transform = "scaleX(0)";
      schedule();
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    query.addEventListener("change", reset);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      query.removeEventListener("change", reset);
    };
  }, []);

  const index = SKILL_GROUPS.findIndex((group) => group.title === pinned);
  const group = index < 0 ? null : SKILL_GROUPS[index];

  return (
    <div
      ref={trackRef}
      style={{ "--steps": STEPS } as CSSProperties}
      className="motion-safe:md:[height:calc(var(--steps)*55svh+45svh)]"
    >
      <div ref={stageRef} className="motion-safe:md:sticky motion-safe:md:top-20">
        {/* What the scroll is showing right now. */}
        <div className="hidden motion-safe:md:block">
          <div className="h-px bg-white/10">
            <div
              ref={barRef}
              className="h-full origin-left scale-x-0 bg-white/70 will-change-transform"
            />
          </div>

          <div
            aria-live="polite"
            className="mt-4 flex min-h-12 items-baseline gap-4 font-mono text-[11px] tracking-widest uppercase"
          >
            <span className="shrink-0 text-zinc-500">
              <span ref={counterRef} className="text-zinc-200">
                00
              </span>{" "}
              / {String(STEPS - 1).padStart(2, "0")}
            </span>
            {group ? (
              <span
                key={group.title}
                className="transition-[opacity,transform] duration-500 starting:translate-y-1 starting:opacity-0"
              >
                <span
                  style={{ color: accentAt(index + 1) }}
                  className="mr-3 font-sans text-base font-black tracking-tight normal-case"
                >
                  {group.title}
                </span>
                <span className="text-zinc-400">
                  {group.items
                    .map((item) => `${item.name} (${levelLabel(item.level)})`)
                    .join(" · ")}
                </span>
              </span>
            ) : (
              <span className="text-zinc-500">
                {SKILL_GROUPS.length} groups ·{" "}
                {SKILL_GROUPS.reduce((n, g) => n + g.items.length, 0)} skills · keep scrolling to
                walk through them
              </span>
            )}
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
