/**
 * Step generators: each runs the example solution on its sample input and records a snapshot
 * after every interesting line, so the visualizer can play it back. `line` indexes the code
 * lines in data.ts.
 */

export interface Step<State> {
  line: number;
  caption: string;
  state: State;
}

/* ---------- Two Pointers · LeetCode 167 ---------- */

export const TWO_POINTERS_INPUT = { numbers: [1, 3, 4, 6, 8, 11, 14], target: 17 };

export interface TwoPointersState {
  left: number;
  right: number;
  sum: number | null;
  found: boolean;
}

export function twoPointersSteps(): Step<TwoPointersState>[] {
  const { numbers, target } = TWO_POINTERS_INPUT;
  const steps: Step<TwoPointersState>[] = [];
  let left = 0;
  let right = numbers.length - 1;
  steps.push({
    line: 1,
    caption: `Put left at the start (index 0) and right at the end (index ${right}).`,
    state: { left, right, sum: null, found: false },
  });
  while (left < right) {
    const sum = numbers[left] + numbers[right];
    steps.push({
      line: 3,
      caption: `${numbers[left]} + ${numbers[right]} = ${sum}. Target is ${target}.`,
      state: { left, right, sum, found: false },
    });
    if (sum === target) {
      steps.push({
        line: 4,
        caption: `Found it: indices ${left + 1} and ${right + 1} (1-based).`,
        state: { left, right, sum, found: true },
      });
      return steps;
    }
    if (sum < target) {
      left++;
      steps.push({
        line: 5,
        caption: `${sum} is too small. Only a bigger left value can help, so move left → ${left}.`,
        state: { left, right, sum: null, found: false },
      });
    } else {
      right--;
      steps.push({
        line: 6,
        caption: `${sum} is too big. Only a smaller right value can help, so move right → ${right}.`,
        state: { left, right, sum: null, found: false },
      });
    }
  }
  return steps;
}

/* ---------- Sliding Window · LeetCode 3 ---------- */

export const SLIDING_INPUT = "abcabcbb";

export interface SlidingState {
  left: number;
  right: number;
  seen: string[];
  best: number;
  /** Index being dropped from the window this step. */
  dropping: number | null;
  done: boolean;
}

export function slidingWindowSteps(): Step<SlidingState>[] {
  const s = SLIDING_INPUT;
  const steps: Step<SlidingState>[] = [];
  const seen = new Set<string>();
  let left = 0;
  let best = 0;
  const snap = (right: number, extra: Partial<SlidingState> = {}): SlidingState => ({
    left,
    right,
    seen: [...seen],
    best,
    dropping: null,
    done: false,
    ...extra,
  });
  steps.push({
    line: 2,
    caption: "Empty window, empty set, best = 0.",
    state: snap(-1),
  });
  for (let right = 0; right < s.length; right++) {
    steps.push({
      line: 3,
      caption: `Look at s[${right}] = "${s[right]}".`,
      state: snap(right),
    });
    while (seen.has(s[right])) {
      steps.push({
        line: 5,
        caption: `"${s[right]}" is already in the window. Drop s[${left}] = "${s[left]}" from the left.`,
        state: snap(right, { dropping: left }),
      });
      seen.delete(s[left]);
      left++;
    }
    seen.add(s[right]);
    const length = right - left + 1;
    const improved = length > best;
    best = Math.max(best, length);
    steps.push({
      line: 9,
      caption: improved
        ? `Window "${s.slice(left, right + 1)}" has length ${length}. New best!`
        : `Window "${s.slice(left, right + 1)}" has length ${length}. Best stays ${best}.`,
      state: snap(right),
    });
  }
  steps.push({
    line: 11,
    caption: `Done. The longest substring without repeats has length ${best}.`,
    state: snap(s.length - 1, { done: true }),
  });
  return steps;
}

/* ---------- Binary Search · LeetCode 704 ---------- */

export const BINARY_INPUT = { nums: [-1, 0, 3, 5, 9, 12, 15, 20], target: 12 };

export interface BinaryState {
  lo: number;
  hi: number;
  mid: number | null;
  found: boolean;
}

