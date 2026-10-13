"use client";

import { useSettings } from "@/features/settings";

import { ProjectGallery } from "./project-gallery";
import { ProjectsGrid } from "./projects-grid";

/** Picks how Projects is presented, following the visitor's setting. */
export function ProjectsView() {
  const { projectsView } = useSettings();

  return projectsView === "gallery" ? (
    <ProjectGallery fallback={<ProjectsGrid />} />
  ) : (
    <ProjectsGrid />
  );
}
