import type { Highlight } from "./study-store";

const CLASS = "user-hl";

function textNodes(root: Node): Text[] {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  for (let n = walker.nextNode(); n; n = walker.nextNode()) nodes.push(n as Text);
  return nodes;
}

/** Offset of (node, offset) inside root.textContent. Wrapping text in spans never changes it. */
function offsetOf(root: HTMLElement, node: Node, offset: number): number {
  const probe = document.createRange();
  probe.selectNodeContents(root);
  probe.setEnd(node, offset);
  return probe.toString().length;
}

/** The selection as offsets into `root`, or null when it is empty or leaves `root`. */
export function selectionOffsets(root: HTMLElement, range: Range) {
  if (!root.contains(range.startContainer) || !root.contains(range.endContainer)) return null;
  const start = offsetOf(root, range.startContainer, range.startOffset);
  const end = offsetOf(root, range.endContainer, range.endOffset);
  return end > start ? { start, end } : null;
}

/** Remove every highlight span from `root` and merge the split text nodes back together. */
function clear(root: HTMLElement) {
  for (const el of root.querySelectorAll(`span.${CLASS}`)) {
    el.replaceWith(...Array.from(el.childNodes));
  }
  root.normalize();
}

/** Redraw all highlights of one chapter. Idempotent, so it is safe to call on every change. */
export function paintHighlights(root: HTMLElement, highlights: readonly Highlight[]) {
  clear(root);
  for (const hl of highlights) {
    let pos = 0;
    // Collect first: wrapping replaces nodes, which would upset a live walk.
    for (const node of textNodes(root)) {
      const from = pos;
      pos += node.length;
      const a = Math.max(hl.start, from) - from;
      const b = Math.min(hl.end, pos) - from;
      if (b <= a) continue;
      // Skip the whitespace-only gaps between blocks.
      if (!node.data.slice(a, b).trim()) continue;
      const target = node.splitText(a);
      target.splitText(b - a);
      const span = document.createElement("span");
      span.className = `${CLASS} hl-${hl.color ?? "yellow"}`;
      target.replaceWith(span);
      span.append(target);
    }
  }
}