export function binarySearchSteps(): Step<BinaryState>[] {
  const { nums, target } = BINARY_INPUT;
  const steps: Step<BinaryState>[] = [];
  let lo = 0;
  let hi = nums.length - 1;
  steps.push({
    line: 1,
    caption: `The answer, if it exists, is somewhere in [${lo}, ${hi}].`,
    state: { lo, hi, mid: null, found: false },
  });
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    steps.push({
      line: 3,
      caption: `Middle of [${lo}, ${hi}] is index ${mid}, value ${nums[mid]}.`,
      state: { lo, hi, mid, found: false },
    });
    if (nums[mid] === target) {
      steps.push({
        line: 4,
        caption: `${nums[mid]} is the target. Return index ${mid}.`,
        state: { lo, hi, mid, found: true },
      });
      return steps;
    }
    if (nums[mid] < target) {
      lo = mid + 1;
      steps.push({
        line: 5,
        caption: `${nums[mid]} < ${target}: the whole left half is too small. lo → ${lo}.`,
        state: { lo, hi, mid: null, found: false },
      });
    } else {
      hi = mid - 1;
      steps.push({
        line: 6,
        caption: `${nums[mid]} > ${target}: the whole right half is too big. hi → ${hi}.`,
        state: { lo, hi, mid: null, found: false },
      });
    }
  }
  return steps;
}

/* ---------- Hash Map · LeetCode 1 ---------- */

export const HASH_INPUT = { nums: [3, 8, 2, 11, 7, 5], target: 9 };

export interface HashState {
  i: number;
  need: number | null;
  map: Array<[number, number]>;
  /** Index of the matching partner once found. */
  match: number | null;
}

export function hashMapSteps(): Step<HashState>[] {
  const { nums, target } = HASH_INPUT;
  const steps: Step<HashState>[] = [];
  const seen = new Map<number, number>();
  steps.push({
    line: 1,
    caption: "Start with an empty map of value → index.",
    state: { i: -1, need: null, map: [], match: null },
  });
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    steps.push({
      line: 3,
      caption: `nums[${i}] = ${nums[i]}. Its partner would be ${target} − ${nums[i]} = ${need}.`,
      state: { i, need, map: [...seen], match: null },
    });
    if (seen.has(need)) {
      const match = seen.get(need) ?? -1;
      steps.push({
        line: 4,
        caption: `${need} is in the map at index ${match}. Answer: [${match}, ${i}].`,
        state: { i, need, map: [...seen], match },
      });
      return steps;
    }
    seen.set(nums[i], i);
    steps.push({
      line: 5,
      caption: `${need} has not been seen yet. Remember ${nums[i]} → ${i} and move on.`,
      state: { i, need, map: [...seen], match: null },
    });
  }
  return steps;
}

/* ---------- BFS · LeetCode 200 ---------- */

export const GRID_INPUT = ["11000", "11010", "00100", "00011"];

export interface GridState {
  /** 0 = water, -1 = land not visited yet, n > 0 = belongs to island n. */
  cells: number[][];
  scan: [number, number] | null;
  current: [number, number] | null;
  queue: Array<[number, number]>;
  count: number;
}

