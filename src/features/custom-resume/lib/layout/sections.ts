import { customKey, isCustomKey, type OrderKey } from "../../types";
import { block, dates, joinNonEmpty, linesOf, para, style, type Ctx, ensureUrl } from "./common";
import type { Block, Item } from "./types";
import type { Run } from "./text";

/** How a column dresses the shared section content. */
export interface Look {
  x: number;
  w: number;
  ink: string;
  muted: string;
  accent: string;
  bullet: string;
  bulletColor: string;
  /** Section heading blocks. */
  heading: (text: string) => Block;
  /** `left` puts dates in a gutter before the record (timeline), `right` on the title line. */
  dateMode: "right" | "left";
  dateW: number;
  /** Narrow column (sidebar): stacks instead of using a right-hand run. */
  narrow: boolean;
  /** Size of record titles relative to the body. */
  titleSize: number;
  /** Set the summary as a lead paragraph (italic, with a bar). */
  lead?: boolean;
  /** Gap between a heading and its first record, and between records (before scaling). */
  headGap: number;
  recGap: number;
}

function bulletItems(c: Ctx, l: Look, lines: string[], x: number, w: number): Item[] {
  const out: Item[] = [];
  lines.forEach((t, i) => {
    const items = para(c.m, [{ s: t }], style(c, { size: c.base, color: l.ink }), {
      x,
      w,
      lh: c.lh,
      bullet: { glyph: l.bullet, indent: 11, color: l.bulletColor },
    });
    // A little air between bullets, carried by the item before it.
    if (i > 0 && items[0]) {
      items.unshift({ h: 1.6 * c.sp, prims: [] });
    }
    out.push(...items);
  });
  return out;
}

/** Date gutter: put `text` on the first line of `items`, aligned to its baseline. */
function withGutter(c: Ctx, l: Look, items: Item[], text: string): Item[] {
  if (!text || !items.length) return items;
  const size = c.base - 0.3;
  const date = para(c.m, [{ s: text }], style(c, { size, color: l.muted }), {
    x: l.x,
    w: l.dateW,
    lh: items[0].h / size,
  });
  items[0] = { h: items[0].h, prims: [...items[0].prims, ...(date[0]?.prims ?? [])] };
  return items;
}

function record(
  c: Ctx,
  l: Look,
  parts: {
    title: Run[];
    right?: string;
    rightLink?: string;
    /** Keep the right-hand text on the title line even in a timeline column. */
    plain?: boolean;
    sub?: Run[];
    bullets?: string[];
  },
): Item[] {
  const gutter = l.dateMode === "left" && !l.narrow && !parts.plain;
  const x = gutter ? l.x + l.dateW + 16 : l.x;
  const w = gutter ? l.w - l.dateW - 16 : l.w;
  const rightText = gutter ? "" : (parts.right ?? "");
  const items: Item[] = [];
  items.push(
    ...para(c.m, parts.title, style(c, { size: c.base + l.titleSize, f: "b", color: l.ink }), {
      x,
      w,
      lh: c.lh,
      right: rightText
        ? [
            {
              s: rightText,
              f: "r",
              color: parts.rightLink ? l.accent : l.muted,
              size: c.base - 0.3,
              link: parts.rightLink,
            },
          ]
        : undefined,
    }),
  );
  if (parts.sub?.length) {
    items.push(
      ...para(
        c.m,
        parts.sub,
        style(c, { size: l.narrow ? c.base - 0.9 : c.base, color: l.muted }),
        {
          x,
          w,
          lh: c.lh,
        },
      ),
    );
  }
  if (parts.bullets?.length) {
    items.push({ h: 2.5 * c.sp, prims: [] });
    items.push(...bulletItems(c, l, parts.bullets, x, w));
  }
  if (gutter) return withGutter(c, l, items, parts.right ?? "");
  return items;
}

