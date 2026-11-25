"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { cn } from "@/lib/cn";

import { PHASES, TRACKS, type TrackId } from "../data";
import { useProgress } from "../lib/progress";
import { PhaseCard } from "./phase-card";
import { Bridge, Capstones, Courses, Overview, Rules } from "./sections";

type Filter = "both" | TrackId;

const FILTERS: ReadonlyArray<{ value: Filter; label: string }> = [
  { value: "both", label: "Both" },
  ...TRACKS.map((track) => ({ value: track.id as Filter, label: track.label })),
];

/** One page of the reader: the overview, a phase, or a reference section. */
interface Section {
  id: string;
  label: string;
  group: "start" | "phases" | "reference";
}

const REFERENCE: readonly Section[] = [
  { id: "courses", label: "Six courses", group: "reference" },
  { id: "capstone", label: "One app worth showing", group: "reference" },
  { id: "bridge", label: "Translation table", group: "reference" },
  { id: "rules", label: "House rules", group: "reference" },
];

const SECTIONS: readonly Section[] = [
  { id: "overview", label: "Overview", group: "start" },
  ...PHASES.map((phase) => ({
    id: `phase-${phase.id}`,
    label: phase.title,
    group: "phases" as const,
  })),
  ...REFERENCE,
];

function subscribeHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

const readHash = () => window.location.hash;
const serverHash = () => "";

const tracksFor = (filter: Filter): readonly TrackId[] =>
  filter === "both" ? TRACKS.map((track) => track.id) : [filter];

function phaseIds(phaseId: string, tracks: readonly TrackId[]): string[] {
  const phase = PHASES.find((item) => item.id === phaseId);
  if (!phase) return [];
  return [...tracks.flatMap((track) => phase.steps[track].map((step) => step.id)), phase.ship.id];
}

interface Props {
  fontClassName: string;
}

/**
 * /native in the layout of /ielts: a top bar, a course tree on the left and one sheet on the right
 * with Back and Next under it. The URL hash is the router, so every phase has an address.
 */
