"use client";

import { cn } from "@/lib/cn";

import type { Project } from "../data";
import { useIsNew } from "../lib/is-new";
import { LIVE, PULSE_S } from "../lib/live-marker";

/** Green dot with a ring that ripples out, like a LIVE light. */
function LiveDot({ className }: { className?: string }) {
  return (
    <span className={cn("relative flex size-2", className)} aria-hidden="true">
      <span
        className="absolute inline-flex size-full rounded-full opacity-75 motion-safe:animate-ping"
        style={{ background: LIVE.dot, animationDuration: `${PULSE_S}s` }}
      />
      <span
        className="relative inline-flex size-2 rounded-full"
        style={{ background: LIVE.dot, boxShadow: `0 0 8px rgba(${LIVE.ring}, 0.9)` }}
      />
    </span>
  );
}

/** Small "NEW" label with a live dot, for text lines such as "01 / 05 · 2026". */
export function NewBadge({ project, className }: { project: Project; className?: string }) {
  if (!useIsNew(project)) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-widest text-zinc-100",
        className,
      )}
    >
      <LiveDot /> NEW
    </span>
  );
}

/** "NEW" pill with a live dot for the top-right corner of a project picture. */
export function LaunchedPill({ project }: { project: Project }) {
  if (!useIsNew(project)) return null;
  return (
    <span
      className="absolute top-3 right-3 z-10 inline-flex items-center gap-2 rounded-full px-3 py-1 font-mono text-[10px] font-bold tracking-[0.2em] shadow-[0_4px_16px_rgba(0,0,0,0.35)] backdrop-blur-xl backdrop-saturate-150"
      style={{ background: LIVE.pill, border: `1px solid ${LIVE.border}`, color: LIVE.text }}
    >
      <LiveDot /> NEW
    </span>
  );
}
