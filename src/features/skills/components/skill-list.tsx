import type { CSSProperties } from "react";

import { accentAt } from "@/config/theme";
import { cn } from "@/lib/cn";

import { SKILL_GROUPS, levelLabel } from "../data";

/** Plain list of every skill, grouped and strongest first. Works on any screen. */
export function SkillList({ className }: { className?: string }) {
  return (
    <div className={cn("grid gap-8 sm:grid-cols-2", className)}>
      {SKILL_GROUPS.map((group, i) => (
        <section key={group.title} style={{ "--accent": accentAt(i + 1) } as CSSProperties}>
          <h3 className="flex items-center gap-2 font-mono text-xs tracking-widest text-zinc-500 uppercase">
            <span aria-hidden="true" className="size-2 rounded-full bg-(--accent)" />
            {group.title}
          </h3>
          <ul className="mt-3 divide-y divide-white/10 border-y border-white/10">
            {[...group.items]
              .sort((a, b) => b.level - a.level)
              .map((skill) => (
                <li key={skill.name} className="flex items-baseline justify-between py-3">
                  <span className="text-lg font-bold tracking-tight">{skill.name}</span>
                  <span className="font-mono text-[11px] tracking-widest text-(--accent) uppercase">
                    {levelLabel(skill.level)}
                  </span>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
