"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/cn";

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
    <div className="mt-10">
      <div className="relative max-w-xl">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-zinc-500"
        >
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
          className="w-full rounded-2xl border border-white/15 bg-white/[0.04] py-3 pr-12 pl-10 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-white/40"
        />
        <kbd className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 rounded border border-white/15 px-1.5 font-mono text-[11px] text-zinc-500">
          /
        </kbd>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3">
        <div
          role="group"
          aria-label="Filter by level"
          className="flex gap-1 rounded-full border border-white/10 p-1"
        >
          {filters.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilter(option.value)}
              aria-pressed={filter === option.value}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-bold transition",
                filter === option.value ? "bg-white text-black" : "text-zinc-400 hover:text-white",
              )}
            >
              {option.label}
              <span className="ml-1.5 font-mono font-normal opacity-60">{option.count}</span>
            </button>
          ))}
        </div>
        <p aria-live="polite" className="font-mono text-xs text-zinc-500">
          {query.trim()
            ? `${results.length} of ${scope.length} patterns match “${query.trim()}”`
            : `${scope.length} patterns`}
        </p>
      </div>

      {results.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-dashed border-white/15 p-10 text-center">
          <p className="text-lg font-bold">No pattern matches that yet.</p>
          <p className="mt-1 text-sm text-zinc-400">
            Try a pattern name, a problem title or its number.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setFilter("all");
            }}
            className="mt-5 rounded-full border border-white/20 px-4 py-1.5 text-sm font-bold transition hover:border-white/50"
          >
            Clear search
          </button>
        </div>
      ) : (
        LEVELS.map(({ level, label, blurb }) => {
          const group = results.filter((r) => r.pattern.level === level);
          if (group.length === 0) return null;
          return (
            <section key={level} className="mt-10">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h2 className="font-mono text-xs tracking-[0.3em] text-zinc-300 uppercase">
                  {label}
                </h2>
                <p className="text-sm text-zinc-500">{blurb}</p>
              </div>
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
    <ol className="mt-4 grid gap-4 sm:grid-cols-2">
      {results.map(({ pattern, index, problems }) => (
        <li key={pattern.slug}>
          <Link
            href={`/algorithms/${pattern.slug}`}
            className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.05]"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -top-16 -right-16 size-44 rounded-full opacity-20 blur-3xl transition-opacity duration-300 group-hover:opacity-40"
              style={{ background: pattern.accent }}
            />
            <div className="flex items-start justify-between gap-4">
              <span className="flex items-center gap-2 font-mono text-xs tracking-widest text-zinc-500">
                {String(index + 1).padStart(2, "0")}
                <LearnedCheck slug={pattern.slug} />
              </span>
              <span
                aria-hidden="true"
                className="rounded-xl border px-3 py-1.5 font-mono text-sm font-bold"
                style={{ borderColor: `${pattern.accent}66`, color: pattern.accent }}
              >
                {pattern.glyph}
              </span>
            </div>
            <h3 className="mt-6 text-2xl font-black tracking-tight transition-colors group-hover:text-white">
              {pattern.name}
            </h3>
            <p className="mt-2 text-sm text-zinc-400">{pattern.tagline}</p>
            <div className="mt-6 flex flex-1 items-end justify-between gap-3">
              <div className="text-xs text-zinc-500">
                <p className="font-mono tracking-wider">EXAMPLE</p>
                <p className="mt-1 text-zinc-300">
                  {pattern.example.id}. {pattern.example.title}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <span className="font-mono text-xs text-zinc-400">{pattern.complexity.time}</span>
                <DifficultyPill level={pattern.example.difficulty} />
              </div>
            </div>
            {problems.length > 0 && (
              <p className="mt-4 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-zinc-300">
                <span className="font-mono tracking-wider text-zinc-500">MATCHES </span>
                {problems.map((p) => `${p.id}. ${p.title}`).join(" · ")}
              </p>
            )}
            <span
              aria-hidden="true"
              className="mt-5 h-0.5 w-0 rounded-full transition-all duration-500 group-hover:w-full"
              style={{ background: pattern.accent }}
            />
          </Link>
        </li>
      ))}
    </ol>
  );
}
