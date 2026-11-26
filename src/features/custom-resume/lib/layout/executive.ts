import {
  avatarPrim,
  avSize,
  block,
  contactItems,
  hasAvatar,
  dates,
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

const MARGIN_X = 52;
const MARGIN_Y = 48;

/** Centred masthead and a timeline: dates in a gutter, the achievements given the room. */
export function layoutExecutive(c: Ctx): Page[] {
  const w = PAGE_W - MARGIN_X * 2;
  // The gutter is as wide as the longest date or skill label, so nothing runs into the text.
  const gutterSize = c.base - 0.3;
  const gutterTexts: [string, "r" | "b"][] = [
    ...c.d.experience.map((e) => [dates(e.start, e.end), "r"] as [string, "r"]),
    ...c.d.education.map((e) => [dates(e.start, e.end), "r"] as [string, "r"]),
    ...c.d.certifications.map((e) => [e.date, "r"] as [string, "r"]),
    ...c.d.skills.map((g) => [g.name, "b"] as [string, "b"]),
  ];
  const dateW = Math.min(
    130,
    Math.max(60, ...gutterTexts.map(([t, f]) => Math.ceil(c.m.width(t, f, gutterSize)) + 2)),
  );
  const look: Look = {
    x: 0,
    w,
    ink: c.ink,
    muted: c.muted,
    accent: c.accent,
    bullet: "–",
    bulletColor: c.accent,
    dateMode: "left",
    dateW,
    lead: true,
    narrow: false,
    titleSize: 1.2,
    headGap: 7,
    recGap: 12,
    heading: (text) => {
      const size = c.base - 0.4;
      const label = text.toUpperCase();
      const track = 1.5;
      const items = para(c.m, [{ s: label }], style(c, { size, f: "b", color: c.accent, track }), {
        x: 0,
        w,
        lh: 1.5,
      });
      const tw = c.m.width(label, "b", size, track);
      const it = items[0];
      const mid = it.h / 2;
      it.prims.push({
        k: "line",
        x1: tw + 10,
        x2: w,
        y1: mid,
        y2: mid,
        color: c.accent,
        width: 0.6,
      });
      return block(items, 18 * c.sp, true);
    },
  };

  const blocks: Block[] = [];
  const b = c.d.basics;
  if (hasAvatar(c)) {
    const size = avSize(c, 72);
    blocks.push(block([{ h: size + 8, prims: [avatarPrim(c, (w - size) / 2, 0, size)] }], 0, true));
  }
  if (b.name.trim()) {
    blocks.push(
      block(
        para(
          c.m,
          [{ s: b.name }],
          style(c, { size: c.base * 2.9, f: "b", color: c.ink, track: 1.2 }),
          {
            x: 0,
            w,
            lh: 1.2,
            align: "c",
          },
        ),
        0,
        true,
      ),
    );
  }
  if (b.title.trim()) {
    blocks.push(
      block(
        para(c.m, [{ s: b.title }], style(c, { size: c.base * 1.25, f: "i", color: c.accent }), {
          x: 0,
          w,
          lh: 1.4,
          align: "c",
        }),
        2,
        true,
      ),
    );
  }
  const contact = contactItems(b);
  if (contact.length) {
    const runs: Run[] = [];
    contact.forEach((it, i) => {
      if (i) runs.push({ s: "   ·   ", color: c.accent });
      runs.push({
        s: it.inline,
        color: c.muted,
        link: it.link,
        icon: c.s.contactIcons ? it.icon : undefined,
        iconColor: c.accent,
      });
    });
    const items = [
      { h: 8 * c.sp, prims: [] },
      {
        h: 3,
        prims: [
          { k: "line" as const, x1: 0, x2: w, y1: 0.8, y2: 0.8, color: c.accent, width: 1.4 },
          { k: "line" as const, x1: 0, x2: w, y1: 2.8, y2: 2.8, color: c.accent, width: 0.4 },
        ],
      },
      { h: 5 * c.sp, prims: [] },
      ...para(c.m, runs, style(c, { size: c.base - 0.3, color: c.muted }), {
        x: 0,
        w,
        lh: 1.55,
        align: "c",
      }),
    ];
    blocks.push(block(items, 0));
  }

  for (const key of c.s.order) {
    if (c.s.hidden.includes(key) || !sectionHasContent(key, c)) continue;
    blocks.push(...sectionBlocks(key, titleOf(c, key), c, look));
  }

  const pages = flow(blocks, { x: MARGIN_X, y: MARGIN_Y, w, h: PAGE_H - MARGIN_Y * 2 });
  return pages.map((prims) => ({ prims }));
}
