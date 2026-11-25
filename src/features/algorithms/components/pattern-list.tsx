"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { LEVELS, PATTERNS, type LeetCodeProblem, type Pattern, type PatternLevel } from "../data";
import { DifficultyPill } from "./difficulty";
import { LearnedCheck } from "./learned";

interface Result {
  pattern: Pattern;
  index: number;
  /** LeetCode problems of this pattern that match the query, shown on the card. */
  problems: LeetCodeProblem[];
}

const normalize = (text: string) => text.toLowerCase().replace(/\s+/g, " ").trim();

function problemMatches(problem: LeetCodeProblem, query: string) {
  return String(problem.id) === query.replace(/^#/, "") || normalize(problem.title).includes(query);
}

/** Filter patterns by name, description, when-to-use hints, and their LeetCode problems. */
function search(query: string): Result[] {
  const q = normalize(query);
  return PATTERNS.flatMap((pattern, index) => {
    if (!q) return [{ pattern, index, problems: [] }];
    const problems = [pattern.example, ...pattern.practice].filter((p) => problemMatches(p, q));
    const text = normalize(
      [pattern.name, pattern.tagline, pattern.idea, ...pattern.whenToUse].join(" "),
    );
    return text.includes(q) || problems.length > 0 ? [{ pattern, index, problems }] : [];
  });
}

type Filter = "all" | PatternLevel;

/** The searchable grid of pattern cards on /algorithms, grouped into Fundamentals and Advanced. */
export function PatternList() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const inputRef = useRef<HTMLInputElement>(null);
  const matches = useMemo(() => search(query), [query]);
  const results = matches.filter((r) => filter === "all" || r.pattern.level === filter);
  const scope = filter === "all" ? PATTERNS : PATTERNS.filter((p) => p.level === filter);
  const filters: Array<{ value: Filter; label: string; count: number }> = [
    { value: "all", label: "All", count: matches.length },
    ...LEVELS.map(({ level, label }) => ({
      value: level,
      label,
      count: matches.filter((r) => r.pattern.level === level).length,
    })),
  ];

  // "/" jumps to the search box, like on many docs sites.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea")) return;
      event.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div>
      <div className="alg-search">
        <span aria-hidden="true" className="glyph">
          ⌕
        </span>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setQuery("");
          }}
          placeholder="Search patterns or LeetCode problems… e.g. 3sum, 200, palindrome"
          aria-label="Search patterns and problems"
        />
        <kbd>/</kbd>
      </div>
      <div className="alg-filters">
        <div role="group" aria-label="Filter by level" className="alg-seg">
          {filters.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilter(option.value)}
              aria-pressed={filter === option.value}
            >
              {option.label}
              <small>{option.count}</small>
            </button>
          ))}
        </div>
        <p aria-live="polite" className="alg-count">
          {query.trim()
            ? `${results.length} of ${scope.length} patterns match “${query.trim()}”`
            : `${scope.length} patterns`}
        </p>
      </div>

      {results.length === 0 ? (
        <div className="alg-empty">
          <strong>No pattern matches that yet.</strong>
          <p>Try a pattern name, a problem title or its number.</p>
          <button
            type="button"
            className="alg-btn"
            onClick={() => {
              setQuery("");
              setFilter("all");
            }}
          >
            Clear search
          </button>
        </div>
      ) : (
        LEVELS.map(({ level, label, blurb }) => {
          const group = results.filter((r) => r.pattern.level === level);
          if (group.length === 0) return null;
          return (
            <section key={level} aria-label={label}>
              <h2 className="alg-h2" data-level={level}>
                {label}
                <small>{blurb}</small>
              </h2>
              <PatternCards results={group} />
            </section>
          );
        })
      )}
    </div>
  );
}

function PatternCards({ results }: { results: Result[] }) {
  return (
    <ol className="alg-grid">
      {results.map(({ pattern, index, problems }) => (
        <li key={pattern.slug}>
          <Link href={`/algorithms/${pattern.slug}`} className="alg-card">
            <div className="alg-card-top">
              <span className="alg-card-no">
                {String(index + 1).padStart(2, "0")}
                <LearnedCheck slug={pattern.slug} />
              </span>
              <span aria-hidden="true" className="alg-glyph" style={{ background: pattern.accent }}>
                {pattern.glyph}
              </span>
            </div>
            <h3>{pattern.name}</h3>
            <p className="alg-tagline">{pattern.tagline}</p>
            <div className="alg-card-foot">
              <div className="eg">
                <p className="alg-label">Example</p>
                <p>
                  {pattern.example.id}. {pattern.example.title}
                </p>
              </div>
              <div className="meta">
                <span>{pattern.complexity.time}</span>
                <DifficultyPill level={pattern.example.difficulty} />
              </div>
            </div>
            {problems.length > 0 && (
              <p className="alg-match">
                <b>MATCHES </b>
                {problems.map((p) => `${p.id}. ${p.title}`).join(" · ")}
              </p>
            )}
          </Link>
        </li>
      ))}
    </ol>
  );
}
