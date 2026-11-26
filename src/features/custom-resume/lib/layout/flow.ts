import type { Block, Item, Prim, Region } from "./types";

function blockHeight(b: Block): number {
  let h = 0;
  for (const it of b.items) h += it.h;
  return h;
}

function shift(prims: Prim[], dx: number, dy: number): Prim[] {
  return prims.map((p) => {
    if (p.k === "line") return { ...p, x1: p.x1 + dx, x2: p.x2 + dx, y1: p.y1 + dy, y2: p.y2 + dy };
    return { ...p, x: p.x + dx, y: p.y + dy };
  });
}

/**
 * Pour blocks into a column, page after page. A block moves whole to the next page when it does
 * not fit; a heading (`keepNext`) moves with the block after it, so a title is never stranded at
 * the bottom of a page. Returns the drawn primitives of each page, in order.
 */
export function flow(blocks: Block[], region: Region): Prim[][] {
  const pages: Prim[][] = [[]];
  const top = () => (pages.length === 1 && region.first ? region.first.y : region.y);
  const room = () => (pages.length === 1 && region.first ? region.first.h : region.h);
  let y = 0; // offset inside the region
  let atTop = true;

  const newPage = () => {
    pages.push([]);
    y = 0;
    atTop = true;
  };

  const place = (items: Item[], before: number) => {
    if (!atTop) y += before;
    const page = pages[pages.length - 1];
    for (const it of items) {
      page.push(...shift(it.prims, region.x, top() + y));
      y += it.h;
    }
    atTop = false;
  };

  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.items.length === 0) continue;

    // Height that has to stay together: this block, plus following blocks while keepNext.
    let group = blockHeight(b);
    let j = i;
    let cur = b;
    while (cur.keepNext && j + 1 < blocks.length) {
      const next = blocks[j + 1];
      // Only the first item of the next block must come along if that block can split.
      group += next.before + (next.items[0]?.h ?? 0);
      j++;
      cur = next;
    }

    const lead = atTop ? 0 : b.before;
    if (y + lead + group > room() && !atTop) newPage();

    if (blockHeight(b) <= room()) {
      place(b.items, b.before);
      continue;
    }

    // Taller than a page: split between lines.
    let rest = b.items;
    let first = true;
    while (rest.length) {
      const avail = room() - y - (first && !atTop ? b.before : 0);
      let take = 0;
      let used = 0;
      while (take < rest.length && used + rest[take].h <= avail) used += rest[take++].h;
      if (take === 0) {
        if (atTop)
          take = 1; // a single item taller than the page: draw it anyway
        else {
          newPage();
          continue;
        }
      }
      place(rest.slice(0, take), first ? b.before : 0);
      rest = rest.slice(take);
      first = false;
      if (rest.length) newPage();
    }
  }
  return pages;
}
