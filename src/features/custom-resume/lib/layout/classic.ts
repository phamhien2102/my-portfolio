import {
  avatarPrim,
  avSize,
  block,
  contactItems,
  hasAvatar,
  padHeader,
  makeCtx,
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

const MARGIN_X = 44;
const MARGIN_Y = 42;

/** One column, black text, plain headings: what an applicant tracking system reads best. */
export function layoutClassic(c: Ctx): Page[] {
  const w = PAGE_W - MARGIN_X * 2;
  const look: Look = {
    x: 0,
    w,
    ink: c.ink,
    muted: c.muted,
    accent: c.accent,
    bullet: "•",
    bulletColor: c.ink,
    dateMode: "right",
    dateW: 0,
    narrow: false,
    titleSize: 0.4,
    headGap: 5,
    recGap: 8,
    heading: (text) => {
      const size = c.base + 0.6;
      const items = para(
        c.m,
        [{ s: text.toUpperCase() }],
        style(c, { size, f: "b", color: c.accent, track: 0.7 }),
        {
          x: 0,
          w,
          lh: 1.35,
        },
      );
      const h = items[0].h;
      items[0] = {
        h: h + 4,
        prims: [
          ...items[0].prims,
          { k: "line", x1: 0, x2: w, y1: h + 1.2, y2: h + 1.2, color: c.accent, width: 0.8 },
        ],
      };
      return block(items, 13 * c.sp, true);
    },
  };

  const blocks: Block[] = [];
  const b = c.d.basics;
  const av = hasAvatar(c) ? avSize(c, 64) : 0;
  const hw = av ? w - av - 16 : w;
  if (b.name.trim()) {
    blocks.push(
      block(
        para(c.m, [{ s: b.name }], style(c, { size: c.base * 2.6, f: "b", color: c.ink }), {
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
        para(c.m, [{ s: b.title }], style(c, { size: c.base * 1.3, color: c.accent }), {
          x: 0,
          w: hw,
          lh: 1.3,
        }),
        1,
        true,
      ),
    );
  }
  const runs: Run[] = [];
  contactItems(b).forEach((it, i) => {
    if (i) runs.push({ s: "  |  ", color: "#9a9a9a" });
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
        para(c.m, runs, style(c, { size: c.base - 0.2, color: c.muted }), { x: 0, w: hw, lh: 1.5 }),
        5 * c.sp,
      ),
    );
  }

  if (av) {
    const first = blocks[0]?.items[0];
    if (first) first.prims.push(avatarPrim(c, w - av, 0, av));
    padHeader(blocks, 0, av);
  }

  for (const key of c.s.order) {
    if (c.s.hidden.includes(key) || !sectionHasContent(key, c)) continue;
    blocks.push(...sectionBlocks(key, titleOf(c, key), c, look));
  }

  const pages = flow(blocks, { x: MARGIN_X, y: MARGIN_Y, w, h: PAGE_H - MARGIN_Y * 2 });
  return pages.map((prims) => ({ prims }));
}

export { makeCtx };
