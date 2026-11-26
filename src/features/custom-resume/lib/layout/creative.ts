import {
  avatarPrim,
  avSize,
  block,
  contactItems,
  hasAvatar,
  mix,
  para,
  readableOn,
  stackItems,
  style,
  type Ctx,
  titleOf,
} from "./common";
import { flow } from "./flow";
import { sectionBlocks, sectionHasContent, type Look } from "./sections";
import type { Block, Item, Page, Prim } from "./types";
import { PAGE_H, PAGE_W } from "./types";
import type { Run } from "./text";
import type { OrderKey, SectionKey } from "../../types";

const MARGIN_X = 40;
const MARGIN_Y = 40;
const SIDE_X = 384; // where the tinted column starts
const SIDE_PAD = 18;
const NARROW: SectionKey[] = ["skills", "languages", "certifications"];

/** A colour band with the name (and photo) on the first page, then a wide and a tinted narrow column. */
export function layoutCreative(c: Ctx): Page[] {
  const onAccent = readableOn(c.accent);
  const softOnAccent = mix(onAccent, c.accent, 0.25);
  const tint = mix(c.accent, "#ffffff", 0.93);
  const mainW = SIDE_X - MARGIN_X - 26;
  const sideX = SIDE_X + SIDE_PAD;
  const sideW = PAGE_W - sideX - 26;

  /* ---- band ---- */
  const b = c.d.basics;
  const av = hasAvatar(c) ? avSize(c, 88) : 0;
  const textW = PAGE_W - MARGIN_X * 2 - (av ? av + 24 : 0);
  const items: Item[] = [];
  if (b.name.trim()) {
    items.push(
      ...para(c.m, [{ s: b.name }], style(c, { size: c.base * 2.9, f: "b", color: onAccent }), {
        x: 0,
        w: textW,
        lh: 1.2,
      }),
    );
  }
  if (b.title.trim()) {
    items.push(
      ...para(c.m, [{ s: b.title }], style(c, { size: c.base * 1.3, color: softOnAccent }), {
        x: 0,
        w: textW,
        lh: 1.35,
      }),
    );
  }
  const runs: Run[] = [];
  contactItems(b).forEach((it, i) => {
    if (i) runs.push({ s: "   ·   ", color: softOnAccent });
    runs.push({
      s: it.inline,
      color: onAccent,
      link: it.link,
      icon: c.s.contactIcons ? it.icon : undefined,
      iconColor: softOnAccent,
    });
  });
  if (runs.length) {
    items.push({ h: 7, prims: [] });
    items.push(
      ...para(c.m, runs, style(c, { size: c.base - 0.4, color: onAccent }), {
        x: 0,
        w: textW,
        lh: 1.55,
      }),
    );
  }
  const text = stackItems(items);
  const bandPad = 30;
  const bandH = Math.max(text.h, av) + bandPad * 2;
  const bandPrims: Prim[] = [
    { k: "rect", x: 0, y: 0, w: PAGE_W, h: bandH, fill: c.accent },
    ...text.prims.map((p) =>
      p.k === "line"
        ? { ...p, x1: p.x1 + MARGIN_X, x2: p.x2 + MARGIN_X, y1: p.y1 + bandPad, y2: p.y2 + bandPad }
        : { ...p, x: p.x + MARGIN_X, y: p.y + bandPad + (text.h < av ? (av - text.h) / 2 : 0) },
    ),
  ];
  if (av) bandPrims.push(avatarPrim(c, PAGE_W - MARGIN_X - av, (bandH - av) / 2, av));

  /* ---- columns ---- */
  const mainLook: Look = {
    x: 0,
    w: mainW,
    ink: c.ink,
    muted: c.muted,
    accent: c.accent,
    bullet: "•",
    bulletColor: c.accent,
    dateMode: "right",
    dateW: 0,
    narrow: false,
    titleSize: 0.5,
    headGap: 6,
    recGap: 9,
    heading: (t) => {
      const size = c.base + 2.4;
      const it = para(c.m, [{ s: t }], style(c, { size, f: "b", color: c.accent }), {
        x: 0,
        w: mainW,
        lh: 1.3,
      });
      it[0].prims.push({
        k: "line",
        x1: 0,
        x2: mainW,
        y1: it[0].h + 1,
        y2: it[0].h + 1,
        color: mix(c.accent, "#ffffff", 0.65),
        width: 0.8,
      });
      it[0] = { h: it[0].h + 3, prims: it[0].prims };
      return block(it, 16 * c.sp, true);
    },
  };
  const sideLook: Look = {
    ...mainLook,
    w: sideW,
    narrow: true,
    titleSize: 0,
    headGap: 6,
    recGap: 8,
    heading: (t) => {
      const size = c.base - 0.5;
      const it = para(
        c.m,
        [{ s: t.toUpperCase() }],
        style(c, { size, f: "b", color: c.accent, track: 1 }),
        { x: 0, w: sideW, lh: 1.5 },
      );
      it[0].prims.push({ k: "rect", x: 0, y: it[0].h + 1, w: 22, h: 2, fill: c.accent });
      it[0] = { h: it[0].h + 4, prims: it[0].prims };
      return block(it, 17 * c.sp, true);
    },
  };

  const main: Block[] = [];
  const side: Block[] = [];
  for (const key of c.s.order) {
    if (c.s.hidden.includes(key) || !sectionHasContent(key, c)) continue;
    if ((NARROW as OrderKey[]).includes(key))
      side.push(...sectionBlocks(key, titleOf(c, key), c, sideLook));
    else main.push(...sectionBlocks(key, titleOf(c, key), c, mainLook));
  }

  const firstY = bandH + 22;
  const mainPages = flow(main, {
    x: MARGIN_X,
    y: MARGIN_Y,
    w: mainW,
    h: PAGE_H - MARGIN_Y * 2,
    first: { y: firstY, h: PAGE_H - firstY - MARGIN_Y },
  });
  const sidePages = flow(side, {
    x: sideX,
    y: MARGIN_Y,
    w: sideW,
    h: PAGE_H - MARGIN_Y * 2,
    first: { y: firstY, h: PAGE_H - firstY - MARGIN_Y },
  });
  const n = Math.max(mainPages.length, sidePages.length);
  const pages: Page[] = [];
  for (let i = 0; i < n; i++) {
    const top = i === 0 ? bandH : 0;
    const bg: Prim = {
      k: "rect",
      x: SIDE_X,
      y: top,
      w: PAGE_W - SIDE_X,
      h: PAGE_H - top,
      fill: tint,
    };
    pages.push({
      prims: [bg, ...(i === 0 ? bandPrims : []), ...(sidePages[i] ?? []), ...(mainPages[i] ?? [])],
    });
  }
  return pages;
}
