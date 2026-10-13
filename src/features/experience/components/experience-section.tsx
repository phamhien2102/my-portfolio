import { Section } from "@/components/ui/section";

import { ExperienceStack } from "./experience-stack";
import { ExperienceTimeline } from "./experience-timeline";
import { ExperienceView } from "./experience-view";

export function ExperienceSection() {
  return (
    <Section id="experience" index="04" label="Experience" heading="Where I've worked." bleed>
      <ExperienceView timeline={<ExperienceTimeline />} stack={<ExperienceStack />} />
    </Section>
  );
}
