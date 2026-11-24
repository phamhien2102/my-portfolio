import { label, ptr, row, scene } from "../lib/scenes";
import type { AlgoLesson } from "../lib/types";

const A = [3, 8, 12, 17, 21, 26, 31, 38, 44];
const TARGET = 26;

/** The array with everything outside [lo, hi] faded, the middle highlighted, and the pointers. */
function view(lo: number, hi: number, mid?: number, found = false) {
  return scene(
    label("target", 320, 70, `looking for ${TARGET}`, { size: 15, weight: 800 }),
    row(A, {
      y: 160,
      index: true,
      tones: (i) =>
        i < lo || i > hi ? "muted" : i === mid ? (found ? "found" : "active") : undefined,
    }),
    lo === hi
      ? ptr("lo", `a${lo}`, "lo = hi")
      : [ptr("lo", `a${lo}`, "lo"), ptr("hi", `a${hi}`, "hi")],
    mid !== undefined &&
      mid !== lo &&
      mid !== hi &&
      ptr("mid", `a${mid}`, "mid", { side: "above", tone: "active" }),
    mid !== undefined &&
      (mid === lo || mid === hi) &&
      lo !== hi &&
      ptr("mid", `a${mid}`, "mid", { side: "above", tone: "active" }),
    lo === hi &&
      mid !== undefined &&
      ptr("mid", `a${mid}`, "mid", { side: "above", tone: found ? "found" : "active" }),
  );
}

export const binarySearch: AlgoLesson = {
  id: "binary-search",
  title: "Binary Search",
  summary: "Find a value in a sorted list by throwing away half of what is left at every step.",
  minutes: 10,
  level: "beginner",
  goals: [
    "Why a sorted list can be searched without looking at everything",
    "How lo, hi and mid shrink the search range",
    "Why the number of steps grows like log n",
    "The off-by-one traps that break most first attempts",
  ],
  takeaways: [
    "Each comparison discards half of the remaining range, so n items need about log2(n) steps.",
    "It only works because the data is sorted: the middle tells you which half cannot hold the target.",
    "Keep one invariant (the target, if present, is always inside lo..hi) and the off-by-one bugs go away.",
  ],
  hud: [
    { label: "Comparisons", icon: "swap" },
    { label: "Items left", icon: "list" },
    { label: "Worst case", icon: "timer" },
  ],
  pseudocode: [
    "search(a, x):",
    "    lo = 0, hi = len(a) - 1",
    "    while lo <= hi:",
    "        mid = (lo + hi) / 2",
    "        if a[mid] == x: return mid",
    "        if a[mid] < x: lo = mid + 1",
    "        else: hi = mid - 1",
    "    return not found",
  ],
  steps: [
    {
      short: "The idea",
      title: "Searching a sorted list",
      body: [
        "You have nine numbers in increasing order and you want to know where `26` is, or whether it is there at all.",
        "A plain scan starts at the left and checks each one. With a million numbers that can mean a million checks. Because the list is sorted, we can do far better.",
      ],
      callout: {
        kind: "insight",
        text: "Sorted order is information. Every comparison can tell you which side of a position the target must be on.",
      },
      metrics: [{ label: "Items left", value: "9", level: "warn" }],
      scene: scene(
        label("target", 320, 70, `looking for ${TARGET}`, { size: 15, weight: 800 }),
        row(A, { y: 160, index: true }),
      ),
    },
    {
      short: "Look middle",
      title: "Check the middle",
      body: [
        "Keep two markers, `lo` and `hi`, around the part that can still contain the target. At the start that is the whole list.",
        "Look at the middle element, index `(lo + hi) / 2` rounded down. Here that is index 4, the value `21`.",
      ],
      metrics: [
        { label: "Comparisons", value: "1", level: "good" },
        { label: "Items left", value: "9", level: "warn" },
      ],
      lines: [3, 4],
      scene: view(0, 8, 4),
    },
    {
      short: "Too small",
      title: "21 is too small",
      body: [
        "`21` is less than `26`. Since the list is sorted, everything at or left of index 4 is smaller still, so none of it can be the target.",
        "Move `lo` to index 5 (one past the middle). Five of the nine items are gone with a single comparison.",
      ],
      callout: {
        kind: "tip",
        text: "Move past mid (`lo = mid + 1`), not onto it. You have already looked at mid.",
      },
      metrics: [
        { label: "Comparisons", value: "1", level: "good" },
        { label: "Items left", value: "4", level: "good" },
      ],
      lines: [6],
      scene: view(5, 8),
    },
    {
      short: "Next middle",
      title: "Check the new middle",
      body: [
        "The range is now indexes 5 to 8, so the middle is index 6, the value `31`.",
        "With an even number of items left there is no exact middle; rounding down is fine as long as the range always shrinks.",
      ],
      metrics: [
        { label: "Comparisons", value: "2", level: "good" },
        { label: "Items left", value: "4", level: "good" },
      ],
      lines: [3, 4],
      scene: view(5, 8, 6),
    },
    {
      short: "Too big",
      title: "31 is too big",
      body: [
        "`31` is more than `26`, so the target can only be to its left. Move `hi` to index 5, one before the middle.",
        "Now `lo` and `hi` both point at index 5: a single candidate remains.",
      ],
      metrics: [
        { label: "Comparisons", value: "2", level: "good" },
        { label: "Items left", value: "1", level: "good" },
      ],
      lines: [7],
      scene: view(5, 5),
    },
    {
      short: "Found it",
      title: "The last candidate is the answer",
      body: [
        "The middle of a one-item range is that item. It is `26`, which is exactly what we wanted.",
        "Three comparisons found it among nine items. If `lo` had ever passed `hi`, the range would be empty and the answer would be 'not found'.",
      ],
      metrics: [
        { label: "Comparisons", value: "3", level: "good" },
        { label: "Items left", value: "1", level: "good" },
      ],
      lines: [5],
      scene: view(5, 5, 5, true),
    },
    {
      short: "Why fast",
      title: "Halving adds up",
      body: [
        "Every step halves the range: 9, then 4, then 1. Doubling the list adds just one more step, so a million items need about 20 comparisons and a billion need about 30.",
        "That growth is called logarithmic, written `O(log n)`. The price is that the data must be sorted first, and it must allow jumping straight to the middle, as an array does.",
      ],
      callout: {
        kind: "warn",
        text: "On a linked list you cannot jump to the middle, so binary search loses its advantage there.",
      },
      metrics: [
        { label: "Comparisons", value: "3", level: "good" },
        { label: "Worst case", value: "log₂ n", level: "good" },
      ],
      scene: scene(
        label("n1", 150, 90, "9 items", { size: 14, weight: 800 }),
        label("n2", 320, 90, "→ 4", { size: 14, weight: 800 }),
        label("n3", 430, 90, "→ 1", { size: 14, weight: 800 }),
        label("n4", 320, 150, "n items need about log₂(n) steps", { size: 13, tone: "muted" }),
        label("n5", 320, 195, "1,000,000 items → about 20 steps", {
          size: 13,
          weight: 800,
          tone: "good",
        }),
      ),
    },
  ],
};
