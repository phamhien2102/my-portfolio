"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { cn } from "@/lib/cn";

import { idsOf, type Phase, type Plan } from "../data";
import { useProgress } from "../lib/progress";
import { PhaseCard } from "./phase-card";

interface Section {
  id: string;
  label: string;
  group: "start" | "phases" | "reference";
}

function subscribeHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

const readHash = () => window.location.hash;
const serverHash = () => "";

const phaseIds = (phase: Phase) => idsOf([phase]);

/**
 * A plan in the layout of /ielts: a top bar, a tree on the left and one sheet on the right with
 * Back and Next under it. The URL hash is the router, so every phase has an address.
 */
export function AiWorkflowApp({ plan, fontClassName }: { plan: Plan; fontClassName: string }) {
  const sections = useMemo<readonly Section[]>(
    () => [
      { id: "overview", label: "Overview", group: "start" },
      ...(plan.compare ? [{ id: "compare", label: "Choose a tool", group: "start" as const }] : []),
      ...plan.phases.map((phase) => ({
        id: `phase-${phase.id}`,
        label: `${phase.number}. ${phase.title}`,
        group: "phases" as const,
      })),
      { id: "rules", label: "House rules", group: "reference" },
    ],
    [plan],
  );

  const hash = useSyncExternalStore(subscribeHash, readHash, serverHash);
  const raw = decodeURIComponent(hash.slice(1));
  const active = sections.find((section) => section.id === raw) ?? sections[0];
  const index = sections.indexOf(active);
  const previous = index > 0 ? sections[index - 1] : undefined;
  const next = index < sections.length - 1 ? sections[index + 1] : undefined;

  const [menuOpen, setMenuOpen] = useState(false);
  const [phasesOpen, setPhasesOpen] = useState(true);
  const progress = useProgress();

  const allIds = useMemo(() => idsOf(plan.phases), [plan]);
  const doneAll = progress.countOf(allIds);
  const percent = allIds.length ? Math.round((doneAll / allIds.length) * 100) : 0;
  const weeks = plan.phases.reduce((n, p) => n + Number.parseInt(p.weeks, 10), 0);
  const facts = [
    { value: String(plan.phases.length), label: "phases" },
    { value: `${weeks}w`, label: "end to end" },
    { value: "1", label: "workflow, grown a layer at a time" },
  ];

  const activePhase = plan.phases.find((phase) => `phase-${phase.id}` === active.id);

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

  const start = sections.filter((section) => section.group === "start");
  const phaseSections = sections.filter((section) => section.group === "phases");
  const reference = sections.filter((section) => section.group === "reference");

  return (
    <div data-page-theme="light" className={cn("aw-app", fontClassName)}>
      <header className="topbar">
        <div className="topbar-left">
          <button
            type="button"
            className="menu-btn"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="workflow-tree"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <MenuIcon open={menuOpen} />
          </button>
          <a className="brand" href="#overview">
            <span className="brand-name">
              <span>AI workflow</span>
            </span>
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
        <aside id="workflow-tree" className={cn("side", menuOpen && "is-open")} aria-label="Plan">
          <div className="side-head">
            <FolderIcon color="var(--ink)" />
            <span>Plan</span>
            <span className="muted">{plan.phases.length} phases</span>
          </div>

          <ul className="parts">
            {start.map((section) => leaf(section))}
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
                  {phaseSections.map((section, i) => {
                    const ids = phaseIds(plan.phases[i]);
                    return leaf(section, `${progress.countOf(ids)}/${ids.length}`);
                  })}
                </ul>
              )}
            </li>
            {reference.map((section) => leaf(section))}
            {plan.others.length > 0 && (
              <li>
                <p className="side-note">Other plans</p>
                <ul className="tree">
                  {plan.others.map((other) => (
                    <li key={other.href}>
                      <Link className="leaf" href={other.href}>
                        <FileIcon />
                        <span>{other.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            )}
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
            <ul className="chips" aria-label="Your progress">
              {activePhase ? (
                <>
                  <li className="chip y">{activePhase.weeks}</li>
                  <li className="chip g">
                    {progress.countOf(phaseIds(activePhase))} / {phaseIds(activePhase).length} done
                  </li>
                </>
              ) : (
                <li className="chip g">{percent}% done</li>
              )}
            </ul>
          </div>

          <div className="stage">
            {activePhase ? (
              <PhaseCard phase={activePhase} />
            ) : active.id === "compare" && plan.compare ? (
              <section aria-labelledby="compare">
                <p className="font-mono text-xs tracking-[0.3em] text-slate-500">CHOOSE A TOOL</p>
                <h2 id="compare" className="mt-3 text-2xl font-black tracking-tight sm:text-4xl">
                  {plan.compare.title}
                </h2>
                <p className="mt-3 max-w-2xl text-slate-600">{plan.compare.intro}</p>
                <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead className="bg-slate-50 font-mono text-[11px] tracking-wider text-slate-500">
                      <tr>
                        <th className="p-3">TOOL</th>
                        <th className="p-3">FITS BEST</th>
                        <th className="p-3">TRADE-OFF</th>
                        <th className="p-3">RUNS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plan.compare.rows.map((row) => (
                        <tr key={row.tool} className="border-t border-slate-200 align-top">
                          <td className="p-3 font-bold">{row.tool}</td>
                          <td className="p-3 text-slate-600">{row.fits}</td>
                          <td className="p-3 text-slate-600">{row.tradeoff}</td>
                          <td className="p-3 text-slate-600">{row.hosting}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ) : active.id === "rules" ? (
              <section aria-labelledby="rules">
                <p className="font-mono text-xs tracking-[0.3em] text-slate-500">HOUSE RULES</p>
                <h2 id="rules" className="mt-3 text-2xl font-black tracking-tight sm:text-4xl">
                  {plan.rulesTitle}
                </h2>
                <ol className="mt-6 space-y-3">
                  {plan.rules.map((rule, i) => (
                    <li
                      key={rule}
                      className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <span className="font-mono text-sm text-slate-400 tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-slate-700">{rule}</span>
                    </li>
                  ))}
                </ol>
              </section>
            ) : (
              <section aria-labelledby="overview">
                <p className="font-mono text-xs tracking-[0.3em] text-slate-500">{plan.kicker}</p>
                <h1 id="overview" className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
                  {plan.title}
                </h1>
                <p className="mt-4 max-w-2xl text-slate-600">{plan.intro}</p>
                <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
                  {facts.map((fact) => (
                    <div key={fact.label}>
                      <dt className="sr-only">{fact.label}</dt>
                      <dd>
                        <span className="font-mono text-2xl font-black tabular-nums">
                          {fact.value}
                        </span>
                        <span className="ml-2 text-sm text-slate-500">{fact.label}</span>
                      </dd>
                    </div>
                  ))}
                </dl>
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
              </section>
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
