"use client";

import { useEffect, useMemo, useState, type PointerEvent as ReactPointerEvent } from "react";

import { markReading, type Answers } from "./marking";
import { Countdown, ExamTools, Intro, ReviewDialog, SIZES, Stat, useUi } from "./exam-parts";
import { MarkablePassage } from "./highlights";
import { EMPTY_RUN, startRun } from "./run";
import { clock, useNow, usePersisted } from "./store";
import type { QuestionGroup, ReadingTest as ReadingTestData } from "./types";

const MINUTES = 60;

const RULES = [
  "3 passages, 40 questions, 60 minutes. Spend about 20 minutes on each passage.",
  "There is no extra time to copy answers: write them as you go.",
  "Spelling counts. Capital letters do not. Keep to the word limit in each instruction.",
  "Your answers are saved in this browser, and the clock keeps running if you leave the page.",
];

/** One group of questions (a heading such as "Questions 1–5", its instructions and the items). */
function Group({
  group,
  answers,
  flags,
  onAnswer,
  onFlag,
  onCurrent,
}: {
  group: QuestionGroup;
  answers: Answers;
  flags: number[];
  onAnswer: (n: number, value: string) => void;
  onFlag: (n: number) => void;
  onCurrent: (n: number) => void;
}) {
  return (
    <section className="mx-group">
      <h3>{group.title}</h3>
      <p className="mx-instructions">{group.instructions}</p>
      {group.kind === "gap" && <p className="mx-limit">{group.limit}</p>}
      {group.kind === "match" && (
        <ol className="mx-choices">
          {group.choices.map((c) => (
            <li key={c.key}>
              <b>{c.key}</b> {c.label}
            </li>
          ))}
        </ol>
      )}
      <ol className="mx-questions-list">
        {group.questions.map((q) => {
          const given = answers[q.n] ?? "";
          return (
            <li
              key={q.n}
              id={`q-${q.n}`}
              className="mx-q"
              onFocusCapture={() => onCurrent(q.n)}
              onClick={() => onCurrent(q.n)}
            >
              <span className="mx-n-col">
                <span className="mx-n">{q.n}</span>
                <button
                  type="button"
                  className="mx-flag"
                  aria-pressed={flags.includes(q.n)}
                  aria-label={`Flag question ${q.n} for review`}
                  title="Flag for review"
                  onClick={() => onFlag(q.n)}
                >
                  ⚑
                </button>
              </span>
              <div className="mx-q-body">
                {group.kind === "gap" ? (
                  <label>
                    {q.text.split("____")[0]}
                    <input
                      type="text"
                      className="mx-gap"
                      value={given}
                      autoComplete="off"
                      spellCheck={false}
                      aria-label={`Answer ${q.n}`}
                      onChange={(e) => onAnswer(q.n, e.target.value)}
                    />
                    {q.text.split("____").slice(1).join("____")}
                  </label>
                ) : (
                  <p>{q.text}</p>
                )}
                {group.kind === "tf" && (
                  <div className="mx-options" role="radiogroup" aria-label={`Question ${q.n}`}>
                    {(group.mode === "TFNG"
                      ? ["TRUE", "FALSE", "NOT GIVEN"]
                      : ["YES", "NO", "NOT GIVEN"]
                    ).map((o) => (
                      <button
                        key={o}
                        type="button"
                        role="radio"
                        aria-checked={given === o}
                        className="mx-opt"
                        onClick={() => onAnswer(q.n, given === o ? "" : o)}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                )}
                {group.kind === "mcq" && (
                  <div
                    className="mx-options stack"
                    role="radiogroup"
                    aria-label={`Question ${q.n}`}
                  >
                    {(q as { options: { key: string; label: string }[] }).options.map((o) => (
                      <button
                        key={o.key}
                        type="button"
                        role="radio"
                        aria-checked={given === o.key}
                        className="mx-opt wide"
                        onClick={() => onAnswer(q.n, given === o.key ? "" : o.key)}
                      >
                        <b>{o.key}</b> {o.label}
                      </button>
                    ))}
                  </div>
                )}
                {group.kind === "match" && (
                  <select
                    className="mx-select"
                    value={given}
                    aria-label={`Answer ${q.n}`}
                    onChange={(e) => onAnswer(q.n, e.target.value)}
                  >
                    <option value="">Choose…</option>
                    {group.choices.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.key}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function ReadingTest({ test, slot = "" }: { test: ReadingTestData; slot?: string }) {
  const [run, setRun] = usePersisted(`ielts.mock.reading.${test.band}${slot}`, EMPTY_RUN);
  const [ui, setUi] = useUi();
  const now = useNow();
  const [tab, setTab] = useState(0);
  const [current, setCurrent] = useState(1);
  const [reviewing, setReviewing] = useState(false);

  const passageOf = useMemo(() => {
    const map = new Map<number, number>();
    test.passages.forEach((p, i) =>
      p.groups.forEach((g) => g.questions.forEach((q) => map.set(q.n, i))),
    );
    return map;
  }, [test]);
  const total = passageOf.size;
  const flags = run.flags ?? [];
  const highlights = run.highlights ?? [];

  const finish = () => {
    setReviewing(false);
    setRun((r) => ({ ...r, phase: "done", finishedAt: Date.now() }));
  };
  const timeUp = run.phase === "running" && run.timed && now > 0 && now >= run.endsAt;
  useEffect(() => {
    if (timeUp) setRun((r) => ({ ...r, phase: "done", finishedAt: Date.now() }));
  }, [timeUp, setRun]);

  const marked = useMemo(
    () => (run.phase === "done" ? markReading(test, run.answers) : null),
    [run.phase, run.answers, test],
  );

  const onAnswer = (n: number, value: string) =>
    setRun((r) => ({ ...r, answers: { ...r.answers, [n]: value } }));
  const onFlag = (n: number) =>
    setRun((r) => {
      const f = r.flags ?? [];
      return { ...r, flags: f.includes(n) ? f.filter((x) => x !== n) : [...f, n] };
    });

  if (run.phase === "intro") {
    return (
      <Intro
        title={test.title}
        minutes={MINUTES}
        rules={RULES}
        onStart={(timed) => setRun(() => startRun(timed, MINUTES))}
      />
    );
  }

  if (run.phase === "done" && marked) {
    const used = run.finishedAt && run.startedAt ? run.finishedAt - run.startedAt : 0;
    return (
      <section className="mx-card" data-testid="mx-result">
        <h2>Reading result</h2>
        <div className="mx-stats">
          <Stat label="Raw score" value={`${marked.raw} / ${marked.total}`} />
          <Stat label="Band" value={marked.band.toFixed(1)} />
          {used > 0 && <Stat label="Time used" value={clock(used)} />}
          {test.passages.map((p, i) => {
            const rows = marked.rows.filter((r) => r.passage === i);
            return (
              <Stat
                key={p.title}
                label={`Passage ${i + 1}`}
                value={`${rows.filter((r) => r.correct).length} / ${rows.length}`}
              />
            );
          })}
        </div>
        <p className="mx-note">
          The band comes from the usual Academic Reading conversion; it is an estimate, not an
          official result.
        </p>
        <div className="mx-table-wrap">
          <table className="mx-review">
            <thead>
              <tr>
                <th>Q</th>
                <th>Your answer</th>
                <th>Right answer</th>
                <th>Why</th>
              </tr>
            </thead>
            <tbody>
              {marked.rows.map((r) => (
                <tr key={r.n} className={r.correct ? "is-right" : "is-wrong"}>
                  <td>
                    <b>{r.n}</b>{" "}
                    <span aria-label={r.correct ? "correct" : "wrong"}>
                      {r.correct ? "✓" : "✗"}
                    </span>
                  </td>
                  <td>{r.given || <i>no answer</i>}</td>
                  <td>{r.expected}</td>
                  <td>{r.why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="button" className="mx-btn" onClick={() => setRun(() => EMPTY_RUN)}>
          Take it again
        </button>
      </section>
    );
  }

  const passage = test.passages[tab];
  const answered = Object.values(run.answers).filter((v) => v.trim()).length;
  const remaining = run.endsAt - now;
  const go = (n: number) => {
    const next = Math.min(total, Math.max(1, n));
    setReviewing(false);
    setCurrent(next);
    setTab(passageOf.get(next) ?? 0);
    requestAnimationFrame(() =>
      document.getElementById(`q-${next}`)?.scrollIntoView({ block: "center" }),
    );
  };

  // Drag the divider between the passage and the questions (arrow keys work too).
  const drag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const split = e.currentTarget.parentElement;
    if (!split) return;
    const box = split.getBoundingClientRect();
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);
    const move = (ev: PointerEvent) =>
      setUi((u) => ({
        ...u,
        pct: Math.min(72, Math.max(28, ((ev.clientX - box.left) / box.width) * 100)),
      }));
    const up = () => {
      target.removeEventListener("pointermove", move);
      target.removeEventListener("pointerup", up);
    };
    target.addEventListener("pointermove", move);
    target.addEventListener("pointerup", up);
  };

  return (
    <div className="mx-run" style={{ ["--mx-zoom" as string]: SIZES[ui.size] }}>
      <div className="mx-bar">
        <b className="mx-title">Reading</b>
        <div className="mx-tabs" role="tablist" aria-label="Passages">
          {test.passages.map((p, i) => (
            <button
              key={p.title}
              role="tab"
              type="button"
              aria-selected={i === tab}
              onClick={() => setTab(i)}
            >
              Part {i + 1}
            </button>
          ))}
        </div>
        <Countdown timed={run.timed} remaining={remaining} />
        <ExamTools />
        <span className="mx-count">
          {answered} / {total}
        </span>
        <button
          type="button"
          className="mx-btn primary"
          data-testid="mx-review"
          onClick={() => setReviewing(true)}
        >
          Review
        </button>
      </div>

      <div className="mx-split" style={{ ["--mx-left" as string]: `${ui.pct}%` }}>
        <article className="mx-passage" aria-label={`Passage ${tab + 1}`}>
          <h2>{passage.title}</h2>
          {passage.subtitle && <p className="mx-sub">{passage.subtitle}</p>}
          <p className="mx-hint">Select words to highlight them or add a note.</p>
          <MarkablePassage
            key={tab}
            paragraphs={passage.paragraphs}
            passage={tab}
            highlights={highlights}
            onChange={(next) => setRun((r) => ({ ...r, highlights: next }))}
          />
        </article>
        <div
          className="mx-gutter"
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize the passage and the questions"
          tabIndex={0}
          onPointerDown={drag}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") setUi((u) => ({ ...u, pct: Math.max(28, u.pct - 3) }));
            if (e.key === "ArrowRight") setUi((u) => ({ ...u, pct: Math.min(72, u.pct + 3) }));
          }}
        />
        <section className="mx-questions" aria-label="Questions">
          {passage.groups.map((g) => (
            <Group
              key={g.title}
              group={g}
              answers={run.answers}
              flags={flags}
              onAnswer={onAnswer}
              onFlag={onFlag}
              onCurrent={setCurrent}
            />
          ))}
        </section>
      </div>

      <nav className="mx-palette" aria-label="Question numbers">
        {test.passages.map((p, i) => {
          const nums = [...passageOf.entries()]
            .filter(([, pi]) => pi === i)
            .map(([n]) => n)
            .sort((a, b) => a - b);
          const done = nums.filter((n) => (run.answers[n] ?? "").trim()).length;
          return (
            <div key={p.title} className="mx-part">
              <span className="mx-part-name">
                Part {i + 1}{" "}
                <small>
                  {done} of {nums.length}
                </small>
              </span>
              <span className="mx-part-nums">
                {nums.map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={[
                      (run.answers[n] ?? "").trim() ? "is-done" : "",
                      flags.includes(n) ? "is-flagged" : "",
                      n === current ? "is-current" : "",
                    ].join(" ")}
                    aria-label={`Question ${n}${flags.includes(n) ? ", flagged" : ""}`}
                    aria-current={n === current}
                    onClick={() => go(n)}
                  >
                    {n}
                  </button>
                ))}
              </span>
            </div>
          );
        })}
        <span className="mx-arrows">
          <button
            type="button"
            className="mx-tool"
            aria-label="Previous question"
            onClick={() => go(current - 1)}
          >
            ←
          </button>
          <button
            type="button"
            className="mx-tool"
            aria-label="Next question"
            onClick={() => go(current + 1)}
          >
            →
          </button>
        </span>
      </nav>

      {reviewing && (
        <ReviewDialog
          total={total}
          answers={run.answers}
          flags={flags}
          onGo={go}
          onSubmit={finish}
          onClose={() => setReviewing(false)}
        />
      )}
    </div>
  );
}
