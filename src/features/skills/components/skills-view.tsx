"use client";

import { useSettings } from "@/features/settings";

import { SkillConstellation } from "./skill-constellation";
import { SkillList } from "./skill-list";
import { SkillSolar } from "./skill-solar";

/** Picks how Skills is presented, following the visitor's setting. */
export function SkillsView() {
  const { skillsView } = useSettings();

  return skillsView === "solar" ? <SkillSolar fallback={<SkillList />} /> : <SkillConstellation />;
}
