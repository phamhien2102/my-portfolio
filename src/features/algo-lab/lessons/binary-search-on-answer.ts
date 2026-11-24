import { label, ptr, row, scene } from "../lib/scenes";
import type { AlgoLesson, Tone } from "../lib/types";

const W = [3, 2, 2, 4, 1, 4];
const CAPS = Array.from({ length: 13 }, (_, i) => i + 4); // capacities 4..16
const DAY_TONES: Tone[] = ["active", "mark", "done", "warn"];

/** Greedy packing: which day each package ships on when the ship carries at most `cap` per day. */
function pack(cap: number) {
  let day = 0;
  let load = 0;
  const group = W.map((w) => {
    if (load + w > cap) {
      day++;
      load = 0;
    }
    load += w;
    return day;
  });
  return { days: day + 1, group };
}

interface View {
  lo?: number;
  hi?: number;
  mid?: number;
  msg: string;
  found?: boolean;
}

/** The packages (coloured by shipping day for the capacity being tested) above the range of answers. */
function view({ lo, hi, mid, msg, found }: View) {
  const showCaps = lo !== undefined && hi !== undefined;
  const g = mid === undefined ? undefined : pack(mid).group;
  const at = (c: number) => `c${c - 4}`;
  return scene(
    row(W, {
      id: "w",
      y: 55,
      w: 40,
      h: 38,
      gap: 6,
      tones: (i) => (g ? DAY_TONES[g[i]] : undefined),
    }),
    label("msg", 320, 120, msg, { size: 13, weight: 800, tone: found ? "good" : "ink" }),
    showCaps &&
      row(CAPS, {
        id: "c",
        y: 205,
        w: 38,
        h: 40,
        gap: 4,
        tones: (i) => {
          const c = i + 4;
          if (c < lo || c > hi) return "muted";
          return c === mid ? (found ? "found" : "active") : undefined;
        },
      }),
    showCaps &&
      (lo === hi
        ? ptr("lo", at(lo), "lo = hi")
        : [ptr("lo", at(lo), "lo"), ptr("hi", at(hi), "hi")]),
    showCaps && mid !== undefined && ptr("mid", at(mid), "mid", { side: "above", tone: "active" }),
  );
}