function skillBlocks(c: Ctx, l: Look): Block[] {
  return c.d.skills
    .filter((g) => g.name.trim() || g.items.trim())
    .map((g, i) => {
      const gap = (i === 0 ? l.headGap : l.recGap * 0.55) * c.sp;
      if (l.narrow) {
        const items = [
          ...para(c.m, [{ s: g.name }], style(c, { size: c.base, f: "b", color: l.ink }), {
            x: l.x,
            w: l.w,
            lh: c.lh,
          }),
          ...para(c.m, [{ s: g.items }], style(c, { size: c.base - 0.3, color: l.muted }), {
            x: l.x,
            w: l.w,
            lh: c.lh,
          }),
        ];
        return block(items, gap);
      }
      if (l.dateMode === "left") {
        const x = l.x + l.dateW + 16;
        const items = para(c.m, [{ s: g.items }], style(c, { size: c.base, color: l.ink }), {
          x,
          w: l.w - l.dateW - 16,
          lh: c.lh,
        });
        const label = para(
          c.m,
          [{ s: g.name }],
          style(c, { size: c.base - 0.3, f: "b", color: l.muted }),
          {
            x: l.x,
            w: l.dateW,
            lh: items[0] ? items[0].h / (c.base - 0.3) : c.lh,
          },
        );
        if (items[0] && label[0])
          items[0] = { h: items[0].h, prims: [...items[0].prims, ...label[0].prims] };
        return block(items, gap);
      }
      const runs: Run[] = [];
      if (g.name.trim()) runs.push({ s: `${g.name.trim()}: `, f: "b" });
      runs.push({ s: g.items });
      return block(
        para(c.m, runs, style(c, { size: c.base, color: l.ink }), { x: l.x, w: l.w, lh: c.lh }),
        gap,
      );
    });
}

/** The heading plus every record of a section, as blocks ready to flow. */
function customBlocks(key: OrderKey, titleText: string, c: Ctx, l: Look): Block[] {
  const cs = c.d.custom.find((x) => customKey(x.id) === key);
  if (!cs || !cs.body.trim()) return [];
  // Timeline columns reserve a gutter for dates; keep this text aligned with the records.
  const gutter = l.dateMode === "left" && !l.narrow ? l.dateW + 16 : 0;
  const x = l.x + gutter;
  const w = l.w - gutter;
  const recs: Block[] = [];
  if (cs.style === "bullets") {
    linesOf(cs.body).forEach((t, i) => {
      const items = para(c.m, [{ s: t }], style(c, { size: c.base, color: l.ink }), {
        x,
        w,
        lh: c.lh,
        bullet: { glyph: l.bullet, indent: 11, color: l.bulletColor },
      });
      recs.push(block(items, (i === 0 ? l.headGap : 1.6) * c.sp));
    });
  } else {
    cs.body
      .split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean)
      .forEach((p, i) => {
        recs.push(
          block(
            para(c.m, [{ s: p }], style(c, { size: c.base, color: l.ink }), {
              x,
              w,
              lh: c.lh + 0.03,
            }),
            (i === 0 ? l.headGap : 3) * c.sp,
          ),
        );
      });
  }
  return recs.length ? [l.heading(titleText), ...recs] : [];
}

