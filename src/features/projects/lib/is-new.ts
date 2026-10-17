import { useSyncExternalStore } from "react";

import type { Project } from "../data";

/** A project keeps its NEW badge for this many days after `addedAt`. */
export const NEW_FOR_DAYS = 30;
const DAY_MS = 86_400_000;

/** True while the project is within NEW_FOR_DAYS of its `addedAt` date. */
export function isNewProject(project: Project, now: number) {
  if (!project.addedAt) return false;
  // "YYYY-MM-DD" alone is read as UTC midnight; use local midnight so the badge starts that day.
  const [y, m, d] = project.addedAt.split("-").map(Number);
  const added = new Date(y, m - 1, d).getTime();
  return Number.isFinite(added) && now >= added && now - added < NEW_FOR_DAYS * DAY_MS;
}

const noop = () => () => {};
/** Local midnight today, so the snapshot stays stable between renders and days follow the clock. */
const today = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
};

/**
 * Whether a project is new, checked in the visitor's browser. The page is prerendered at build
 * time, so the server answers "not new" and the badge appears once the page hydrates.
 */
export function useIsNew(project: Project) {
  const now = useSyncExternalStore(noop, today, () => null);
  return now !== null && isNewProject(project, now);
}
