import {
  avatarPrim,
  avSize,
  block,
  contactItems,
  hasAvatar,
  padHeader,
  para,
  style,
  type Ctx,
  titleOf,
} from "./common";
import { flow } from "./flow";
import { sectionBlocks, sectionHasContent, type Look } from "./sections";
import type { Block, Page } from "./types";
import { PAGE_H, PAGE_W } from "./types";
import type { Run } from "./text";

const MARGIN_X = 50;
const MARGIN_Y = 50;
const GUTTER = 112;

/** Airy, editorial: section titles hang in the left margin, content sits to their right. */
export function layoutMinimal(c: Ctx): Page[] {
  const w = PAGE_W - MARGIN_X * 2;
  const cw = w - GUTTER;
  let headingText = "";
  const look: Look = {
    x: GUTTER,
    w: cw,
    ink: c.ink,
    muted: c.muted,
    accent: c.accent,
    bullet: "–",
    bulletColor: c.muted,
    dateMode: "right",
    dateW: 0,
    narrow: false,
    titleSize: 0.4,
    headGap: 0,
    recGap: 10,
    // The title is drawn into the first record (see below) so it sits on that record's first line.
    heading: (t) => {
      headingText = t;
      return block([], 20 * c.sp);
    },
  };

  const blocks: Block[] = [];
  const b = c.d.basics;
  const av = hasAvatar(c) ? avSize(c, 60) : 0;
  const hw = av ? w - av - 16 : w;
  if (b.name.trim()) {
    blocks.push(
      block(
        para(c.m, [{ s: b.name }], style(c, { size: c.base * 2.7, f: "b", color: c.ink }), {
          x: 0,
          w: hw,
          lh: 1.2,
        }),
        0,
        true,
      ),
    );
  }
  if (b.title.trim()) {
    blocks.push(
      block(
        para(c.m, [{ s: b.title }], style(c, { size: c.base * 1.2, color: c.accent }), {
          x: 0,
          w: hw,
          lh: 1.4,
        }),
        1,
        true,
      ),
    );
  }
  const runs: Run[] = [];
  contactItems(b).forEach((it, i) => {
    if (i) runs.push({ s: "   /   ", color: "#b0b0b0" });
    runs.push({
      s: it.inline,
      color: c.muted,
      link: it.link,
      icon: c.s.contactIcons ? it.icon : undefined,
      iconColor: c.accent,
    });
  });
  if (runs.length) {
    blocks.push(
      block(
        para(c.m, runs, style(c, { size: c.base - 0.3, color: c.muted }), {
          x: 0,
          w: hw,
          lh: 1.55,
        }),
        6 * c.sp,
      ),
    );
  }
  if (av) {
    const first = blocks[0]?.items[0];
    if (first) first.prims.push(avatarPrim(c, w - av, 0, av));
    padHeader(blocks, 0, av);
  }
  blocks.push(
    block(
      [
        {
          h: 1,
          prims: [{ k: "line", x1: 0, x2: w, y1: 0.5, y2: 0.5, color: c.ink, width: 0.7 }],
        },
      ],
      12 * c.sp,
    ),
  );

  for (const key of c.s.order) {
    if (c.s.hidden.includes(key) || !sectionHasContent(key, c)) continue;
    const [head, ...recs] = sectionBlocks(key, titleOf(c, key), c, look);
    if (!head || !recs.length) continue;
    const firstItem = recs[0].items[0];
    const size = c.base - 1.2;
    const title = para(
      c.m,
      [{ s: headingText.toUpperCase() }],
      style(c, { size, f: "b", color: c.accent, track: 0.9 }),
      { x: 0, w: GUTTER - 12, lh: firstItem.h / size },
    );
    let y = 0;
    for (const t of title) {
      for (const p of t.prims)
        firstItem.prims.push({ ...p, y: (p.k === "line" ? 0 : p.y) + y } as typeof p);
      y += t.h;
    }
    recs[0].before = head.before;
    blocks.push(...recs);
  }

  const pages = flow(blocks, { x: MARGIN_X, y: MARGIN_Y, w, h: PAGE_H - MARGIN_Y * 2 });
  return pages.map((p) => ({ prims: p }));
}
