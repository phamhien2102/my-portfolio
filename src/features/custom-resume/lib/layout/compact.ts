import {
  avatarPrim,
  avSize,
  block,
  contactItems,
  hasAvatar,
  mix,
  padHeader,
  para,
  stackItems,
  style,
  type Ctx,
  titleOf,
} from "./common";
import { flow } from "./flow";
import { sectionBlocks, sectionHasContent, type Look } from "./sections";
import type { Block, Item, Page } from "./types";
import { PAGE_H, PAGE_W } from "./types";

const MARGIN_X = 36;
const MARGIN_Y = 34;

/** Dense single column: name on the left, contact stacked on the right, accent-barred headings. */
export function layoutCompact(base: Ctx): Page[] {
  // Tighter than the other templates: the whole point is to fit more.
  const c: Ctx = { ...base, sp: base.sp * 0.82, lh: base.lh - 0.05, base: base.base - 0.2 };
  const w = PAGE_W - MARGIN_X * 2;
  const look: Look = {
    x: 0,
    w,
    ink: c.ink,
    muted: c.muted,
    accent: c.accent,
    bullet: "•",
    bulletColor: c.accent,
    dateMode: "right",
    dateW: 0,
    narrow: false,
    titleSize: 0.3,
    headGap: 4,
    recGap: 6.5,
    heading: (text) => {
      const size = c.base + 0.4;
      const items = para(
        c.m,
        [{ s: text.toUpperCase() }],
        style(c, { size, f: "b", color: c.accent, track: 0.9 }),
        { x: 8, w: w - 8, lh: 1.35 },
      );
      items[0].prims.push({
        k: "rect",
        x: 0,
        y: 1,
        w: 3,
        h: items[0].h - 2,
        fill: c.accent,
      });
      items[0].prims.push({
        k: "line",
        x1: 0,
        x2: w,
        y1: items[0].h + 1.5,
        y2: items[0].h + 1.5,
        color: mix(c.accent, "#ffffff", 0.7),
        width: 0.6,
      });
      items[0] = { h: items[0].h + 4, prims: items[0].prims };
      return block(items, 11 * c.sp, true);
    },
  };

  const b = c.d.basics;
  const av = hasAvatar(c) ? avSize(c, 58) : 0;
  const leftX = av ? av + 14 : 0;
  const rightW = w * 0.36;
  const leftW = w - leftX - rightW - 14;

  const left: Item[] = [];
  if (b.name.trim()) {
    left.push(
      ...para(c.m, [{ s: b.name }], style(c, { size: c.base * 2.35, f: "b", color: c.ink }), {
        x: leftX,
        w: leftW,
        lh: 1.2,
      }),
    );
  }
  if (b.title.trim()) {
    left.push(
      ...para(c.m, [{ s: b.title }], style(c, { size: c.base * 1.2, color: c.accent }), {
        x: leftX,
        w: leftW,
        lh: 1.3,
      }),
    );
  }
  const right: Item[] = contactItems(b).flatMap((it) =>
    para(
      c.m,
      [
        {
          s: it.inline,
          link: it.link,
          icon: c.s.contactIcons ? it.icon : undefined,
          iconColor: c.accent,
        },
      ],
      style(c, { size: c.base - 0.4, color: c.muted }),
      {
        x: w - rightW,
        w: rightW,
        lh: 1.45,
        align: "r",
      },
    ),
  );
  const l = stackItems(left);
  const r = stackItems(right);
  const prims = [...l.prims, ...r.prims];
  if (av) prims.push(avatarPrim(c, 0, 0, av));
  const headerH = Math.max(l.h, r.h, av);
  const blocks: Block[] = [block([{ h: headerH, prims }], 0, true)];
  void padHeader;

  for (const key of c.s.order) {
    if (c.s.hidden.includes(key) || !sectionHasContent(key, c)) continue;
    blocks.push(...sectionBlocks(key, titleOf(c, key), c, look));
  }
  const pages = flow(blocks, { x: MARGIN_X, y: MARGIN_Y, w, h: PAGE_H - MARGIN_Y * 2 });
  return pages.map((p) => ({ prims: p }));
}
