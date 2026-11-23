"use client";

import { useState } from "react";

import { cn } from "@/lib/cn";

import { MODULES } from "../data";
import { Check, Chevron, Folder } from "./icons";

interface Props {
  activeId: string;
  isDone: (id: string) => boolean;
  countOf: (ids: readonly string[]) => number;
  total: number;
  onNavigate: () => void;
}

/** The left column: modules as coloured folders with their lessons, and a progress drawer. */
export function CourseTree({ activeId, isDone, countOf, total, onNavigate }: Props) {
  // A module is open when the reader toggled it, or by default when it holds the open lesson.
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [progressOpen, setProgressOpen] = useState(false);

  const allIds = MODULES.flatMap((m) => m.lessons.map((l) => l.id));
  const done = countOf(allIds);
  const percent = total ? Math.round((done / total) * 100) : 0;

  return (
    <aside id="ds-sidebar" className="ds-sidebar" aria-label="Course">
      <div className="ds-tree-root">
        <Folder color="#d5b07a" />
        <span>Course</span>
        <span className="ds-tree-meta">{total} lessons</span>
      </div>

      <nav className="ds-course">
        {MODULES.map((module) => {
          const open = expanded[module.id] ?? false;
          const count = countOf(module.lessons.map((l) => l.id));
          return (
            <div key={module.id} className={cn("ds-mod", open && "is-open")}>
              <button
                type="button"
                className="ds-mod-head"
                aria-expanded={open}
                onClick={() => setExpanded((e) => ({ ...e, [module.id]: !open }))}
              >
                <Chevron className="ds-mod-chev" />
                <Folder color={module.color} />
                <span className="ds-mod-title">{module.name}</span>
                <span className="ds-mod-count">
                  {count}/{module.lessons.length}
                </span>
              </button>
              <div className="ds-mod-body">
                <div className="ds-mod-clip">
                  <ul className="ds-mod-lessons">
                    {module.lessons.map((lesson) => {
                      const current = lesson.id === activeId;
                      return (
                        <li
                          key={lesson.id}
                          className={cn("ds-lesson-row", current && "is-current")}
                        >
                          <a
                            href={`#${lesson.id}`}
                            tabIndex={open ? 0 : -1}
                            aria-current={current ? "page" : undefined}
                            onClick={onNavigate}
                          >
                            <span
                              className={cn("ds-mark", isDone(lesson.id) && "is-done")}
                              aria-hidden="true"
                            >
                              {isDone(lesson.id) ? <Check /> : <i />}
                            </span>
                            <span className="ds-lesson-title">{lesson.title}</span>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      <div className={cn("ds-progress", progressOpen && "is-open")}>
        <button
          type="button"
          className="ds-progress-head"
          aria-expanded={progressOpen}
          onClick={() => setProgressOpen((o) => !o)}
        >
          <span className="ds-eyebrow">Progress</span>
          <span className="ds-progress-pct">
            {done} / {total}
          </span>
          <Chevron className="ds-progress-chev" />
        </button>
        <div className="ds-progress-body">
          <div className="ds-progress-clip">
            <div
              className="ds-bar"
              role="progressbar"
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <span style={{ width: `${percent}%` }} />
            </div>
            <ul className="ds-progress-list">
              {MODULES.map((module) => {
                const count = countOf(module.lessons.map((l) => l.id));
                const all = count === module.lessons.length;
                return (
                  <li key={module.id}>
                    <span
                      className={cn("ds-check", all && "is-on", !all && count > 0 && "is-part")}
                    >
                      <Check />
                    </span>
                    <span>{module.name}</span>
                    <span className="ds-progress-count">
                      {count}/{module.lessons.length}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </aside>
  );
}
