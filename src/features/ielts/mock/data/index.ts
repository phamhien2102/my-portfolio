import type { Band, ReadingTest } from "../types";
import { readingBand56 } from "./reading-band56";
import { readingBand67 } from "./reading-band67";
import { readingBand78 } from "./reading-band78";

export { SPEAKING, WRITING } from "./writing-speaking";

export const READING: Record<Band, ReadingTest> = {
  "56": readingBand56,
  "67": readingBand67,
  "78": readingBand78,
};
