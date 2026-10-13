"use client";

import { useState } from "react";

import { useSettings } from "@/features/settings";

import { SkillConstellation } from "./skill-constellation";
import { SkillList } from "./skill-list";
import { SkillsPath } from "./skills-path";
import { SkillSolar } from "./skill-solar";
import { SkillsScroller } from "./skills-scroller";

/**
 * Picks how Skills is presented, following the visitor's setting. Which group is lit is owned
 * here, so both the chips and the scroll story can drive it.
 */
export function SkillsView() {
  const { skillsView } = useSettings();
  const [pinned, setPinned] = useState<string | null>(null);

  // The path brings its own scroll-driven flight, so it skips the scroll walkthrough.
  if (skillsView === "path") return <SkillsPath fallback={<SkillList />} />;

  return (
    <SkillsScroller pinned={pinned} onPin={setPinned}>
      {skillsView === "solar" ? (
        <SkillSolar pinned={pinned} onPin={setPinned} fallback={<SkillList />} />
      ) : (
        <SkillConstellation pinned={pinned} onPin={setPinned} />
      )}
    </SkillsScroller>
  );
}
