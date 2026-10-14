import { Section } from "@/components/ui/section";

import { SkillsView } from "./skills-view";

export function SkillsSection() {
  return (
    <Section id="skills" index="03" label="Skills" heading="Tools I reach for." bleed>
      <SkillsView />
    </Section>
  );
}
