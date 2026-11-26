"use client";

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
import { useSideCollapsed } from "../lib/layout-store";
import { useProgress } from "../lib/progress";
import { useFlashcards, useNotes, type Note } from "../lib/study-store";
import { FlashcardsPanel } from "./flashcards-panel";
import { NotesPanel } from "./notes-panel";
import { AnswersPopover } from "./answers-popover";
import { AudioDock } from "./audio-dock";
import { FoldAll } from "./fold-all";
import { TranscriptMode } from "./transcript-mode";
import { ChevronsIcon, SideFloat } from "./side-float";
import { StudyTools } from "./study-tools";

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
  // Wide screens fold the menu away and back (the arrows); narrow ones open it as a drawer.
  const { collapsed, toggle: toggleSide } = useSideCollapsed();
  const [cardsOpen, setCardsOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const cardCount = useFlashcards().items.length;
  const noteCount = useNotes().items.length;
  const chapterLabels = useMemo(() => Object.fromEntries(flat.map((c) => [c.id, c.label])), [flat]);
  const chapterOrder = useMemo(() => flat.map((c) => c.id), [flat]);
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
      if (target?.closest("audio, input, textarea, select, [contenteditable], [role=dialog]"))
        return;
      if (document.querySelector("[role=dialog]")) return;
      const to =
        event.key === "ArrowRight" ? next : event.key === "ArrowLeft" ? previous : undefined;
      if (to) window.location.hash = to.id;
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, previous]);

  // On a phone the course tree is a drawer: Escape closes it, as does a tap on the backdrop.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  // From the notes list: go to the note's chapter, scroll to its passage and flash it once.
  const openNote = (note: Note) => {
    setNotesOpen(false);
    if (window.location.hash !== `#${note.chapterId}`) window.location.hash = note.chapterId;
    // After the chapter has been shown and the page has been reset to the top.
    window.setTimeout(() => {
      const el = document.querySelector<HTMLElement>(`[data-note-id="${CSS.escape(note.id)}"]`);
      if (!el) return;
      el.scrollIntoView({ block: "center" });
      el.classList.add("note-flash");
      window.setTimeout(() => el.classList.remove("note-flash"), 1800);
    }, 250);
  };

  const total = flat.length;
  const doneTotal = progress.countOf(flat.map((c) => c.id));
  const isDone = progress.isDone(active.id);

  return (
    <div data-page-theme="light" className={cn("ielts-app", fontClassName)}>
      <header className="topbar">
        <div className="topbar-left">
          {/* The menu button sits in the top-left corner, where a phone reader looks for it. It is
              only shown below 62rem, where the course menu folds into a drawer; on a wide screen
              the arrows in the menu's header fold it instead. */}
          <button
            type="button"
            className="menu-btn"
            aria-label={menuOpen ? "Close course menu" : "Open course menu"}
            aria-expanded={menuOpen}
            aria-controls="course-tree"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <MenuIcon open={menuOpen} />
          </button>
          <a className="brand" href="#">
            <span className="brand-name">
              <span>{title}</span>
            </span>
          </a>
        </div>
        <div className="topbar-right">
          <button
            type="button"
            className="cards-btn notes-btn"
            aria-label={noteCount > 0 ? `Notes, ${noteCount}` : "Notes"}
            onClick={() => setNotesOpen(true)}
          >
            <NotesIcon />
            <b className="btn-label">Notes</b>
            {noteCount > 0 && <span>{noteCount}</span>}
          </button>
          <button type="button" className="cards-btn" onClick={() => setCardsOpen(true)}>
            Flashcards{cardCount > 0 && <span>{cardCount}</span>}
          </button>
        </div>
      </header>

      {/* Wide screens: while the course menu is folded away, a tab on the left edge brings it back.
          With the menu open the tab is gone and the arrows in the menu's header fold it instead.
          Phones use the hamburger and the drawer. */}
      {collapsed && <SideFloat onExpand={toggleSide} />}

      <div className={cn("shell", collapsed && "is-collapsed")}>
        {menuOpen && (
          <button
            type="button"
            className="side-backdrop"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
        )}
        <aside id="course-tree" className={cn("side", menuOpen && "is-open")} aria-label="Course">
          <div className="side-head">
            <FolderIcon color="var(--ink)" />
            <span>Course</span>
            <span className="muted">{total} chapters</span>
            <button
              type="button"
              className="side-collapse"
              aria-label="Collapse course menu"
              title="Collapse menu"
              onClick={toggleSide}
            >
              <ChevronsIcon flipped={false} />
            </button>
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
          {/* Keyed so a new chapter starts with no tooltip or dialog. */}
          <StudyTools key={active.id} stageRef={stageRef} chapterId={active.id} />
          {/* Keyed too: a recording stops when the chapter changes. */}
          <AudioDock key={`audio-${active.id}`} stageRef={stageRef} />
          <TranscriptMode stageRef={stageRef} />
          <FoldAll stageRef={stageRef} />
          <AnswersPopover key={`pop-${active.id}`} stageRef={stageRef} />

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
        </main>
      </div>

      {cardsOpen && <FlashcardsPanel onClose={() => setCardsOpen(false)} />}
      {notesOpen && (
        <NotesPanel
          labels={chapterLabels}
          order={chapterOrder}
          onOpen={openNote}
          onClose={() => setNotesOpen(false)}
        />
      )}

      <p className="colophon">Links to practice websites open third-party pages.</p>
    </div>
  );
}

function NotesIcon() {
  return (
    <svg className="notes-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 20h4L19 9l-4-4L4 16v4ZM13.5 6.5l4 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Three lines that turn into a cross while the drawer is open. */
function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg className="menu-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d={open ? "M6 6l12 12M18 6L6 18" : "M4 7h16M4 12h16M4 17h16"}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
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
