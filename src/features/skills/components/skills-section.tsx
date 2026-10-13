import { Section } from "@/components/ui/section";

import { SkillConstellation } from "./skill-constellation";

export function SkillsSection() {
  return (
    <Section id="skills" index="03" label="Skills" heading="Tools I reach for.">
      <SkillConstellation />
    </Section>
  );
}