export function bfsSteps(): Step<GridState>[] {
  const rows = GRID_INPUT.length;
  const cols = GRID_INPUT[0].length;
  const cells: number[][] = GRID_INPUT.map((row) => [...row].map((ch) => (ch === "1" ? -1 : 0)));
  const steps: Step<GridState>[] = [];
  let count = 0;
  const snap = (
    scan: [number, number] | null,
    current: [number, number] | null,
    queue: Array<[number, number]>,
  ): GridState => ({
    cells: cells.map((row) => [...row]),
    scan,
    current,
    queue: queue.map(([y, x]) => [y, x]),
    count,
  });
  const neighbours: Array<[number, number]> = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  steps.push({
    line: 1,
    caption: "Scan the grid cell by cell. count = 0.",
    state: snap(null, null, []),
  });
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (cells[r][c] !== -1) {
        steps.push({
          line: 4,
          caption:
            cells[r][c] === 0
              ? `(${r}, ${c}) is water. Skip.`
              : `(${r}, ${c}) already belongs to island ${cells[r][c]}. Skip.`,
          state: snap([r, c], null, []),
        });
        continue;
      }
      count++;
      cells[r][c] = count;
      const queue: Array<[number, number]> = [[r, c]];
      steps.push({
        line: 6,
        caption: `New land at (${r}, ${c}). That's island #${count}. Start a BFS from here.`,
        state: snap([r, c], null, queue),
      });
      while (queue.length) {
        const [y, x] = queue.shift() as [number, number];
        const added: string[] = [];
        for (const [dy, dx] of neighbours) {
          const ny = y + dy;
          const nx = x + dx;
          if (cells[ny]?.[nx] !== -1) continue;
          cells[ny][nx] = count;
          queue.push([ny, nx]);
          added.push(`(${ny}, ${nx})`);
        }
        steps.push({
          line: added.length ? 11 : 8,
          caption: added.length
            ? `Visit (${y}, ${x}). Land next door: ${added.join(", ")}. Mark and queue them.`
            : `Visit (${y}, ${x}). No unvisited land around it.`,
          state: snap([r, c], [y, x], queue),
        });
      }
      steps.push({
        line: 7,
        caption: `Queue is empty: island #${count} is fully explored.`,
        state: snap([r, c], null, []),
      });
    }
  }
  steps.push({
    line: 16,
    caption: `Done. There are ${count} islands.`,
    state: snap(null, null, []),
  });
  return steps;
}

/* ---------- Dynamic Programming · LeetCode 198 ---------- */

export const DP_INPUT = [2, 7, 9, 3, 1];

export interface DpState {
  /** dp[i] = most money from the first i houses; null = not filled yet. */
  dp: Array<number | null>;
  i: number | null;
  skip: number | null;
  take: number | null;
  done: boolean;
}

export function dpSteps(): Step<DpState>[] {
  const nums = DP_INPUT;
  const steps: Step<DpState>[] = [];
  const dp: Array<number | null> = [0, ...nums.map(() => null)];
  const snap = (extra: Partial<DpState> = {}): DpState => ({
    dp: [...dp],
    i: null,
    skip: null,
    take: null,
    done: false,
    ...extra,
  });
  steps.push({
    line: 1,
    caption: "dp[i] = the most money from the first i houses. With no houses, dp[0] = 0.",
    state: snap({ i: 0 }),
  });
  dp[1] = nums[0];
  steps.push({
    line: 2,
    caption: `With only house 1, rob it: dp[1] = ${nums[0]}.`,
    state: snap({ i: 1 }),
  });
  for (let i = 2; i <= nums.length; i++) {
    const skip = dp[i - 1] ?? 0;
    const take = (dp[i - 2] ?? 0) + nums[i - 1];
    steps.push({
      line: 5,
      caption: `House ${i} holds ${nums[i - 1]}. Skip it → keep dp[${i - 1}] = ${skip}. Take it → dp[${i - 2}] + ${nums[i - 1]} = ${take}.`,
      state: snap({ i, skip, take }),
    });
    dp[i] = Math.max(skip, take);
    steps.push({
      line: 6,
      caption:
        take > skip
          ? `Taking wins: dp[${i}] = ${take}.`
          : `Skipping is at least as good: dp[${i}] = ${skip}.`,
      state: snap({ i, skip, take }),
    });
  }
  steps.push({
    line: 8,
    caption: `Done. The most you can rob is dp[${nums.length}] = ${dp[nums.length]}.`,
    state: snap({ i: nums.length, done: true }),
  });
  return steps;
}

/* ---------- Backtracking · LeetCode 78 ---------- */

export const BACKTRACK_INPUT = [1, 2, 3];

export interface BacktrackState {
  /** Indices currently on the path. */
  path: number[];
  start: number;
  result: number[][];
  /** Index just pushed or popped this step. */
  touched: number | null;
  action: "start" | "record" | "push" | "pop" | "done";
}

