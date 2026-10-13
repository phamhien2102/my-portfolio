"use client";

import { useSettings } from "@/features/settings";

import { ProjectGallery } from "./project-gallery";
import { ProjectScroll } from "./project-scroll";
import { ProjectsGrid } from "./projects-grid";

/** Picks how Projects is presented, following the visitor's setting. */
export function ProjectsView() {
  const { projectsView } = useSettings();

  if (projectsView === "scroll") return <ProjectScroll fallback={<ProjectsGrid />} />;
  if (projectsView === "gallery") return <ProjectGallery fallback={<ProjectsGrid />} />;
  return <ProjectsGrid />;
}
