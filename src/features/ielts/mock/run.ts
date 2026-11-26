import type { Answers } from "./marking";

/** A highlight (and optional note) on a stretch of one paragraph of a passage. */
export interface Highlight {
  id: string;
  passage: number;
  para: number;
  start: number;
  end: number;
  note: string;
}

/** Where a test is: not started, being taken, or finished. Saved so a reload does not lose it. */
export interface RunState {
  phase: "intro" | "running" | "done";
  timed: boolean;
  startedAt: number;
  endsAt: number;
  finishedAt: number;
  answers: Answers;
  /** Questions marked for review. */
  flags?: number[];
  highlights?: Highlight[];
}

export const EMPTY_RUN: RunState = {
  phase: "intro",
  timed: true,
  startedAt: 0,
  endsAt: 0,
  finishedAt: 0,
  answers: {},
  flags: [],
  highlights: [],
};

export const startRun = (timed: boolean, minutes: number): RunState => {
  const now = Date.now();
  return {
    phase: "running",
    timed,
    startedAt: now,
    endsAt: now + minutes * 60_000,
    finishedAt: 0,
    answers: {},
    flags: [],
    highlights: [],
  };
};
