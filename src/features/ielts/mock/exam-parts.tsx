"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

import type { Answers } from "./marking";
import { clock, usePersisted } from "./store";

/** Look-and-feel choices that stay between tests: split position, text size, whether the clock shows. */
export interface Ui {
  pct: number;
  size: number;
  hideClock: boolean;
}
export const DEFAULT_UI: Ui = { pct: 50, size: 0, hideClock: false };
export const SIZES = [1, 1.12, 1.25, 1.4];

export function useUi() {
  return usePersisted("ielts.mock.ui", DEFAULT_UI);
}

/** The screen before a test starts: what to expect, timed or untimed, and the Start button. */
export function Intro({
  title,
  minutes,
  rules,
  onStart,
  note,
}: {
  title: string;
  minutes: number;
  rules: string[];
  onStart: (timed: boolean) => void;
  note?: ReactNode;
}) {
  const [timed, setTimed] = useState(true);
  return (
    <section className="mx-card mx-intro">
      <h2>{title}</h2>
      <ul>
        {rules.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
      {note}
      <div className="mx-mode" role="group" aria-label="Timing">
        <button type="button" aria-pressed={timed} onClick={() => setTimed(true)}>
          Timed · {minutes} min
        </button>
        <button type="button" aria-pressed={!timed} onClick={() => setTimed(false)}>
          Untimed practice
        </button>
      </div>
      <button
        type="button"
        className="mx-btn primary"
        onClick={() => onStart(timed)}
        data-testid="mx-start"
      >
        Start the test
      </button>
    </section>
  );
}

/** The clock. Like the real test it can be hidden (so it does not make you anxious) and shown again. */
export function Countdown({ timed, remaining }: { timed: boolean; remaining: number }) {
  const [ui, setUi] = useUi();
  if (!timed) return <span className="mx-clock">Untimed</span>;
  return (
    <span className="mx-clockbox">
      {ui.hideClock ? (
        <span className="mx-clock is-hidden">Time hidden</span>
      ) : (
        <span
          className={`mx-clock${remaining < 5 * 60_000 ? "is-low" : ""}`}
          role="timer"
          aria-live="off"
        >
          {clock(remaining)}
        </span>
      )}
      <button
        type="button"
        className="mx-tool"
        aria-label={ui.hideClock ? "Show the time" : "Hide the time"}
        title={ui.hideClock ? "Show the time" : "Hide the time"}
        onClick={() => setUi((u) => ({ ...u, hideClock: !u.hideClock }))}
      >
        {ui.hideClock ? "Show" : "Hide"}
      </button>
    </span>
  );
}

/** Text size, fullscreen and a way out: the small tools at the top of the exam screen. */
export function ExamTools({ size = true }: { size?: boolean }) {
  const [ui, setUi] = useUi();
  const [full, setFull] = useState(false);
  useEffect(() => {
    const on = () => setFull(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", on);
    return () => document.removeEventListener("fullscreenchange", on);
  }, []);
  return (
    <span className="mx-tools">
      {size && (
        <>
          <button
            type="button"
            className="mx-tool"
            aria-label="Smaller text"
            disabled={ui.size <= 0}
            onClick={() => setUi((u) => ({ ...u, size: Math.max(0, u.size - 1) }))}
          >
            A−
          </button>
          <button
            type="button"
            className="mx-tool"
            aria-label="Larger text"
            disabled={ui.size >= SIZES.length - 1}
            onClick={() => setUi((u) => ({ ...u, size: Math.min(SIZES.length - 1, u.size + 1) }))}
          >
            A+
          </button>
        </>
      )}
      <button
        type="button"
        className="mx-tool"
        aria-pressed={full}
        onClick={() =>
          document.fullscreenElement
            ? void document.exitFullscreen()
            : void document.documentElement.requestFullscreen?.()
        }
      >
        {full ? "Exit full screen" : "Full screen"}
      </button>
      <Link
        className="mx-tool"
        href="/ielts"
        title="Leave the test. Your answers are kept, and the clock keeps running."
      >
        Leave
      </Link>
    </span>
  );
}

export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="mx-stat">
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

/** Before you submit, like the real test's review screen: what is empty, what you flagged. */
export function ReviewDialog({
  total,
  answers,
  flags,
  onGo,
  onSubmit,
  onClose,
}: {
  total: number;
  answers: Answers;
  flags: number[];
  onGo: (n: number) => void;
  onSubmit: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const all = Array.from({ length: total }, (_, i) => i + 1);
  const empty = all.filter((n) => !(answers[n] ?? "").trim());
  const chips = (list: number[]) =>
    list.length ? (
      <div className="mx-chips">
        {list.map((n) => (
          <button key={n} type="button" onClick={() => onGo(n)}>
            {n}
          </button>
        ))}
      </div>
    ) : (
      <p className="mx-note">None.</p>
    );

  return (
    <div className="mx-overlay" onClick={onClose}>
      <div
        className="mx-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Review your answers"
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Review your answers</h2>
        <div className="mx-stats">
          <Stat label="Answered" value={`${total - empty.length} / ${total}`} />
          <Stat label="Flagged" value={flags.length} />
        </div>
        <h3>Not answered yet</h3>
        {chips(empty)}
        <h3>Flagged for review</h3>
        {chips([...flags].sort((a, b) => a - b))}
        <div className="mx-dialog-actions">
          <button type="button" className="mx-btn" onClick={onClose}>
            Keep working
          </button>
          <button
            type="button"
            className="mx-btn primary"
            data-testid="mx-submit"
            onClick={onSubmit}
          >
            Submit and see my score
          </button>
        </div>
      </div>
    </div>
  );
}
