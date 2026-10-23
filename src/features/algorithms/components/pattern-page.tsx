import Link from "next/link";

import { THEME } from "@/config/theme";

import { leetcodeUrl, PATTERNS, type Pattern } from "../data";
import { DifficultyPill } from "./difficulty";
import { LearnedToggle } from "./learned";
import { PatternLab } from "./pattern-lab";

/** /algorithms/[slug]: when to use the pattern, the idea, a step-by-step walkthrough and practice. */
export function PatternPage({ pattern }: { pattern: Pattern }) {
  const index = PATTERNS.findIndex((p) => p.slug === pattern.slug);
  const previous = PATTERNS[index - 1];
  const next = PATTERNS[index + 1];

  return (
    <main
      className="min-h-svh px-5 py-16 text-zinc-100 sm:px-8"
      style={{ background: THEME.background }}
    >
      <div className="mx-auto max-w-6xl">
        <Link
          href="/algorithms"
          className="font-mono text-xs tracking-[0.25em] text-zinc-500 hover:text-zinc-300"
        >
          ← ALL PATTERNS
        </Link>

        <header className="mt-10">
          <p className="font-mono text-xs tracking-[0.3em]" style={{ color: pattern.accent }}>
            PATTERN {String(index + 1).padStart(2, "0")} /{" "}
            {String(PATTERNS.length).padStart(2, "0")} ·{" "}
            {pattern.level === "advanced" ? "ADVANCED" : "FUNDAMENTALS"}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-3">
            <h1 className="text-4xl font-black tracking-tight sm:text-6xl">{pattern.name}</h1>
            <LearnedToggle slug={pattern.slug} />
          </div>
          <p className="mt-4 max-w-2xl text-lg text-zinc-400">{pattern.tagline}</p>
        </header>

        <section className="mt-10 grid gap-4 md:grid-cols-[1.3fr_1fr]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="font-mono text-xs tracking-[0.25em] text-zinc-500">THE IDEA</h2>
            <p className="mt-3 leading-relaxed text-zinc-200">{pattern.idea}</p>
            <div className="mt-5 flex flex-wrap gap-2 font-mono text-xs">
              <span className="rounded-full border border-white/15 px-3 py-1 text-zinc-300">
                time <span className="font-bold text-white">{pattern.complexity.time}</span>
              </span>
              <span className="rounded-full border border-white/15 px-3 py-1 text-zinc-300">
                space <span className="font-bold text-white">{pattern.complexity.space}</span>
              </span>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="font-mono text-xs tracking-[0.25em] text-zinc-500">REACH FOR IT WHEN</h2>
            <ul className="mt-3 space-y-2.5">
              {pattern.whenToUse.map((item) => (
                <li key={item} className="flex gap-3 text-sm text-zinc-300">
                  <span aria-hidden="true" style={{ color: pattern.accent }}>
                    ▸
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-mono text-xs tracking-[0.25em] text-zinc-500">WATCH IT RUN</h2>
              <p className="mt-2 text-xl font-bold">
                {pattern.example.id}. {pattern.example.title}
              </p>
              <p className="mt-1 max-w-2xl text-sm text-zinc-400">{pattern.example.statement}</p>
            </div>
            <div className="flex items-center gap-3">
              <DifficultyPill level={pattern.example.difficulty} />
              <a
                href={leetcodeUrl(pattern.example.slug)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/20 px-4 py-1.5 text-xs font-bold transition hover:border-white/50"
              >
                Open on LeetCode ↗
              </a>
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {pattern.example.examples.map((example, i) => (
              <div
                key={example.input}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-4 font-mono text-[13px]"
              >
                <p className="font-sans text-sm font-bold text-zinc-100">Example {i + 1}</p>
                <div className="mt-2 space-y-1 border-l-2 border-white/15 pl-3 leading-6">
                  <p className="break-words text-zinc-300">
                    <span className="font-bold text-zinc-100">Input:</span> {example.input}
                  </p>
                  <p className="text-zinc-300">
                    <span className="font-bold text-zinc-100">Output:</span> {example.output}
                  </p>
                  {example.explanation && (
                    <p className="font-sans text-zinc-400">
                      <span className="font-mono font-bold text-zinc-100">Explanation:</span>{" "}
                      {example.explanation}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <p className="mt-8 font-mono text-xs text-zinc-500">
            <span className="tracking-[0.2em] text-zinc-400">WALKTHROUGH INPUT</span> ·{" "}
            {pattern.example.input}
          </p>
          <div className="mt-3">
            <PatternLab pattern={pattern} />
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-mono text-xs tracking-[0.25em] text-zinc-500">PRACTICE NEXT</h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {pattern.practice.map((problem) => (
              <li key={problem.id}>
                <a
                  href={leetcodeUrl(problem.slug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm transition hover:border-white/25"
                >
                  <span className="text-zinc-200">
                    <span className="font-mono text-zinc-500">{problem.id}.</span> {problem.title}
                  </span>
                  <DifficultyPill level={problem.difficulty} />
                </a>
              </li>
            ))}
          </ul>
        </section>

        <nav className="mt-16 flex justify-between gap-4 border-t border-white/10 pt-6 text-sm">
          {previous ? (
            <Link href={`/algorithms/${previous.slug}`} className="text-zinc-400 hover:text-white">
              ← {previous.name}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/algorithms/${next.slug}`} className="text-zinc-400 hover:text-white">
              {next.name} →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </div>
    </main>
  );
}
