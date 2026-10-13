"use client";

import type { ReactNode } from "react";

import { useSettings } from "@/features/settings";

import { isPathEffect } from "../lib/effects";
import { ExperiencePath } from "./experience-path";

interface ExperienceViewProps {
  /** The plain vertical timeline. Also the fallback for the 3D effects. */
  timeline: ReactNode;
  /** The sticky card stack. */
  stack: ReactNode;
}

/** Picks how Experience is presented, following the visitor's setting. */
export function ExperienceView({ timeline, stack }: ExperienceViewProps) {
  const { experienceEffect } = useSettings();

  if (isPathEffect(experienceEffect)) {
    return <ExperiencePath effect={experienceEffect}>{timeline}</ExperiencePath>;
  }

  return (
    <div className="mx-auto max-w-6xl px-6 sm:px-10">
      {experienceEffect === "stack" ? stack : timeline}
    </div>
  );
}
