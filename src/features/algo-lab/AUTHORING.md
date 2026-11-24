# Writing an Algo Lab lesson

A lesson is one TypeScript file in `src/features/algo-lab/lessons/<id>.ts`. It is plain data: a
title, goals, and a list of steps. Each step has some text and a **scene** (what the stage draws).
The page animates between consecutive scenes, so a lesson reads like a flip-book.

Read these first: `lib/types.ts` (the item types), `lib/scenes.ts` (the helpers), and the three
finished lessons `lessons/binary-search.ts` (row + pointers), `lessons/stacks.ts` (stack),
`lessons/tree-traversals.ts` (tree + tones). Match their depth and tone.

## File shape

```ts
import { label, ptr, row, scene } from "../lib/scenes"; // only what you use
import type { AlgoLesson } from "../lib/types";

export const binarySearch: AlgoLesson = {
  id: "binary-search", // must equal the file name without .ts
  title: "Binary Search",
  summary: "One sentence, at most 110 characters.",
  minutes: 10,
  level: "beginner", // "beginner" | "intermediate" | "advanced"
  goals: ["3 to 5 noun phrases: 'How X works', 'Why Y'"],
  takeaways: ["exactly 3 sentences"],
  hud: [{ label: "Comparisons", icon: "swap" }], // 3 to 5 chips, see below
  steps: [{ short, title, body, callout?, metrics?, chapter?, scene }],
};
```

The export must be written exactly as `export const <camelCaseName>: AlgoLesson = {` (the page's
data file is generated from it).

## Steps

- 6 to 10 steps (7 to 9 is typical). `short` is the timeline label: 1 to 14 characters, unique.
- Step 1 states the problem and shows the starting data. Middle steps run the idea on a small
  concrete input, one move per step (one comparison, one swap, one pointer move, one recursive
  call). Include the trade-offs, a pitfall or edge case, and the cost (time and space). The last
  step is a recap: the decision rule or the complexity.
- `body`: 1 to 3 short paragraphs (1 to 3 sentences each). Put code, indexes, values and names of
  variables in backticks. Explain WHY, with the numbers visible on the stage.
- `callout` on roughly half the steps: `{ kind: "insight" | "tip" | "warn", text }`, mixed.
- `chapter` is optional; a worked example can use `{ label: "Case", tone: "amber" }`
  (tones: "red" | "amber" | "blue" | "green" | "ink").
- Original wording only; do not copy text from any website or book. Be technically exact.

## Pseudocode and highlighted lines

A lesson can carry `pseudocode: string[]`: 6 to 14 short lines (at most 64 characters) shown in a dark
"Pseudocode" card beside the stage. Write it like the lesson's idea in plain steps, indented with 4
spaces per level (`"search(a, x):"`, `"    while lo <= hi:"`). The first line is the function header. Words
like `for`, `while`, `if`, `else`, `return`, `repeat`, `in`, `and`, `or`, `not` are coloured.

Each step then says which lines it is about with `lines: [3, 4]` (1-based line numbers); every other
line dims while those stay lit. Leave `lines` out of steps that are not about the code (the opening
problem, a recap, a pitfall in prose). Add `pseudocode` right after `hud`, and `lines` right after
`metrics` (or after `callout`) in each step.

## The hud chips and metrics

`hud` is a row of 3 to 5 chips shown over the stage for the whole lesson: `{ label, icon }` with
icon one of `list grid branch swap search memory sigma bolt check hourglass timer gauge layers
database queue shield alert users link server globe download`. Each step may set `metrics:
[{ label, value, level? }]` (label must match a chip; level `"good" | "warn" | "bad"` tints it).
Make them tell a numeric story: comparisons so far, items left, swaps, size, memory, total cost.
A chip a step does not set shows "—".

## Scenes

`scene(...parts)` builds a scene from items and lists of items; `false`/`null`/`""` parts are
skipped, so `cond && ptr(...)` works. An **item** is one of:

