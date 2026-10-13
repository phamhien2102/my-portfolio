"use client";

import { useRef, type CSSProperties, type PointerEvent } from "react";

import { accentAt } from "@/config/theme";

import type { Project } from "../data";
import { ProjectBackdrop } from "./project-backdrop";

/** Maximum tilt in degrees on each axis. */
const TILT = 9;

interface ProjectCardProps {
  project: Project;
  index: number;
}

/**
 * Project card that leans toward the pointer and sweeps a coloured glare across its face.
 *
 * Pointer position is written straight to CSS variables (throttled to one write per frame),
 * so hovering never triggers a React render. The tilt only runs for a real mouse and when
 * motion is allowed; touch and reduced-motion users get a plain card.
 */
export function ProjectCard({ project, index }: ProjectCardProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const frame = useRef(0);
  const accent = accentAt(index);

  function handleMove(event: PointerEvent<HTMLAnchorElement>) {
    if (event.pointerType !== "mouse") return;
    const { clientX, clientY } = event;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width;
      const y = (clientY - rect.top) / rect.height;
      el.style.setProperty("--rx", `${((0.5 - y) * 2 * TILT).toFixed(2)}deg`);
      el.style.setProperty("--ry", `${((x - 0.5) * 2 * TILT).toFixed(2)}deg`);
      el.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
      el.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
    });
  }

  function handleLeave() {
    cancelAnimationFrame(frame.current);
    const el = ref.current;
    if (!el) return;
    for (const name of ["--rx", "--ry", "--mx", "--my"]) el.style.removeProperty(name);
  }

  return (
    <a
      ref={ref}
      href={project.href}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      style={{ "--accent": accent } as CSSProperties}
      className="group relative block h-full rounded-3xl border border-white/10 bg-white/[0.03] p-3 transition-[transform,border-color,background-color] duration-200 ease-out [transform-style:preserve-3d] hover:border-(--accent)/60 hover:bg-white/[0.05] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--accent) motion-safe:[transform:perspective(1000px)_rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] max-sm:active:scale-[0.99]"
    >
      {/* Preview: the real image when there is one, otherwise a generated backdrop. */}
      <div className="relative aspect-16/10 overflow-hidden rounded-2xl bg-[#0d0d14]">
        <ProjectBackdrop
          project={project}
          index={index}
          sizes="(min-width: 1152px) 540px, (min-width: 640px) 45vw, 100vw"
        />

        {/* Pointer-following glare. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            backgroundImage: `radial-gradient(360px circle at var(--mx, 50%) var(--my, 50%), color-mix(in oklab, ${accent} 38%, transparent), transparent 65%)`,
          }}
        />

        <span className="absolute top-3 left-3 rounded-full bg-black/55 px-3 py-1 font-mono text-[11px] tracking-widest text-zinc-200 backdrop-blur-sm">
          {project.year}
        </span>
        <span
          aria-hidden="true"
          className="absolute right-3 bottom-3 flex size-11 items-center justify-center rounded-full bg-white text-xl text-black transition-[transform,background-color] duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:bg-(--accent) group-hover:text-white"
        >
          &#8599;
        </span>
      </div>

      <div className="px-3 pt-6 pb-4 sm:px-4">
        <h3 className="text-2xl font-black tracking-tight transition-colors duration-300 group-hover:text-(--accent) sm:text-3xl">
          {project.title}
        </h3>
        <p className="mt-3 text-zinc-400">{project.summary}</p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-white/15 px-3 py-1 font-mono text-[11px] tracking-wider text-zinc-400 transition-colors duration-300 group-hover:border-(--accent)/50"
            >
              {tag}
            </li>
          ))}
        </ul>
      </div>
    </a>
  );
}
