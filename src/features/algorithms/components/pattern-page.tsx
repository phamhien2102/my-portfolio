import Link from "next/link";

import { leetcodeUrl, PATTERNS, type Pattern } from "../data";
import { AlgShell } from "./alg-shell";
import { DifficultyPill } from "./difficulty";
import { LearnedToggle } from "./learned";
import { PatternLab } from "./pattern-lab";

/** /algorithms/[slug]: when to use the pattern, the idea, a step-by-step walkthrough and practice. */
export function PatternPage({ pattern }: { pattern: Pattern }) {
  const index = PATTERNS.findIndex((p) => p.slug === pattern.slug);
  const previous = PATTERNS[index - 1];
  const next = PATTERNS[index + 1];

  return (
    <AlgShell back={{ href: "/algorithms", label: "← All patterns" }}>
      <header className="alg-banner">
        <p className="alg-eyebrow">
          Pattern {String(index + 1).padStart(2, "0")} / {String(PATTERNS.length).padStart(2, "0")}{" "}
          · {pattern.level === "advanced" ? "Advanced" : "Fundamentals"}
        </p>
        <div className="alg-title-row">
          <h1>{pattern.name}</h1>
          <LearnedToggle slug={pattern.slug} />
        </div>
        <p className="alg-sub">{pattern.tagline}</p>
      </header>

      <section className="alg-two">
        <div className="alg-panel">
          <h2 className="alg-label">The idea</h2>
          <p>{pattern.idea}</p>
          <div className="alg-chips">
            <span className="alg-chip y">
              time <b>{pattern.complexity.time}</b>
            </span>
            <span className="alg-chip v">
              space <b>{pattern.complexity.space}</b>
            </span>
          </div>
        </div>
        <div className="alg-panel">
          <h2 className="alg-label">Reach for it when</h2>
          <ul className="alg-when">
            {pattern.whenToUse.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <h2 className="alg-h2">Watch it run</h2>
        <div className="alg-run-head">
          <div>
            <h3>
              {pattern.example.id}. {pattern.example.title}
            </h3>
            <p>{pattern.example.statement}</p>
          </div>
          <div className="actions">
            <DifficultyPill level={pattern.example.difficulty} />
            <a
              href={leetcodeUrl(pattern.example.slug)}
              target="_blank"
              rel="noopener noreferrer"
              className="alg-btn"
            >
              Open on LeetCode ↗
            </a>
          </div>
        </div>
        <div className="alg-examples">
          {pattern.example.examples.map((example, i) => (
            <div key={example.input} className="alg-example">
              <strong>Example {i + 1}</strong>
              <div>
                <p>
                  <b>Input:</b> {example.input}
                </p>
                <p>
                  <b>Output:</b> {example.output}
                </p>
                {example.explanation && (
                  <p>
                    <b>Explanation:</b> {example.explanation}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="alg-input">
          <b>WALKTHROUGH INPUT</b> · {pattern.example.input}
        </p>
        <div className="mt-3">
          <PatternLab pattern={pattern} />
        </div>
      </section>

      <section>
        <h2 className="alg-h2">Practice next</h2>
        <ul className="alg-practice">
          {pattern.practice.map((problem) => (
            <li key={problem.id}>
              <a href={leetcodeUrl(problem.slug)} target="_blank" rel="noopener noreferrer">
                <span>
                  <span className="no">{problem.id}.</span> {problem.title}
                </span>
                <DifficultyPill level={problem.difficulty} />
              </a>
            </li>
          ))}
        </ul>
      </section>

      <nav className="alg-pager" aria-label="Patterns">
        {previous ? <Link href={`/algorithms/${previous.slug}`}>← {previous.name}</Link> : <span />}
        {next ? <Link href={`/algorithms/${next.slug}`}>{next.name} →</Link> : <span />}
      </nav>
    </AlgShell>
  );
}