export function backtrackSteps(): Step<BacktrackState>[] {
  const nums = BACKTRACK_INPUT;
  const steps: Step<BacktrackState>[] = [];
  const result: number[][] = [];
  const path: number[] = [];
  const snap = (
    start: number,
    action: BacktrackState["action"],
    touched: number | null = null,
  ): BacktrackState => ({
    path: [...path],
    start,
    result: result.map((r) => [...r]),
    touched,
    action,
  });
  const show = (indices: number[]) => `[${indices.map((i) => nums[i]).join(", ")}]`;

  steps.push({
    line: 11,
    caption: "Start with an empty path and call backtrack(0).",
    state: snap(0, "start"),
  });
  const backtrack = (start: number) => {
    result.push(path.map((i) => nums[i]));
    steps.push({
      line: 4,
      caption: `Every path is a subset: record ${show(path)}. (${result.length} so far)`,
      state: snap(start, "record"),
    });
    for (let i = start; i < nums.length; i++) {
      path.push(i);
      steps.push({
        line: 6,
        caption: `Choose ${nums[i]}. Path is now ${show(path)}; explore from index ${i + 1}.`,
        state: snap(i + 1, "push", i),
      });
      backtrack(i + 1);
      path.pop();
      steps.push({
        line: 8,
        caption: `Everything starting with ${show([...path, i])} is done. Undo: pop ${nums[i]}.`,
        state: snap(i + 1, "pop", i),
      });
    }
  };
  backtrack(0);
  steps.push({
    line: 12,
    caption: `Done. ${result.length} subsets, each found exactly once.`,
    state: snap(nums.length, "done"),
  });
  return steps;
}

/* ---------- Heap · LeetCode 215 ---------- */

export const HEAP_INPUT = { nums: [3, 2, 1, 5, 6, 4], k: 2 };

export interface HeapState {
  i: number;
  /** The min-heap as an array: children of n sit at 2n + 1 and 2n + 2. */
  heap: number[];
  popped: number | null;
  done: boolean;
}

function heapPush(heap: number[], value: number) {
  heap.push(value);
  let n = heap.length - 1;
  while (n > 0) {
    const parent = (n - 1) >> 1;
    if (heap[parent] <= heap[n]) break;
    [heap[parent], heap[n]] = [heap[n], heap[parent]];
    n = parent;
  }
}

function heapPop(heap: number[]): number {
  const top = heap[0];
  const last = heap.pop() as number;
  if (heap.length) {
    heap[0] = last;
    let n = 0;
    for (;;) {
      const l = 2 * n + 1;
      const r = l + 1;
      let small = n;
      if (l < heap.length && heap[l] < heap[small]) small = l;
      if (r < heap.length && heap[r] < heap[small]) small = r;
      if (small === n) break;
      [heap[small], heap[n]] = [heap[n], heap[small]];
      n = small;
    }
  }
  return top;
}

export function heapSteps(): Step<HeapState>[] {
  const { nums, k } = HEAP_INPUT;
  const steps: Step<HeapState>[] = [];
  const heap: number[] = [];
  steps.push({
    line: 1,
    caption: `Empty min-heap. It will hold at most k = ${k} numbers: the ${k} largest seen so far.`,
    state: { i: -1, heap: [], popped: null, done: false },
  });
  nums.forEach((num, i) => {
    heapPush(heap, num);
    steps.push({
      line: 3,
      caption: `Push ${num}. The smallest number always floats to the top: top = ${heap[0]}.`,
      state: { i, heap: [...heap], popped: null, done: false },
    });
    if (heap.length > k) {
      const popped = heapPop(heap);
      steps.push({
        line: 4,
        caption: `${heap.length + 1} > k, so pop the top (${popped}). It can't be among the ${k} largest.`,
        state: { i, heap: [...heap], popped, done: false },
      });
    }
  });
  steps.push({
    line: 6,
    caption: `Done. The heap holds the ${k} largest; its top, ${heap[0]}, is the k-th largest (k = ${k}).`,
    state: { i: nums.length, heap: [...heap], popped: null, done: true },
  });
  return steps;
}

/* ---------- Monotonic Stack · LeetCode 739 ---------- */

export const MONO_INPUT = [73, 74, 75, 71, 69, 72, 76, 73];

export interface MonoState {
  i: number;
  /** Indices on the stack, bottom first. */
  stack: number[];
  answer: Array<number | null>;
  popped: number | null;
  done: boolean;
}

