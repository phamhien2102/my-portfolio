"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/cn";

import { MODULES } from "../data";
import { SearchIcon } from "./icons";

interface Hit {
  key: string;
  title: string;
  meta: string;
  href: string;
  kind: "lesson" | "step";
  text: string;
}

/** Every lesson and every step, flattened once so typing only has to filter. */
const INDEX: Hit[] = MODULES.flatMap((module) =>
  module.lessons.flatMap((lesson) => [
    {
      key: lesson.id,
      title: lesson.title,
      meta: `${module.name} · ${lesson.minutes} min`,
      href: `#${lesson.id}`,
      kind: "lesson" as const,
      text: `${lesson.title} ${lesson.summary}`.toLowerCase(),
    },
    ...lesson.steps.map((step, i) => ({
      key: `${lesson.id}/${i + 1}`,
      title: step.title,
      meta: `${lesson.title} · step ${i + 1}`,
      href: `#${lesson.id}/${i + 1}`,
      kind: "step" as const,
      text: `${step.title} ${step.body.join(" ")}`.toLowerCase(),
    })),
  ]),
);

export function SearchDialog({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  const hits = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    const pool = words.length
      ? INDEX.filter((h) => words.every((w) => h.text.includes(w)))
      : INDEX.filter((h) => h.kind === "lesson");
    return pool.slice(0, 30);
  }, [query]);

  const at = Math.min(cursor, Math.max(hits.length - 1, 0));

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>("[aria-selected=true]")
      ?.scrollIntoView({ block: "nearest" });
  }, [at]);

  const open = (hit: Hit | undefined) => {
    if (!hit) return;
    window.location.hash = hit.href.slice(1);
    onClose();
  };

  return (
    <div className="ds-sx" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ds-sx-dialog" role="dialog" aria-modal="true" aria-label="Search the course">
        <div className="ds-sx-bar">
          <SearchIcon />
          <input
            autoFocus
            value={query}
            placeholder="Search lessons and steps…"
            aria-label="Search"
            onChange={(e) => {
              setQuery(e.target.value);
              setCursor(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              else if (e.key === "ArrowDown") {
                e.preventDefault();
                setCursor(Math.min(at + 1, hits.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setCursor(Math.max(at - 1, 0));
              } else if (e.key === "Enter") open(hits[at]);
            }}
          />
          <kbd className="ds-esc">esc</kbd>
        </div>
        {hits.length ? (
          <ul className="ds-sx-list" ref={listRef} role="listbox">
            {hits.map((hit, i) => (
              <li
                key={hit.key}
                role="option"
                aria-selected={i === at}
                className={cn("ds-sx-item", i === at && "is-on")}
                onMouseMove={() => setCursor(i)}
                onClick={() => open(hit)}
              >
                <span className={cn("ds-sx-kind", hit.kind)}>
                  {hit.kind === "lesson" ? "Lesson" : "Step"}
                </span>
                <span className="ds-sx-main">
                  <b>{hit.title}</b>
                  <span>{hit.meta}</span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="ds-sx-empty">Nothing matches “{query}”.</p>
        )}
      </div>
    </div>
  );
}
