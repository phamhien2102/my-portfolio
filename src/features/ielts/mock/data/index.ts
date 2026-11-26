import type { Band, MockEntry, ReadingTest, SpeakingTest, WritingTest } from "../types";
import { readingBand56 } from "./reading-band56";
import { readingBand67 } from "./reading-band67";
import { readingBand78 } from "./reading-band78";
import { SPEAKING as SPEAKING_PRACTICE, WRITING as WRITING_PRACTICE } from "./writing-speaking";

/**
 * Every test the page can offer, per band and skill. To add a supplied (official) test, write it in the
 * same shape as the files here (see ../types.ts), then add an entry below with `kind: "official"`
 * and a label such as "Mock test 1 (official)". `node src/features/ielts/mock/check.mjs` checks a
 * Reading file's numbering and answers.
 */
const practice = <T>(test: T, n = 1): MockEntry<T> => ({
  id: n === 1 ? "practice" : `practice-${n}`,
  label: "Practice test",
  kind: "practice",
  test,
});

export const READING: Record<Band, MockEntry<ReadingTest>[]> = {
  "56": [practice(readingBand56)],
  "67": [practice(readingBand67)],
  "78": [practice(readingBand78)],
};

export const WRITING: Record<Band, MockEntry<WritingTest>[]> = {
  "56": [practice(WRITING_PRACTICE["56"])],
  "67": [practice(WRITING_PRACTICE["67"])],
  "78": [practice(WRITING_PRACTICE["78"])],
};

export const SPEAKING: Record<Band, MockEntry<SpeakingTest>[]> = {
  "56": [practice(SPEAKING_PRACTICE["56"])],
  "67": [practice(SPEAKING_PRACTICE["67"])],
  "78": [practice(SPEAKING_PRACTICE["78"])],
};
