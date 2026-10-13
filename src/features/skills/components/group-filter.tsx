"use client";

import type { CSSProperties } from "react";

import { accentAt } from "@/config/theme";
import { cn } from "@/lib/cn";

import { SKILL_GROUPS } from "../data";

interface GroupFilterProps {
  /** Title of the pinned group, if any. */
  pinned: string | null;
  onPin: (group: string | null) => void;
}

/** One toggle per skill group; a pinned group stays lit while the others fade. */
export function GroupFilter({ pinned, onPin }: GroupFilterProps) {
  return (
    <div role="group" aria-label="Highlight a skill group" className="flex flex-wrap gap-2">
      {SKILL_GROUPS.map((group, i) => {
        const isPinned = pinned === group.title;
        return (
          <button
            key={group.title}
            type="button"
            aria-pressed={isPinned}
            onClick={() => onPin(isPinned ? null : group.title)}
            style={{ "--accent": accentAt(i + 1) } as CSSProperties}
            className={cn(
              "flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-xs tracking-widest uppercase transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
              isPinned
                ? "border-(--accent) bg-(--accent) text-black"
                : "border-white/15 text-zinc-400 hover:border-white/40 hover:text-white",
            )}
          >
            <span
              aria-hidden="true"
              className={cn("size-2 rounded-full", isPinned ? "bg-black" : "bg-(--accent)")}
            />
            {group.title}
          </button>
        );
      })}
    </div>
  );
}
