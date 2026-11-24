// Checks the lesson data in src/features/design-system/lessons/*.ts.
//   node scripts/validate-lessons.mjs              every lesson
//   node scripts/validate-lessons.mjs caching sql  only lessons whose file name matches
// Lesson files only import types, so Node can load them directly (type stripping).
import { readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const dir = resolve(import.meta.dirname, "../src/features/design-system/lessons");
const only = process.argv.slice(2);
const files = readdirSync(dir)
  .filter((f) => f.endsWith(".ts"))
  .filter((f) => !only.length || only.some((o) => f.includes(o)));

const KINDS = ["user", "dns", "server", "service", "lb", "cache", "db", "queue", "limiter"];
const TONES = ["req", "res", "warn", "hand"];
const CALLOUTS = ["insight", "tip", "warn"];
const LEVELS = ["beginner", "intermediate", "advanced"];
let problems = 0;

for (const file of files) {
  const mod = await import(pathToFileURL(join(dir, file)).href);
  const lesson = Object.values(mod)[0];
  const errs = [];
  const warns = [];
  const err = (m) => errs.push(m);

  const id = file.replace(/\.ts$/, "");
  if (!lesson || typeof lesson !== "object") {
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

  const nodeIds = new Set();
  for (const n of lesson.nodes ?? []) {
    if (nodeIds.has(n.id)) err(`duplicate node id ${n.id}`);
    nodeIds.add(n.id);
    if (!KINDS.includes(n.kind)) err(`node ${n.id}: unknown kind ${n.kind}`);
  }
  {
    // The camera fits whatever is on stage, so coordinates are free, but a very wide scene is drawn small.
    const xs = (lesson.nodes ?? []).map((n) => n.x);
    const ys = (lesson.nodes ?? []).map((n) => n.y);
    const w = Math.max(...xs) - Math.min(...xs);
    const h = Math.max(...ys) - Math.min(...ys);
    if (w > 640 || h > 300)
      warns.push(
        `the nodes span ${w} x ${h}; keep it within 640 x 300 so the scene is not drawn tiny`,
      );
  }
  const ns = lesson.nodes ?? [];
  const together = (a, b) =>
    (lesson.steps ?? []).some(
      (st) => st.scene?.show?.includes(a.id) && st.scene.show.includes(b.id),
    );
  for (let i = 0; i < ns.length; i++)
    for (let j = i + 1; j < ns.length; j++) {
      const a = ns[i];
      const b = ns[j];
      if (!together(a, b)) continue;
      const needX = a.kind === "user" || b.kind === "user" ? 190 : 108;
      const needY = a.kind === "user" || b.kind === "user" ? 150 : 104;
      if (Math.abs(a.x - b.x) < needX && Math.abs(a.y - b.y) < needY)
        warns.push(`nodes ${a.id} and ${b.id} are too close and will overlap`);
    }
  const links = new Map();
  for (const l of lesson.links ?? []) {
    if (links.has(l.id)) err(`duplicate link id ${l.id}`);
    links.set(l.id, l);
    if (!nodeIds.has(l.from) || !nodeIds.has(l.to)) err(`link ${l.id} points at a missing node`);
  }

  const hudLabels = new Set((lesson.hud ?? []).map((h) => h.label));
  const shorts = new Set();
  if (!(lesson.steps?.length >= 5 && lesson.steps.length <= 10)) err("steps: 5 to 10");
  (lesson.steps ?? []).forEach((s, i) => {
    const at = `step ${i + 1} (${s.short})`;
    if (!s.short || s.short.length > 14) err(`${at}: short must be 1-14 characters`);
    if (shorts.has(s.short)) err(`${at}: duplicate short`);
    shorts.add(s.short);
    if (!s.title) err(`${at}: missing title`);
    if (!(s.body?.length >= 1 && s.body.length <= 3)) err(`${at}: body needs 1 to 3 paragraphs`);
    if (s.callout && !CALLOUTS.includes(s.callout.kind)) err(`${at}: bad callout kind`);
    for (const m of s.metrics ?? [])
      if (!hudLabels.has(m.label)) err(`${at}: metric "${m.label}" is not a hud label`);
    const sc = s.scene;
    const show = new Set(sc?.show ?? []);
    if (!show.size) err(`${at}: scene.show is empty`);
    for (const id of show) if (!nodeIds.has(id)) err(`${at}: show has unknown node ${id}`);
    for (const id of [...(sc.hot ?? []), ...(sc.down ?? [])])
      if (!show.has(id)) err(`${at}: hot/down node ${id} is not in show`);
    for (const id of [...Object.keys(sc.badges ?? {}), ...Object.keys(sc.bubbles ?? {})])
      if (!show.has(id)) err(`${at}: badge/bubble on ${id}, which is not in show`);
    for (const [id, t] of Object.entries(sc.badges ?? {}))
      if (t.length > 30) warns.push(`${at}: badge on ${id} is ${t.length} chars (max 30)`);
    for (const id of Object.keys(sc.labels ?? {}))
      if (!show.has(id)) err(`${at}: label override on ${id}, which is not in show`);
    for (const id of [...Object.keys(sc.linkLabels ?? {}), ...(sc.dim ?? [])]) {
      const l = links.get(id);
      if (!l) err(`${at}: linkLabels/dim uses unknown link ${id}`);
      else if (!show.has(l.from) || !show.has(l.to))
        err(`${at}: linkLabels/dim on ${id} but an end is not in show`);
    }
    for (const pnl of sc.panels ?? [])
      if (!pnl.title || !(pnl.lines?.length >= 1 && pnl.lines.length <= 8))
        err(`${at}: a panel needs a title and 1 to 8 lines`);
    for (const f of sc.flows ?? []) {
      const l = links.get(f.link);
      if (!l) err(`${at}: flow uses unknown link ${f.link}`);
      else if (!show.has(l.from) || !show.has(l.to))
        err(`${at}: flow on ${f.link} but an end is not in show`);
      if (f.tone && !TONES.includes(f.tone)) err(`${at}: bad flow tone ${f.tone}`);
      if (f.label && f.label.length > 30) warns.push(`${at}: flow label "${f.label}" is long`);
    }
  });

  if (errs.length || warns.length) {
    console.log(`${errs.length ? "✗" : "!"} ${file}`);
    errs.forEach((e) => console.log("   error:", e));
    warns.forEach((w) => console.log("   warn: ", w));
  } else console.log(`✓ ${file} (${lesson.steps.length} steps)`);
  problems += errs.length;
}
process.exit(problems ? 1 : 0);
