// node src/features/ielts/mock/check.mjs  — checks every reading test file for numbering and answers.
import { readdirSync } from "node:fs";
import { pathToFileURL } from "node:url";
import path from "node:path";

const dir = path.join(path.dirname(new URL(import.meta.url).pathname), "data");
const problems = [];
const bad = (file, msg) => problems.push(`${file}: ${msg}`);

for (const file of readdirSync(dir).filter((f) => f.startsWith("reading-") && f.endsWith(".ts"))) {
  const mod = await import(pathToFileURL(path.join(dir, file)).href);
  const test = Object.values(mod).find((v) => v && v.passages);
  if (!test) {
    bad(file, "no ReadingTest export");
    continue;
  }
  if (test.passages.length !== 3) bad(file, `needs 3 passages, has ${test.passages.length}`);
  const seen = [];
  test.passages.forEach((p, pi) => {
    const words = p.paragraphs
      .map((x) => x.text)
      .join(" ")
      .split(/\s+/).length;
    console.log(
      `${file} passage ${pi + 1}: ${words} words, ${p.groups.reduce((a, g) => a + g.questions.length, 0)} questions`,
    );
    for (const g of p.groups) {
      for (const q of g.questions) {
        seen.push(q.n);
        if (!q.why || q.why.length < 8) bad(file, `Q${q.n} has no explanation`);
        if (g.kind === "tf") {
          const ok =
            g.mode === "TFNG" ? ["TRUE", "FALSE", "NOT GIVEN"] : ["YES", "NO", "NOT GIVEN"];
          if (!ok.includes(q.answer))
            bad(file, `Q${q.n} answer ${q.answer} not valid for ${g.mode}`);
        }
        if (g.kind === "mcq" && !q.options.some((o) => o.key === q.answer))
          bad(file, `Q${q.n} answer not in options`);
        if (g.kind === "match" && !g.choices.some((c) => c.key === q.answer))
          bad(file, `Q${q.n} answer not in choices`);
        if (g.kind === "gap") {
          if (!q.text.includes("____")) bad(file, `Q${q.n} has no gap`);
          if (!Array.isArray(q.answer) || !q.answer.length) bad(file, `Q${q.n} has no answers`);
          const limit = /(\w+) WORD/.exec(g.limit)?.[1]?.toLowerCase();
          const max = { one: 1, two: 2, three: 3 }[limit] ?? 3;
          for (const a of q.answer)
            if (a.split(/\s+/).length > max + (/\d/.test(a) ? 1 : 0))
              bad(file, `Q${q.n} answer "${a}" breaks the word limit`);
          for (const a of q.answer) {
            const hay = p.paragraphs
              .map((x) => x.text)
              .join(" ")
              .toLowerCase();
            if (!hay.includes(a.toLowerCase()) && !/^\d+$/.test(a))
              bad(file, `Q${q.n} answer "${a}" is not in the passage`);
          }
        }
      }
    }
  });
  seen.sort((a, b) => a - b);
  if (seen.length !== 40 || seen.some((n, i) => n !== i + 1))
    bad(file, `questions must be 1..40, got ${seen.join(",")}`);
}
if (problems.length) {
  console.log("\nPROBLEMS:\n" + problems.join("\n"));
  process.exit(1);
}
console.log("\nAll reading tests OK");
