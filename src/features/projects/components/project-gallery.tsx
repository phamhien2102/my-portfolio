"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import { FadeIn } from "@/components/ui/fade-in";
import { accentAt } from "@/config/theme";

import { PROJECTS } from "../data";
import { createGalleryScene, type GalleryScene } from "../lib/create-gallery-scene";

/** Run whenever the visitor hasn't asked for less motion. */
const GALLERY_QUERY = "(prefers-reduced-motion: no-preference)";

const STAGE_MASK: CSSProperties = {
  maskImage:
    "linear-gradient(to right, transparent, black 14%, black 86%, transparent), linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)",
  maskComposite: "intersect",
  WebkitMaskImage:
    "linear-gradient(to right, transparent, black 14%, black 86%, transparent), linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)",
  WebkitMaskComposite: "source-in",
};

interface ProjectGalleryProps {
  /** Shown instead with reduced motion, or if WebGL fails. */
  fallback: ReactNode;
}

/**
 * Projects as a 3D gallery: a curved wall of floating screens over a neon floor (WebGL),
 * with the front project's details as ordinary HTML underneath.
 *
 * Works with drag/swipe, clicking a neighbour, the arrow buttons, the dots and the arrow keys.
 * Next after the last project wraps to the first, and previous wraps the other way.
 */
export function ProjectGallery({ fallback }: ProjectGalleryProps) {
  const [active, setActive] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const sceneRef = useRef<GalleryScene | null>(null);
  const activeRef = useRef(active);

  const count = PROJECTS.length;
  const wrap = (index: number) => ((index % count) + count) % count;
  const go = (index: number) => setActive(wrap(index));

  useEffect(() => {
    const root = rootRef.current;
    const host = hostRef.current;
    if (!root || !host) return;

    const query = window.matchMedia(GALLERY_QUERY);
    const sync = () => {
      sceneRef.current?.dispose();
      sceneRef.current = null;
      if (!query.matches) return;
      try {
        sceneRef.current = createGalleryScene({
          host,
          onSelect: setActive,
          onOpen: () => linkRef.current?.click(),
        });
        sceneRef.current.setActive(activeRef.current);
        delete root.dataset.gallery;
      } catch {
        // No WebGL (or it failed): fall back to the card grid.
        root.dataset.gallery = "off";
      }
    };

    sync();
    query.addEventListener("change", sync);
    return () => {
      query.removeEventListener("change", sync);
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    activeRef.current = active;
    sceneRef.current?.setActive(active);
  }, [active]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") go(active + 1);
    else if (event.key === "ArrowLeft") go(active - 1);
    else return;
    event.preventDefault();
  }

  const project = PROJECTS[active];
  const accent = accentAt(active);

  return (
    <div ref={rootRef} className="group/gallery">
      {/* The 3D view: motion allowed, WebGL working. */}
      <div
        role="group"
        aria-roledescription="carousel"
        aria-label="Projects"
        onKeyDown={handleKeyDown}
        className="hidden group-data-[gallery=off]/gallery:hidden! motion-safe:block"
      >
        <FadeIn className="relative mx-auto h-[22rem] w-full max-w-6xl sm:h-[28rem] lg:h-[34rem]">
          {/* The edges fade out, so the scene never ends in a hard line. */}
          <div
            ref={hostRef}
            aria-hidden="true"
            style={STAGE_MASK}
            className="absolute inset-0 touch-pan-y select-none"
          />
        </FadeIn>

        {/* Details of the front project, as real, readable HTML. */}
        <div className="mx-auto mt-2 grid max-w-6xl items-end gap-8 lg:grid-cols-[1fr_auto]">
          <div
            key={active}
            aria-live="polite"
            className="transition-[opacity,transform] duration-500 ease-out starting:translate-y-3 starting:opacity-0"
          >
            <p className="font-mono text-xs tracking-widest text-zinc-500">
              <span style={{ color: accent }}>{String(active + 1).padStart(2, "0")}</span> /{" "}
              {String(PROJECTS.length).padStart(2, "0")} &middot; {project.year}
            </p>
            <h3 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">{project.title}</h3>
            <p className="mt-3 max-w-xl text-zinc-400">{project.summary}</p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-white/15 px-3 py-1 font-mono text-[11px] tracking-wider text-zinc-400"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col items-start gap-6 lg:items-end">
            <a
              ref={linkRef}
              href={project.href}
              className="group inline-flex items-center gap-3 rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition-[opacity,transform] duration-300 hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white active:scale-[0.98]"
            >
              View project
              <span
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              >
                &#8599;
              </span>
            </a>

            <div className="flex items-center gap-4">
              <ArrowButton direction="prev" onClick={() => go(active - 1)} />
              <div className="flex items-center gap-2">
                {PROJECTS.map((item, i) => (
                  <button
                    key={item.title}
                    type="button"
                    aria-label={`Go to ${item.title}`}
                    aria-current={i === active}
                    onClick={() => go(i)}
                    className="h-2 w-2 rounded-full bg-white/25 transition-[width,background-color] duration-300 hover:bg-white/50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white aria-[current=true]:w-8 aria-[current=true]:bg-white"
                  />
                ))}
              </div>
              <ArrowButton direction="next" onClick={() => go(active + 1)} />
            </div>
          </div>
        </div>
      </div>

      {/* The card grid: reduced motion, or no WebGL. */}
      <div className="block group-data-[gallery=off]/gallery:block! motion-safe:hidden">
        {fallback}
      </div>
    </div>
  );
}

function ArrowButton({
  direction,
  onClick,
}: {
  direction: "prev" | "next";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={direction === "prev" ? "Previous project" : "Next project"}
      onClick={onClick}
      className="flex size-11 items-center justify-center rounded-full border border-white/20 text-zinc-300 transition-[opacity,background-color,color] hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5"
      >
        <path d={direction === "prev" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} />
      </svg>
    </button>
  );
}