export const binarySearchOnAnswer: AlgoLesson = {
  id: "binary-search-on-answer",
  title: "Binary Search on the Answer",
  summary:
    "Search the range of possible answers with a yes/no check instead of searching an array.",
  minutes: 13,
  level: "advanced",
  goals: [
    "Why the answer itself can be the thing you binary search",
    "What a monotonic feasibility check is",
    "How to pick the lo and hi bounds of the answer range",
    "Why the loop keeps mid on the feasible side",
  ],
  takeaways: [
    "If you can test whether a value works, and every larger value also works, binary search finds the smallest one that does.",
    "Bound the answer between the obvious minimum and a value that surely works, then halve the range with the check.",
    "The cost is the number of halvings times the cost of one check, here log(range) times O(n).",
  ],
  hud: [
    { label: "Checks", icon: "search" },
    { label: "Range size", icon: "list" },
    { label: "Days needed", icon: "timer" },
    { label: "Cost", icon: "gauge" },
  ],
  pseudocode: [
    "smallest_capacity(weights, days):",
    "    lo = max(weights), hi = sum(weights)",
    "    while lo < hi:",
    "        mid = (lo + hi) / 2",
    "        if days_needed(weights, mid) <= days:",
    "            hi = mid",
    "        else:",
    "            lo = mid + 1",
    "    return lo",
  ],
  steps: [
    {
      short: "The problem",
      title: "Ship it in 3 days",
      body: [
        "Six packages weigh `3, 2, 2, 4, 1, 4`. They must ship in this order, and a ship leaves every day carrying whole packages up to its capacity.",
        "What is the smallest capacity that gets everything delivered within `3` days? Nothing here is sorted, so there is no array to search.",
      ],
      callout: {
        kind: "insight",
        text: "The thing we are looking for is a number (the capacity), not a position in a list.",
      },
      metrics: [{ label: "Days needed", value: "?", level: "warn" }],
      scene: view({ msg: "packages in order, at most 3 days: smallest capacity?" }),
    },
    {
      short: "Bounds",
      title: "The answer lives in a range",
      body: [
        "The capacity cannot be below `4`, the heaviest package, or that package would never fit. It never needs to exceed `16`, the total weight: one day carries everything.",
        "So the answer is somewhere in `4..16`. That is 13 candidates, and we want the smallest one that works.",
      ],
      metrics: [
        { label: "Range size", value: "13", level: "warn" },
        { label: "Checks", value: "0", level: "good" },
      ],
      lines: [2],
      scene: view({ lo: 4, hi: 16, msg: "candidate capacities 4 to 16" }),
    },
    {
      short: "Check 10",
      title: "Test the middle capacity",
      body: [
        "Try `mid = 10`. Load packages greedily: `3 + 2 + 2 = 7`, and a `4` more would make 11, so start day 2 with `4 + 1 + 4 = 9`.",
        "That takes 2 days, within the limit of 3, so capacity 10 works. Any bigger ship also works, so the answer is at most 10.",
      ],
      callout: {
        kind: "tip",
        text: "The check is a plain greedy scan: fill a day until the next package does not fit, then start a new day.",
      },
      metrics: [
        { label: "Checks", value: "1", level: "good" },
        { label: "Days needed", value: "2", level: "good" },
        { label: "Range size", value: "13", level: "warn" },
      ],
      lines: [4, 5, 6],
      scene: view({ lo: 4, hi: 16, mid: 10, msg: "capacity 10 -> 2 days (3 allowed): works" }),
    },
    {
      short: "Check 7",
      title: "Feasible, so keep mid",
      body: [
        "Since 10 works, set `hi = 10`. We keep `mid` itself because it may be the smallest working value; `hi = mid - 1` could throw the answer away.",
        "The new middle is `(4 + 10) / 2 = 7`. Days: `3 + 2 + 2 = 7`, then `4 + 1 = 5`, then `4`: 3 days, still allowed.",
      ],
      metrics: [
        { label: "Checks", value: "2", level: "good" },
        { label: "Days needed", value: "3", level: "good" },
        { label: "Range size", value: "7", level: "good" },
      ],
      lines: [6, 4, 5],
      scene: view({ lo: 4, hi: 10, mid: 7, msg: "capacity 7 -> 3 days (3 allowed): works" }),
    },
    {
      short: "Check 5",
      title: "Too small: 4 days",
      body: [
        "Now `hi = 7` and the middle is `(4 + 7) / 2 = 5`. Packing gives `3 + 2`, then `2`, then `4 + 1`, then `4`.",
        "That is 4 days, more than the 3 allowed. Capacity 5 fails, and so does everything below it, because a smaller ship can only need more days.",
      ],
      callout: {
        kind: "insight",
        text: "Failure at 5 rules out 4 as well. Feasibility only flips once, from no to yes, as capacity grows.",
      },
      metrics: [
        { label: "Checks", value: "3", level: "good" },
        { label: "Days needed", value: "4", level: "bad" },
        { label: "Range size", value: "4", level: "good" },
      ],
      lines: [5, 7, 8],
      scene: view({ lo: 4, hi: 7, mid: 5, msg: "capacity 5 -> 4 days (3 allowed): too small" }),
    },
    {
      short: "Check 6",
      title: "Infeasible, so skip mid",
      body: [
        "Since 5 fails, set `lo = mid + 1 = 6`. Unlike the feasible case, mid is known to be wrong, so we step past it.",
        "Test `mid = (6 + 7) / 2 = 6`: `3 + 2`, then `2 + 4`, then `1 + 4`. That is exactly 3 days, so 6 works.",
      ],
      metrics: [
        { label: "Checks", value: "4", level: "good" },
        { label: "Days needed", value: "3", level: "good" },
        { label: "Range size", value: "2", level: "good" },
      ],
      lines: [8, 4, 5],
      scene: view({ lo: 6, hi: 7, mid: 6, msg: "capacity 6 -> 3 days (3 allowed): works" }),
    },
    {
      short: "Answer",
      title: "lo meets hi",
      body: [
        "Capacity 6 works, so `hi = 6`, and `lo` is already 6. The range holds one value, and the loop `while (lo < hi)` stops.",
        "The smallest capacity is `6`. Four checks settled a range of 13 candidates.",
      ],
      metrics: [
        { label: "Checks", value: "4", level: "good" },
        { label: "Range size", value: "1", level: "good" },
      ],
      lines: [3, 9],
      scene: view({ lo: 6, hi: 6, mid: 6, msg: "smallest capacity = 6", found: true }),
    },
    {
      short: "Monotonic",
      title: "Why this works",
      body: [
        "Every capacity below 6 fails and every capacity from 6 up works. That single boundary between 'no' and 'yes' is what binary search needs, just like a sorted array has a boundary around the target.",
        "If the check were not monotonic (a bigger value could fail where a smaller one worked), halving would be unsafe.",
      ],
      callout: {
        kind: "warn",
        text: "Before using this pattern, argue why the check can only flip once. If you cannot, the pattern does not apply.",
      },
      metrics: [{ label: "Checks", value: "4", level: "good" }],
      scene: scene(
        row(CAPS, {
          id: "c",
          y: 150,
          w: 38,
          h: 40,
          gap: 4,
          tones: (i) => (i + 4 < 6 ? "warn" : "found"),
        }),
        label("no", 190, 95, "fails: too small", { size: 12, tone: "warn" }),
        label("yes", 450, 95, "works: big enough", { size: 12, tone: "good" }),
        ptr("ans", "c2", "smallest yes", { tone: "found" }),
      ),
    },
    {
      short: "Same trick",
      title: "Another disguise",
      body: [
        "Koko eats from piles `3, 6, 7, 11` and has `H = 8` hours. What is the slowest speed (bananas per hour) that finishes in time? The check sums `ceil(pile / speed)` over the piles.",
        "Speed 4 takes `1 + 2 + 2 + 3 = 8` hours, fine; speed 3 takes `1 + 2 + 3 + 4 = 10`, too slow. Search speeds `1..11` the same way: the answer is 4.",
      ],
      callout: {
        kind: "tip",
        text: "Total cost is O(n log R): about log2(R) checks over a range of size R, each scanning n items.",
      },
      metrics: [
        { label: "Cost", value: "O(n log R)", level: "good" },
        { label: "Checks", value: "log R", level: "good" },
      ],
      scene: scene(
        row([3, 6, 7, 11], { id: "p", y: 75 }),
        label("l1", 320, 150, "speed 3: 1 + 2 + 3 + 4 = 10 hours (limit 8): too slow", {
          size: 13,
          tone: "warn",
        }),
        label("l2", 320, 185, "speed 4: 1 + 2 + 2 + 3 = 8 hours (limit 8): works", {
          size: 13,
          weight: 800,
          tone: "good",
        }),
        label("l3", 320, 240, "smallest working speed = 4", { size: 14, weight: 800 }),
      ),
    },
  ],
};
