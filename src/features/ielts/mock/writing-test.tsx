"use client";

import { useEffect, useState } from "react";

import { Task1Chart } from "./chart";
import { Countdown, ExamTools, Intro } from "./exam-parts";
import { clock, useNow, usePersisted, wordCount } from "./store";
import type { WritingTest as WritingData } from "./types";

const MINUTES = 60;

interface WritingRun {
  phase: "intro" | "running" | "done";
  timed: boolean;
  startedAt: number;
  endsAt: number;
  finishedAt: number;
  t1: string;
  t2: string;
}

const EMPTY: WritingRun = {
  phase: "intro",
  timed: true,
  startedAt: 0,
  endsAt: 0,
  finishedAt: 0,
  t1: "",
  t2: "",
};

const CHECK_1 = [
  "An introduction that paraphrases the question (not copied).",
  "A clear overview: the main trends or the biggest differences, with no detail yet.",
  "The key figures, selected and compared, not every number listed.",
  "Accurate numbers, units and time words.",
  "Short paragraphs, and linking words that do not repeat.",
  "At least 150 words.",
];

const CHECK_2 = [
  "Every part of the question is answered.",
  "Your position is clear in the introduction and again in the conclusion.",
  "Each body paragraph has one main idea, an explanation and an example.",
  "Ideas are connected: this, however, as a result, for instance.",
  "A range of vocabulary and sentences, with few errors that block meaning.",
  "At least 250 words.",
];

function Checklist({ items, name }: { items: string[]; name: string }) {
  const [ticked, setTicked] = useState<boolean[]>(() => items.map(() => false));
  return (
    <ul className="mx-check" aria-label={`${name} checklist`}>
      {items.map((t, i) => (
        <li key={t}>
          <label>
            <input
              type="checkbox"
              checked={ticked[i]}
              onChange={() => setTicked((c) => c.map((v, j) => (j === i ? !v : v)))}
            />
            {t}
          </label>
        </li>
      ))}
    </ul>
  );
}

export function WritingTest({ test }: { test: WritingData }) {
  const [run, setRun] = usePersisted(`ielts.mock.writing.${test.band}`, EMPTY);
  const now = useNow();
  const [tab, setTab] = useState<1 | 2>(1);
  const [ideas, setIdeas] = useState(false);

  const timeUp = run.phase === "running" && run.timed && now > 0 && now >= run.endsAt;
  useEffect(() => {
    if (timeUp) setRun((r) => ({ ...r, phase: "done", finishedAt: Date.now() }));
  }, [timeUp, setRun]);

  if (run.phase === "intro") {
    return (
      <Intro
        title={
          test.band === "56"
            ? "Writing Mock Test · Band 5–6"
            : test.band === "67"
              ? "Writing Mock Test · Band 6–7"
              : "Writing Mock Test · Band 7–8"
        }
        minutes={MINUTES}
        rules={[
          "2 tasks, 60 minutes: about 20 minutes on Task 1 (150+ words) and 40 on Task 2 (250+ words).",
          "Task 2 counts for more of your Writing band, so do not run out of time for it.",
          "Writing cannot be marked automatically. When you finish you see a model answer and a checklist to mark yourself.",
          "Your text is saved in this browser as you type.",
        ]}
        onStart={(timed) =>
          setRun(() => ({
            ...EMPTY,
            phase: "running",
            timed,
            startedAt: Date.now(),
            endsAt: Date.now() + MINUTES * 60_000,
          }))
        }
      />
    );
  }

  const w1 = wordCount(run.t1);
  const w2 = wordCount(run.t2);

  if (run.phase === "done") {
    const used = run.finishedAt && run.startedAt ? run.finishedAt - run.startedAt : 0;
    return (
      <section className="mx-card" data-testid="mx-result">
        <h2>Writing: compare and mark yourself</h2>
        <p className="mx-note">
          {used > 0 ? `Time used ${clock(used)}. ` : ""}Task 1: {w1} words (aim for 150+). Task 2:{" "}
          {w2} words (aim for 250+). Read the model answer, then tick what your own text does.
        </p>
        {([1, 2] as const).map((n) => {
          const task = n === 1 ? test.task1 : test.task2;
          const text = n === 1 ? run.t1 : run.t2;
          return (
            <div key={n} className="mx-task-review">
              <h3>Task {n}</h3>
              <p className="mx-prompt">{task.prompt}</p>
              <div className="mx-two">
                <div>
                  <h4>Your answer ({n === 1 ? w1 : w2} words)</h4>
                  <p className="mx-essay">{text || <i>You wrote nothing for this task.</i>}</p>
                </div>
                <div>
                  <h4>Model answer</h4>
                  <p className="mx-essay">{task.modelAnswer}</p>
                </div>
              </div>
              <Checklist items={n === 1 ? CHECK_1 : CHECK_2} name={`Task ${n}`} />
            </div>
          );
        })}
        <button type="button" className="mx-btn" onClick={() => setRun(() => EMPTY)}>
          Write it again
        </button>
      </section>
    );
  }

  const remaining = run.endsAt - now;
  const task = tab === 1 ? test.task1 : test.task2;
  const text = tab === 1 ? run.t1 : run.t2;
  const min = tab === 1 ? 150 : 250;
  const words = tab === 1 ? w1 : w2;

  return (
    <div className="mx-run mx-writing">
      <div className="mx-bar">
        <div className="mx-tabs" role="tablist" aria-label="Tasks">
          {([1, 2] as const).map((n) => (
            <button
              key={n}
              role="tab"
              type="button"
              aria-selected={tab === n}
              onClick={() => setTab(n)}
            >
              Task {n}
            </button>
          ))}
        </div>
        <Countdown timed={run.timed} remaining={remaining} />
        <ExamTools size={false} />
        <button
          type="button"
          className="mx-btn primary"
          data-testid="mx-submit"
          onClick={() => {
            if (window.confirm("Finish the Writing test?"))
              setRun((r) => ({ ...r, phase: "done", finishedAt: Date.now() }));
          }}
        >
          Finish
        </button>
      </div>
      <div className="mx-split">
        <article className="mx-passage">
          <h2>Writing Task {tab}</h2>
          <p className="mx-prompt">{task.prompt}</p>
          {tab === 1 ? (
            <Task1Chart visual={test.task1.visual} />
          ) : (
            <>
              <button type="button" className="mx-btn" onClick={() => setIdeas((v) => !v)}>
                {ideas ? "Hide ideas" : "Need ideas?"}
              </button>
              {ideas && (
                <ul className="mx-ideas">
                  {test.task2.ideas.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              )}
            </>
          )}
        </article>
        <section className="mx-questions">
          <textarea
            className="mx-textarea"
            aria-label={`Task ${tab} answer`}
            value={text}
            spellCheck={false}
            placeholder={`Write your Task ${tab} answer here (at least ${min} words).`}
            onChange={(e) =>
              setRun((r) =>
                tab === 1 ? { ...r, t1: e.target.value } : { ...r, t2: e.target.value },
              )
            }
          />
          <p className={`mx-words${words >= min ? "is-ok" : ""}`}>
            {words} words {words >= min ? "✓" : `· ${min - words} to go`}
          </p>
        </section>
      </div>
    </div>
  );
}
