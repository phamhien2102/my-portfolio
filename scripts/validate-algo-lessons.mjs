// Checks the lesson data in src/features/algo-lab/lessons/*.ts.
//   node scripts/validate-algo-lessons.mjs                 every lesson
//   node scripts/validate-algo-lessons.mjs binary tree     only lessons whose file name matches
// Lesson files import the scene helpers, so a small resolve hook lets Node load them as TypeScript.
import { readdirSync } from "node:fs";
import { register } from "node:module";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

register(
  "data:text/javascript," +
    encodeURIComponent(`export async function resolve(spec, ctx, next) {
      try { return await next(spec, ctx); }
      catch (e) {
        if ((spec.startsWith(".") || spec.startsWith("/")) && !/\\.[a-z]+$/.test(spec)) return next(spec + ".ts", ctx);
        throw e;
      }
    }`),
);

const dir = resolve(import.meta.dirname, "../src/features/algo-lab/lessons");
const only = process.argv.slice(2);
const files = readdirSync(dir)
  .filter((f) => f.endsWith(".ts"))
  .filter((f) => !only.length || only.some((o) => f.includes(o)));

const LEVELS = ["beginner", "intermediate", "advanced"];
const CALLOUTS = ["insight", "tip", "warn"];
const CHAPTER_TONES = ["red", "amber", "blue", "green", "ink"];
const TONES = ["plain", "active", "found", "done", "warn", "mark", "muted", "ghost"];
const EDGE_TONES = ["plain", "active", "found", "warn", "muted"];
let problems = 0;

