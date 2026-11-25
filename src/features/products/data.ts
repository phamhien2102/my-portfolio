/**
 * The products that are going live, in the order they are shown. Plain copy, not JSX; a card is
 * one entry. The counts are written by hand (a feature may not import another feature's data),
 * so update them when a course grows.
 */

export interface Product {
  path: string;
  name: string;
  tagline: string;
  blurb: string;
  /** Short facts shown as chips, such as how many lessons there are. */
  facts: readonly string[];
  /** What the reader does there, as a few short bullets. */
  highlights: readonly string[];
  /** Which colour family of the page's palette the card wears. */
  tone: "blue" | "teal" | "indigo";
  cta: string;
}

export const PRODUCTS: readonly Product[] = [
  {
    path: "/ielts",
    name: "IELTS Practice",
    tagline: "A course reader for Band 6–8.",
    blurb:
      "Sixteen chapters across four weeks of listening, reading, writing and speaking, in English with Vietnamese beside it.",
    facts: ["16 chapters", "EN + VI", "Notes & flashcards"],
    highlights: [
      "Take notes on any passage and export them",
      "Make flashcards, import or export a deck",
      "Your progress is saved in this browser",
    ],
    tone: "teal",
    cta: "Open IELTS Practice",
  },
  {
    path: "/design-system",
    name: "Design System",
    tagline: "System design, one request at a time.",
    blurb:
      "An interactive course that follows a single web request from the address bar to the database and back, one animated step at a time.",
    facts: ["9 modules", "40 lessons", "EN · VI · FR · DE"],
    highlights: [
      "Replay every step on an isometric diagram",
      "See what changed, in numbers, after each step",
      "Search the whole course with ⌘K",
    ],
    tone: "blue",
    cta: "Open Design System",
  },
  {
    path: "/algo-lab",
    name: "Algo Lab",
    tagline: "Data structures and algorithms, step by step.",
    blurb:
      "Eighty-six lessons from Big-O to hard problems. Watch each algorithm run on blocks you can step through, with the pseudocode beside it.",
    facts: ["14 modules", "86 lessons", "EN · VI · FR · DE"],
    highlights: [
      "Step through every algorithm, forwards and back",
      "Pseudocode and complexity next to the animation",
      "Tick lessons off as you learn them",
    ],
    tone: "indigo",
    cta: "Open Algo Lab",
  },
];