export function sectionBlocks(key: OrderKey, titleText: string, c: Ctx, l: Look): Block[] {
  if (isCustomKey(key)) return customBlocks(key, titleText, c, l);
  const d = c.d;
  const recs: Block[] = [];
  const gapOf = (i: number) => (i === 0 ? l.headGap : l.recGap) * c.sp;

  switch (key) {
    case "summary": {
      const paras = d.summary
        .split(/\n\s*\n|\n/)
        .map((p) => p.trim())
        .filter(Boolean);
      paras.forEach((p, i) => {
        const lead = !!l.lead;
        const items = para(
          c.m,
          [{ s: p }],
          style(c, { size: c.base + (lead ? 0.8 : 0), f: lead ? "i" : "r", color: l.ink }),
          {
            x: lead ? l.x + 12 : l.x,
            w: lead ? l.w - 12 : l.w,
            lh: c.lh + 0.03,
          },
        );
        if (lead) {
          for (const it of items) {
            it.prims.push({
              k: "line",
              x1: l.x + 1,
              x2: l.x + 1,
              y1: 0,
              y2: it.h,
              color: l.accent,
              width: 2,
            });
          }
        }
        recs.push(block(items, i === 0 ? l.headGap * c.sp : 3 * c.sp));
      });
      break;
    }
    case "experience":
      d.experience
        .filter((e) => e.role.trim() || e.company.trim())
        .forEach((e, i) => {
          recs.push(
            block(
              record(c, l, {
                title: [{ s: e.role || e.company }],
                right: dates(e.start, e.end),
                sub: e.role
                  ? [
                      { s: e.company, f: "b", color: l.accent },
                      ...(e.location.trim()
                        ? [{ s: `  ·  ${e.location.trim()}`, color: l.muted }]
                        : []),
                    ]
                  : undefined,
                bullets: linesOf(e.bullets),
              }),
              gapOf(i),
            ),
          );
        });
      break;
    case "education":
      d.education
        .filter((e) => e.school.trim() || e.degree.trim())
        .forEach((e, i) => {
          recs.push(
            block(
              record(c, l, {
                title: [{ s: e.degree || e.school }],
                right: dates(e.start, e.end),
                sub: e.degree
                  ? [
                      { s: e.school, f: "b", color: l.accent },
                      ...(e.location.trim()
                        ? [{ s: `  ·  ${e.location.trim()}`, color: l.muted }]
                        : []),
                    ]
                  : undefined,
                bullets: linesOf(e.details),
              }),
              gapOf(i),
            ),
          );
        });
      break;
    case "skills":
      recs.push(...skillBlocks(c, l));
      break;
    case "projects":
      d.projects
        .filter((p) => p.name.trim())
        .forEach((p, i) => {
          const link = p.link.trim();
          const items = record(c, l, {
            title: [{ s: p.name }],
            plain: true,
            right: link,
            rightLink: link ? ensureUrl(link) : undefined,
            sub: p.tech.trim() ? [{ s: p.tech.trim(), f: "i" }] : undefined,
            bullets: linesOf(p.bullets),
          });
          recs.push(block(items, gapOf(i)));
        });
      break;
    case "certifications":
      d.certifications
        .filter((x) => x.name.trim())
        .forEach((x, i) => {
          recs.push(
            block(
              record(c, l, {
                title: [{ s: x.name }],
                right: x.date.trim(),
                sub: x.issuer.trim() ? [{ s: x.issuer.trim() }] : undefined,
              }),
              gapOf(i) * (l.narrow ? 0.7 : 0.6),
            ),
          );
        });
      break;
    case "languages":
      d.languages
        .filter((x) => x.name.trim())
        .forEach((x, i) => {
          const runs: Run[] = [{ s: x.name.trim(), f: "b" }];
          const lvl = joinNonEmpty([x.level], "");
          if (lvl) runs.push({ s: ` — ${lvl}`, color: l.muted });
          recs.push(
            block(
              para(c.m, runs, style(c, { size: c.base, color: l.ink }), {
                x: l.x,
                w: l.w,
                lh: c.lh,
              }),
              (i === 0 ? l.headGap : 1.5) * c.sp,
            ),
          );
        });
      break;
  }
  if (!recs.length) return [];
  return [l.heading(titleText), ...recs];
}

export function sectionHasContent(key: OrderKey, c: Ctx): boolean {
  if (isCustomKey(key)) {
    return c.d.custom.some((x) => customKey(x.id) === key && !!x.body.trim());
  }
  const d = c.d;
  switch (key) {
    case "summary":
      return !!d.summary.trim();
    case "experience":
      return d.experience.some((e) => e.role.trim() || e.company.trim());
    case "education":
      return d.education.some((e) => e.school.trim() || e.degree.trim());
    case "skills":
      return d.skills.some((g) => g.name.trim() || g.items.trim());
    case "projects":
      return d.projects.some((p) => p.name.trim());
    case "certifications":
      return d.certifications.some((x) => x.name.trim());
    case "languages":
      return d.languages.some((x) => x.name.trim());
  }
}