for (const file of files) {
  const mod = await import(pathToFileURL(join(dir, file)).href);
  const lesson = Object.values(mod).find((v) => v && typeof v === "object" && v.steps);
  const errs = [];
  const warns = [];
  const err = (m) => errs.push(m);
  const id = file.replace(/\.ts$/, "");

  if (!lesson) {
    console.log(`✗ ${file}: no exported lesson`);
    problems++;
    continue;
  }
  if (lesson.id !== id) err(`id "${lesson.id}" should equal the file name "${id}"`);
  if (!lesson.title) err("missing title");
  if (!lesson.summary || lesson.summary.length > 110) err("summary missing or over 110 characters");
  if (!Number.isInteger(lesson.minutes)) err("minutes must be an integer");
  if (!LEVELS.includes(lesson.level)) err(`level must be one of ${LEVELS}`);
  if (!(lesson.goals?.length >= 3 && lesson.goals.length <= 5)) err("goals: 3 to 5 items");
  if (lesson.takeaways?.length !== 3) err("takeaways: exactly 3 items");
  if (!(lesson.hud?.length >= 3 && lesson.hud.length <= 5)) err("hud: 3 to 5 slots");
  const hudLabels = new Set((lesson.hud ?? []).map((h) => h.label));
  const code = lesson.pseudocode;
  if (code !== undefined) {
    if (!Array.isArray(code) || code.length < 4 || code.length > 18) err("pseudocode: an array of 4 to 18 lines");
    else for (const [i, l] of code.entries()) if (typeof l !== "string" || l.length > 64) warns.push(`pseudocode line ${i + 1} is missing or over 64 characters`);
  } else warns.push("no pseudocode yet");

  const shorts = new Set();
  if (!(lesson.steps?.length >= 6 && lesson.steps.length <= 10)) err("steps: 6 to 10");
  (lesson.steps ?? []).forEach((s, i) => {
    const at = `step ${i + 1} (${s.short})`;
    if (!s.short || s.short.length > 14) err(`${at}: short must be 1-14 characters`);
    if (shorts.has(s.short)) err(`${at}: duplicate short`);
    shorts.add(s.short);
    if (!s.title) err(`${at}: missing title`);
    if (!(s.body?.length >= 1 && s.body.length <= 3)) err(`${at}: body needs 1 to 3 paragraphs`);
    if (s.callout && !CALLOUTS.includes(s.callout.kind)) err(`${at}: bad callout kind`);
    if (s.chapter && !CHAPTER_TONES.includes(s.chapter.tone)) err(`${at}: bad chapter tone`);
    if (s.lines !== undefined) {
      if (!code) err(`${at}: lines needs the lesson to have pseudocode`);
      else if (!Array.isArray(s.lines) || s.lines.some((n) => !Number.isInteger(n) || n < 1 || n > code.length)) err(`${at}: lines must be 1-based line numbers within the pseudocode (1 to ${code.length})`);
    }
    for (const m of s.metrics ?? []) if (!hudLabels.has(m.label)) err(`${at}: metric "${m.label}" is not a hud label`);

    const items = s.scene?.items;
    if (!items?.length) return err(`${at}: scene has no items`);
    if (items.length > 70) warns.push(`${at}: ${items.length} items is a lot`);
    const byId = new Map();
    for (const it of items) {
      if (!it || !it.t || !it.id) {
        err(`${at}: an item has no t or id`);
        continue;
      }
      if (byId.has(it.id)) err(`${at}: duplicate item id "${it.id}"`);
      byId.set(it.id, it);
    }
    const blocks = [];
    for (const it of byId.values()) {
      if (it.t === "cell" || it.t === "disc") {
        if (![it.x, it.y].every(Number.isFinite)) err(`${at}: ${it.id} has no numeric x, y`);
        if (typeof it.text !== "string") err(`${at}: ${it.id} text must be a string`);
        else if (it.text.length > 14) warns.push(`${at}: ${it.id} text "${it.text}" is long (max 14)`);
        if (it.tone && !TONES.includes(it.tone)) err(`${at}: ${it.id} bad tone ${it.tone}`);
        const w = it.t === "disc" ? (it.r ?? 20) * 2 : (it.w ?? 52);
        const h = it.t === "disc" ? w : (it.h ?? 46);
        const cy = it.t === "cell" && it.base ? it.y - h / 2 : it.y;
        blocks.push({ id: it.id, x0: it.x - w / 2, x1: it.x + w / 2, y0: cy - h / 2, y1: cy + h / 2 });
      } else if (it.t === "edge") {
        for (const end of [it.from, it.to]) {
          const t = byId.get(end);
          if (!t || !(t.t === "cell" || t.t === "disc")) err(`${at}: edge ${it.id} points at "${end}", which is not a cell or disc in this scene`);
        }
        if (it.tone && !EDGE_TONES.includes(it.tone)) err(`${at}: edge ${it.id} bad tone ${it.tone}`);
      } else if (it.t === "pointer") {
        if (typeof it.at === "string") {
          const t = byId.get(it.at);
          if (!t || !(t.t === "cell" || t.t === "disc")) err(`${at}: pointer ${it.id} points at "${it.at}", which is not a cell or disc in this scene`);
        } else if (!it.at || ![it.at.x, it.at.y].every(Number.isFinite)) err(`${at}: pointer ${it.id} needs an id or {x, y}`);
        if (!it.text || it.text.length > 18) warns.push(`${at}: pointer ${it.id} text is empty or long (max 18)`);
      } else if (it.t === "label") {
        if (![it.x, it.y].every(Number.isFinite)) err(`${at}: label ${it.id} has no numeric x, y`);
        if (!it.text || it.text.length > 70) warns.push(`${at}: label ${it.id} is empty or over 70 chars`);
      } else if (it.t === "frame") {
        if (![it.x, it.y, it.w, it.h].every(Number.isFinite) || it.w <= 0 || it.h <= 0) err(`${at}: frame ${it.id} needs numeric x, y, w, h > 0`);
      } else err(`${at}: unknown item type "${it.t}"`);
    }
    for (let a = 0; a < blocks.length; a++)
      for (let b = a + 1; b < blocks.length; b++) {
        const p = blocks[a];
        const q = blocks[b];
        if (p.x0 < q.x1 - 2 && q.x0 < p.x1 - 2 && p.y0 < q.y1 - 2 && q.y0 < p.y1 - 2) warns.push(`${at}: ${p.id} and ${q.id} overlap`);
      }
    if (blocks.length) {
      const w = Math.max(...blocks.map((b) => b.x1)) - Math.min(...blocks.map((b) => b.x0));
      const h = Math.max(...blocks.map((b) => b.y1)) - Math.min(...blocks.map((b) => b.y0));
      if (w > 900 || h > 520) warns.push(`${at}: the scene spans ${Math.round(w)} x ${Math.round(h)}; it will be drawn tiny`);
    }
  });

  if (code && !(lesson.steps ?? []).some((st) => st.lines?.length)) warns.push("pseudocode is set but no step highlights lines");
  const shown = warns.slice(0, 12);
  if (errs.length || warns.length) {
    console.log(`${errs.length ? "✗" : "!"} ${file}`);
    errs.forEach((e) => console.log("   error:", e));
    shown.forEach((w) => console.log("   warn: ", w));
    if (warns.length > shown.length) console.log(`   … and ${warns.length - shown.length} more warnings`);
  } else console.log(`✓ ${file} (${lesson.steps.length} steps)`);
  problems += errs.length;
}
process.exit(problems ? 1 : 0);
