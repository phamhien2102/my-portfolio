import { Section } from "@/components/ui/section";

import { ProjectsView } from "./projects-view";

export function ProjectsSection() {
  return (
    <Section id="projects" index="02" label="Projects" heading="Selected work.">
      <ProjectsView />
    </Section>
  );
}
