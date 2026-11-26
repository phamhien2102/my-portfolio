import {
  avatarPrim,
  avSize,
  block,
  contactItems,
  hasAvatar,
  mix,
  para,
  readableOn,
  style,
  type Ctx,
  titleOf,
} from "./common";
import { flow } from "./flow";
import { sectionBlocks, sectionHasContent, type Look } from "./sections";
import type { Block, Page, Prim } from "./types";
import { PAGE_H, PAGE_W } from "./types";
import type { OrderKey, SectionKey } from "../../types";

const SIDE_W = 196;
const SIDE_PAD = 24;
const MAIN_PAD_L = 28;
const MAIN_PAD_R = 36;
const MARGIN_Y = 40;
const SIDEBAR: SectionKey[] = ["skills", "languages", "certifications"];

/** Two columns: an accent sidebar for contact and skills, the story on the right. */
export function layoutModern(c: Ctx): Page[] {
  const onAccent = readableOn(c.accent);
  const softOnAccent = mix(onAccent, c.accent, 0.28);
  const sideW = SIDE_W - SIDE_PAD * 2;
  const mainX = SIDE_W + MAIN_PAD_L;
  const mainW = PAGE_W - mainX - MAIN_PAD_R;

  const sideLook: Look = {
    x: 0,
    w: sideW,
    ink: onAccent,
    muted: softOnAccent,
    accent: onAccent,
    bullet: "•",
    bulletColor: onAccent,
    dateMode: "right",
    dateW: 0,
    narrow: true,
    titleSize: 0,
    headGap: 6,
    recGap: 8,
    heading: (text) => {
      const size = c.base - 0.6;
      const items = para(
        c.m,
        [{ s: text.toUpperCase() }],
        style(c, { size, f: "b", color: onAccent, track: 1.1 }),
        {
          x: 0,
          w: sideW,
          lh: 1.5,
        },
      );
      const h = items[0].h;
      items[0] = {
        h: h + 4,
        prims: [
          ...items[0].prims,
          {
            k: "line",
            x1: 0,
            x2: sideW,
            y1: h + 1.5,
            y2: h + 1.5,
            color: softOnAccent,
            width: 0.6,
          },
        ],
      };
      return block(items, 17 * c.sp, true);
    },
  };

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
    heading: (text) => {
      const size = c.base + 2.6;
      const bar = 3;
      const items = para(c.m, [{ s: text }], style(c, { size, f: "b", color: c.accent }), {
        x: 0,
        w: mainW,
        lh: 1.3,
      });
      items.unshift({
        h: bar + 5,
        prims: [{ k: "rect", x: 0, y: 0, w: 26, h: bar, fill: c.accent }],
      });
      return block(items, 15 * c.sp, true);
    },
  };

  // Sidebar: contact first, then the sidebar sections in the user's order.
  const side: Block[] = [];
  if (hasAvatar(c)) {
    const size = Math.min(avSize(c, 110), sideW);
    side.push(block([{ h: size, prims: [avatarPrim(c, (sideW - size) / 2, 0, size)] }], 0, true));
  }
  const contact = contactItems(c.d.basics, c.s.titles.contact === "Liên hệ");
  if (contact.length) {
    side.push(sideLook.heading(c.s.titles.contact || "Contact"));
    contact.forEach((it, i) => {
      const label = para(
        c.m,
        [{ s: it.label.toUpperCase() }],
        style(c, { size: c.base - 2.4, color: softOnAccent, track: 0.8 }),
        {
          x: 0,
          w: sideW,
          lh: 1.5,
        },
      );
      const value = para(
        c.m,
        [
          {
            s: it.value,
            link: it.link,
            icon: c.s.contactIcons ? it.icon : undefined,
            iconColor: softOnAccent,
          },
        ],
        style(c, { size: c.base - 0.3, color: onAccent }),
        {
          x: 0,
          w: sideW,
          lh: c.lh,
        },
      );
      side.push(block([...label, ...value], (i === 0 ? 7 : 5.5) * c.sp));
    });
  }
  const mainSections: OrderKey[] = [];
  for (const key of c.s.order) {
    if (c.s.hidden.includes(key) || !sectionHasContent(key, c)) continue;
    if ((SIDEBAR as OrderKey[]).includes(key))
      side.push(...sectionBlocks(key, titleOf(c, key), c, sideLook));
    else mainSections.push(key);
  }

  const main: Block[] = [];
  const b = c.d.basics;
  if (b.name.trim()) {
    main.push(
      block(
        para(c.m, [{ s: b.name }], style(c, { size: c.base * 2.7, f: "b", color: c.ink }), {
          x: 0,
          w: mainW,
          lh: 1.18,
        }),
        0,
        true,
      ),
    );
  }
  if (b.title.trim()) {
    main.push(
      block(
        para(c.m, [{ s: b.title }], style(c, { size: c.base * 1.3, color: c.accent }), {
          x: 0,
          w: mainW,
          lh: 1.3,
        }),
        2,
        true,
      ),
    );
  }
  for (const key of mainSections) main.push(...sectionBlocks(key, titleOf(c, key), c, mainLook));

  const h = PAGE_H - MARGIN_Y * 2;
  const sidePages = flow(side, { x: SIDE_PAD, y: MARGIN_Y, w: sideW, h });
  const mainPages = flow(main, { x: mainX, y: MARGIN_Y, w: mainW, h });
  const n = Math.max(sidePages.length, mainPages.length);
  const pages: Page[] = [];
  for (let i = 0; i < n; i++) {
    const bg: Prim = { k: "rect", x: 0, y: 0, w: SIDE_W, h: PAGE_H, fill: c.accent };
    pages.push({ prims: [bg, ...(sidePages[i] ?? []), ...(mainPages[i] ?? [])] });
  }
  return pages;
}
