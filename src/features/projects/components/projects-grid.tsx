import { FadeIn } from "@/components/ui/fade-in";

import { PROJECTS } from "../data";
import { ProjectCard } from "./project-card";

/** Two-column grid of tilt cards. Also the fallback for the 3D carousel. */
export function ProjectsGrid() {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 sm:gap-8">
      {PROJECTS.map((project, i) => (
        <li key={project.title}>
          <FadeIn delay={(i % 2) * 100} className="h-full">
            <ProjectCard project={project} index={i} />
          </FadeIn>
        </li>
      ))}
    </ul>
  );
}