export function NativeApp({ fontClassName }: Props) {
  const hash = useSyncExternalStore(subscribeHash, readHash, serverHash);
  const raw = decodeURIComponent(hash.slice(1));
  const active = SECTIONS.find((section) => section.id === raw) ?? SECTIONS[0];
  const index = SECTIONS.indexOf(active);
  const previous = index > 0 ? SECTIONS[index - 1] : undefined;
  const next = index < SECTIONS.length - 1 ? SECTIONS[index + 1] : undefined;

  const [filter, setFilter] = useState<Filter>("both");
  const [menuOpen, setMenuOpen] = useState(false);
  const [phasesOpen, setPhasesOpen] = useState(true);
  const [referenceOpen, setReferenceOpen] = useState(true);
  const progress = useProgress();
  const tracks = tracksFor(filter);

  const allIds = useMemo(() => PHASES.flatMap((phase) => phaseIds(phase.id, tracks)), [tracks]);
  const doneAll = progress.countOf(allIds);
  const percent = allIds.length ? Math.round((doneAll / allIds.length) * 100) : 0;

  // A new section starts at the top of the page.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [active.id]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const activePhase = PHASES.find((phase) => `phase-${phase.id}` === active.id);

  const leaf = (section: Section, count?: string) => (
    <li key={section.id}>
      <a
        href={`#${section.id}`}
        aria-current={section.id === active.id ? "page" : undefined}
        className={cn("leaf", section.id === active.id && "is-active")}
        onClick={() => setMenuOpen(false)}
      >
        <FileIcon />
        <span>{section.label}</span>
        {count && <span className="count">{count}</span>}
      </a>
    </li>
  );

  return (
    <div data-page-theme="light" className={cn("nv-app", fontClassName)}>
      <header className="topbar">
        <div className="topbar-left">
          <button
            type="button"
            className="menu-btn"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="native-tree"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <MenuIcon open={menuOpen} />
          </button>
          <a className="brand" href="#overview">
            <span className="brand-name">
              <span>Going native</span>
            </span>
          </a>
        </div>
        <div className="topbar-right">
          <a className="top-link" href="/native/weather-design">
            Weather design
          </a>
        </div>
      </header>

      <div className="shell">
        {menuOpen && (
          <button
            type="button"
            className="side-backdrop"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
        )}
        <aside id="native-tree" className={cn("side", menuOpen && "is-open")} aria-label="Roadmap">
          <div className="side-head">
            <FolderIcon color="var(--ink)" />
            <span>Roadmap</span>
            <span className="muted">{PHASES.length} phases</span>
          </div>

          <ul className="parts">
            {leaf(SECTIONS[0])}
            <li>
              <button
                type="button"
                className="part-toggle"
                aria-expanded={phasesOpen}
                onClick={() => setPhasesOpen((open) => !open)}
              >
                <Chevron open={phasesOpen} />
                <FolderIcon color="#4aa3e8" />
                <span className="part-name">Phases</span>
                <span className="count">
                  {doneAll}/{allIds.length}
                </span>
              </button>
              {phasesOpen && (
                <ul className="tree">
                  {PHASES.map((phase) => {
                    const ids = phaseIds(phase.id, tracks);
                    return leaf(
                      {
                        id: `phase-${phase.id}`,
                        label: `${phase.number}. ${phase.title}`,
                        group: "phases",
                      },
                      `${progress.countOf(ids)}/${ids.length}`,
                    );
                  })}
                </ul>
              )}
            </li>
            <li>
              <button
                type="button"
                className="part-toggle"
                aria-expanded={referenceOpen}
                onClick={() => setReferenceOpen((open) => !open)}
              >
                <Chevron open={referenceOpen} />
                <FolderIcon color="#1f9d8f" />
                <span className="part-name">Reference</span>
                <span className="count">{REFERENCE.length}</span>
              </button>
              {referenceOpen && <ul className="tree">{REFERENCE.map((s) => leaf(s))}</ul>}
            </li>
          </ul>

          <div className="progress">
            <span>PROGRESS</span>
            <strong>
              {doneAll} / {allIds.length}
            </strong>
          </div>
        </aside>

        <main className="lesson">
          <div className="lesson-head">
            <p className="crumbs">
              <span>
                {active.group === "phases"
                  ? "Phases"
                  : active.group === "reference"
                    ? "Reference"
                    : "Start"}
              </span>{" "}
              / <span>{active.label}</span>
            </p>
            {activePhase ? (
              <div className="filter" role="group" aria-label="Show one platform or both">
                {FILTERS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={filter === option.value}
                    onClick={() => setFilter(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : (
              <ul className="chips" aria-label="Your progress">
                <li className="chip g">{percent}% done</li>
              </ul>
            )}
          </div>

          <div className="stage">
            {activePhase ? (
              <PhaseCard phase={activePhase} tracks={tracks} />
            ) : active.id === "courses" ? (
              <Courses />
            ) : active.id === "capstone" ? (
              <Capstones />
            ) : active.id === "bridge" ? (
              <Bridge />
            ) : active.id === "rules" ? (
              <Rules />
            ) : (
              <>
                <Overview />
                <div className="mt-8 flex items-center gap-3">
                  <div className="bar flex-1">
                    <i style={{ width: `${percent}%` }} />
                  </div>
                  <span
                    aria-live="polite"
                    className="font-mono text-xs text-slate-500 tabular-nums"
                  >
                    {doneAll} / {allIds.length} done
                  </span>
                  {doneAll > 0 && (
                    <button
                      type="button"
                      onClick={progress.clear}
                      className="font-mono text-xs tracking-wider text-slate-400 underline-offset-4 hover:text-slate-700 hover:underline"
                    >
                      RESET
                    </button>
                  )}
                </div>
                <p className="mt-3 font-mono text-[11px] tracking-wider text-slate-400">
                  TICKS ARE KEPT IN THIS BROWSER ONLY
                </p>
              </>
            )}
          </div>

          <nav className="lesson-foot" aria-label="Sections">
            {previous ? (
              <a className="btn" href={`#${previous.id}`}>
                ← Back
              </a>
            ) : (
              <span className="btn is-disabled" aria-disabled="true">
                ← Back
              </span>
            )}
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

      <p className="colophon">A private page. Not linked from anywhere, not in search results.</p>
    </div>
  );
}

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
        strokeLinejoin="round"
      />
    </svg>
  );
}
