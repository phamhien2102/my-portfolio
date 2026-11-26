/**
 * The mock tests. Everything here is plain data so a test can be written, read and checked without
 * touching the UI. The tests are original: written for this course in the IELTS Academic format,
 * not copied from any published test.
 */

export type Band = "56" | "67" | "78";

export const BANDS: readonly { id: Band; label: string; range: string }[] = [
  { id: "56", label: "Band 5–6", range: "5–6" },
  { id: "67", label: "Band 6–7", range: "6–7" },
  { id: "78", label: "Band 7–8", range: "7–8" },
];

export interface Choice {
  /** "A", "B", "C" or a heading number such as "i". */
  key: string;
  label: string;
}

/** A True / False / Not Given (or Yes / No / Not Given) statement. */
export interface TfQuestion {
  n: number;
  text: string;
  answer: "TRUE" | "FALSE" | "NOT GIVEN" | "YES" | "NO";
  /** One sentence pointing at the evidence in the passage. */
  why: string;
}

export interface McqQuestion {
  n: number;
  text: string;
  options: Choice[];
  /** The key of the right option. */
  answer: string;
  why: string;
}

/** A sentence, note or table cell with a gap written as "____". */
export interface GapQuestion {
  n: number;
  text: string;
  /** Every accepted spelling, lower case ("20", "twenty" both listed if both are right). */
  answer: string[];
  why: string;
}

/** Match a statement, paragraph or feature to one of the shared choices of its group. */
export interface MatchQuestion {
  n: number;
  text: string;
  /** The key of the right choice. */
  answer: string;
  why: string;
}

export type QuestionGroup =
  | {
      kind: "tf";
      mode: "TFNG" | "YNNG";
      title: string;
      instructions: string;
      questions: TfQuestion[];
    }
  | { kind: "mcq"; title: string; instructions: string; questions: McqQuestion[] }
  | { kind: "gap"; title: string; instructions: string; limit: string; questions: GapQuestion[] }
  | {
      kind: "match";
      title: string;
      instructions: string;
      choices: Choice[];
      /** Matching headings may use a choice more than once only if stated in the instructions. */
      questions: MatchQuestion[];
    };

export interface Paragraph {
  /** "A", "B"... when the questions refer to paragraphs. */
  label?: string;
  text: string;
}

export interface Passage {
  title: string;
  subtitle?: string;
  paragraphs: Paragraph[];
  groups: QuestionGroup[];
}

/** Three passages, questions numbered 1 to 40 across them. */
export interface ReadingTest {
  band: Band;
  title: string;
  passages: Passage[];
}

export type Task1Visual =
  | { kind: "table"; caption: string; columns: string[]; rows: string[][] }
  | {
      kind: "bar" | "line";
      caption: string;
      unit: string;
      categories: string[];
      series: { name: string; values: number[] }[];
    };

export interface WritingTest {
  band: Band;
  task1: { prompt: string; visual: Task1Visual; modelAnswer: string };
  task2: { prompt: string; ideas: string[]; modelAnswer: string };
}

export interface SpeakingTest {
  band: Band;
  part1: { topic: string; questions: string[] }[];
  part2: { cue: string; bullets: string[]; followUp: string };
  part3: string[];
}

/** Academic Reading and Listening: raw score out of 40 to band. Published conversion, rounded. */
const CONVERSION: [number, number][] = [
  [39, 9],
  [37, 8.5],
  [35, 8],
  [33, 7.5],
  [30, 7],
  [27, 6.5],
  [23, 6],
  [19, 5.5],
  [15, 5],
  [13, 4.5],
  [10, 4],
  [8, 3.5],
  [6, 3],
  [4, 2.5],
];

export function bandFromRaw(raw: number): number {
  for (const [min, band] of CONVERSION) if (raw >= min) return band;
  return 2;
}
