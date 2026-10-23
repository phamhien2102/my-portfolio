export type Difficulty = "Easy" | "Medium" | "Hard";

export interface LeetCodeProblem {
  id: number;
  title: string;
  slug: string;
  difficulty: Difficulty;
}

export interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface Pattern {
  slug: PatternSlug;
  level: PatternLevel;
  name: string;
  tagline: string;
  /** Accent colour for the card and the visualizer. */
  accent: string;
  /** A short glyph shown on the card. */
  glyph: string;
  whenToUse: readonly string[];
  idea: string;
  complexity: { time: string; space: string };
  /** The problem the visualizer walks through. */
  example: LeetCodeProblem & {
    statement: string;
    /** The input the visualizer walks through. */
    input: string;
    /** The examples from the LeetCode problem statement. */
    examples: readonly ProblemExample[];
  };
  /** The example solution, one string per line; steps point at these lines by index. */
  code: readonly string[];
  practice: readonly LeetCodeProblem[];
}

export type PatternSlug =
  | "two-pointers"
  | "sliding-window"
  | "binary-search"
  | "hash-map"
  | "bfs"
  | "dynamic-programming"
  | "backtracking"
  | "heap"
  | "monotonic-stack"
  | "union-find";

/** Fundamentals come first; advanced patterns build on them. */
export type PatternLevel = "fundamental" | "advanced";

export const LEVELS: ReadonlyArray<{ level: PatternLevel; label: string; blurb: string }> = [
  {
    level: "fundamental",
    label: "Fundamentals",
    blurb: "The everyday tools. Most easy and medium problems use one of these.",
  },
  {
    level: "advanced",
    label: "Advanced",
    blurb: "Built on the basics, for the medium-hard problems interviews love.",
  },
];

export const leetcodeUrl = (slug: string) => `https://leetcode.com/problems/${slug}/`;

