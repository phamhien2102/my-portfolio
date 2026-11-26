import { bandFromRaw, type QuestionGroup, type ReadingTest } from "./types";

export type Answers = Record<number, string>;

/** Capitals, spacing and punctuation do not matter; spelling does (as the course's rules say). */
export const normalise = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/[.,;:!?'"“”‘’]/g, "")
    .replace(/\s+/g, " ");

export interface Marked {
  n: number;
  passage: number;
  given: string;
  correct: boolean;
  /** What the right answer is, as text. */
  expected: string;
  question: string;
  why: string;
}

function expectedOf(group: QuestionGroup, q: QuestionGroup["questions"][number]): string {
  if (group.kind === "gap") return (q as { answer: string[] }).answer[0];
  if (group.kind === "match") {
    const key = (q as { answer: string }).answer;
    const choice = group.choices.find((c) => c.key === key);
    return choice ? `${key}  ${choice.label}` : key;
  }
  if (group.kind === "mcq") {
    const mq = q as { answer: string; options: { key: string; label: string }[] };
    const opt = mq.options.find((o) => o.key === mq.answer);
    return opt ? `${mq.answer}  ${opt.label}` : mq.answer;
  }
  return (q as { answer: string }).answer;
}

function isRight(
  group: QuestionGroup,
  q: QuestionGroup["questions"][number],
  given: string,
): boolean {
  if (!given.trim()) return false;
  if (group.kind === "gap") {
    return (q as { answer: string[] }).answer.some((a) => normalise(a) === normalise(given));
  }
  return given === (q as { answer: string }).answer;
}

export function markReading(test: ReadingTest, answers: Answers) {
  const rows: Marked[] = [];
  test.passages.forEach((p, passage) => {
    for (const g of p.groups) {
      for (const q of g.questions) {
        const given = answers[q.n] ?? "";
        rows.push({
          n: q.n,
          passage,
          given,
          correct: isRight(g, q, given),
          expected: expectedOf(g, q),
          question: q.text,
          why: q.why,
        });
      }
    }
  });
  rows.sort((a, b) => a.n - b.n);
  const raw = rows.filter((r) => r.correct).length;
  return { rows, raw, total: rows.length, band: bandFromRaw(raw) };
}