export function monoStackSteps(): Step<MonoState>[] {
  const temps = MONO_INPUT;
  const steps: Step<MonoState>[] = [];
  const answer: Array<number | null> = temps.map(() => null);
  const stack: number[] = [];
  const snap = (i: number, popped: number | null = null, done = false): MonoState => ({
    i,
    stack: [...stack],
    answer: [...answer],
    popped,
    done,
  });
  steps.push({
    line: 2,
    caption: "The stack holds days still waiting for a warmer one. Their temps only go down.",
    state: snap(-1),
  });
  for (let i = 0; i < temps.length; i++) {
    while (stack.length && temps[i] > temps[stack[stack.length - 1]]) {
      const j = stack.pop() as number;
      answer[j] = i - j;
      steps.push({
        line: 6,
        caption: `${temps[i]} > ${temps[j]}: day ${j} finally got a warmer day. Pop it, answer[${j}] = ${i} − ${j} = ${i - j}.`,
        state: snap(i, j),
      });
    }
    const top = stack[stack.length - 1];
    stack.push(i);
    steps.push({
      line: 8,
      caption:
        top === undefined
          ? `Day ${i} (${temps[i]}): nothing left to compare with. Push it and wait.`
          : `Day ${i} (${temps[i]}) is not warmer than ${temps[top]} below it. Push it and wait.`,
      state: snap(i),
    });
  }
  stack.forEach((j) => (answer[j] = 0));
  steps.push({
    line: 10,
    caption: `Done. Days still on the stack never got warmer, so they stay 0.`,
    state: snap(temps.length, null, true),
  });
  return steps;
}

/* ---------- Union-Find · LeetCode 684 ---------- */

export const UNION_INPUT: Array<[number, number]> = [
  [1, 2],
  [2, 3],
  [3, 4],
  [1, 4],
  [1, 5],
];

export interface UnionState {
  parent: number[];
  edge: number;
  /** Nodes on the path just walked by find, or just joined. */
  active: number[];
  found: boolean;
}

export function unionFindSteps(): Step<UnionState>[] {
  const edges = UNION_INPUT;
  const steps: Step<UnionState>[] = [];
  const parent = Array.from({ length: edges.length + 1 }, (_, i) => i);
  const snap = (edge: number, active: number[] = [], found = false): UnionState => ({
    parent: [...parent],
    edge,
    active,
    found,
  });
  const walk = (x: number) => {
    const chain = [x];
    while (parent[chain[chain.length - 1]] !== chain[chain.length - 1]) {
      chain.push(parent[chain[chain.length - 1]]);
    }
    return chain;
  };

  steps.push({
    line: 1,
    caption: "Every node starts as its own group: parent[x] = x.",
    state: snap(-1),
  });
  for (let e = 0; e < edges.length; e++) {
    const [a, b] = edges[e];
    const chainA = walk(a);
    const chainB = walk(b);
    const ra = chainA[chainA.length - 1];
    const rb = chainB[chainB.length - 1];
    steps.push({
      line: 5,
      caption: `Edge [${a}, ${b}]: find(${a}) walks ${chainA.join(" → ")}, find(${b}) walks ${chainB.join(" → ")}.`,
      state: snap(e, [...chainA, ...chainB]),
    });
    const compressed = [...chainA.slice(0, -2), ...chainB.slice(0, -2)];
    if (compressed.length) {
      for (const x of chainA.slice(0, -1)) parent[x] = ra;
      for (const x of chainB.slice(0, -1)) parent[x] = rb;
      steps.push({
        line: 3,
        caption: `Path compression: ${compressed.join(", ")} now point straight at root ${ra}. Next find is one hop.`,
        state: snap(e, compressed),
      });
    }
    if (ra === rb) {
      steps.push({
        line: 6,
        caption: `${a} and ${b} already share root ${ra}. This edge closes a cycle: return [${a}, ${b}].`,
        state: snap(e, [a, b], true),
      });
      return steps;
    }
    parent[ra] = rb;
    steps.push({
      line: 7,
      caption: `Different roots, so join the groups: parent[${ra}] = ${rb}.`,
      state: snap(e, [ra, rb]),
    });
  }
  return steps;
}