export const PATTERNS: readonly Pattern[] = [
  {
    slug: "two-pointers",
    level: "fundamental",
    name: "Two Pointers",
    tagline: "Walk in from both ends and let the data tell you which side to move.",
    accent: "#00c4ff",
    glyph: "← →",
    whenToUse: [
      "The array is sorted, or you can sort it without losing the answer.",
      "You are looking for a pair (or triple) that meets a condition.",
      "You need to compare or swap items from the two ends, like palindromes.",
    ],
    idea: "Start one pointer at each end. Each step looks at the pair and moves exactly one pointer inward, so every step throws away a candidate that can never be the answer. One pass, no nested loop.",
    complexity: { time: "O(n)", space: "O(1)" },
    example: {
      id: 167,
      title: "Two Sum II – Input Array Is Sorted",
      slug: "two-sum-ii-input-array-is-sorted",
      difficulty: "Medium",
      statement:
        "Given a sorted array, find the two numbers that add up to target and return their 1-based indices.",
      input: "numbers = [1, 3, 4, 6, 8, 11, 14], target = 17",
      examples: [
        {
          input: "numbers = [2, 7, 11, 15], target = 9",
          output: "[1, 2]",
          explanation: "The sum of 2 and 7 is 9. Therefore, index1 = 1, index2 = 2.",
        },
        {
          input: "numbers = [2, 3, 4], target = 6",
          output: "[1, 3]",
          explanation: "The sum of 2 and 4 is 6. Therefore, index1 = 1, index2 = 3.",
        },
        {
          input: "numbers = [-1, 0], target = -1",
          output: "[1, 2]",
          explanation: "The sum of -1 and 0 is -1. Therefore, index1 = 1, index2 = 2.",
        },
      ],
    },
    code: [
      "function twoSum(numbers: number[], target: number): number[] {",
      "  let left = 0, right = numbers.length - 1;",
      "  while (left < right) {",
      "    const sum = numbers[left] + numbers[right];",
      "    if (sum === target) return [left + 1, right + 1];",
      "    if (sum < target) left++;",
      "    else right--;",
      "  }",
      "  return [];",
      "}",
    ],
    practice: [
      { id: 125, title: "Valid Palindrome", slug: "valid-palindrome", difficulty: "Easy" },
      {
        id: 11,
        title: "Container With Most Water",
        slug: "container-with-most-water",
        difficulty: "Medium",
      },
      { id: 15, title: "3Sum", slug: "3sum", difficulty: "Medium" },
      { id: 42, title: "Trapping Rain Water", slug: "trapping-rain-water", difficulty: "Hard" },
    ],
  },
  {
    slug: "sliding-window",
    level: "fundamental",
    name: "Sliding Window",
    tagline: "Grow the window to the right, shrink it from the left, never look back.",
    accent: "#00b96b",
    glyph: "[ ▭ ]",
    whenToUse: [
      "The question is about a contiguous subarray or substring.",
      "You want the longest, shortest or best window that satisfies a rule.",
      "A brute force would recheck overlapping ranges again and again.",
    ],
    idea: "Keep a window [left, right] and a small summary of what is inside it (a set, a count, a sum). Move right one step at a time; whenever the window breaks the rule, move left until it is valid again. Each index enters and leaves the window once.",
    complexity: { time: "O(n)", space: "O(k) for the window's contents" },
    example: {
      id: 3,
      title: "Longest Substring Without Repeating Characters",
      slug: "longest-substring-without-repeating-characters",
      difficulty: "Medium",
      statement: "Find the length of the longest substring that has no repeated characters.",
      input: 's = "abcabcbb"',
      examples: [
        {
          input: 's = "abcabcbb"',
          output: "3",
          explanation: 'The answer is "abc", with the length of 3.',
        },
        {
          input: 's = "bbbbb"',
          output: "1",
          explanation: 'The answer is "b", with the length of 1.',
        },
        {
          input: 's = "pwwkew"',
          output: "3",
          explanation:
            'The answer is "wke", with the length of 3. "pwke" is a subsequence, not a substring.',
        },
      ],
    },
    code: [
      "function lengthOfLongestSubstring(s: string): number {",
      "  const seen = new Set<string>();",
      "  let left = 0, best = 0;",
      "  for (let right = 0; right < s.length; right++) {",
      "    while (seen.has(s[right])) {",
      "      seen.delete(s[left]);",
      "      left++;",
      "    }",
      "    seen.add(s[right]);",
      "    best = Math.max(best, right - left + 1);",
      "  }",
      "  return best;",
      "}",
    ],
    practice: [
      {
        id: 643,
        title: "Maximum Average Subarray I",
        slug: "maximum-average-subarray-i",
        difficulty: "Easy",
      },
      {
        id: 424,
        title: "Longest Repeating Character Replacement",
        slug: "longest-repeating-character-replacement",
        difficulty: "Medium",
      },
      {
        id: 567,
        title: "Permutation in String",
        slug: "permutation-in-string",
        difficulty: "Medium",
      },
      {
        id: 76,
        title: "Minimum Window Substring",
        slug: "minimum-window-substring",
        difficulty: "Hard",
      },
    ],
  },
  {
    slug: "binary-search",
    level: "fundamental",
    name: "Binary Search",
    tagline: "Halve the search space every step until only the answer is left.",
    accent: "#ffb020",
    glyph: "½",
    whenToUse: [
      "The data is sorted, or the answer space is monotonic (false… false, true… true).",
      "You need O(log n) instead of a linear scan.",
      "The problem asks for the first or last position where something becomes true.",
    ],
    idea: "Keep a range [lo, hi] that must contain the answer. Look at the middle: it either is the answer, or it proves the whole left or right half can be thrown away. The range halves every step.",
    complexity: { time: "O(log n)", space: "O(1)" },
    example: {
      id: 704,
      title: "Binary Search",
      slug: "binary-search",
      difficulty: "Easy",
      statement: "Return the index of target in a sorted array, or -1 if it is not there.",
      input: "nums = [-1, 0, 3, 5, 9, 12, 15, 20], target = 12",
      examples: [
        {
          input: "nums = [-1, 0, 3, 5, 9, 12], target = 9",
          output: "4",
          explanation: "9 exists in nums and its index is 4.",
        },
        {
          input: "nums = [-1, 0, 3, 5, 9, 12], target = 2",
          output: "-1",
          explanation: "2 does not exist in nums so return -1.",
        },
      ],
    },
    code: [
      "function search(nums: number[], target: number): number {",
      "  let lo = 0, hi = nums.length - 1;",
      "  while (lo <= hi) {",
      "    const mid = Math.floor((lo + hi) / 2);",
      "    if (nums[mid] === target) return mid;",
      "    if (nums[mid] < target) lo = mid + 1;",
      "    else hi = mid - 1;",
      "  }",
      "  return -1;",
      "}",
    ],
    practice: [
      {
        id: 35,
        title: "Search Insert Position",
        slug: "search-insert-position",
        difficulty: "Easy",
      },
      {
        id: 33,
        title: "Search in Rotated Sorted Array",
        slug: "search-in-rotated-sorted-array",
        difficulty: "Medium",
      },
      { id: 875, title: "Koko Eating Bananas", slug: "koko-eating-bananas", difficulty: "Medium" },
      {
        id: 4,
        title: "Median of Two Sorted Arrays",
        slug: "median-of-two-sorted-arrays",
        difficulty: "Hard",
      },
    ],
  },
  {
    slug: "hash-map",
    level: "fundamental",
    name: "Hash Map",
    tagline: "Remember what you have seen so the answer is one lookup away.",
    accent: "#c44dff",
    glyph: "{ k: v }",
    whenToUse: [
      "You keep asking “have I seen this before?” or “where was it?”.",
      "You need to count, group or pair items quickly.",
      "A nested loop is only there to search for a matching value.",
    ],
    idea: "Trade memory for time. As you scan, store each value (or its count, or its index) in a map. For every new item, the partner you need is a constant-time lookup instead of another loop.",
    complexity: { time: "O(n)", space: "O(n)" },
    example: {
      id: 1,
      title: "Two Sum",
      slug: "two-sum",
      difficulty: "Easy",
      statement: "Return the indices of the two numbers that add up to target.",
      input: "nums = [3, 8, 2, 11, 7, 5], target = 9",
      examples: [
        {
          input: "nums = [2, 7, 11, 15], target = 9",
          output: "[0, 1]",
          explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
        },
        { input: "nums = [3, 2, 4], target = 6", output: "[1, 2]" },
        { input: "nums = [3, 3], target = 6", output: "[0, 1]" },
      ],
    },
    code: [
      "function twoSum(nums: number[], target: number): number[] {",
      "  const seen = new Map<number, number>();",
      "  for (let i = 0; i < nums.length; i++) {",
      "    const need = target - nums[i];",
      "    if (seen.has(need)) return [seen.get(need)!, i];",
      "    seen.set(nums[i], i);",
      "  }",
      "  return [];",
      "}",
    ],
    practice: [
      { id: 217, title: "Contains Duplicate", slug: "contains-duplicate", difficulty: "Easy" },
      { id: 242, title: "Valid Anagram", slug: "valid-anagram", difficulty: "Easy" },
      { id: 49, title: "Group Anagrams", slug: "group-anagrams", difficulty: "Medium" },
      {
        id: 128,
        title: "Longest Consecutive Sequence",
        slug: "longest-consecutive-sequence",
        difficulty: "Medium",
      },
    ],
  },
  {
    slug: "bfs",
    level: "fundamental",
    name: "BFS / DFS",
    tagline: "Explore a grid or graph one neighbour at a time and mark where you have been.",
    accent: "#ff4d6d",
    glyph: "◉→◎",
    whenToUse: [
      "The input is a grid, a tree or a graph of connected things.",
      "You need to count connected regions or flood-fill an area.",
      "BFS: the shortest path in an unweighted graph. DFS: explore every branch.",
    ],
    idea: "From a starting cell, keep a queue (BFS) or a stack (DFS) of places to visit. Pop one, look at its neighbours, push the ones you have not visited yet and mark them. When the queue is empty, the whole connected region has been found.",
    complexity: { time: "O(rows × cols)", space: "O(rows × cols) in the worst case" },
    example: {
      id: 200,
      title: "Number of Islands",
      slug: "number-of-islands",
      difficulty: "Medium",
      statement: "Count the islands: groups of '1' cells connected up, down, left or right.",
      input: 'grid = ["11000", "11010", "00100", "00011"]',
      examples: [
        { input: 'grid = ["11110", "11010", "11000", "00000"]', output: "1" },
        { input: 'grid = ["11000", "11000", "00100", "00011"]', output: "3" },
      ],
    },
    code: [
      "function numIslands(grid: string[][]): number {",
      "  let count = 0;",
      "  for (let r = 0; r < grid.length; r++) {",
      "    for (let c = 0; c < grid[0].length; c++) {",
      '      if (grid[r][c] !== "1") continue;',
      "      count++;",
      '      const queue = [[r, c]]; grid[r][c] = "0";',
      "      while (queue.length) {",
      "        const [y, x] = queue.shift()!;",
      "        for (const [ny, nx] of neighbours(y, x)) {",
      '          if (grid[ny]?.[nx] !== "1") continue;',
      '          grid[ny][nx] = "0"; queue.push([ny, nx]);',
      "        }",
      "      }",
      "    }",
      "  }",
      "  return count;",
      "}",
    ],
    practice: [
      { id: 733, title: "Flood Fill", slug: "flood-fill", difficulty: "Easy" },
      { id: 695, title: "Max Area of Island", slug: "max-area-of-island", difficulty: "Medium" },
      { id: 994, title: "Rotting Oranges", slug: "rotting-oranges", difficulty: "Medium" },
      { id: 127, title: "Word Ladder", slug: "word-ladder", difficulty: "Hard" },
    ],
  },
  {
    slug: "dynamic-programming",
    level: "advanced",
    name: "Dynamic Programming",
    tagline: "Solve each small case once, then build the big answer from the small ones.",
    accent: "#ff7a00",
    glyph: "dp[i]",
    whenToUse: [
      "The question asks for a maximum, minimum or number of ways.",
      "A choice now depends on the best result of a smaller version of the problem.",
      "A plain recursion would solve the same subproblem many times.",
    ],
    idea: "Name the state (dp[i] = the best answer for the first i items), find how it depends on smaller states, and fill a table from the smallest case upward. Every state is computed once, so overlapping recursion turns into a single loop.",
    complexity: {
      time: "O(n) here; O(states × choices) in general",
      space: "O(n), often O(1) with two variables",
    },
    example: {
      id: 198,
      title: "House Robber",
      slug: "house-robber",
      difficulty: "Medium",
      statement:
        "Houses in a row hold some money. You cannot rob two neighbours. Return the most you can rob.",
      input: "nums = [2, 7, 9, 3, 1]",
      examples: [
        {
          input: "nums = [1, 2, 3, 1]",
          output: "4",
          explanation:
            "Rob house 1 (money = 1) and then rob house 3 (money = 3). Total amount you can rob = 1 + 3 = 4.",
        },
        {
          input: "nums = [2, 7, 9, 3, 1]",
          output: "12",
          explanation:
            "Rob house 1 (money = 2), rob house 3 (money = 9) and rob house 5 (money = 1). Total amount you can rob = 2 + 9 + 1 = 12.",
        },
      ],
    },
    code: [
      "function rob(nums: number[]): number {",
      "  const dp = new Array(nums.length + 1).fill(0);",
      "  dp[1] = nums[0];",
      "  for (let i = 2; i <= nums.length; i++) {",
      "    const skip = dp[i - 1];",
      "    const take = dp[i - 2] + nums[i - 1];",
      "    dp[i] = Math.max(skip, take);",
      "  }",
      "  return dp[nums.length];",
      "}",
    ],
    practice: [
      { id: 70, title: "Climbing Stairs", slug: "climbing-stairs", difficulty: "Easy" },
      { id: 322, title: "Coin Change", slug: "coin-change", difficulty: "Medium" },
      {
        id: 1143,
        title: "Longest Common Subsequence",
        slug: "longest-common-subsequence",
        difficulty: "Medium",
      },
      { id: 72, title: "Edit Distance", slug: "edit-distance", difficulty: "Hard" },
    ],
  },
  {
    slug: "backtracking",
    level: "advanced",
    name: "Backtracking",
    tagline: "Try a choice, explore everything after it, then undo it and try the next.",
    accent: "#c6f000",
    glyph: "↳ ↶",
    whenToUse: [
      "You must list every subset, permutation or combination.",
      "You build an answer step by step and some partial answers can be abandoned early.",
      "Constraints are small (n ≈ 10–20) because the output itself is exponential.",
    ],
    idea: "Keep one growing path. At each step, choose an option, recurse to explore everything that starts with that choice, then pop it off and try the next option. The path is shared, so undoing the last move is all it takes to go back.",
    complexity: { time: "O(n · 2ⁿ) for subsets", space: "O(n) for the path, plus the output" },
    example: {
      id: 78,
      title: "Subsets",
      slug: "subsets",
      difficulty: "Medium",
      statement: "Return every possible subset of an array of unique numbers.",
      input: "nums = [1, 2, 3]",
      examples: [
        {
          input: "nums = [1, 2, 3]",
          output: "[[], [1], [2], [1, 2], [3], [1, 3], [2, 3], [1, 2, 3]]",
        },
        { input: "nums = [0]", output: "[[], [0]]" },
      ],
    },
    code: [
      "function subsets(nums: number[]): number[][] {",
      "  const result: number[][] = [];",
      "  const path: number[] = [];",
      "  function backtrack(start: number) {",
      "    result.push([...path]);",
      "    for (let i = start; i < nums.length; i++) {",
      "      path.push(nums[i]);",
      "      backtrack(i + 1);",
      "      path.pop();",
      "    }",
      "  }",
      "  backtrack(0);",
      "  return result;",
      "}",
    ],
    practice: [
      { id: 46, title: "Permutations", slug: "permutations", difficulty: "Medium" },
      { id: 39, title: "Combination Sum", slug: "combination-sum", difficulty: "Medium" },
      { id: 79, title: "Word Search", slug: "word-search", difficulty: "Medium" },
      { id: 51, title: "N-Queens", slug: "n-queens", difficulty: "Hard" },
    ],
  },
  {
    slug: "heap",
    level: "advanced",
    name: "Heap / Priority Queue",
    tagline: "Keep only the k best so far; the weakest of them is always on top.",
    accent: "#00d4a8",
    glyph: "△ top-k",
    whenToUse: [
      "You need the k largest, k smallest or k most frequent items.",
      "You repeatedly take the smallest or largest item from a changing collection.",
      "Merging several sorted lists or streams.",
    ],
    idea: "A min-heap gives the smallest item in O(1) and adds or removes in O(log k). Push every number, and whenever the heap holds more than k items, pop the smallest. What stays is the k largest, and the top is the k-th largest.",
    complexity: { time: "O(n log k)", space: "O(k)" },
    example: {
      id: 215,
      title: "Kth Largest Element in an Array",
      slug: "kth-largest-element-in-an-array",
      difficulty: "Medium",
      statement:
        "Return the k-th largest element in the array (in sorted order, not the k-th distinct).",
      input: "nums = [3, 2, 1, 5, 6, 4], k = 2",
      examples: [
        { input: "nums = [3, 2, 1, 5, 6, 4], k = 2", output: "5" },
        { input: "nums = [3, 2, 3, 1, 2, 4, 5, 5, 6], k = 4", output: "4" },
      ],
    },
    code: [
      "function findKthLargest(nums: number[], k: number): number {",
      "  const heap = new MinHeap<number>();",
      "  for (const num of nums) {",
      "    heap.push(num);",
      "    if (heap.size() > k) heap.pop();",
      "  }",
      "  return heap.peek();",
      "}",
    ],
    practice: [
      { id: 1046, title: "Last Stone Weight", slug: "last-stone-weight", difficulty: "Easy" },
      {
        id: 347,
        title: "Top K Frequent Elements",
        slug: "top-k-frequent-elements",
        difficulty: "Medium",
      },
      {
        id: 973,
        title: "K Closest Points to Origin",
        slug: "k-closest-points-to-origin",
        difficulty: "Medium",
      },
      {
        id: 295,
        title: "Find Median from Data Stream",
        slug: "find-median-from-data-stream",
        difficulty: "Hard",
      },
    ],
  },
  {
    slug: "monotonic-stack",
    level: "advanced",
    name: "Monotonic Stack",
    tagline: "Keep a stack in sorted order; whatever gets popped has just found its answer.",
    accent: "#7aa2ff",
    glyph: "▁▃▅",
    whenToUse: [
      "For each item you need the next (or previous) greater or smaller item.",
      "Spans, stock prices, temperatures, histogram rectangles.",
      "A nested loop scans forward from every index looking for a bigger value.",
    ],
    idea: "Walk left to right with a stack of indices whose values only go down. A new value that is bigger than the top is the answer for that top, so pop it and record the distance. Each index is pushed and popped once.",
    complexity: { time: "O(n)", space: "O(n)" },
    example: {
      id: 739,
      title: "Daily Temperatures",
      slug: "daily-temperatures",
      difficulty: "Medium",
      statement:
        "For each day, return how many days you wait for a warmer temperature, or 0 if none comes.",
      input: "temperatures = [73, 74, 75, 71, 69, 72, 76, 73]",
      examples: [
        {
          input: "temperatures = [73, 74, 75, 71, 69, 72, 76, 73]",
          output: "[1, 1, 4, 2, 1, 1, 0, 0]",
        },
        { input: "temperatures = [30, 40, 50, 60]", output: "[1, 1, 1, 0]" },
        { input: "temperatures = [30, 60, 90]", output: "[1, 1, 0]" },
      ],
    },
    code: [
      "function dailyTemperatures(temps: number[]): number[] {",
      "  const answer = new Array(temps.length).fill(0);",
      "  const stack: number[] = []; // indices, temps going down",
      "  for (let i = 0; i < temps.length; i++) {",
      "    while (stack.length && temps[i] > temps[stack.at(-1)!]) {",
      "      const j = stack.pop()!;",
      "      answer[j] = i - j;",
      "    }",
      "    stack.push(i);",
      "  }",
      "  return answer;",
      "}",
    ],
    practice: [
      {
        id: 496,
        title: "Next Greater Element I",
        slug: "next-greater-element-i",
        difficulty: "Easy",
      },
      {
        id: 503,
        title: "Next Greater Element II",
        slug: "next-greater-element-ii",
        difficulty: "Medium",
      },
      { id: 901, title: "Online Stock Span", slug: "online-stock-span", difficulty: "Medium" },
      {
        id: 84,
        title: "Largest Rectangle in Histogram",
        slug: "largest-rectangle-in-histogram",
        difficulty: "Hard",
      },
    ],
  },
  {
    slug: "union-find",
    level: "advanced",
    name: "Union-Find",
    tagline: "Every group has one leader; joining two groups means one leader follows the other.",
    accent: "#ff2d95",
    glyph: "◎⇄◎",
    whenToUse: [
      "Edges arrive one by one and you ask “are these two already connected?”.",
      "Counting groups, provinces or components in an undirected graph.",
      "Detecting the edge that closes a cycle.",
    ],
    idea: "Each node points to a parent; following parents leads to the group's root. Two nodes are connected exactly when they share a root. To join groups, point one root at the other. Path compression makes later finds almost O(1).",
    complexity: { time: "≈ O(n · α(n)), nearly linear", space: "O(n)" },
    example: {
      id: 684,
      title: "Redundant Connection",
      slug: "redundant-connection",
      difficulty: "Medium",
      statement:
        "A tree got one extra edge. Return the edge you can remove so the graph is a tree again.",
      input: "edges = [[1, 2], [2, 3], [3, 4], [1, 4], [1, 5]]",
      examples: [
        { input: "edges = [[1, 2], [1, 3], [2, 3]]", output: "[2, 3]" },
        { input: "edges = [[1, 2], [2, 3], [3, 4], [1, 4], [1, 5]]", output: "[1, 4]" },
      ],
    },
    code: [
      "function findRedundantConnection(edges: number[][]): number[] {",
      "  const parent = Array.from({ length: edges.length + 1 }, (_, i) => i);",
      "  const find = (x: number): number =>",
      "    parent[x] === x ? x : (parent[x] = find(parent[x]));",
      "  for (const [a, b] of edges) {",
      "    const ra = find(a), rb = find(b);",
      "    if (ra === rb) return [a, b];",
      "    parent[ra] = rb;",
      "  }",
      "  return [];",
      "}",
    ],
    practice: [
      { id: 547, title: "Number of Provinces", slug: "number-of-provinces", difficulty: "Medium" },
      {
        id: 990,
        title: "Satisfiability of Equality Equations",
        slug: "satisfiability-of-equality-equations",
        difficulty: "Medium",
      },
      { id: 721, title: "Accounts Merge", slug: "accounts-merge", difficulty: "Medium" },
      {
        id: 1579,
        title: "Remove Max Number of Edges to Keep Graph Fully Traversable",
        slug: "remove-max-number-of-edges-to-keep-graph-fully-traversable",
        difficulty: "Hard",
      },
    ],
  },
];

export function findPattern(slug: string) {
  return PATTERNS.find((pattern) => pattern.slug === slug);
}
