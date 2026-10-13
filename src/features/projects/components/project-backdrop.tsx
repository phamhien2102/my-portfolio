import Image from "next/image";

import { accentAt } from "@/config/theme";

import type { Project } from "../data";

interface ProjectBackdropProps {
  project: Project;
  index: number;
  /** `sizes` hint for the image, if the project has one. */
  sizes: string;
  /** Draw the big outlined number (on by default; off when the caller draws its own). */
  numbered?: boolean;
}

/**
 * What fills a project's preview: its image when it has one, otherwise a generated backdrop
 * (two accent glows, a faint grid and a big outlined number). Fills its positioned parent.
 * Parents that are a `group` get a slow zoom on hover.
 */
export function ProjectBackdrop({ project, index, sizes, numbered = true }: ProjectBackdropProps) {
  if (project.image) {
    return (
      <Image
        src={project.image}
        alt={`${project.title} preview`}
        fill
        sizes={sizes}
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
    );
  }

  return (
    <>
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(70% 90% at 15% 0%, color-mix(in oklab, ${accentAt(index)} 55%, transparent), transparent 70%), radial-gradient(60% 80% at 100% 100%, color-mix(in oklab, ${accentAt(index + 3)} 40%, transparent), transparent 70%)`,
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 [background-image:linear-gradient(to_right,rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.35)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] [background-size:32px_32px] opacity-30"
      />
      {numbered && (
        <span
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center text-[8rem] leading-none font-black tracking-tighter text-transparent transition-transform duration-500 ease-out select-none [-webkit-text-stroke:2px_rgba(255,255,255,0.55)] group-hover:scale-110 sm:text-[9rem]"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      )}
    </>
  );
}
