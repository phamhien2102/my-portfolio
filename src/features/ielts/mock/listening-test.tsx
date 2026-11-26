"use client";

import { useEffect, useMemo, useState } from "react";

import { normalise } from "./marking";
import { Countdown, ExamTools, Intro, Stat } from "./exam-parts";
import { clock, useNow, usePersisted } from "./store";
import { bandFromRaw } from "./types";

const MINUTES = 40; // 30 listening + 10 to copy answers

/** Free, official full tests: the recordings are theirs, so the test is taken on their site. */
const SOURCES = [
  {
    name: "IELTS.org · Academic sample tests",
    url: "https://ielts.org/take-a-test/preparation-resources/sample-test-questions/academic-test",
    note: "Official sample questions with audio.",
  },
  {
    name: "British Council · IELTS Ready",
    url: "https://takeielts.britishcouncil.org/prepare/ielts-ready",
    note: "Free practice material from an official IELTS partner.",
  },
  {
    name: "Cambridge · IELTS practice tests (book series)",
    url: "https://www.cambridge.org/cambridgeenglish/catalog/cambridge-english-exams-ielts/ielts-21-practice-tests",
    note: "Real past papers with audio; buy or borrow the book.",
  },
];

interface ListeningRun {
  phase: "intro" | "running" | "done";
  timed: boolean;
  startedAt: number;
  endsAt: number;
  finishedAt: number;
  answers: Record<number, string>;
  key: string;
}

const EMPTY: ListeningRun = {
  phase: "intro",
  timed: true,
  startedAt: 0,
  endsAt: 0,
  finishedAt: 0,
  answers: {},
  key: "",
};

/** "1 Parker" / "2. 4 / four" / just one answer per line. A "/" or "or" lists acceptable answers. */
function parseKey(text: string): Record<number, string[]> {
  const out: Record<number, string[]> = {};
  let next = 1;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const m = /^(\d{1,2})\s*[.):\-]?\s+(.+)$/.exec(line);
    const n = m ? Number(m[1]) : next;
    const body = m ? m[2] : line;
    out[n] = body
      .split(/\s*\/\s*|\s+or\s+/i)
      .map(normalise)
      .filter(Boolean);
    next = n + 1;
  }
  return out;
}

export function ListeningTest({ band }: { band: string }) {
  const [run, setRun] = usePersisted(`ielts.mock.listening.${band}`, EMPTY);
  const now = useNow();
  const timeUp = run.phase === "running" && run.timed && now > 0 && now >= run.endsAt;
  useEffect(() => {
    if (timeUp) setRun((r) => ({ ...r, phase: "done", finishedAt: Date.now() }));
  }, [timeUp, setRun]);
  const [manual, setManual] = useState("");

  const keyed = useMemo(() => parseKey(run.key), [run.key]);
  const hasKey = Object.keys(keyed).length > 0;
  const rows = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => i + 1).map((n) => {
        const given = run.answers[n] ?? "";
        const accepted = keyed[n];
        return {
          n,
          given,
          accepted,
          right: !!accepted && accepted.includes(normalise(given)) && !!given.trim(),
        };
      }),
    [run.answers, keyed],
  );
  const raw = hasKey
    ? rows.filter((r) => r.right).length
    : Math.min(40, Math.max(0, Number(manual) || 0));

  if (run.phase === "intro") {
    return (
      <Intro
        title="Listening Mock Test"
        minutes={MINUTES}
        rules={[
          "4 recordings, 40 questions: about 30 minutes of listening, then 10 minutes to copy your answers. Play each recording once.",
          "The recordings are official and free, so you take the test on their site and keep your answers on this sheet. This page times you and works out your band.",
          "Spelling counts. Capital letters do not.",
        ]}
        note={
          <ul className="mx-links">
            {SOURCES.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.name}
                </a>
                <span> — {s.note}</span>
              </li>
            ))}
          </ul>
        }
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

  if (run.phase === "done") {
    const used = run.finishedAt && run.startedAt ? run.finishedAt - run.startedAt : 0;
    return (
      <section className="mx-card" data-testid="mx-result">
        <h2>Listening result</h2>
        <p className="mx-note">
          Compare with the official answer key: paste it below (one answer per line, with or without
          the number, and &ldquo;a / b&rdquo; for alternatives) and your sheet is marked for you. Or
          count your right answers and type the number.
        </p>
        <textarea
          className="mx-textarea short"
          aria-label="Official answer key"
          placeholder={"1 Parker\n2 4 / four\n3 Sunday"}
          value={run.key}
          spellCheck={false}
          onChange={(e) => setRun((r) => ({ ...r, key: e.target.value }))}
        />
        {!hasKey && (
          <label className="mx-manual">
            Your right answers (0–40)
            <input
              type="number"
              min={0}
              max={40}
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              aria-label="Right answers"
            />
          </label>
        )}
        <div className="mx-stats">
          <Stat label="Raw score" value={`${raw} / 40`} />
          <Stat label="Band" value={bandFromRaw(raw).toFixed(1)} />
          {used > 0 && <Stat label="Time used" value={clock(used)} />}
        </div>
        {hasKey && (
          <div className="mx-table-wrap">
            <table className="mx-review">
              <thead>
                <tr>
                  <th>Q</th>
                  <th>Your answer</th>
                  <th>Key</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.n} className={r.right ? "is-right" : "is-wrong"}>
                    <td>
                      <b>{r.n}</b> {r.right ? "✓" : "✗"}
                    </td>
                    <td>{r.given || <i>no answer</i>}</td>
                    <td>{r.accepted ? r.accepted.join(" / ") : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mx-note">The band is the usual Academic Listening conversion, an estimate.</p>
        <button type="button" className="mx-btn" onClick={() => setRun(() => EMPTY)}>
          Start again
        </button>
      </section>
    );
  }

  const remaining = run.endsAt - now;
  const answered = Object.values(run.answers).filter((v) => v.trim()).length;
  const sections = [0, 1, 2, 3].map((s) => Array.from({ length: 10 }, (_, i) => s * 10 + i + 1));

  return (
    <div className="mx-run mx-listening">
      <div className="mx-bar">
        <b>Answer sheet</b>
        <Countdown timed={run.timed} remaining={remaining} />
        <ExamTools size={false} />
        <span className="mx-count">{answered} / 40</span>
        <button
          type="button"
          className="mx-btn primary"
          data-testid="mx-submit"
          onClick={() => {
            if (window.confirm("Finish and check your answers?"))
              setRun((r) => ({ ...r, phase: "done", finishedAt: Date.now() }));
          }}
        >
          Finish
        </button>
      </div>
      <div className="mx-sheet-wrap">
        <ul className="mx-links">
          {SOURCES.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noopener noreferrer">
                {s.name}
              </a>
            </li>
          ))}
        </ul>
        {sections.map((nums, i) => (
          <fieldset key={i} className="mx-sheet">
            <legend>Section {i + 1}</legend>
            {nums.map((n) => (
              <label key={n}>
                <span>{n}</span>
                <input
                  type="text"
                  value={run.answers[n] ?? ""}
                  autoComplete="off"
                  spellCheck={false}
                  aria-label={`Answer ${n}`}
                  onChange={(e) =>
                    setRun((r) => ({ ...r, answers: { ...r.answers, [n]: e.target.value } }))
                  }
                />
              </label>
            ))}
          </fieldset>
        ))}
      </div>
    </div>
  );
}