| helper                               | what it draws                                                                                                                                                           |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cell(id, x, y, text, opts)`         | a keycap block (array slot, stack entry, bar). `x, y` = centre. `w`, `h`, `sub` (small caption below, e.g. an index), `tone`, `base` (y is the bottom, so `h` grows up) |
| `disc(id, x, y, text, opts)`         | a round node (tree/graph). `r`, `sub`, `tone`                                                                                                                           |
| `edge(id, from, to, opts)`           | a line between two items **by id**: `arrow: "end" \| "both" \| "none"`, `tone`, `label`, `dashed`                                                                       |
| `ptr(id, at, text, opts)`            | an arrow + pill pointing at an item id (or `{x, y}`): `side: "below" \| "above" \| "left" \| "right"`, `tone`                                                           |
| `label(id, x, y, text, opts)`        | free text: `size`, `anchor`, `tone: "ink" \| "muted" \| "warn" \| "good"`, `weight`                                                                                     |
| `frame(id, x, y, w, h, text?, opts)` | a dashed outline around a region (a window, a subarray, a memory block); `x, y` = top-left                                                                              |

Layout helpers return lists of items: `row(values, opts)`, `bars(values, opts)`, `stack(values,
opts)`, `matrix(rows, opts)`, `linked(values, opts)` (nodes joined by arrows, `doubly`, `circular`,
`tail`), `tree(levelOrder, opts)` (`null` leaves a gap), `graph(nodes, edges, opts)`. Their ids:
`row` `${id}${key}` (default id `a`, key = index), `bars` `b${key}`, `stack` `s${key}`, `matrix`
`m${r}-${c}`, `linked` `n${key}`, `tree` `t${levelOrderIndex}`, `graph` `g${name}`. Pass a
different `id` prefix when a scene has two rows (e.g. `row(x, { id: "a" })`, `row(y, { id: "b" })`).

**Tones** (`tone`): `plain` (default), `active` (the thing being looked at or compared right now),
`found` (the answer / success), `done` (settled, processed, in its final place), `mark` (special:
pivot, visited, chosen), `warn` (conflict, problem, rejected), `muted` (discarded, out of range),
`ghost` (an empty slot). Edge tones: `plain active found warn muted`.

### Make it move

Items keep their identity across steps **by id**. If the same id appears in the next step at a
new x/y, it slides there; a new tone fades in; a pointer with the same id glides to its new
target. So:

- Give things that persist the SAME id in every step (pointers `"i"`, `"lo"`, `"mid"`; labels).
- For elements that get reordered (sorting, swaps, a queue shifting), pass `keys` to `row`/`stack`
  so each element keeps its id when its position changes: `row(values, { keys: values })`.
- Build each step from one small function of the state (`view(lo, hi, mid)`) like
  `binary-search.ts` does, instead of writing every step by hand.

### Layout

The camera zooms to fit whatever is on stage, so coordinates are free; think of a 640 x 300 area
centred on x = 320. A `row` of N default cells is `60 * N - 8` wide (9 cells is 532): for more than
9 use `w: 38`, or two rows. Cells are 52 x 46 by default. Keep cell text to 3 characters when you
can (14 is the limit; long text shrinks); keep disc text to 4. A tree of 4 levels fits `width: 360`.
Spread graph nodes over about 480 x 240. Pointers sit 26 px beyond their target on the chosen side;
two pointers on the same side of the same cell collide, so merge them (`"i = j"`) or use
`side: "above"` for one. Do not place items on top of each other (the validator warns).
Use `label` for captions, equations and running results, near y = 60 (above) or y = 250+ (below).

## Check your work

```
node scripts/validate-algo-lessons.mjs <id> <id> ...   # errors AND warnings about your lessons must be fixed
npx prettier --write src/features/algo-lab/lessons/<files>
npm run typecheck                                       # fix errors in your files
```

(Node prints a harmless "MODULE_TYPELESS_PACKAGE_JSON" warning.) Do not edit any file other than
your lesson files; `data.ts` is generated by `node scripts/gen-algo-data.mjs`.
