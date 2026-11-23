"use client";

import Link from "next/link";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { cn } from "@/lib/cn";

import type { OutlineChapter, OutlinePart } from "../lib/outline";
import { useProgress } from "../lib/progress";

interface Props {
  title: string;
  outline: readonly OutlinePart[];
  fontClassName: string;
  /** One server-rendered <section class="chapter"> per chapter. */
  children: ReactNode;
}

type FlatChapter = OutlineChapter & { part: OutlinePart };

function subscribeHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

const readHash = () => window.location.hash;
const serverHash = () => "";

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/**
 * The shell around the chapters. The URL hash is the router: `#p-week-1-overview` opens a chapter,
 * `#part-…` opens a part's first chapter, and an id inside a chapter (a homework link, "Jump to")
 * opens that chapter and scrolls to the spot. No state is set from an effect: the hash is read with
 * useSyncExternalStore and everything else is derived from it.
 */
export function IeltsApp({ title, outline, fontClassName, children }: Props) {
  const flat = useMemo<FlatChapter[]>(
    () => outline.flatMap((part) => part.chapters.map((chapter) => ({ ...chapter, part }))),
    [outline],
  );

  const hash = useSyncExternalStore(subscribeHash, readHash, serverHash);
  const raw = safeDecode(hash.slice(1));

  const { active, anchor } = useMemo(() => {
    const exact = flat.find((c) => c.id === raw);
    if (exact) return { active: exact, anchor: null };
    const part = outline.find((p) => p.id === raw);
    const first = part && flat.find((c) => c.part.id === part.id);
    if (first) return { active: first, anchor: null };
    const inner = flat
      .filter((c) => raw.startsWith(c.id + "-"))
      .sort((a, b) => b.id.length - a.id.length)[0];
    return inner ? { active: inner, anchor: raw } : { active: flat[0], anchor: null };
  }, [flat, outline, raw]);

  const index = flat.indexOf(active);
  const previous = index > 0 ? flat[index - 1] : undefined;
  const next = index < flat.length - 1 ? flat[index + 1] : undefined;

  const stageRef = useRef<HTMLDivElement>(null);
  // A part is open when the reader opened it, or by default when it holds the chapter being read.
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [menuOpen, setMenuOpen] = useState(false);
  const progress = useProgress();

  // Show only the active chapter. Before paint, so a deep link never flashes the first one.
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    for (const el of stage.querySelectorAll<HTMLElement>(":scope > section.chapter")) {
      el.hidden = el.id !== active.id;
    }
  }, [active.id]);

  // Then move the page: to the anchor inside the chapter, or back to the top of the new chapter.
  useEffect(() => {
    if (anchor) document.getElementById(anchor)?.scrollIntoView({ block: "start" });
    else window.scrollTo({ top: 0 });
  }, [active.id, anchor, hash]);

  // Left and right arrows turn the page, unless the reader is using a control that needs them.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("audio, input, textarea, select, [contenteditable]")) return;
      const to =
        event.key === "ArrowRight" ? next : event.key === "ArrowLeft" ? previous : undefined;
      if (to) window.location.hash = to.id;
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, previous]);

  const total = flat.length;
  const doneTotal = progress.countOf(flat.map((c) => c.id));
  const isDone = progress.isDone(active.id);

  return (
    <div data-page-theme="light" className={cn("ielts-app", fontClassName)}>
      <header className="topbar">
        <a className="brand" href="#">
          <BrandIcon />
          <span className="brand-name">
            <span>{title}</span>
          </span>
        </a>
        <div className="topbar-right">
          <button
            type="button"
            className="menu-btn"
            aria-expanded={menuOpen}
            aria-controls="course-tree"
            onClick={() => setMenuOpen((open) => !open)}
          >
            Course
          </button>
          <Link href="/" className="home-link">
            ← Raymond Pham
          </Link>
        </div>
      </header>

      <div className="shell">
        <aside id="course-tree" className={cn("side", menuOpen && "is-open")} aria-label="Course">
          <div className="side-head">
            <FolderIcon color="var(--ink)" />
            <span>Course</span>
            <span className="muted">{total} chapters</span>
          </div>

          <ul className="parts">
            {outline.map((part) => {
              const open = expanded[part.id] ?? part.id === active.part.id;
              const done = progress.countOf(part.chapters.map((c) => c.id));
              return (
                <li key={part.id}>
                  <button
                    type="button"
                    className="part-toggle"
                    aria-expanded={open}
                    onClick={() => setExpanded((e) => ({ ...e, [part.id]: !open }))}
                  >
                    <Chevron open={open} />
                    <FolderIcon color={part.color} />
                    <span className="part-name">
                      {part.number}. {part.name}
                    </span>
                    <span className="count">
                      {done}/{part.chapters.length}
                    </span>
                  </button>
                  {open && (
                    <ul className="tree">
                      {part.chapters.map((chapter) => (
                        <li key={chapter.id}>
                          <a
                            href={`#${chapter.id}`}
                            aria-current={chapter.id === active.id ? "page" : undefined}
                            className={cn("leaf", chapter.id === active.id && "is-active")}
                            onClick={() => setMenuOpen(false)}
                          >
                            <FileIcon />
                            <span>{chapter.label}</span>
                            {progress.isDone(chapter.id) && (
                              <span className="tick" aria-label="read">
                                ✓
                              </span>
                            )}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="progress">
            <span>PROGRESS</span>
            <strong>
              {doneTotal} / {total}
            </strong>
          </div>
        </aside>

        <main className="lesson">
          <div className="lesson-head">
            <p className="crumbs">
              <span>Part {active.part.number}</span> / <span>{active.part.name}</span>
            </p>
            <ul className="chips" aria-label="About this chapter">
              <li className="chip y">{active.minutes} min read</li>
              {active.audio > 0 && <li className="chip g">{active.audio} audio</li>}
              {active.bilingual && <li className="chip v">EN + VI</li>}
            </ul>
          </div>

          <div ref={stageRef} className="stage">
            {children}
          </div>

          <nav className="lesson-foot" aria-label="Chapters">
            {previous ? (
              <a className="btn" href={`#${previous.id}`}>
                ← Back
              </a>
            ) : (
              <span className="btn is-disabled" aria-disabled="true">
                ← Back
              </span>
            )}
            <button
              type="button"
              className={cn("btn", isDone && "is-on")}
              aria-pressed={isDone}
              onClick={() => progress.toggle(active.id)}
            >
              {isDone ? "✓ Read" : "Mark as read"}
            </button>
            {next ? (
              <a className="btn primary" href={`#${next.id}`}>
                Next: {next.label} →
              </a>
            ) : (
              <span className="btn primary is-disabled" aria-disabled="true">
                The end
              </span>
            )}
          </nav>
          <p className="hint">← → turn the page</p>
        </main>
      </div>

      <p className="colophon">Links to practice websites open third-party pages.</p>
    </div>
  );
}

function BrandIcon() {
  return (
    <svg className="brand-icon" viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="3"
        y="4"
        width="18"
        height="16"
        rx="3"
        fill="#cfe3b2"
        stroke="#1d1b18"
        strokeWidth="1.6"
      />
      <path
        d="M7.5 9h9M7.5 12.5h9M7.5 16h5"
        stroke="#1d1b18"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FolderIcon({ color }: { color: string }) {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"
        fill={color}
      />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg className="icon file" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M7 3.5h6.5L18 8v11.5a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1Z M13 3.5V8.5h5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg className={cn("chevron", open && "is-open")} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="m9 6 6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
